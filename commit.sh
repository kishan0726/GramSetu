#!/bin/bash

set -e

echo "🔄 Checking current branch..."
branch=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $branch"

echo "➕ Adding all changes..."
git add .

if git diff --cached --quiet; then
    echo "✅ Nothing to commit."
else
    read -p "📝 Enter commit message: " message
    git commit -m "$message"
fi

echo "📥 Pulling latest changes..."
git pull origin $branch --rebase

echo "🚀 Pushing to origin/$branch ..."
git push origin $branch

echo "✅ Done successfully!"