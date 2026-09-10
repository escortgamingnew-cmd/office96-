$ErrorActionPreference = 'Stop'
$proto = 'D:\Escort gaming\escort-stake\prototype\pixi-feel'
$out = Join-Path $PSScriptRoot 'run-dady.html'

function Load-Module($name) {
  $t = [IO.File]::ReadAllText((Join-Path $proto "src\$name"), [Text.Encoding]::UTF8)
  # strip import lines
  $t = ($t -split "`n" | Where-Object { $_ -notmatch '^\s*import\s' }) -join "`n"
  # strip export keyword
  $t = $t -replace '(?m)^export\s+', ''
  return $t
}

$params  = Load-Module 'params.js'
$tex     = Load-Module 'tex.js'
$cam     = Load-Module 'cam.js'
$world   = Load-Module 'world.js'
$ui      = Load-Module 'ui.js'
$sandbox = Load-Module 'sandbox.js'
$feellab = Load-Module 'feellab.js'
$main    = Load-Module 'main.js'

# world.js uses T.* namespace — provide it
$texNS = @'

const T = { COL, rnd, pick, makeSkyTex, makeDotTex, facadeCanvas, makeBuildingVariant,
  makeRoofTex, makeAntennaTex, makeLampTex, makeTreeTex, makeBushTex, makeCarTex,
  makeBillboardTex, makeChaserTex, makeHotelTex, makeShadowTex };
'@

# swap asset load for embedded data URI
$oldLoad = 'const papiBase = await PIXI.Assets.load("assets/papi-run-20f.webp");'
$newLoad = 'const _img = new Image(); _img.src = PAPI_URI; await _img.decode(); const papiBase = PIXI.Texture.from(_img);'
if (-not $main.Contains($oldLoad)) { throw 'main.js asset-load line not found' }
$main = $main.Replace($oldLoad, $newLoad)

# base64 the spritesheet
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $proto 'assets\papi-run-20f.webp')))
$papi = "const PAPI_URI = `"data:image/webp;base64,$b64`";"

# extract <style> and body markup from index.html
$html = [IO.File]::ReadAllText((Join-Path $proto 'index.html'), [Text.Encoding]::UTF8)
$style = [regex]::Match($html, '(?s)<style>.*?</style>').Value
$body = [regex]::Match($html, '(?s)<body>(.*?)<script').Groups[1].Value.Trim()

$sb = New-Object Text.StringBuilder
[void]$sb.AppendLine('<title>Run Dady</title>')
[void]$sb.AppendLine('<meta charset="utf-8">')
[void]$sb.AppendLine($style)
[void]$sb.AppendLine($body)
[void]$sb.AppendLine('<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/8.16.0/pixi.min.js"></script>')
[void]$sb.AppendLine('<script>')
[void]$sb.AppendLine($papi)
[void]$sb.AppendLine($params)
[void]$sb.AppendLine($tex)
[void]$sb.AppendLine($texNS)
[void]$sb.AppendLine($cam)
[void]$sb.AppendLine($world)
[void]$sb.AppendLine($ui)
[void]$sb.AppendLine($sandbox)
[void]$sb.AppendLine($feellab)
[void]$sb.AppendLine($main)
[void]$sb.AppendLine('</script>')

[IO.File]::WriteAllText($out, $sb.ToString(), (New-Object Text.UTF8Encoding($false)))
"written: $out ($([math]::Round((Get-Item $out).Length/1KB)) KB)"
