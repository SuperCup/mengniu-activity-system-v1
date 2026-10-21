$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$root = "D:\Project\蒙牛-原型-ds-harness\hq-console"
$out  = "D:\Project\蒙牛-原型-ds-harness\_analysis\shots"
New-Item -ItemType Directory -Force -Path $out | Out-Null
$views = @('v-home','v-create','v-approve','v-manage','v-plan','v-h5','v-board','v-admin','v-vendor')
foreach($v in $views){
  $url = "file:///" + ($root -replace '\\','/') + "/index.html#" + $v
  $dom = Join-Path $out "$v.dom.html"
  & $chrome --headless=new --disable-gpu --no-sandbox --virtual-time-budget=4000 --dump-dom $url 2>$null | Set-Content -LiteralPath $dom -Encoding utf8
  $len = (Get-Item $dom).Length
  $err = Select-String -LiteralPath $dom -Pattern 'mtlErr' -SimpleMatch -Quiet
  "$v dom=$len errBanner=$err"
}
