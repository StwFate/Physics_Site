# One-time taskbar recovery for Venus only. Never enumerates other user hives.
# Uses the documented Start Layout policy, then removes our temporary policy.
[CmdletBinding()]
param([switch]$Preview)
$ErrorActionPreference='Stop'
$taskExpectedProfile='C:\Users\Venus'
$taskIdentity=[Security.Principal.WindowsIdentity]::GetCurrent()
$taskProfileKey='HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList\'+$taskIdentity.User.Value
$taskActualProfile=[Environment]::ExpandEnvironmentVariables((Get-ItemProperty -LiteralPath $taskProfileKey).ProfileImagePath)
if($taskActualProfile -ine $taskExpectedProfile){throw 'This recovery can only run as the Venus user.'}
$taskSource='C:\Users\Public\Documents\TaskbarRecovery-20261016-134349\OrderedShortcuts'
$taskManifest=Import-Csv -LiteralPath (Join-Path $taskSource 'Recovery-order.csv')
if($taskManifest.Count -ne 30){throw 'The expected 30-item recovery manifest is missing.'}
$taskPins=Join-Path $taskExpectedProfile 'AppData\Roaming\Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar'
$taskPolicy='HKCU:\Software\Policies\Microsoft\Windows\Explorer'
$taskTaskband='HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Taskband'
$taskExistingPolicy=Get-ItemProperty -LiteralPath $taskPolicy -ErrorAction SilentlyContinue
if($taskExistingPolicy -and ($null -ne $taskExistingPolicy.StartLayoutFile -or $null -ne $taskExistingPolicy.LockedStartLayout)){
    throw 'An existing Start layout policy is present. It was not changed.'
}
foreach($taskItem in $taskManifest){if(-not(Test-Path -LiteralPath $taskItem.Shortcut)){throw "Missing shortcut: $($taskItem.Name)"}}
if($Preview){
    Write-Output "Target Windows user: $($taskIdentity.Name)"
    Write-Output 'Back up current pins and taskbar registry; apply the supplied 30-item order only to this user.'
    Write-Output 'Restart only this session/user Explorer; remove the temporary policy after applying.'
    return
}
$taskBackup=Join-Path 'C:\Users\Public\Documents' ('TaskbarRecovery-BeforeApply-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
$null=New-Item -ItemType Directory -Path $taskBackup
Copy-Item -LiteralPath $taskPins -Destination (Join-Path $taskBackup 'Pins') -Recurse
& reg.exe export 'HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Taskband' (Join-Path $taskBackup 'Taskband.reg') /y | Out-Null
if($LASTEXITCODE -ne 0){throw 'Could not back up the taskbar registry.'}
$taskLayout=Join-Path $taskBackup 'RecoveryLayout.xml'
$taskXml=New-Object Xml.XmlDocument
$taskXml.LoadXml('<LayoutModificationTemplate xmlns="http://schemas.microsoft.com/Start/2014/LayoutModification" xmlns:defaultlayout="http://schemas.microsoft.com/Start/2014/FullDefaultLayout" xmlns:taskbar="http://schemas.microsoft.com/Start/2014/TaskbarLayout" Version="1"><CustomTaskbarLayoutCollection PinListPlacement="Replace"><defaultlayout:TaskbarLayout><taskbar:TaskbarPinList /></defaultlayout:TaskbarLayout></CustomTaskbarLayoutCollection></LayoutModificationTemplate>')
$taskList=$taskXml.GetElementsByTagName('taskbar:TaskbarPinList')[0]
foreach($taskItem in $taskManifest){
    if($taskItem.AppId -and $taskItem.AppId.Contains('!')){
        $taskEntry=$taskXml.CreateElement('taskbar','UWA','http://schemas.microsoft.com/Start/2014/TaskbarLayout')
        $taskEntry.SetAttribute('AppUserModelID',$taskItem.AppId)
    }else{
        $taskEntry=$taskXml.CreateElement('taskbar','DesktopApp','http://schemas.microsoft.com/Start/2014/TaskbarLayout')
        $taskEntry.SetAttribute('DesktopApplicationLinkPath',$taskItem.Shortcut)
    }
    $null=$taskList.AppendChild($taskEntry)
}
$taskXml.Save($taskLayout)
$taskSession=[Diagnostics.Process]::GetCurrentProcess().SessionId
function Restart-TaskExplorer {
    $taskExplorerProcesses=Get-CimInstance Win32_Process -Filter "Name='explorer.exe' AND SessionId=$taskSession"
    foreach($taskExplorerProcess in $taskExplorerProcesses){
        $taskOwner=Invoke-CimMethod -InputObject $taskExplorerProcess -MethodName GetOwnerSid
        if($taskOwner.Sid -eq $taskIdentity.User.Value){Stop-Process -Id $taskExplorerProcess.ProcessId -Force}
    }
    Start-Sleep -Seconds 2
    if(-not(Get-Process -Name explorer -ErrorAction SilentlyContinue|Where-Object SessionId -eq $taskSession)){
        Start-Process -FilePath "$env:SystemRoot\explorer.exe" -WindowStyle Hidden
    }
}
$taskApplied=$false
try{
    $null=New-Item -Path $taskPolicy -Force
    $null=New-ItemProperty -LiteralPath $taskPolicy -Name StartLayoutFile -PropertyType String -Value $taskLayout -Force
    $null=New-ItemProperty -LiteralPath $taskPolicy -Name LockedStartLayout -PropertyType DWord -Value 1 -Force
    # Clear only the saved pins for this known user, after the verified backup.
    # Paths are literal and the file list is bounded; no recursive deletion.
    foreach($taskFile in Get-ChildItem -LiteralPath $taskPins -Filter '*.lnk'){
        if($taskFile.Directory.FullName -ine $taskPins){throw 'Unexpected shortcut path.'}
        Remove-Item -LiteralPath $taskFile.FullName
    }
    foreach($taskName in @('Favorites','FavoritesResolve','FavoritesChanges','FavoritesRemovedChanges','FavoritesVersion')){
        Remove-ItemProperty -LiteralPath $taskTaskband -Name $taskName -ErrorAction SilentlyContinue
    }
    Restart-TaskExplorer
    for($taskTry=0;$taskTry -lt 20;$taskTry++){
        Start-Sleep -Seconds 1
        $taskCount=@(Get-ChildItem -LiteralPath $taskPins -Filter '*.lnk').Count
        if($taskCount -ge 27){$taskApplied=$true;break}
    }
    if(-not $taskApplied){throw 'Windows did not apply the supplied layout; restoring the pre-attempt taskbar.'}
}catch{
    $taskFailure=$_.Exception.Message
}finally{
    Remove-ItemProperty -LiteralPath $taskPolicy -Name StartLayoutFile -ErrorAction SilentlyContinue
    Remove-ItemProperty -LiteralPath $taskPolicy -Name LockedStartLayout -ErrorAction SilentlyContinue
    if(-not $taskApplied){
        foreach($taskFile in Get-ChildItem -LiteralPath $taskPins -Filter '*.lnk'){Remove-Item -LiteralPath $taskFile.FullName}
        foreach($taskFile in Get-ChildItem -LiteralPath (Join-Path $taskBackup 'Pins') -Filter '*.lnk'){
            Copy-Item -LiteralPath $taskFile.FullName -Destination $taskPins
        }
        & reg.exe import (Join-Path $taskBackup 'Taskband.reg') | Out-Null
    }
    Restart-TaskExplorer
}
[pscustomobject]@{Applied=$taskApplied;Backup=$taskBackup;PinCount=@(Get-ChildItem -LiteralPath $taskPins -Filter '*.lnk').Count;TemporaryPolicyRemoved=$true;Error=$taskFailure}|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $taskBackup 'Result.json')
Write-Output (Get-Content -LiteralPath (Join-Path $taskBackup 'Result.json') -Raw)
