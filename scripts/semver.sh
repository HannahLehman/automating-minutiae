#! /bin/bash
if [ -z "$1" ]; then
 echo 'please pass the section to increment - patch, minor, major'
 exit 1
fi

# setup git client to use the deployment key, this block could move into the runner
echo "Configuring Git Client"
mkdir -p ~/.ssh && chmod 700 ~/.ssh
ssh-keyscan gitlab.com >> ~/.ssh/known_hosts && chmod 644 ~/.ssh/known_hosts
eval $(ssh-agent -s)
ssh-add <(echo "$GITLAB_WRITE_SSH_KEY")

echo "Configuring remote push origin to use ssh: git@gitlab.com:${CI_PROJECT_PATH}.git"
git remote set-url --push origin "git@gitlab.com:${CI_PROJECT_PATH}.git"
git config --global user.email "YOUR-GITLAB-USER.EMAIL"
git config --global user.name "YOUR-GITLAB-USER.NAME"

# runner is on detached HEAD, checkout the actual branch
echo "Checking out $CI_COMMIT_REF_NAME"
git checkout ${CI_COMMIT_REF_NAME}

# get latest prod release version
CURRENT_VERSION=$(git describe --tags `git rev-list --tags=release-web-v* --max-count=1`)

## Remove 'release-web-' from tag name, yeilds vX.X.X
TRIMMED_VERSION=$(echo $CURRENT_VERSION | cut -d'-' -f 3)
echo "Current Version: $TRIMMED_VERSION"

if [[ $CI_COMMIT_REF_NAME == 'release-web' ]]; then
  # Increment version
  NEW_VERSION=$(semver -i $1 $TRIMMED_VERSION)
  echo "New Version: $NEW_VERSION"
  # Only release-web should be tagged, with new prod version
  TAGNAME="release-web-v$NEW_VERSION"
else
  echo "Version increments only happen on release-web"
  exit 1
fi

echo "Tagging Version $NEW_VERSION"
git tag -a $TAGNAME -m "$TAGNAME"
echo "Pushing tag to origin"
git push origin $TAGNAME
