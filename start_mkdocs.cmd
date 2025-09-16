@echo off
chcp 65001 > nul
title MkDocs - перевірка залежностей...
color 07

REM Встановлюємо шлях до Python та `requirements.txt`
set PYTHON_PATH=python
set REQUIREMENTS=requirements.txt

REM Перевіряємо, чи існує файл requirements.txt
if not exist %REQUIREMENTS% (
    echo [ERROR] Файл %REQUIREMENTS% не знайдено.
    exit /b 1
)

echo Перевірка залежностей з %REQUIREMENTS%...
%PYTHON_PATH% -m pip install -r %REQUIREMENTS%

if %errorlevel% neq 0 (
    echo [ERROR] Виникла помилка під час встановлення залежностей.
    exit /b 1
)

timeout /t 1
cls
color 0A

echo.
echo Час запуску: %date% %time:~0,5%
echo.
echo --------------- Встановлені залежності: ---------------
git --version
echo.
pip list | findstr /i "^mkdocs"
echo -------------------------------------------------------
echo.
echo Запуск локального сервера MkDocs...
echo.
echo.
title MkDocs - запущено локальний сервер

%PYTHON_PATH% -m mkdocs serve -a localhost:80

pause