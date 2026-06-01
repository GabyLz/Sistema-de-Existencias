@echo off
setlocal
set PID=

:parse
if "%~1"=="" goto done
if /I "%~1"=="/pid" (
  set PID=%~2
  shift
  shift
  goto parse
)
shift
goto parse

:done
if not defined PID exit /b 1
node -e "try{process.kill(Number(process.argv[1]));process.exit(0);}catch(e){process.exit(1)}" %PID%
exit /b %errorlevel%