$ErrorActionPreference = 'Stop'
# Run Dady FLAT A/B — շենքերը մեկ նկարով (baked skew, GPT-ի պրոտոյի ձևը)՝
# երեսներով 2.5D-ի հետ համեմատելու համար։ Հիմնադրի պատվերը, 2026-09-10։
# Տիգրանի կոդը ՉԻ փոխվում — patch-երը միայն build-ի պահին են։
$proto = 'D:\Escort gaming\escort-stake\prototype\pixi-feel'
$out = Join-Path $env:TEMP 'run-dady-flat.html'

function Load-Module($name) {
  $t = [IO.File]::ReadAllText((Join-Path $proto "src\$name"), [Text.Encoding]::UTF8)
  $t = ($t -split "`n" | Where-Object { $_ -notmatch '^\s*import\s' }) -join "`n"
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

# ---- FLAT patch-երը world.js-ի վրա ----
# 1. կողային ու տանիքի mesh-երը չեն նկարվում
$world = $world.Replace('this._wallQuad(b.sideQ, xi, v.h, zNear, zFar, b.side > 0);', 'b.sideQ.m.visible = false;')
$world = [regex]::Replace($world, 'if \(cam\.y > v\.h \+ 0\.2\) this\._roofQuad\([^\r\n]*\r?\n\s*else b\.roofQ\.m\.visible = false;', 'b.roofQ.m.visible = false;')
if ($world -match '_roofQuad\(b\.roofQ') { throw 'roof patch failed' }
# 2. side texture չկա flat վարիանտում — dummy
$world = $world.Replace('new Quad(v.side)', 'new Quad(this.roofTex)')
# 3. front-ը հիմա ամբողջ շենքն ա (front+baked side), աջ կողմի շենքերը հայելային
$world = $world.Replace('this.buildings.push(b);', 'b.front.scale.x = side > 0 ? -1 : 1; this.buildings.push(b);')
$world = $world.Replace('.place(b.front, cx, zNear, v.w, v.h)', '.place(b.front, cx, zNear, v.wFlat || v.w, v.hFlat || v.h)')

$texNS = @'

const T = { COL, rnd, pick, makeSkyTex, makeDotTex, facadeCanvas, makeBuildingVariant,
  makeRoofTex, makeAntennaTex, makeLampTex, makeTreeTex, makeBushTex, makeCarTex,
  makeBillboardTex, makeChaserTex, makeHotelTex, makeShadowTex };
'@

# ---- FLAT շենք. front + կողը ներկած-թեքած ՄԵԿ canvas-ում (ֆիքսված անկյուն) ----
$flatChunk = @'

function makeBuildingVariantFlat() {
  const tower = rnd() < .5;
  const h = tower ? rnd(10.5, 13) : rnd(8, 10.5);
  const d = tower ? rnd(5, 7) : rnd(8, 12);
  const w = tower ? rnd(5, 8) : rnd(9, 14);
  const wall = pick(COL.walls);
  const front = facadeCanvas(w, h, wall, 0.6, {});
  const side = facadeCanvas(d, h, wall, 0.6, { door: true });
  const K = 0.45, RISE = 0.16;
  const sw = Math.round(side.width * K);
  const rise = Math.round(h * 22 * RISE);
  const c = document.createElement("canvas");
  c.width = front.width + sw; c.height = front.height + rise;
  const x = c.getContext("2d");
  x.drawImage(front, 0, rise);
  x.setTransform(1, -(rise / sw), 0, 1, front.width, rise);
  x.drawImage(side, 0, 0, side.width, side.height, 0, 0, sw, front.height);
  x.fillStyle = "rgba(20,16,40,.28)"; x.fillRect(0, 0, sw, front.height);
  x.setTransform(1, 0, 0, 1, 0, 0);
  return { w, h, d, front: tex(c), side: null, antenna: h > 12,
           wFlat: w + d * K, hFlat: h * (1 + RISE) };
}
T.makeBuildingVariant = makeBuildingVariantFlat;
'@

$oldLoad = 'const papiBase = await PIXI.Assets.load("assets/papi-run-20f.webp");'
$newLoad = 'const _img = new Image(); _img.src = PAPI_URI; await _img.decode(); const papiBase = PIXI.Texture.from(_img);'
if (-not $main.Contains($oldLoad)) { throw 'main.js asset-load line not found' }
$main = $main.Replace($oldLoad, $newLoad)

$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $proto 'assets\papi-run-20f.webp')))
$papi = "const PAPI_URI = `"data:image/webp;base64,$b64`";"

$html = [IO.File]::ReadAllText((Join-Path $proto 'index.html'), [Text.Encoding]::UTF8)
$style = [regex]::Match($html, '(?s)<style>.*?</style>').Value
$body = [regex]::Match($html, '(?s)<body>(.*?)<script').Groups[1].Value.Trim()
$badge = '<div style="position:fixed;top:44px;right:10px;z-index:5;font:600 10px ui-monospace,monospace;color:#ffd27a;background:rgba(14,19,27,.75);border:1px solid rgba(255,210,122,.4);border-radius:6px;padding:3px 8px">FLAT ՓՈՐՁ</div>'
$body = $body.Replace('<button id="fpsBtn"', $badge + '<button id="fpsBtn"')

$sb = New-Object Text.StringBuilder
[void]$sb.AppendLine('<title>Run Dady Flat</title>')
[void]$sb.AppendLine('<meta charset="utf-8">')
[void]$sb.AppendLine($style)
[void]$sb.AppendLine($body)
[void]$sb.AppendLine('<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/8.16.0/pixi.min.js"></script>')
[void]$sb.AppendLine('<script>')
[void]$sb.AppendLine($papi)
[void]$sb.AppendLine($params)
[void]$sb.AppendLine($tex)
[void]$sb.AppendLine($texNS)
[void]$sb.AppendLine($flatChunk)
[void]$sb.AppendLine($cam)
[void]$sb.AppendLine($world)
[void]$sb.AppendLine($ui)
[void]$sb.AppendLine($sandbox)
[void]$sb.AppendLine($feellab)
[void]$sb.AppendLine($main)
[void]$sb.AppendLine('</script>')

[IO.File]::WriteAllText($out, $sb.ToString(), (New-Object Text.UTF8Encoding($false)))
"written: $out ($([math]::Round((Get-Item $out).Length/1KB)) KB)"
