$ErrorActionPreference = 'Stop'
$chatDir = 'D:\Escort gaming\escort-stake\office\chat'
$out = Join-Path $PSScriptRoot 'office96-chat.html'

$map = [ordered]@{
  'general'   = 'general.md'
  'dev'       = 'dev.md'
  'product'   = 'product.md'
  'club96'    = 'club96.md'
  'dm-sevak'  = 'dm\sevak.md'
  'decisions' = 'decisions.md'
}

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
      # entry header: [YYYY-MM-DD HH:MM] Author   (decisions: [YYYY-MM-DD] D-xxx — Author)
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
  $archive[$ch] = @($msgs | Sort-Object ts)
  "{0}: {1} msgs" | ForEach-Object { $_ -f $ch, $msgs.Count }
}

$json = ($archive | ConvertTo-Json -Depth 6 -Compress)
$tpl = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'chat-template.html'), [Text.Encoding]::UTF8)
if (-not $tpl.Contains('__ARCHIVE_JSON__')) { throw 'placeholder missing' }
# escape </script> inside embedded JSON
$json = $json.Replace('</', '<\/')
$tpl = $tpl.Replace('__ARCHIVE_JSON__', $json)
[IO.File]::WriteAllText($out, $tpl, (New-Object Text.UTF8Encoding($false)))
"written: $out ($([math]::Round((Get-Item $out).Length/1KB)) KB)"
