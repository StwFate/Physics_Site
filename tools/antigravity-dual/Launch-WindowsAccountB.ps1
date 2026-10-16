# Interactive password entry stays on this PC and is never saved by the launcher.
$ErrorActionPreference = 'Stop'
try {
    $Host.UI.RawUI.WindowTitle = 'Open Antigravity B'
    Write-Host 'Open Antigravity using the separate AntigravityB Windows account.'
    Write-Host 'Enter its WINDOWS password below, not your Google password or PIN.'
    $taskPassword = Read-Host 'AntigravityB Windows password' -AsSecureString
    $taskCredential = New-Object Management.Automation.PSCredential("$env:COMPUTERNAME\AntigravityB", $taskPassword)
    $taskHelper = Join-Path (Split-Path -Parent $PSCommandPath) 'Run-WindowsAccountB.ps1'
    Start-Process -FilePath "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" `
        -Credential $taskCredential -LoadUserProfile -WindowStyle Hidden `
        -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"{0}"' -f $taskHelper))
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    $null = Read-Host 'Press Enter to close'
} finally {
    $taskPassword = $null
    $taskCredential = $null
}
