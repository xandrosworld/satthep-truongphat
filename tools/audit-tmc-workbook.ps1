param(
  [Parameter(Mandatory=$true)][string]$SourcePath,
  [string]$OutputDirectory = 'artifacts/customer-review/scope-completion-2026-09-14/source-audit'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$tmcSource = (Resolve-Path -LiteralPath $SourcePath).Path
$tmcZip = [IO.Compression.ZipFile]::OpenRead($tmcSource)
try {
  function Read-TmcXml([string]$part) {
    $entry = $tmcZip.GetEntry($part)
    if (-not $entry) { throw "Missing workbook part: $part" }
    $reader = [IO.StreamReader]::new($entry.Open())
    try { [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
  }
  $strings = Read-TmcXml 'xl/sharedStrings.xml'
  $texts = @($strings.sst.si | ForEach-Object { ($_.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join '' })
  $book = Read-TmcXml 'xl/workbook.xml'
  $rels = Read-TmcXml 'xl/_rels/workbook.xml.rels'
  $sheets = @{}
  foreach ($sheet in $book.workbook.sheets.sheet) {
    $relId = $sheet.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    $rel = $rels.Relationships.Relationship | Where-Object { $_.Id -eq $relId }
    $sheets[$sheet.name] = Read-TmcXml ('xl/' + $rel.Target)
  }
  function Read-TmcCell([string]$sheet, [string]$address) {
    $cell = $sheets[$sheet].SelectSingleNode('//*[local-name()="c" and @r="' + $address + '"]')
    if (-not $cell) { return [ordered]@{ sheet=$sheet; address=$address; value=$null; formula=$null } }
    $value = $cell.SelectSingleNode('./*[local-name()="v"]')
    $formula = $cell.SelectSingleNode('./*[local-name()="f"]')
    $decoded = if ($value) { $value.InnerText } else { $null }
    if ($cell.t -eq 's' -and $value) { $decoded=$texts[[int]$value.InnerText] }
    [ordered]@{sheet=$sheet; address=$address; value=$decoded; formula=$(if($formula){$formula.InnerText}else{$null}); sharedIndex=$(if($formula){$formula.GetAttribute('si')}else{$null})}
  }
  $cells = @()
  foreach ($address in @('D4','D5','D6','D7','AS4','AT4','AW4','AY4','BP4','BQ4','BR4','BS4','BT4','BU4','BV4','BW4','BY4','CA4','CB2','CB4','CE4','CF2','CG2','CH2','CI2','CM4','CO4','BX3','CP3')) { $cells += Read-TmcCell 'XD Gia' $address }
  foreach ($address in @('J4','L4','L3')) { $cells += Read-TmcCell 'Output' $address }
  foreach ($address in @('L4','N4','AD22','AE22')) { $cells += Read-TmcCell 'BC Chao gia' $address }
  foreach ($row in 19..22) { foreach ($column in @('AP','AQ','AR','AT','AU','AV')) { $cells += Read-TmcCell 'Data' ($column+$row) } }
  foreach ($row in 31..34) { foreach ($column in @('AP','AQ','AR','AT','AU','AV')) { $cells += Read-TmcCell 'Data' ($column+$row) } }
  function Number-Tmc([string]$address) { [double](($cells | Where-Object { $_.sheet -eq 'XD Gia' -and $_.address -eq $address }).value) }
  $commonBase = (Number-Tmc 'BP4')+(Number-Tmc 'BQ4')+(Number-Tmc 'BR4')+(Number-Tmc 'BU4')+(Number-Tmc 'BV4')+(Number-Tmc 'BW4')+(Number-Tmc 'BY4')
  $common = if ((Number-Tmc 'CA4') -gt 0) { Number-Tmc 'CA4' } else { $commonBase*(Number-Tmc 'CB2') }
  $basePrice = $commonBase+$common
  $unitPrice = $basePrice*(1+(Number-Tmc 'CF2'))*(1+(Number-Tmc 'CG2'))*(1+(Number-Tmc 'CH2'))*(Number-Tmc 'CI2')/(Number-Tmc 'AY4')
  $amount = (Number-Tmc 'AW4')*$unitPrice
  $checks = @(
    [ordered]@{cell='CB4'; calculated=$commonBase*(Number-Tmc 'CB2'); cached=Number-Tmc 'CB4'},
    [ordered]@{cell='CE4'; calculated=$basePrice; cached=Number-Tmc 'CE4'},
    [ordered]@{cell='CM4'; calculated=$unitPrice; cached=Number-Tmc 'CM4'},
    [ordered]@{cell='CO4'; calculated=$amount; cached=Number-Tmc 'CO4'}
  )
  foreach ($mapping in @(@('Output','J4',$unitPrice),@('Output','L4',$amount),@('BC Chao gia','L4',$unitPrice))) {
    $cached = ($cells | Where-Object { $_.sheet -eq $mapping[0] -and $_.address -eq $mapping[1] }).value
    if ($null -eq $cached -or $cached -eq '') { throw 'Missing linked output cell' }
    $checks += [ordered]@{cell=($mapping[0]+'!'+$mapping[1]);calculated=$mapping[2];cached=[double]$cached}
  }
  foreach ($check in $checks) { $check.delta=$check.calculated-$check.cached; $check.passed=[Math]::Abs($check.delta) -lt 0.000001 }
  $report = [ordered]@{
    at=[DateTime]::UtcNow.ToString('o'); sourceName=[IO.Path]::GetFileName($tmcSource); sha256=(Get-FileHash -LiteralPath $tmcSource -Algorithm SHA256).Hash.ToLowerInvariant()
    method='Read original OOXML and cached cells; independently recompute CB/CE/CM/CO. No Excel full-workbook recalculation, no customer data edits.'
    cachedExampleKind='D4:D7 are mechanical in the supplied workbook, not a real pure-TMC or mixed-order acceptance sample.'
    cells=$cells; checks=$checks; passed=(@($checks | Where-Object { -not $_.passed }).Count -eq 0)
    findings=@('CB uses material + auxiliary + separate part price + blended labor + finishing + internal freight + installation, before common cost; delivery excluded.', 'CA uses length in millimetres times quantity times 2: equivalent 2000 currency units per metre, not 2 per metre.', 'CI2 is a multiplier, not a percentage. Percent-form equivalent is (CI2-1)*100 and must retain source/label.', 'The workbook CP3 delivery calculation is separate. Later customer three-layer/all-in rules take precedence; do not append CP3 on top of an already complete quotation.', 'This cached arithmetic audit alone does not close CD-01 or establish a new business formula.')
  }
  New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
  $report | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath (Join-Path $OutputDirectory 'workbook-audit.json') -Encoding UTF8
  $checks | ForEach-Object { [PSCustomObject]$_ } | Format-Table cell,calculated,cached,delta,passed -AutoSize
  if (-not $report.passed) { throw 'Original workbook cached arithmetic did not reconcile' }
} finally { $tmcZip.Dispose() }
