$ErrorActionPreference = 'Stop'
$urdRoot = Join-Path (Split-Path $PSScriptRoot -Parent) 'urd-truong-phat-2026-09-12'
$urdSend = Join-Path $urdRoot 'BAN_GUI_KHACH'
$urdReview = Join-Path $urdRoot 'KIEM_TRA_NOI_BO'
$urdWord = New-Object -ComObject Word.Application
$urdWord.Visible = $false
$urdWord.DisplayAlerts = 0
$urdWord.AutomationSecurity = 3
try {
    foreach ($urdFile in (Get-ChildItem -LiteralPath $urdSend -Filter '*.docx')) {
        $urdDocument = $null
        try {
            $urdDocument = $urdWord.Documents.Open($urdFile.FullName, $false, $true, $false)
            $urdDocument.Repaginate()
            $urdPdf = [System.IO.Path]::ChangeExtension($urdFile.FullName, '.pdf')
            $urdDocument.ExportAsFixedFormat($urdPdf, 17)
            [pscustomobject]@{File=$urdFile.Name; Pages=$urdDocument.ComputeStatistics(2)} | ConvertTo-Json -Compress
        } finally {
            if ($null -ne $urdDocument) {
                $urdDocument.Close(0)
                [void][Runtime.InteropServices.Marshal]::ReleaseComObject($urdDocument)
            }
        }
    }
} finally {
    $urdWord.Quit()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($urdWord)
}
$urdExcel = New-Object -ComObject Excel.Application
$urdExcel.Visible = $false
$urdExcel.DisplayAlerts = $false
$urdExcel.AutomationSecurity = 3
$urdWorkbook = $null
try {
    $urdWorkbook = $urdExcel.Workbooks.Open((Join-Path $urdSend '02_BO_TINH_DOI_CHIEU.xlsx'), 0, $false)
    $urdExcel.CalculateFullRebuild()
    $urdWorkbook.Save()
    $urdTrial = $urdWorkbook.Worksheets.Item('Dau vao')
    $urdComparison = $urdWorkbook.Worksheets.Item('4 phuong an')
    $urdOutput = $urdWorkbook.Worksheets.Item('Bao gia')
    $urdMass = $urdWorkbook.Worksheets.Item('Boc tach')
    $urdResults = @()
    # Only this new illustrative workbook is modified. Restore its initial inputs.
    foreach ($urdChoice in 1..4) {
        $urdTrial.Cells.Item(50,2).Value2 = [double]$urdChoice
        $urdExcel.CalculateFullRebuild()
        $urdResults += [pscustomobject]@{
            Check='Choose common alternative'; Choice=$urdChoice
            Output=$urdOutput.Cells.Item(11,6).Value2
            ExpectedColumn=$urdComparison.Cells.Item(11,$urdChoice+1).Value2
            PriceA=$urdOutput.Cells.Item(5,5).Value2
            PriceB=$urdOutput.Cells.Item(6,5).Value2
        }
    }
    $urdTrial.Cells.Item(50,2).Value2 = [double]1
    $urdTrial.Cells.Item(16,2).Value2 = [double]0
    $urdExcel.CalculateFullRebuild()
    $urdResults += [pscustomobject]@{
        Check='Charge retained remnants'; PurchasedKg=$urdMass.Cells.Item(10,2).Value2
        BlankKg=$urdMass.Cells.Item(7,5).Value2; ChargedStock=$urdMass.Cells.Item(15,2).Value2
        TMCTotal=$urdComparison.Cells.Item(11,3).Value2
    }
    $urdTrial.Cells.Item(16,2).Value2 = [double]1
    $urdExcel.CalculateFullRebuild()
    $urdWorkbook.Save()
    $urdWorkbook.Worksheets.Item('4 phuong an').ExportAsFixedFormat(0, (Join-Path $urdReview 'excel-4-phuong-an.pdf'))
    $urdWorkbook.Worksheets.Item('Bao gia').ExportAsFixedFormat(0, (Join-Path $urdReview 'excel-bao-gia.pdf'))
    $urdResults | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $urdReview 'excel-live-tests.json') -Encoding UTF8
    $urdResults | ConvertTo-Json -Depth 4
} finally {
    if ($null -ne $urdWorkbook) {
        $urdWorkbook.Close($false)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($urdWorkbook)
    }
    $urdExcel.Quit()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($urdExcel)
}
