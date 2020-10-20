import os
import json
import sys

import requests
from requests.auth import HTTPBasicAuth

from git import Repo

JIRA_USERNAME = os.getenv("JIRA_USERNAME", "")
JIRA_TOKEN = os.getenv("JIRA_TOKEN", "")
BASE_URL = "https://YOUR-ORG.atlassian.net/rest/api/latest"

if JIRA_USERNAME == "" or JIRA_TOKEN == "":
    sys.exit("Jira username or password is not set")

auth = HTTPBasicAuth(JIRA_USERNAME, JIRA_TOKEN)


# Get version_number from git tag
print("Getting release version to close...")
repo = Repo('.')
assert not repo.bare

tags = sorted(repo.tags, key=lambda t: t.commit.committed_datetime)
latest_tag = str(tags[-1])

version_number = latest_tag.split('v')[-1]

print("The version_number is:")
print(version_number)

# Get issues for release version
print("Finding issues for release...")
issues_req = requests.get(
    # Find issues for release without status of Done, Duplicate, or Will Not Fix
    f"{BASE_URL}/search?jql=fixVersion%20%3D%20{version_number}%20and%20status%20not%20in%20(Done%2C%20Duplicate%2C%20'Will%20not%20fix')",
    auth=auth,
)
issues_req.raise_for_status()
issues_json = issues_req.json()


# create list of Jira issue IDs
issue_ids = [i.get("id") for i in issues_json["issues"]]


# get transitions (Leaving commented in case of future use)
# transitions_req = requests.get(f'https://YOUR-ORG.atlassian.net/rest/api/latest/issue/{issue_ids[0]}/transitions', auth=auth)
# ID 251: Done


# update issues to 'DONE'
print("Transitioning issues to 'Done'...")
headers = {"Accept": "application/json", "Content-Type": "application/json"}

payload = json.dumps({"transition": {"id": "251"}})


for id in issue_ids:
    transition_req = requests.post(
        f"{BASE_URL}/issue/{id}/transitions", data=payload, headers=headers, auth=auth,
    )
    transition_req.raise_for_status()


# get jira Release
print("Getting related Jira release...")
release_req = requests.get(
    f"{BASE_URL}/project/YOUR-PROJECT/versions", headers=headers, auth=auth,
)
release_req.raise_for_status()
release_req_json = release_req.json()


def version_is_current_release(version):
    return version.get("name") == f"{version_number}"


current_release = list(filter(version_is_current_release, release_req_json))[0]

print("The latest jira version is:")
print(current_release["name"])

payload = json.dumps({"released": "true"})

print("Closing related Jira release...")
close_release_req = requests.put(
    f'{BASE_URL}/version/{current_release["id"]}',
    data=payload,
    headers=headers,
    auth=auth,
)
close_release_req.raise_for_status()

if close_release_req.status_code != 200:
    sys.exit(
        f"There was an issue closing out {version_number}. Jira returned a: {close_release_req.status_code}."
    )

print(f"Release {version_number} closed out with a: {close_release_req.status_code}.")
