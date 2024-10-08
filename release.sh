#!/usr/bin/env bash

echo
echo "Commit, version and push release"
echo
echo -n "Commit message: "; read MESSAGE
if [ -z "$MESSAGE" ]; then
    echo "⚠️ Missing commit message!"
    exit 1
fi
echo
echo -n "Type of release (major, minor, patch - defaults to patch): "; read RELEASE
if [ -z "$RELEASE" ]; then
    RELEASE='patch'
fi
echo
npm config set git-tag-version false
TAG=`npm version $RELEASE`
git add --all
git commit --all -m "$MESSAGE"
`git tag $TAG`
git push
git push --tags origin
echo