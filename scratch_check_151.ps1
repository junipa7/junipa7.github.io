Add-Type -AssemblyName System.Web
$path = "c:\Users\junipa7\Documents\myhomepage\contents\MES\diagrams\dfd_level_0.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

if ($content -match 'data-mxgraph="([^"]+)"') {
    $val = $Matches[1]
    $decoded = [System.Web.HttpUtility]::HtmlDecode($val)
    
    Write-Host "Decoded String Length: $($decoded.Length)"
    Write-Host "Substring around 151:"
    
    $pos = 151
    $start = [Math]::Max(0, $pos - 40)
    $end = [Math]::Min($decoded.Length, $pos + 40)
    
    for ($i = $start; $i -lt $end; $i++) {
        $char = $decoded[$i]
        $code = [int][char]$char
        $pointer = if ($i -eq $pos) { "===> " } else { "     " }
        Write-Host "$pointer[$i]: '$char' (code: $code)"
    }
} else {
    Write-Host "data-mxgraph not found!"
}
