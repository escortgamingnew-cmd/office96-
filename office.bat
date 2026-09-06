@echo off
rem Escort Gaming - Office (chat + board)
rem Բացում ա լոկալ օֆիսը բրաուզերում։ Փակել՝ Ctrl+C կամ պատուհանը փակել։
cd /d "%~dp0"
py -X utf8 tools\office\server.py %*
if errorlevel 1 python -X utf8 tools\office\server.py %*
pause
