$path = "C:\Users\junipa7\Documents\myhomepage\contents\MES\split_diagrams.ps1"
$lines = (Get-Content -Raw -Path $path -Encoding utf8) -split "\r?\n"
if ($lines.Count -lt 2) { $lines = (Get-Content -Raw -Path $path -Encoding utf8) -split "\n" }
for ($i = 370; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    Write-Host "Line $($i+1): '$line'"
    # Find all quote positions
    $quotePos = @()
    for ($j = 0; $j -lt $line.Length; $j++) {
        if ($line[$j] -eq '"') {
            $quotePos += ($j + 1)
        }
    }
    if ($quotePos.Count -gt 0) {
        Write-Host "  Double quotes at columns: $($quotePos -join ', ')"
    }
}
