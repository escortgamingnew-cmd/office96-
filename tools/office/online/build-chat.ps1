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
  'decisions' = 'decisions.md'
}

# ---- լոկալ օֆիսի ռեակցիաները (channel -> entry index -> emoji -> [անուններ]) ----
$rxPath = Join-Path $chatDir 'reactions.json'
$rxAll = if (Test-Path $rxPath) { [IO.File]::ReadAllText($rxPath, [Text.Encoding]::UTF8) | ConvertFrom-Json } else { $null }

# ---- արխիվի parse ----
$archive = [ordered]@{}
foreach ($ch in $map.Keys) {
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
# բանալին՝ հեղինակի անվան ՍԿԻԶԲԸ (startsWith match էջում)
$avMap = [ordered]@{}
$avFiles = [ordered]@{ 'Սևակ'='sevak.png'; 'Անանիա'='anania.png'; 'Տիգրան'='tigran.png'; 'Լուսինե'='lusine.png' }
foreach ($k in $avFiles.Keys) {
  $f = Join-Path $avDir $avFiles[$k]
  if (Test-Path $f) { $avMap[$k] = AvatarB64 $f; 'avatar: {0}' -f $k }
}

# ---- հավաքում ----
$json = ($archive | ConvertTo-Json -Depth 6 -Compress).Replace('</', '<\/')
$avJson = ($avMap | ConvertTo-Json -Compress).Replace('</', '<\/')
$tpl = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'chat-template.html'), [Text.Encoding]::UTF8)
foreach ($ph in '__ARCHIVE_JSON__','__AVATARS_JSON__') {
  if (-not $tpl.Contains($ph)) { throw "placeholder missing: $ph" }
}
$tpl = $tpl.Replace('__ARCHIVE_JSON__', $json).Replace('__AVATARS_JSON__', $avJson)
[IO.File]::WriteAllText($out, $tpl, (New-Object Text.UTF8Encoding($false)))
"written: $out ($([math]::Round((Get-Item $out).Length/1KB)) KB)"
