# Creates a separate standard Windows user and launcher for Antigravity Desktop.
# No existing Google credentials, conversations, or settings are copied.
[CmdletBinding()]
param([switch]$Preview)

$ErrorActionPreference = 'Stop'
$taskAccount = 'AntigravityB'
$taskSource = 'C:\Users\Venus\AppData\Local\Programs\Antigravity'
$taskDesktop = 'C:\Users\Venus\OneDrive\Desktop'
$taskInstall = Join-Path $env:ProgramFiles 'Antigravity Account B'
$taskExe = Join-Path $taskInstall 'Antigravity.exe'
$taskShortcut = Join-Path $taskDesktop 'Antigravity B.lnk'
$taskStatus = 'C:\Users\Public\Documents\AntigravityB-setup-status.txt'

if ($Preview) {
    Write-Output "Create standard local account: $taskAccount (password entered privately)."
    Write-Output "Copy application files from: $taskSource"
    Write-Output "Separate application location: $taskInstall"
    Write-Output "Create desktop shortcut: $taskShortcut"
    Write-Output 'Launch as the second Windows user; Google sign-in is manual.'
    return
}

$taskIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$taskPrincipal = New-Object Security.Principal.WindowsPrincipal($taskIdentity)
if (-not $taskPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    # The person at the computer handles the Windows elevation prompt.
    Start-Process -FilePath "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" `
        -Verb RunAs -WindowStyle Normal `
        -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"{0}"' -f $PSCommandPath))
    return
}

function Write-TaskStatus([string]$Message) {
    # This file contains only progress, never passwords or Google account details.
    $Message | Set-Content -LiteralPath $taskStatus -Encoding UTF8
    Write-Host $Message
}

