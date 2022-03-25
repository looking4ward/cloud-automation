cls
function Get-Variables() {
    return Get-Content "$PSScriptRoot\variables.json" | ConvertFrom-Json
}
