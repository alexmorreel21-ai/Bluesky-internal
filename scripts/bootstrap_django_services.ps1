param(
  [string]$PythonExe = "python"
)

$ErrorActionPreference = "Stop"

$services = @(
  "auth-service",
  "users-service",
  "teams-service",
  "assignments-service",
  "reports-service",
  "daily-reports-service"
)

$backendRoot = Split-Path -Parent $PSScriptRoot
$requirementsPath = Join-Path $backendRoot "requirements.txt"

foreach ($service in $services) {
  $servicePath = Join-Path $backendRoot "services/$service"

  if (!(Test-Path $servicePath)) {
    Write-Warning "Skipping missing service folder: $servicePath"
    continue
  }

  Push-Location $servicePath
  try {
    Write-Host "Bootstrapping $service ..."

    if (!(Test-Path ".venv")) {
      & $PythonExe -m venv .venv
    }

    $venvPython = Join-Path $servicePath ".venv/Scripts/python.exe"
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install -r $requirementsPath

    if (!(Test-Path "manage.py")) {
      & $venvPython -m django startproject config .
    }

    if (!(Test-Path "apps")) {
      New-Item -ItemType Directory -Path "apps" | Out-Null
    }

    $healthAppPath = Join-Path $servicePath "apps/health"
    if (!(Test-Path $healthAppPath)) {
      & $venvPython manage.py startapp health apps/health
    }

    Write-Host "Done: $service"
  }
  finally {
    Pop-Location
  }
}

Write-Host "All services bootstrapped."
