$ErrorActionPreference = 'Stop'
$editorRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopRoot = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopRoot 'Adelaide Handyman MEL ONE 本地后台.lnk'
$shortcutShell = New-Object -ComObject WScript.Shell
if (Test-Path -LiteralPath $shortcutPath) {
    $existing = $shortcutShell.CreateShortcut($shortcutPath)
    if ($existing.Arguments -notlike '*Adelaide Handyman MEL ONE*open-editor.vbs*') { throw '桌面已有同名入口，不覆盖，请核对。' }
}
$shortcut = $shortcutShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $env:WINDIR 'System32/wscript.exe'
$shortcut.Arguments = '"' + (Join-Path $editorRoot 'open-editor.vbs') + '"'
$shortcut.WorkingDirectory = Split-Path -Parent (Split-Path -Parent $editorRoot)
$shortcut.Description = 'Adelaide Handyman MEL ONE 本地中文内容编辑；草稿保存、双语预览、历史恢复；不会自动上线'
$shortcut.IconLocation = Join-Path $shortcut.WorkingDirectory 'public/favicon-32.png'
$shortcut.Save()
Write-Output $shortcutPath
