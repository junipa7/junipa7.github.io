Add-Type -AssemblyName System.Web

$drawioPath = "C:\Users\junipa7\Documents\myhomepage\contents\MES\drawio.xml"
$oeePath = "C:\Users\junipa7\Documents\myhomepage\contents\MES\OEE_Diagram.xml"
$outputDir = "C:\Users\junipa7\Documents\myhomepage\contents\MES\diagrams"

if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# 1. Load XML Helper
function Load-Xml($path) {
    $xml = New-Object System.Xml.XmlDocument
    $content = Get-Content -Encoding utf8 -Path $path
    $xml.LoadXml($content)
    return $xml
}

# 2. Build Cell Cache
function Get-CellCache($xml) {
    $cells = $xml.SelectNodes("//mxCell")
    $cache = @{}
    foreach ($c in $cells) {
        if ($c.id) {
            $cache[$c.id] = $c
        }
    }
    return $cache
}

# 3. Recursive Absolute Coordinate Finder
function Get-AbsoluteCoords($cellId, $cache, $coordCache) {
    if ($coordCache.Contains($cellId)) {
        return $coordCache[$cellId]
    }
    
    $cell = $cache[$cellId]
    if (!$cell) {
        return @{ X = 0.0; Y = 0.0 }
    }
    
    $geo = $cell.mxGeometry
    $x = 0.0
    $y = 0.0
    if ($geo) {
        if ($geo.x) { $x = [double]$geo.x }
        if ($geo.y) { $y = [double]$geo.y }
    }
    
    $parent = $cell.parent
    if ($parent -and $parent -ne "0" -and $parent -ne "1") {
        $pCoords = Get-AbsoluteCoords $parent $cache $coordCache
        $x += $pCoords.X
        $y += $pCoords.Y
    }
    
    $result = @{ X = $x; Y = $y }
    $coordCache[$cellId] = $result
    return $result
}

# 4. Generate HTML Wrapper
function Export-HtmlDiagram($title, $xmlPayload, $filename) {
    # Build a standard PowerShell hashtable for mxgraph options
    $mxgraphData = @{
        highlight = "#007acc"
        nav = [bool]$true
        resize = [bool]$true
        "dark-mode" = "dark"
        toolbar = "zoom layers tags lightbox"
        edit = "_blank"
        xml = $xmlPayload
    }
    # Convert the hashtable to a JSON string
    $jsonStr = ConvertTo-Json $mxgraphData -Compress
    # HTML encode the entire JSON string to be placed inside the data-mxgraph attribute
    $jsonEncoded = [System.Web.HttpUtility]::HtmlEncode($jsonStr)

    $htmlContent = @"
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>$title</title>
    <style>
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #121212;
            overflow: auto;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 20px;
        }
        .header {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #2d2d2d;
        }
        .header h2 {
            margin: 0 0 5px 0;
            color: #ffffff;
            font-size: 1.5rem;
            font-weight: 600;
        }
        .header p {
            margin: 0;
            color: #888888;
            font-size: 0.9rem;
        }
        .viewer-wrapper {
            flex: 1;
            background-color: #1e1e1e;
            border-radius: 8px;
            border: 1px solid #2d2d2d;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            padding: 10px;
            overflow: auto;
            position: relative;
        }
        /* Custom styles to override draw.io dark mode appearance */
        .mxgraph {
            background-color: transparent !important;
        }
        /* Style the toolbar for premium dark feel */
        .geToolbarContainer {
            background-color: #252525 !important;
            border-color: #333333 !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>$title</h2>
            <p>마우스 휠로 확대/축소, 마우스 드래그로 화면 이동이 가능합니다.</p>
        </div>
        <div class="viewer-wrapper">
            <div class="mxgraph" style="max-width:100%; border:1px solid transparent;" 
                 data-mxgraph="$jsonEncoded"></div>
        </div>
    </div>
    <script type="text/javascript" src="https://viewer.diagrams.net/js/viewer-static.min.js"></script>
</body>
</html>
"@

    $outputPath = Join-Path $outputDir $filename
    [System.IO.File]::WriteAllText($outputPath, $htmlContent, [System.Text.Encoding]::UTF8)
    Write-Host "Exported: $outputPath"
}

