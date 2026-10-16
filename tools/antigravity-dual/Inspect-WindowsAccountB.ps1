# Read-only diagnostics for the second user's browser/sign-in startup.
$ErrorActionPreference = 'Stop'
$taskPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $taskPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process -FilePath "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -Verb RunAs -WindowStyle Normal `
        -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',('"{0}"' -f $PSCommandPath))
    return
}
$taskReportPath = 'C:\Users\Public\Documents\AntigravityB-signin-diagnostic.json'
try {
    $taskUser = Get-LocalUser -Name 'AntigravityB'
    $taskSid = $taskUser.SID.Value
    $taskProfile = [Environment]::ExpandEnvironmentVariables((Get-ItemProperty -LiteralPath ('HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList\' + $taskSid)).ProfileImagePath)
    $taskChoice = Get-ItemProperty -LiteralPath ('Registry::HKEY_USERS\' + $taskSid + '\Software\Microsoft\Windows\Shell\Associations\UrlAssociations\https\UserChoice') -ErrorAction SilentlyContinue
    $taskLogRoot = Join-Path $taskProfile 'AppData\Roaming\Antigravity\logs'
    $taskMainLog = Join-Path $taskLogRoot 'main.log'
    $taskServerLog = Join-Path $taskLogRoot 'language_server.log'
    $taskMain = if (Test-Path -LiteralPath $taskMainLog) { Get-Content -LiteralPath $taskMainLog -Tail 350 } else { @() }
    $taskServer = if (Test-Path -LiteralPath $taskServerLog) { Get-Content -LiteralPath $taskServerLog -Tail 350 } else { @() }
    $taskLatest = @($taskMain + $taskServer)
    $taskErrors = @($taskLatest | Where-Object { $_ -match 'failed.*(browser|open|launch)|unable.*(browser|open)|ShellExecute|No application.*associated|ERR_' } | Select-Object -Last 10 | ForEach-Object {
        $_ -replace 'https?://\S+', '[URL redacted]' -replace '[\w.+-]+@[\w.-]+', '[email redacted]' -replace '[A-Za-z0-9_./+=-]{40,}', '[long value redacted]'
    })
    [pscustomobject]@{
        Checked = (Get-Date).ToString('o')
        WindowsUser = $taskUser.Name
        HttpsBrowserAssociation = $taskChoice.ProgId
        MachineEdgeInstalled = (Test-Path -LiteralPath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
        StartupReadyLogged = [bool]($taskMain -match 'Local:')
        OAuthUrlLogged = [bool]($taskLatest -match 'accounts\.google\.com/o/oauth2|ANTIGRAVITY_OPEN_URL')
        MissingLoginLogged = [bool]($taskServer -match 'You are not logged into Antigravity|No signed-in account')
        FileTokenStorageLogged = [bool]($taskServer -match 'Using file-based token storage')
        BrowserErrors = $taskErrors
    } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $taskReportPath -Encoding UTF8
} catch {
    @{ DiagnosticError = $_.Exception.Message } | ConvertTo-Json | Set-Content -LiteralPath $taskReportPath -Encoding UTF8
}
