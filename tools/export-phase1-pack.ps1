$ErrorActionPreference = 'Stop'
$phaseFolder = Join-Path (Split-Path $PSScriptRoot -Parent) 'giai-doan-1-2026-09-12'
$phaseFile = Join-Path $phaseFolder '01_LUONG_TONG_THE_VA_BAO_GIA_1_3.docx'
$phaseWord = New-Object -ComObject Word.Application
$phaseWord.Visible = $false
$phaseWord.DisplayAlerts = 0
$phaseWord.AutomationSecurity = 3
$phaseDocument = $null
try {
    $phaseDocument = $phaseWord.Documents.Open($phaseFile, $false, $true, $false)
    $phaseDocument.Repaginate()
    $phaseDocument.ExportAsFixedFormat([System.IO.Path]::ChangeExtension($phaseFile, '.pdf'), 17)
    [pscustomobject]@{ File=$phaseFile; Pages=$phaseDocument.ComputeStatistics(2) } | ConvertTo-Json
} finally {
    if ($null -ne $phaseDocument) {
        $phaseDocument.Close(0)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($phaseDocument)
    }
    $phaseWord.Quit()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($phaseWord)
}
