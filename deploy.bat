@echo off
cd /d "%~dp0"
python deploy.py
if %errorlevel% neq 0 (
    echo.
    pause
)
