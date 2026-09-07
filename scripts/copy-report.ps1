[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string] $ReportPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$resolvedReport = Resolve-Path -LiteralPath $ReportPath -ErrorAction SilentlyContinue
if ($null -eq $resolvedReport -or -not (Test-Path -LiteralPath $resolvedReport.Path -PathType Leaf)) {
    Write-Error "Report file does not exist: $ReportPath"
    exit 1
}

$reportText = Get-Content -LiteralPath $resolvedReport.Path -Raw -Encoding UTF8
Set-Clipboard -Value $reportText
Write-Host "Copied report to clipboard: $($resolvedReport.Path)"