try {
    $Host.UI.RawUI.WindowTitle = 'Set up Antigravity B'
    Write-Host 'Antigravity B setup' -ForegroundColor Cyan
    Write-Host 'This creates a separate STANDARD Windows user and an app copy.'
    Write-Host 'Your current Antigravity account and its data will stay in place.'
    Write-Host 'Enter the Windows password in this window only, never in chat.'
    Write-Host ''
    Write-TaskStatus 'Waiting for a password in the Antigravity B setup window.'

    if (-not (Test-Path -LiteralPath (Join-Path $taskSource 'Antigravity.exe'))) {
        throw "The installed Antigravity application was not found at $taskSource."
    }
    if (Test-Path -LiteralPath $taskShortcut) {
        throw "A shortcut already exists at $taskShortcut. Nothing was overwritten."
    }

    $taskExisting = Get-LocalUser -Name $taskAccount -ErrorAction SilentlyContinue
    if ($taskExisting) {
        if (-not $taskExisting.Enabled) { throw 'AntigravityB exists but is disabled.' }
        $taskPassword = Read-Host 'Enter the existing AntigravityB Windows password' -AsSecureString
    } else {
        do {
            $taskPassword = Read-Host 'Choose a Windows password for AntigravityB' -AsSecureString
            $taskConfirm = Read-Host 'Enter that password again' -AsSecureString
            $taskCredential = New-Object System.Management.Automation.PSCredential($taskAccount, $taskPassword)
            $taskConfirmation = New-Object System.Management.Automation.PSCredential($taskAccount, $taskConfirm)
            $taskMatches = $taskCredential.GetNetworkCredential().Password -ceq $taskConfirmation.GetNetworkCredential().Password
            if ($taskPassword.Length -eq 0 -or -not $taskMatches) {
                Write-Host 'Use a nonempty password and enter the same password twice.' -ForegroundColor Yellow
            }
        } until ($taskPassword.Length -gt 0 -and $taskMatches)

        $taskCreated = New-LocalUser -Name $taskAccount -Password $taskPassword `
            -Description 'Separate Antigravity Desktop account' -AccountNeverExpires
        $taskUsersGroup = Get-LocalGroup -SID 'S-1-5-32-545'
        Add-LocalGroupMember -Group $taskUsersGroup -Member $taskCreated
        Write-TaskStatus 'Created the standard AntigravityB Windows account.'
    }

    $taskMarker = Join-Path $taskInstall '.antigravity-b-setup'
    if (Test-Path -LiteralPath $taskInstall) {
        if (-not (Test-Path -LiteralPath $taskMarker)) {
            throw "The destination $taskInstall already exists and is not owned by this setup."
        }
    } else {
        $null = New-Item -ItemType Directory -Path $taskInstall
        'Antigravity B application copy; contains no user account data.' | Set-Content -LiteralPath $taskMarker
    }
    Write-TaskStatus 'Copying installed application files. This may take a minute.'
    foreach ($taskItem in Get-ChildItem -LiteralPath $taskSource -Force) {
        Copy-Item -LiteralPath $taskItem.FullName -Destination $taskInstall -Recurse -Force
    }
    foreach ($taskRelative in @('Antigravity.exe', 'resources\app.asar', 'resources\bin\language_server.exe')) {
        $taskOriginalHash = (Get-FileHash -LiteralPath (Join-Path $taskSource $taskRelative) -Algorithm SHA256).Hash
        $taskCopyHash = (Get-FileHash -LiteralPath (Join-Path $taskInstall $taskRelative) -Algorithm SHA256).Hash
        if ($taskOriginalHash -ne $taskCopyHash) { throw "Application copy verification failed: $taskRelative" }
    }

    # Generate a native Windows icon from a letter, without changing the app logo.
    Add-Type -AssemblyName System.Drawing
    $taskBitmap = New-Object Drawing.Bitmap(256, 256)
    $taskGraphics = [Drawing.Graphics]::FromImage($taskBitmap)
    $taskFont = New-Object Drawing.Font('Segoe UI', 154, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
    $taskBrush = New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(255, 246, 239, 218))
    $taskFormat = New-Object Drawing.StringFormat
    $taskFormat.Alignment = [Drawing.StringAlignment]::Center
    $taskFormat.LineAlignment = [Drawing.StringAlignment]::Center
    $taskGraphics.Clear([Drawing.Color]::FromArgb(255, 42, 79, 147))
    $taskGraphics.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $taskGraphics.DrawString('B', $taskFont, $taskBrush, [Drawing.RectangleF]::new(0, 0, 256, 246), $taskFormat)
    $taskPng = New-Object IO.MemoryStream
    $taskBitmap.Save($taskPng, [Drawing.Imaging.ImageFormat]::Png)
    $taskIconPath = Join-Path $taskInstall 'Antigravity-B.ico'
    $taskIconStream = [IO.File]::Create($taskIconPath)
    $taskWriter = New-Object IO.BinaryWriter($taskIconStream)
    $taskWriter.Write([uint16]0); $taskWriter.Write([uint16]1); $taskWriter.Write([uint16]1)
    $taskWriter.Write([byte]0); $taskWriter.Write([byte]0); $taskWriter.Write([byte]0); $taskWriter.Write([byte]0)
    $taskWriter.Write([uint16]1); $taskWriter.Write([uint16]32)
    $taskWriter.Write([uint32]$taskPng.Length); $taskWriter.Write([uint32]22)
    $taskWriter.Write($taskPng.ToArray()); $taskWriter.Dispose()
    $taskPng.Dispose(); $taskGraphics.Dispose(); $taskFont.Dispose()
    $taskBrush.Dispose(); $taskFormat.Dispose(); $taskBitmap.Dispose()

    $taskShell = New-Object -ComObject WScript.Shell
    $taskLink = $taskShell.CreateShortcut($taskShortcut)
    $taskLink.TargetPath = "$env:SystemRoot\System32\runas.exe"
    # Preserve the executable's inner quotes through runas argument parsing.
    $taskLink.Arguments = '/profile /user:{0}\{1} "\"{2}\""' -f $env:COMPUTERNAME, $taskAccount, $taskExe
    $taskLink.WorkingDirectory = $taskInstall
    $taskLink.IconLocation = "$taskIconPath,0"
    $taskLink.Description = 'Antigravity Desktop using the separate AntigravityB Windows account'
    $taskLink.Save()
    Write-TaskStatus 'Account, application copy, and B desktop shortcut are ready. Launching the second app.'

    $taskCredential = New-Object System.Management.Automation.PSCredential("$env:COMPUTERNAME\$taskAccount", $taskPassword)
    Start-Process -FilePath $taskExe -WorkingDirectory $taskInstall `
        -Credential $taskCredential -LoadUserProfile -WindowStyle Normal
    Write-TaskStatus 'Antigravity B launch requested. Sign into your second Google account in that app. Two-account behavior is not yet verified.'
    Write-Host ''
    Write-Host 'Use the Antigravity B desktop shortcut next time. It asks for the Windows password.'
    Write-Host 'The second app has its own settings, history, and file permissions.'
    Write-Host 'If Google sign-in fails here, sign into the AntigravityB Windows session once and complete it there.'
} catch {
    Write-TaskStatus ('Setup stopped: ' + $_.Exception.Message)
    Write-Host 'No existing account, conversation, or settings were removed.' -ForegroundColor Yellow
    Write-Host 'If the account was created, it remains available for a retry.'
} finally {
    $taskPassword = $null
    $taskConfirm = $null
    $taskCredential = $null
    $taskConfirmation = $null
    Write-Host ''
    $null = Read-Host 'Press Enter to close this setup window'
}
