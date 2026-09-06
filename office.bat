@echo off
rem Escort Gaming - Office (chat + board)
rem Opens the local office in the browser. Stop: Ctrl+C or close window.
cd /d "%~dp0"
py -X utf8 tools\office\server.py %*
if errorlevel 1 pause
