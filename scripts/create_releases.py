import os
import json
import sys

from datetime import datetime, timedelta
import requests
from requests.auth import HTTPBasicAuth
import semver
import get_current_web_release

JIRA_USERNAME = os.getenv("JIRA_USERNAME", "")
JIRA_TOKEN = os.getenv("JIRA_TOKEN", "")
BASE_URL = "https://YOUR-ORG.atlassian.net/rest/api/latest"

if JIRA_USERNAME == "" or JIRA_TOKEN == "":
    sys.exit("Jira username or password is not set")

auth = HTTPBasicAuth(JIRA_USERNAME, JIRA_TOKEN)
headers = {"Accept": "application/json", "Content-Type": "application/json"}

# Get version_number from git tag
print("Getting current release version...")
version_number = get_current_web_release.version_number
print(version_number)

# Current and next version should already exist in Jira
version_to_check = semver.bump_minor(f"{version_number}")

# ensure jira version is not closed
def is_unreleased_web_version(version):
    return (
        version.get("released") is False
        and version.get("startDate") is not None
        and "twmobile" not in version.get("name")
    )

print("Getting the latest unreleased web version from Jira...")
release_req = requests.get(
    f"{BASE_URL}/project/YOUR-PROJECT/versions", headers=headers, auth=auth,
)
release_req.raise_for_status()
release_req_json = release_req.json()
latest_web_versions = list(filter(is_unreleased_web_version, release_req_json))

# Get last open web version
latest_web_v = sorted(
    latest_web_versions, key=lambda v: v.get("startDate"), reverse=True
)[0]


if version_to_check != latest_web_v.get("name"):
    sys.exit(
        f"The latest version in Jira is {latest_web_v.get('name')}... Please ensure this is correct and rerun job."
    )


print("Defining version number and dates for new version...")

# bump version and relevant dates
name = f'{semver.bump_minor(latest_web_v.get("name"))}'
start_date = f'{datetime.strptime(latest_web_v.get("startDate"), "%Y-%m-%d") + timedelta(days=7)}'
release_date = f'{datetime.strptime(latest_web_v.get("releaseDate"), "%Y-%m-%d") + timedelta(days=7)}'


# create version for develop (current + minor increase)
print(f"Creating version {name}...")
payload = json.dumps(
    {
        "archived": "false",
        "startDate": start_date,
        "releaseDate": release_date,
        "name": name,
        "projectId": 10002,  # TW Project
        "released": "false",
    }
)
create_version_req = requests.post(
    url=f"{BASE_URL}/version", data=payload, headers=headers, auth=auth
)
create_version_req.raise_for_status()

print(f"Release version {name} created!")