# 5. Extract, Shift & Wrap Diagram
function Process-Diagram($name, $title, $minX, $maxX, $minY, $maxY, $xml, $cache, $coordCache, $filename) {
    Write-Host "Processing diagram: $name ($title)..."
    
    # 5a. Identify vertexes inside the boundary
    $selectedIds = New-Object System.Collections.Generic.HashSet[string]
    $vertices = @()
    
    foreach ($entry in $cache.GetEnumerator()) {
        $c = $entry.Value
        if ($c.vertex -eq "1") {
            $abs = Get-AbsoluteCoords $c.id $cache $coordCache
            if ($abs.X -ge $minX -and $abs.X -le $maxX -and $abs.Y -ge $minY -and $abs.Y -le $maxY) {
                [void]$selectedIds.Add($c.id)
                $vertices += $c
            }
        }
    }
    
    if ($vertices.Count -eq 0) {
        Write-Warning "No vertices found in bounding box for $name!"
        return
    }
    
    # 5b. Recursively include parents of selected vertices (to keep containers/borders)
    $parentsToAdd = New-Object System.Collections.Generic.HashSet[string]
    foreach ($id in $selectedIds) {
        $cell = $cache[$id]
        $parent = $cell.parent
        while ($parent -and $parent -ne "0" -and $parent -ne "1") {
            if (!$selectedIds.Contains($parent)) {
                [void]$parentsToAdd.Add($parent)
            }
            $parent = $cache[$parent].parent
        }
    }
    foreach ($p in $parentsToAdd) {
        [void]$selectedIds.Add($p)
    }
    
    # 5c. Collect edges whose source AND target are selected
    $edges = @()
    foreach ($entry in $cache.GetEnumerator()) {
        $c = $entry.Value
        if ($c.edge -eq "1") {
            if ($c.source -and $c.target -and $selectedIds.Contains($c.source) -and $selectedIds.Contains($c.target)) {
                $edges += $c
            }
        }
    }
    
    # 5d. Calculate Shift offset
    # We want to find the top-level selected vertices and compute their min X and min Y
    $topLevelX = @()
    $topLevelY = @()
    foreach ($id in $selectedIds) {
        $cell = $cache[$id]
        # Only shift if parent is 1 or parent is not selected (top-level inside our diagram)
        if ($cell.parent -eq "1" -or !$selectedIds.Contains($cell.parent)) {
            $geo = $cell.mxGeometry
            if ($geo) {
                if ($geo.x) { $topLevelX += [double]$geo.x } else { $topLevelX += 0.0 }
                if ($geo.y) { $topLevelY += [double]$geo.y } else { $topLevelY += 0.0 }
            }
        }
    }
    
    $offsetX = 0.0
    $offsetY = 0.0
    if ($topLevelX.Count -gt 0) { $offsetX = ($topLevelX | Measure-Object -Minimum).Minimum - 20.0 }
    if ($topLevelY.Count -gt 0) { $offsetY = ($topLevelY | Measure-Object -Minimum).Minimum - 20.0 }
    
    Write-Host "  Calculated Offset - X: $offsetX, Y: $offsetY"
    
    # 5e. Create cloned XML document for this page
    $doc = New-Object System.Xml.XmlDocument
    $rootNode = $doc.CreateElement("mxfile")
    $doc.AppendChild($rootNode) | Out-Null
    
    $diagNode = $doc.CreateElement("diagram")
    $diagNode.SetAttribute("name", $title)
    $diagNode.SetAttribute("id", $name)
    $rootNode.AppendChild($diagNode) | Out-Null
    
    $modelNode = $doc.CreateElement("mxGraphModel")
    # Copy attributes from original mxGraphModel
    $origModel = $xml.DocumentElement
    if ($origModel.Name -eq "mxGraphModel") {
        foreach ($attr in $origModel.Attributes) {
            $modelNode.SetAttribute($attr.Name, $attr.Value)
        }
    } else {
        $origModel = $xml.SelectSingleNode("//mxGraphModel")
        if ($origModel) {
            foreach ($attr in $origModel.Attributes) {
                $modelNode.SetAttribute($attr.Name, $attr.Value)
            }
        }
    }
    $diagNode.AppendChild($modelNode) | Out-Null
    
    $rootEl = $doc.CreateElement("root")
    $modelNode.AppendChild($rootEl) | Out-Null
    
    # Append default layers 0 and 1
    $cell0 = $doc.CreateElement("mxCell")
    $cell0.SetAttribute("id", "0")
    $rootEl.AppendChild($cell0) | Out-Null
    
    $cell1 = $doc.CreateElement("mxCell")
    $cell1.SetAttribute("id", "1")
    $cell1.SetAttribute("parent", "0")
    $rootEl.AppendChild($cell1) | Out-Null
    
    # Function to clone and shift a cell
    $cloneAndShift = {
        param($origCell)
        $newCell = $doc.ImportNode($origCell, $true)
        
        # Shift geometry if top-level or parent not selected
        $parent = $origCell.parent
        $shouldShift = ($parent -eq "1" -or !$selectedIds.Contains($parent))
        
        $geo = $newCell.mxGeometry
        if ($geo -and $shouldShift) {
            if ($geo.x) {
                $newX = [double]$geo.x - $offsetX
                $geo.SetAttribute("x", $newX.ToString())
            }
            if ($geo.y) {
                $newY = [double]$geo.y - $offsetY
                $geo.SetAttribute("y", $newY.ToString())
            }
        }
        
        # Also shift edge control points if it's an edge
        if ($origCell.edge -eq "1" -and $geo) {
            $sourcePoint = $geo.SelectSingleNode("mxPoint[@as='sourcePoint']")
            if ($sourcePoint -and $sourcePoint.x) {
                $newX = [double]$sourcePoint.x - $offsetX
                $sourcePoint.SetAttribute("x", $newX.ToString())
            }
            if ($sourcePoint -and $sourcePoint.y) {
                $newY = [double]$sourcePoint.y - $offsetY
                $sourcePoint.SetAttribute("y", $newY.ToString())
            }
            
            $targetPoint = $geo.SelectSingleNode("mxPoint[@as='targetPoint']")
            if ($targetPoint -and $targetPoint.x) {
                $newX = [double]$targetPoint.x - $offsetX
                $targetPoint.SetAttribute("x", $newX.ToString())
            }
            if ($targetPoint -and $targetPoint.y) {
                $newY = [double]$targetPoint.y - $offsetY
                $targetPoint.SetAttribute("y", $newY.ToString())
            }
            
            $points = $geo.SelectNodes("Array/mxPoint")
            foreach ($pt in $points) {
                if ($pt.x) {
                    $newX = [double]$pt.x - $offsetX
                    $pt.SetAttribute("x", $newX.ToString())
                }
                if ($pt.y) {
                    $newY = [double]$pt.y - $offsetY
                    $pt.SetAttribute("y", $newY.ToString())
                }
            }
        }
        
        # If parent was 1, keep it 1. If parent is selected, keep its parent ID.
        if ($parent -eq "1") {
            # Top-level cell in original becomes top-level in new diagram
            $newCell.SetAttribute("parent", "1")
        }
        
        return $newCell
    }
    
    # Clone and append selected vertices
    foreach ($id in $selectedIds) {
        $c = $cache[$id]
        $newCell = &$cloneAndShift $c
        $rootEl.AppendChild($newCell) | Out-Null
    }
    
    # Clone and append selected edges
    foreach ($e in $edges) {
        $newCell = &$cloneAndShift $e
        $rootEl.AppendChild($newCell) | Out-Null
    }
    
    # Export as HTML
    $xmlString = ""
    $sw = New-Object System.IO.StringWriter
    $xw = [System.Xml.XmlWriter]::Create($sw, (New-Object System.Xml.XmlWriterSettings -Property @{ OmitXmlDeclaration = $true }))
    $doc.Save($xw)
    $xw.Flush()
    $xmlString = $sw.ToString()
    
    Export-HtmlDiagram $title $xmlString $filename
}

