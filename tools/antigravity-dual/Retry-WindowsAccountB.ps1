# Repair the earlier Windows-user setup and both B launcher shortcuts.
[CmdletBinding()]
param([switch]$Preview)
$ErrorActionPreference = 'Stop'
$taskInstall = 'C:\Program Files\Antigravity Account B'
$taskSource = 'C:\Users\Venus\AppData\Local\Programs\Antigravity'
$taskDesktop = 'C:\Users\Venus\OneDrive\Desktop\Antigravity B.lnk'
$taskPins = 'C:\Users\Venus\AppData\Roaming\Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar'
$taskStatus = 'C:\Users\Public\Documents\AntigravityB-retry-status.txt'
$taskHelperSource = Split-Path -Parent $PSCommandPath
if ($Preview) {
    Write-Output 'Reuse existing standard Windows account AntigravityB; keep its password and Google data.'
    Write-Output 'Refresh only the owned second application copy and install its supervised launcher.'
    Write-Output 'Give the B shortcut/window its own Windows taskbar identity and password-protected relaunch command.'
    Write-Output 'Repair existing taskbar links pointing to the B application copy; preserve primary-app links.'
    Write-Output 'Open a local password window; Google authentication remains manual.'
    return
}
$taskIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$taskPrincipal = New-Object Security.Principal.WindowsPrincipal($taskIdentity)
if (-not $taskPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process -FilePath "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" `
        -Verb RunAs -WindowStyle Normal -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"{0}"' -f $PSCommandPath))
    return
}
try {
    $Host.UI.RawUI.WindowTitle = 'Repair Antigravity B'
    'Repair started.' | Set-Content -LiteralPath $taskStatus
    $taskUser = Get-LocalUser -Name 'AntigravityB' -ErrorAction Stop
    if (-not $taskUser.Enabled) { throw 'The AntigravityB Windows account is disabled.' }
    if (-not (Test-Path -LiteralPath (Join-Path $taskInstall '.antigravity-b-setup'))) {
        throw 'The second installation does not have the expected ownership marker. Nothing was overwritten.'
    }
    $taskRunning = Get-CimInstance Win32_Process -Filter "Name='Antigravity.exe' OR Name='language_server.exe'" |
        Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith($taskInstall + '\', [StringComparison]::OrdinalIgnoreCase) }
    if ($taskRunning) { throw 'The old Windows-user copy of Antigravity B is still running. Close that copy before retrying.' }

    # Read only a diagnostic flag from the previous account's logs, never tokens.
    $taskProfileKey = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList\' + $taskUser.SID.Value
    $taskProfile = [Environment]::ExpandEnvironmentVariables((Get-ItemProperty -LiteralPath $taskProfileKey).ProfileImagePath)
    $taskOldLog = Join-Path $taskProfile 'AppData\Roaming\Antigravity\logs\main.log'
    if (Test-Path -LiteralPath $taskOldLog) {
        $taskOldText = Get-Content -LiteralPath $taskOldLog -Raw
        ('Previous log browser-launch error detected: ' + [bool]($taskOldText -match 'Failed to open|ShellExecute|No application.*associated|default browser')) | Add-Content -LiteralPath $taskStatus
    }
    Write-Host 'Refreshing the separate app copy. Primary app and all user data stay in place.'
    foreach ($taskItem in Get-ChildItem -LiteralPath $taskSource -Force) {
        Copy-Item -LiteralPath $taskItem.FullName -Destination $taskInstall -Recurse -Force
    }
    foreach ($taskRelative in @('Antigravity.exe','resources\app.asar','resources\bin\language_server.exe')) {
        if ((Get-FileHash -LiteralPath (Join-Path $taskSource $taskRelative)).Hash -ne (Get-FileHash -LiteralPath (Join-Path $taskInstall $taskRelative)).Hash) {
            throw "The app copy did not verify: $taskRelative"
        }
    }
    foreach ($taskName in @('TaskbarIdentity.cs','Run-WindowsAccountB.ps1','Launch-WindowsAccountB.ps1')) {
        Copy-Item -LiteralPath (Join-Path $taskHelperSource $taskName) -Destination (Join-Path $taskInstall $taskName) -Force
    }
    Add-Type -Path (Join-Path $taskInstall 'TaskbarIdentity.cs')
    $taskLaunch = Join-Path $taskInstall 'Launch-WindowsAccountB.ps1'
    $taskPowerShell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
    $taskArguments = '-NoProfile -ExecutionPolicy Bypass -File "{0}"' -f $taskLaunch
    $taskCommand = '"{0}" {1}' -f $taskPowerShell, $taskArguments
    $taskIcon = Join-Path $taskInstall 'Antigravity-B.ico'
    $taskShell = New-Object -ComObject WScript.Shell
    $taskLinks = @($taskDesktop)
    foreach ($taskPin in Get-ChildItem -LiteralPath $taskPins -Filter '*.lnk' -ErrorAction SilentlyContinue) {
        $taskLink = $taskShell.CreateShortcut($taskPin.FullName)
        if ($taskLink.TargetPath -ieq (Join-Path $taskInstall 'Antigravity.exe')) { $taskLinks += $taskPin.FullName }
    }
    $taskBackups = Join-Path $taskInstall 'shortcut-backups'
    $null = New-Item -ItemType Directory -Path $taskBackups -Force
    foreach ($taskLinkPath in $taskLinks) {
        if (Test-Path -LiteralPath $taskLinkPath) {
            Copy-Item -LiteralPath $taskLinkPath -Destination (Join-Path $taskBackups ((Get-Date -Format 'yyyyMMddHHmmssfff') + '-' + [IO.Path]::GetFileName($taskLinkPath)))
        }
        $taskLink = $taskShell.CreateShortcut($taskLinkPath)
        $taskLink.TargetPath = $taskPowerShell
        $taskLink.Arguments = $taskArguments
        $taskLink.WorkingDirectory = $taskInstall
        $taskLink.IconLocation = "$taskIcon,0"
        $taskLink.Description = 'Antigravity B - separate Windows and Google account'
        $taskLink.Save()
        $null = [Runtime.InteropServices.Marshal]::ReleaseComObject($taskLink)
        [AntigravityTaskbarIdentity]::SetShortcut($taskLinkPath,'Venus.Antigravity.AccountB',$taskCommand,$taskIcon)
        if ([AntigravityTaskbarIdentity]::ReadShortcutId($taskLinkPath) -ne 'Venus.Antigravity.AccountB') {
            throw 'The taskbar shortcut identity did not verify.'
        }
    }
    ('Repair complete. Updated B desktop/taskbar shortcuts: ' + $taskLinks.Count + '. Waiting for local Windows password and second Google sign-in.') | Add-Content -LiteralPath $taskStatus
    Start-Process -FilePath $taskPowerShell -WindowStyle Normal -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"{0}"' -f $taskLaunch))
} catch {
    ('Repair stopped: ' + $_.Exception.Message) | Add-Content -LiteralPath $taskStatus
    Write-Host $_.Exception.Message -ForegroundColor Red
    $null = Read-Host 'Press Enter to close'
}
