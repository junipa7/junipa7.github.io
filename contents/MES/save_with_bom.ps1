$path = "C:\Users\junipa7\Documents\myhomepage\contents\MES\split_diagrams.ps1"
$content = Get-Content -Raw -Path $path -Encoding utf8
$utf8WithBom = New-Object System.Text.UTF8Encoding($true)
[System.IO.File]::WriteAllText($path, $content, $utf8WithBom)
Write-Host "Successfully saved split_diagrams.ps1 with UTF-8 BOM!"