# 6. Process all diagrams in drawio.xml
Write-Host "Loading drawio.xml..."
$drawioXml = Load-Xml $drawioPath
$drawioCache = Get-CellCache $drawioXml
$coordCache = @{}

# Define Bounding Boxes for drawio.xml
Process-Diagram "dfd_level_0" "전체 아키텍처 개요 DFD (Level 0)" -850 -200 0 450 $drawioXml $drawioCache $coordCache "dfd_level_0.html"
Process-Diagram "e10_ram_states" "SEMI E10 장비 상태 트리" -2400 -1700 0 1150 $drawioXml $drawioCache $coordCache "e10_ram_states.html"
Process-Diagram "stream_storage" "실시간 데이터 수집 및 EES 스트림 분배" -1600 -900 300 900 $drawioXml $drawioCache $coordCache "stream_storage.html"
Process-Diagram "process_1_details" "Process 1.0 상세: SECS/GEM 이벤트 파싱" -1600 -900 1150 2200 $drawioXml $drawioCache $coordCache "process_1_details.html"
Process-Diagram "process_2_details" "Process 2.0 상세: 실시간 특징 추출 엔진" -650 0 450 1150 $drawioXml $drawioCache $coordCache "process_2_details.html"
Process-Diagram "process_3_details" "Process 3.0 상세: 기하/통계적 이상치 필터" -850 -150 1150 1580 $drawioXml $drawioCache $coordCache "process_3_details.html"
Process-Diagram "process_4_details" "Process 4.0 상세: OEE 및 효율 산출 계산" -850 -150 1580 2100 $drawioXml $drawioCache $coordCache "process_4_details.html"
Process-Diagram "chan_algorithm_flow" "Chan 볼록 껍질 알고리즘 흐름도" 0 800 0 900 $drawioXml $drawioCache $coordCache "chan_algorithm_flow.html"
Process-Diagram "asynchronous_query" "분위수 및 통계 비동기 질의 흐름도" 0 850 900 1300 $drawioXml $drawioCache $coordCache "asynchronous_query.html"
Process-Diagram "kll_compaction_flow" "KLL Sketch 데이터 압축 루프 흐름도" 0 800 1300 2200 $drawioXml $drawioCache $coordCache "kll_compaction_flow.html"

# 7. Process OEE_Diagram.xml
Write-Host "Loading OEE_Diagram.xml..."
$oeeXml = Load-Xml $oeePath
$oeeCache = Get-CellCache $oeeXml
$oeeCoordCache = @{}

# For OEE_Diagram.xml, we take the entire bounding box
Process-Diagram "oee_realtime_dfd" "OEE 실시간 DFD (High-Level)" 0 1000 0 1000 $oeeXml $oeeCache $oeeCoordCache "oee_realtime_dfd.html"

Write-Host "All diagrams split and exported successfully!"
