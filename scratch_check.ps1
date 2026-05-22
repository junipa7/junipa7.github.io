$diagramsDir = "c:\Users\junipa7\Documents\myhomepage\contents\MES\diagrams"
$files = Get-ChildItem -Path $diagramsDir -Filter "*.html"

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    
    # Find the start index of data-mxgraph="
    $startIdx = $content.IndexOf('data-mxgraph="')
    if ($startIdx -lt 0) {
        Write-Host ($file.Name + ": data-mxgraph not found!")
        continue
    }
    $startIdx += 14 # 'data-mxgraph="'.Length
    
    # Find the closing quote of the data-mxgraph attribute
    $endIdx = $content.IndexOf('"></div>', $startIdx)
    if ($endIdx -lt 0) {
        $endIdx = $content.IndexOf('"', $startIdx)
    }
    
    if ($endIdx -lt 0) {
        Write-Host ($file.Name + ": closing quote not found!")
        continue
    }
    
    # Extract the raw attribute value
    $rawVal = $content.Substring($startIdx, $endIdx - $startIdx)
    
    # Check if there are any literal double quotes inside
    $quoteCount = 0
    $idx = $rawVal.IndexOf('"')
    while ($idx -ge 0) {
        $quoteCount++
        $idx = $rawVal.IndexOf('"', $idx + 1)
    }
    
    if ($quoteCount -gt 0) {
        Write-Host ($file.Name + ": Found " + $quoteCount + " literal double quotes inside data-mxgraph!")
        $firstIdx = $rawVal.IndexOf('"')
        $start = [Math]::Max(0, $firstIdx - 40)
        $end = [Math]::Min($rawVal.Length - 1, $firstIdx + 40)
        $len = $end - $start
        $msg = "  Snippet: " + "... " + $rawVal.Substring($start, $firstIdx - $start) + " ===> [QUOTE] <=== " + $rawVal.Substring($firstIdx + 1, $len - ($firstIdx - $start) - 1) + " ..."
        Write-Host $msg
    } else {
        Write-Host ($file.Name + ": 0 literal double quotes inside data-mxgraph")
    }
}
