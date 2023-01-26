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
echo -n "Type of release (major, minor, patch - dafaults to patch): "; read RELEASE
if [ -z "$RELEASE" ]; then
    RELEASE='patch'
fi
echo
`npm version $RELEASE`
git add --all
git commit --all -m "$MESSAGE"
git push --follow-tags
echo