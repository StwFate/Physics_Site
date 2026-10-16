# Same-Windows-user account-data isolation, based on ParaGravity's launch method:
# https://github.com/edison-land/paragravity/blob/main/bin/paragravity
# This is an unofficial compatibility workaround, not an OS security sandbox.
[CmdletBinding()]
param(
    [switch]$Preview,
    [switch]$InstallShortcut,
    [switch]$NoLaunch
)

$ErrorActionPreference = 'Stop'
$taskApp = 'C:\Users\Venus\AppData\Local\Programs\Antigravity\Antigravity.exe'
$taskRoot = 'C:\Users\Venus\AppData\Local\AntigravityProfiles\B'
$taskData = Join-Path $taskRoot 'data'
$taskHome = Join-Path $taskRoot 'home'
$taskDesktop = 'C:\Users\Venus\OneDrive\Desktop'
$taskShortcutPath = Join-Path $taskDesktop 'Antigravity B.lnk'

if ($Preview) {
    Write-Output "Application: $taskApp"
    Write-Output "Second profile: $taskRoot"
    Write-Output 'Runs as Venus. No extra Windows account or password is used.'
    Write-Output 'Only the child process receives redirected home/data paths and SSH keyring-bypass markers.'
    Write-Output 'Google login credentials are stored in local profile files by the application.'
    Write-Output 'The original application profile and Windows credential entries are not modified by this script.'
    return
}

if (-not (Test-Path -LiteralPath $taskApp)) { throw "Antigravity was not found at $taskApp" }
foreach ($taskDirectory in @($taskRoot, $taskData, $taskHome, (Join-Path $taskHome 'AppData\Roaming'), (Join-Path $taskHome 'AppData\Local'))) {
    $null = New-Item -ItemType Directory -Path $taskDirectory -Force
}

if ($InstallShortcut) {
    $taskShell = New-Object -ComObject WScript.Shell
    if (Test-Path -LiteralPath $taskShortcutPath) {
        $taskOldLink = $taskShell.CreateShortcut($taskShortcutPath)
        if ([IO.Path]::GetFileName($taskOldLink.TargetPath) -ieq 'runas.exe') {
            $taskBackup = Join-Path $taskRoot 'Previous-Windows-user-shortcut.lnk'
            if (-not (Test-Path -LiteralPath $taskBackup)) {
                Copy-Item -LiteralPath $taskShortcutPath -Destination $taskBackup
            }
        } elseif ($taskOldLink.Arguments -notlike '*Launch-AntigravityB.ps1*') {
            throw 'Antigravity B.lnk belongs to a different launcher. It was not overwritten.'
        }
    }
    $taskIconSource = 'C:\Program Files\Antigravity Account B\Antigravity-B.ico'
    $taskIcon = Join-Path $taskRoot 'Antigravity-B.ico'
    if (Test-Path -LiteralPath $taskIconSource) {
        Copy-Item -LiteralPath $taskIconSource -Destination $taskIcon -Force
    }
    $taskLink = $taskShell.CreateShortcut($taskShortcutPath)
    $taskLink.TargetPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
    $taskLink.Arguments = '-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}"' -f $PSCommandPath
    $taskLink.WorkingDirectory = $taskRoot
    $taskLink.Description = 'Antigravity Desktop - separate account B profile, no Windows password prompt'
    if (Test-Path -LiteralPath $taskIcon) { $taskLink.IconLocation = "$taskIcon,0" }
    else { $taskLink.IconLocation = "$taskApp,0" }
    $taskLink.Save()
    Write-Output "Updated shortcut: $taskShortcutPath"
}

if ($NoLaunch) { return }

$taskExisting = Get-CimInstance Win32_Process -Filter "Name='Antigravity.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine.Contains("--user-data-dir=$taskData") -and $_.CommandLine -notmatch '--type=' } |
    Select-Object -First 1
if ($taskExisting) {
    Write-Output "The B profile is already running (process $($taskExisting.ProcessId))."
    return
}

$taskStart = New-Object Diagnostics.ProcessStartInfo
$taskStart.FileName = $taskApp
$taskStart.Arguments = '"--user-data-dir={0}"' -f $taskData
$taskStart.WorkingDirectory = Split-Path -Parent $taskApp
$taskStart.UseShellExecute = $false
# Child-only environment: the normal Windows session and original app keep theirs.
$taskStart.EnvironmentVariables['HOME'] = $taskHome
$taskStart.EnvironmentVariables['USERPROFILE'] = $taskHome
$taskStart.EnvironmentVariables['APPDATA'] = Join-Path $taskHome 'AppData\Roaming'
$taskStart.EnvironmentVariables['LOCALAPPDATA'] = Join-Path $taskHome 'AppData\Local'
# Antigravity's remote-session detector selects file-based token storage.
# Nothing is copied from the primary account's credential store.
$taskStart.EnvironmentVariables['SSH_CONNECTION'] = '127.0.0.1 50000 127.0.0.1 22'
$taskStart.EnvironmentVariables['SSH_CLIENT'] = '127.0.0.1 50000 22'
$taskProcess = [Diagnostics.Process]::Start($taskStart)
$taskProcess.Id | Set-Content -LiteralPath (Join-Path $taskRoot 'last-launch.pid')
Write-Output "Started the separate B profile as the current Windows user (process $($taskProcess.Id))."
Write-Output 'Sign in manually. Account isolation and token refresh still require runtime verification.'
