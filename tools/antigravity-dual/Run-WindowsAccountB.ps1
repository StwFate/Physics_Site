# Runs INSIDE the AntigravityB Windows identity and supervises its app.
$ErrorActionPreference = 'Stop'
$taskIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
if (($taskIdentity.Name -split '\\')[-1] -ine 'AntigravityB') {
    throw 'Refusing to open Account B under a different Windows user.'
}
$taskProfileKey = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList\' + $taskIdentity.User.Value
$taskProfile = [Environment]::ExpandEnvironmentVariables((Get-ItemProperty -LiteralPath $taskProfileKey).ProfileImagePath)
if (-not $taskProfile -or -not (Test-Path -LiteralPath $taskProfile)) { throw 'The second Windows profile is not initialized.' }
$taskRoot = Split-Path -Parent $PSCommandPath
$taskApp = Join-Path $taskRoot 'Antigravity.exe'
$taskData = Join-Path $taskProfile 'AppData\Roaming\Antigravity'
$taskLogRoot = Join-Path $taskProfile 'AppData\Local\AntigravityBLauncher'
$null = New-Item -ItemType Directory -Path $taskData -Force
$null = New-Item -ItemType Directory -Path $taskLogRoot -Force
# Safe progress only, readable from the main account; app logs stay private.
$taskStatusPath = 'C:\Users\Public\Documents\AntigravityB-runtime.json'
$taskRelaunch = '"{0}" -NoProfile -ExecutionPolicy Bypass -File "{1}"' -f "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe", (Join-Path $taskRoot 'Launch-WindowsAccountB.ps1')
Add-Type -Path (Join-Path $taskRoot 'TaskbarIdentity.cs')
$taskStart = New-Object Diagnostics.ProcessStartInfo
$taskStart.FileName = $taskApp
$taskStart.Arguments = '"--user-data-dir={0}"' -f $taskData
$taskStart.WorkingDirectory = $taskRoot
$taskStart.UseShellExecute = $false
$taskStart.CreateNoWindow = $true
$taskStart.RedirectStandardOutput = $true
$taskStart.RedirectStandardError = $true
$taskStart.RedirectStandardInput = $true
$taskStart.EnvironmentVariables['HOME'] = $taskProfile
$taskStart.EnvironmentVariables['USERPROFILE'] = $taskProfile
$taskStart.EnvironmentVariables['APPDATA'] = Join-Path $taskProfile 'AppData\Roaming'
$taskStart.EnvironmentVariables['LOCALAPPDATA'] = Join-Path $taskProfile 'AppData\Local'
foreach ($taskName in @('SSH_CONNECTION','SSH_CLIENT','SSH_TTY')) { $taskStart.EnvironmentVariables.Remove($taskName) }
$taskProcess = [Diagnostics.Process]::Start($taskStart)
$taskProcess.StandardInput.Close()
$taskStamp = '{0}-{1}' -f (Get-Date -Format 'yyyyMMdd-HHmmss'), $taskProcess.Id
$taskOutput = [IO.File]::Create((Join-Path $taskLogRoot "$taskStamp.stdout.log"))
$taskError = [IO.File]::Create((Join-Path $taskLogRoot "$taskStamp.stderr.log"))
$taskWindowSet = $false
$taskWindowError = $null
try {
    $taskOutputCopy = $taskProcess.StandardOutput.BaseStream.CopyToAsync($taskOutput)
    $taskErrorCopy = $taskProcess.StandardError.BaseStream.CopyToAsync($taskError)
    while (-not $taskProcess.WaitForExit(1000)) {
        $taskProcess.Refresh()
        if (-not $taskWindowSet -and $taskProcess.MainWindowHandle -ne [IntPtr]::Zero) {
            try {
                [AntigravityTaskbarIdentity]::SetWindow($taskProcess.MainWindowHandle, 'Venus.Antigravity.AccountB', $taskRelaunch, (Join-Path $taskRoot 'Antigravity-B.ico'))
                $taskWindowSet = $true
            } catch { $taskWindowError = $_.Exception.Message }
        }
        [pscustomobject]@{
            WindowsUser = $taskIdentity.Name
            Profile = $taskProfile
            ProcessId = $taskProcess.Id
            TaskbarIdentitySet = $taskWindowSet
            TaskbarError = $taskWindowError
            Updated = (Get-Date).ToString('o')
        } | ConvertTo-Json | Set-Content -LiteralPath $taskStatusPath -Encoding UTF8
    }
    $taskOutputCopy.GetAwaiter().GetResult()
    $taskErrorCopy.GetAwaiter().GetResult()
} finally {
    $taskOutput.Dispose(); $taskError.Dispose(); $taskProcess.Dispose()
}
