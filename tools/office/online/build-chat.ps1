$ErrorActionPreference = 'Stop'
$repo = 'D:\Escort gaming\escort-stake'
$chatDir = Join-Path $repo 'office\chat'
$avDir = Join-Path $repo 'office\citizens\avatars'
$out = Join-Path $env:TEMP 'office96-chat.html'

$map = [ordered]@{
  'general'   = 'general.md'
  'dev'       = 'dev.md'
  'product'   = 'product.md'
  'club96'    = 'club96.md'
  'dm-sevak'  = 'dm\sevak.md'
  'dm-tigran' = 'dm\tigran.md'
  'dm-anania' = 'dm\anania.md'
  'dm-lusine' = 'dm\lusine.md'
  'dm-areg'   = 'dm\areg.md'
  'dm-hasmik' = 'dm\hasmik.md'
  'decisions' = 'decisions.md'
}

# ---- լոկալ օֆիսի ռեակցիաները (channel -> entry index -> emoji -> [անուններ]) ----
$rxPath = Join-Path $chatDir 'reactions.json'
$rxAll = if (Test-Path $rxPath) { [IO.File]::ReadAllText($rxPath, [Text.Encoding]::UTF8) | ConvertFrom-Json } else { $null }

# ---- արխիվի parse ----
$archive = [ordered]@{}
foreach ($ch in $map.Keys) {
  # DM-երը անձնական են (D-012)՝ db-only. git-ի արխիվ չեն մտնում, էջում չեն baked լինում։
  if ($ch -like 'dm-*') { $archive[$ch] = @(); 'dm (private, db-only): {0}' -f $ch; continue }
  $path = Join-Path $chatDir $map[$ch]
  $msgs = @()
  if (Test-Path $path) {
    $raw = [IO.File]::ReadAllText($path, [Text.Encoding]::UTF8)
    $blocks = [regex]::Split($raw, "(?m)^---\s*$")
    $i = 0
    foreach ($b in $blocks) {
      $b = $b.Trim()
      if ($b -eq '') { continue }
      $m = [regex]::Match($b, '(?m)^\[(\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}))?\]\s*(.+)$')
      if (-not $m.Success) { continue }
      $date = $m.Groups[1].Value
      $time = if ($m.Groups[2].Success) { $m.Groups[2].Value } else { '00:00' }
      $author = $m.Groups[3].Value.Trim()
      $text = $b.Substring($m.Index + $m.Length).Trim()
      if ($text -eq '') { continue }
      $i++
      $msgs += [pscustomobject]@{
        id     = ('a{0}T{1}-{2:d3}' -f $date, ($time -replace ':',''), $i)
        author = $author
        ts     = "${date}T${time}:00"
        text   = $text
      }
    }
  }
  # ռեակցիաները կպցնում ենք ֆայլի հերթականության ինդեքսով՝ ՄԻՆՉԵՎ sort-ը
  $chRx = if ($rxAll) { $rxAll.PSObject.Properties[$ch] } else { $null }
  if ($chRx -and $chRx.Value) {
    for ($n = 0; $n -lt $msgs.Count; $n++) {
      $p = $chRx.Value.PSObject.Properties["$n"]
      if ($p -and $p.Value) {
        $r = [ordered]@{}
        foreach ($e in $p.Value.PSObject.Properties) { $r[$e.Name] = @($e.Value) }
        $msgs[$n] | Add-Member -NotePropertyName reactions -NotePropertyValue $r
      }
    }
  }
  $archive[$ch] = @($msgs | Sort-Object ts)
  '{0}: {1} msgs' -f $ch, $msgs.Count
}

# ---- ավատարներ. 96px քառակուսի JPEG, base64 ----
Add-Type -AssemblyName System.Drawing
function AvatarB64($file) {
  $img = [Drawing.Image]::FromFile($file)
  try {
    $side = [Math]::Min($img.Width, $img.Height)
    $srcX = [int](($img.Width - $side) / 2); $srcY = [int](($img.Height - $side) / 2)
    $bmp = New-Object Drawing.Bitmap 96, 96
    $g = [Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.DrawImage($img, (New-Object Drawing.Rectangle 0,0,96,96), (New-Object Drawing.Rectangle $srcX,$srcY,$side,$side), 'Pixel')
    $g.Dispose()
    $ms = New-Object IO.MemoryStream
    $enc = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $ep = New-Object Drawing.Imaging.EncoderParameters 1
    $ep.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality, 82L)
    $bmp.Save($ms, $enc, $ep)
    $bmp.Dispose()
    return 'data:image/jpeg;base64,' + [Convert]::ToBase64String($ms.ToArray())
  } finally { $img.Dispose() }
}
# մեծ նկար (պրոֆիլ քարտ/սթորի). max կողմը $maxDim, JPEG
function ImgB64($file, $maxDim, $q) {
  $img = [Drawing.Image]::FromFile($file)
  try {
    $k = [Math]::Min(1.0, $maxDim / [Math]::Max($img.Width, $img.Height))
    $w = [Math]::Max(1, [int]($img.Width * $k)); $h = [Math]::Max(1, [int]($img.Height * $k))
    $bmp = New-Object Drawing.Bitmap $w, $h
    $g = [Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.DrawImage($img, 0, 0, $w, $h)
    $g.Dispose()
    $ms = New-Object IO.MemoryStream
    $enc = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $ep = New-Object Drawing.Imaging.EncoderParameters 1
    $ep.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality, [long]$q)
    $bmp.Save($ms, $enc, $ep)
    $bmp.Dispose()
    return 'data:image/jpeg;base64,' + [Convert]::ToBase64String($ms.ToArray())
  } finally { $img.Dispose() }
}
# բանալին՝ հեղինակի անվան ՍԿԻԶԲԸ (startsWith match էջում)
$avMap = [ordered]@{}
$avFiles = [ordered]@{ 'Սևակ'='sevak.png'; 'Անանիա'='anania.png'; 'Տիգրան'='tigran.png'; 'Լուսինե'='lusine.png'; 'Արեգ'='areg.png'; 'Հասմիկ'='hasmik.png' }
foreach ($k in $avFiles.Keys) {
  $f = Join-Path $avDir $avFiles[$k]
  if (Test-Path $f) { $avMap[$k] = AvatarB64 $f; 'avatar: {0}' -f $k }
}

