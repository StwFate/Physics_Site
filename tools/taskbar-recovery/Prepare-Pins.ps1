# Reconstruct the user's supplied list as shortcuts. This does NOT change pins,
# registry policies, any other account, or start applications.
[CmdletBinding()]
param([string]$Destination = 'C:\Users\Public\Documents\TaskbarRecovery-20261016-134349\OrderedShortcuts')
$ErrorActionPreference = 'Stop'
Add-Type -Path (Join-Path $PSScriptRoot 'ShellLinks.cs')
$taskDesktop = 'C:\Users\Venus\OneDrive\Desktop'
$taskPublicDesktop = 'C:\Users\Public\Desktop'
$taskUserStart = 'C:\Users\Venus\AppData\Roaming\Microsoft\Windows\Start Menu\Programs'
$taskCommonStart = 'C:\ProgramData\Microsoft\Windows\Start Menu\Programs'
$taskImplicit = 'C:\Users\Venus\AppData\Roaming\Microsoft\Internet Explorer\Quick Launch\User Pinned\ImplicitAppShortcuts'
$taskItems = @(
    @{Name='File Explorer';Source='C:\Users\Public\Documents\TaskbarRecovery-20261016-134349\CurrentPins\File Explorer.lnk'},
    @{Name='Comet Main';Source=(Join-Path $taskDesktop 'General - Comet.lnk')},
    @{Name='Comet Work';Find='Work - Comet.lnk'},
    @{Name='Brave';Source=(Join-Path $taskPublicDesktop 'Brave.lnk')},
    @{Name='Discord';Source=(Join-Path $taskDesktop 'Discord - Copy.lnk')},
    @{Name='Roblox';AppId='com.Roblox.Player'},
    @{Name='Roblox Studio';Source=(Join-Path $taskDesktop 'Roblox Studio.lnk')},
    @{Name='iCUE';Source=(Join-Path $taskPublicDesktop 'iCUE.lnk')},
    @{Name='OBS Studio';Source=(Join-Path $taskPublicDesktop 'OBS Studio.lnk')},
    @{Name='Visual Studio Code';Source=(Join-Path $taskDesktop 'Visual Studio Code.lnk')},
    @{Name='Antigravity';Source=(Join-Path $taskDesktop 'Antigravity.lnk')},
    @{Name='Antigravity 2';Source=(Join-Path $taskDesktop 'Antigravity2.exe.lnk')},
    @{Name='ChatGPT';AppId='OpenAI.Codex_2p2nqsd0c76g0!App'},
    @{Name='Antigravity IDE';Source=(Join-Path $taskDesktop 'Antigravity IDE.lnk')},
    @{Name='Voicemod';Source=(Join-Path $taskCommonStart 'Voicemod\Voicemod.lnk')},
    @{Name='MuMu Multi Manager';Target='C:\Program Files\Netease\MuMuPlayer\nx_main\MuMuManager.exe'},
    @{Name='Razer Synapse';AppId='Razer.Synapse.4'},
    @{Name='Unsloth';Source=(Join-Path $taskDesktop 'Unsloth.lnk')},
    @{Name='Spotify';Source=(Join-Path $taskDesktop 'Spotify.lnk')},
    @{Name='Clumsy';Target=(Join-Path $taskDesktop 'clumsy-0.3-win64-a\clumsy.exe')},
    @{Name='DuckDuckGo';AppId='DuckDuckGo.DesktopBrowser_ya2fgkz3nks94!App'},
    @{Name='Brave Personal';Find='Personal - Brave.lnk'},
    @{Name='Chrome Personal';Source=(Join-Path $taskDesktop 'Solarized (General) - Chrome.lnk')},
    @{Name='Lunar Client';Source=(Join-Path $taskDesktop 'Lunar Client.lnk')},
    @{Name='Chrome School';Find='Rehan (student.lhschools.org) - Chrome.lnk'},
    @{Name='BlurAutoClicker';Source=(Join-Path $taskDesktop 'BlurAutoClicker.lnk')},
    @{Name='Figma';Source=(Join-Path $taskUserStart 'Figma.lnk')},
    @{Name='Antigravity Tools';Source=(Join-Path $taskDesktop 'Antigravity Tools.lnk')},
    @{Name='StarDesk';Source=(Join-Path $taskDesktop 'StarDesk.lnk')},
    @{Name='OpenCode';Source=(Join-Path $taskDesktop 'OpenCode.lnk')}
)
$null = New-Item -ItemType Directory -Path $Destination -Force
$taskShell = New-Object -ComObject WScript.Shell
$taskReport = for ($taskIndex=0; $taskIndex -lt $taskItems.Count; $taskIndex++) {
    $taskItem = $taskItems[$taskIndex]
    $taskPath = Join-Path $Destination ('{0:00} {1}.lnk' -f ($taskIndex+1), $taskItem.Name)
    if ($taskItem.Find) {
        $taskFound = @(Get-ChildItem -LiteralPath $taskImplicit -Filter '*.lnk' -Recurse | Where-Object Name -eq $taskItem.Find)
        if ($taskFound.Count -ne 1) { throw "Expected exactly one source for $($taskItem.Name)." }
        $taskItem.Source = $taskFound[0].FullName
    }
    if ($taskItem.Source) {
        Copy-Item -LiteralPath $taskItem.Source -Destination $taskPath -Force
    } elseif ($taskItem.AppId) {
        [RecoveryShellLinks]::CreateAppShortcut($taskPath, $taskItem.AppId, $taskItem.Name)
    } else {
        if (-not (Test-Path -LiteralPath $taskItem.Target)) { throw "Application not found: $($taskItem.Name)" }
        $taskLink = $taskShell.CreateShortcut($taskPath)
        $taskLink.TargetPath = $taskItem.Target
        $taskLink.WorkingDirectory = Split-Path -Parent $taskItem.Target
        $taskLink.IconLocation = "$($taskItem.Target),0"
        $taskLink.Save()
    }
    $taskLink = $taskShell.CreateShortcut($taskPath)
    [pscustomobject]@{Order=$taskIndex+1;Name=$taskItem.Name;Shortcut=$taskPath;Target=$taskLink.TargetPath;Arguments=$taskLink.Arguments;AppId=$taskItem.AppId}
}
$taskReport | Export-Csv -LiteralPath (Join-Path $Destination 'Recovery-order.csv') -NoTypeInformation
$taskReport | Select-Object Order,Name | Format-Table -AutoSize
