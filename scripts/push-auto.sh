#!/usr/bin/env bash
# One-command push: add all, commit, push to current branch
# Usage: npm run push              (commit message: "Auto push")
#        npm run push -- "fix: signup"   (custom message)
set -e
MSG="${1:-Auto push}"
git add -A
if git diff --staged --quiet; then
  echo "Nothing to commit (working tree clean)."
  exit 0
fi
git commit -m "$MSG"
BRANCH=$(git branch --show-current)
git push origin "$BRANCH"
echo "Pushed to origin/$BRANCH"