# ---- պրոֆիլներ. bio (profiles.json) + մեծ ավատար 320px ----
$profSrc = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'profiles.json'), [Text.Encoding]::UTF8) | ConvertFrom-Json
$profMap = [ordered]@{}
foreach ($p in $profSrc.PSObject.Properties) {
  $o = [ordered]@{ role = $p.Value.role; bio = $p.Value.bio }
  if ($avFiles.Contains($p.Name)) {
    $f = Join-Path $avDir $avFiles[$p.Name]
    if (Test-Path $f) { $o['big'] = ImgB64 $f 320 84 }
  }
  $profMap[$p.Name] = $o
  'profile: {0}' -f $p.Name
}

# ---- սթորիներ (D-011). manifest.json + նկարները. ՄԻԱՅՆ վերջին 24 ժ-ը էջ ա գնում,
#      հին ֆայլերը մնում են արխիվում (append-only), ուղղակի գոտում չեն երևա ----
$stDir = Join-Path $repo 'office\citizens\stories'
$stories = @()
$stCutoff = (Get-Date).AddHours(-24)
$manPath = Join-Path $stDir 'manifest.json'
if (Test-Path $manPath) {
  $man = [IO.File]::ReadAllText($manPath, [Text.Encoding]::UTF8) | ConvertFrom-Json
  foreach ($s in @($man)) {
    if (-not $s) { continue }
    $f = Join-Path $stDir $s.file
    if (-not (Test-Path $f)) { 'story SKIP (file missing): {0}' -f $s.id; continue }
    try { $stTs = [datetime]::Parse([string]$s.ts) } catch { $stTs = Get-Date }
    if ($stTs -lt $stCutoff) { 'story EXPIRED (>24h, արխիվում մնում ա): {0}' -f $s.id; continue }
    $stories += [pscustomobject]@{
      id      = $s.id
      author  = $s.author
      ts      = $s.ts
      caption = [string]$s.caption
      img     = (ImgB64 $f 900 80)
    }
    'story: {0}' -f $s.id
  }
}

# ---- հավաքում ----
$json = ($archive | ConvertTo-Json -Depth 6 -Compress).Replace('</', '<\/')
$avJson = ($avMap | ConvertTo-Json -Compress).Replace('</', '<\/')
$profJson = ($profMap | ConvertTo-Json -Depth 4 -Compress).Replace('</', '<\/')
$stJson = if ($stories.Count) { (ConvertTo-Json @($stories) -Depth 4 -Compress).Replace('</', '<\/') } else { '[]' }
$tpl = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'chat-template.html'), [Text.Encoding]::UTF8)
foreach ($ph in '__ARCHIVE_JSON__','__AVATARS_JSON__','__PROFILES_JSON__','__STORIES_JSON__') {
  if (-not $tpl.Contains($ph)) { throw "placeholder missing: $ph" }
}
$tpl = $tpl.Replace('__ARCHIVE_JSON__', $json).Replace('__AVATARS_JSON__', $avJson).Replace('__PROFILES_JSON__', $profJson).Replace('__STORIES_JSON__', $stJson)
# ---- «արթնացնող կամուրջի» quine-ը. SELF_T-ի մեջ դնում ենք ֆրագմենտի placeholder-ով
#      տարբերակը, որ էջը կարողանա ինքն իրան վերահրապարակել (artifact capability) ----
$qMark = '"__' + 'Q__"'
if ($tpl.Contains($qMark)) {
  $esc = $tpl.Replace('\', '\\').Replace('"', '\"').Replace("`r", '\r').Replace("`n", '\n').Replace('</', '<\/')
  $tpl = $tpl.Replace($qMark, '"' + $esc + '"')
}
[IO.File]::WriteAllText($out, $tpl, (New-Object Text.UTF8Encoding($false)))
"written: $out ($([math]::Round((Get-Item $out).Length/1KB)) KB)"
