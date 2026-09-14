param([switch]$TemplatePreview)
$ErrorActionPreference = 'Stop'
$contractRoot = Split-Path $PSScriptRoot -Parent
$contractOut = Join-Path $contractRoot 'hop-dong-truong-phat-2026-09-10'
$contractInput = Join-Path $contractOut 'Hop_dong_Xandro_Truong_Phat_65tr_10-09-2026_KY.docx'
$contractPdf = Join-Path $contractOut 'Hop_dong_Xandro_Truong_Phat_65tr_10-09-2026_KY_WORD.pdf'
if ($TemplatePreview) {
  $contractInput = 'C:\Users\DELL\Downloads\Hop_dong_dich_vu_Xandro_Phuoc_An_Kite_Coffee_theo_form_khach_12tr_GTGT_co_bao_gia.docx'
  $contractPdf = Join-Path $contractOut 'NOI_BO_mau_goc.pdf'
}
$contractWord = New-Object -ComObject Word.Application
$contractWord.Visible = $false
$contractWord.DisplayAlerts = 0
$contractWord.AutomationSecurity = 3
$contractDoc = $null
try {
  $contractDoc = $contractWord.Documents.Open($contractInput, $false, $true, $false)
  $contractDoc.Repaginate()
  $contractDoc.ExportAsFixedFormat($contractPdf, 17)
  [pscustomobject]@{File=$contractPdf; Pages=$contractDoc.ComputeStatistics(2)} | Format-List
} finally {
  if ($null -ne $contractDoc) { $contractDoc.Close(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($contractDoc) }
  $contractWord.Quit(0)
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($contractWord)
}
