Add-Type -AssemblyName System.Web

$xml = '<mxfile><diagram name="Test Diagram" id="1"></diagram></mxfile>'
$mxgraphData = @{
    highlight = "#007acc"
    nav = [bool]$true
    resize = [bool]$true
    "dark-mode" = "dark"
    toolbar = "zoom layers tags lightbox"
    edit = "_blank"
    xml = $xml
}

$jsonStr = ConvertTo-Json $mxgraphData -Compress
$jsonEncoded = [System.Web.HttpUtility]::HtmlEncode($jsonStr)

Write-Host "JSON string: $jsonStr"
Write-Host "Encoded string: $jsonEncoded"
