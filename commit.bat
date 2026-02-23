@echo off
setlocal enabledelayedexpansion

echo Checking current branch...
for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set branch=%%i
echo Current branch: %branch%

echo Adding all changes...
git add .

git diff --cached --quiet
if %errorlevel%==0 (
    echo Nothing to commit.
) else (
    echo.
    set /p message=Enter commit message: 
    if "!message!"=="" (
        echo Commit message cannot be empty.
        exit /b
    )
    git commit -m "!message!"
)

echo Pulling latest changes...
git pull origin %branch% --rebase

echo Pushing to origin/%branch% ...
git push origin %branch%

echo Done successfully!
pause