$ErrorActionPreference = "Stop"
Set-Location "C:\Users\junipa7\Documents\myhomepage\contents\systemhazard"

$index = Get-Content "hazardindex.html" -Raw -Encoding UTF8

# Remove footer
$index = $index -replace "((?s)<!-- Author & Footer -->.*</body>)", ""

# Replace onclick
for ($i = 1; $i -le 7; $i++) {
    $pattern = "onclick=`"if\(window\.loadContent\) \{ loadContent\('systemhazard/part$i[^']+'\); \} else \{ location\.href='part$i[^']+'\;' \}`""
    $replace = "onclick=`"document.getElementById('part$i').scrollIntoView({behavior: 'smooth'})`" style=`"cursor:pointer;`""
    $index = $index -replace $pattern, $replace
}

$partsHtml = "<div class=`"max-w-6xl mx-auto px-6 py-16 space-y-16`">`n"

$files = "part1concept.html","part2causes.html","part3cases.html","part4impact.html","part5strategy.html","part6methodology.html","part7application.html"

$partNum = 1
foreach ($f in $files) {
    $content = Get-Content $f -Raw -Encoding UTF8
    if ($content -match "(?s)<body[^>]*>(.*?)</body>") {
        $bodyContent = $Matches[1]
        $partsHtml += "<section id=`"part$partNum`" class=`"scroll-mt-24`">`n$bodyContent`n</section>`n"
    }
    $partNum++
}

$partsHtml += "</div>`n"

$footer = @"
    <!-- Author & Footer -->
    <footer class="bg-slate-100 py-16 border-t border-slate-200">
        <div class="max-w-4xl mx-auto px-6 text-center">
            <h3 class="text-lg font-bold mb-4">About the Series</h3>
            <p class="text-sm text-slate-600 leading-relaxed mb-8">
                본 도서 시리즈는 현대 기업의 파편화된 IT 환경에서 발생하는 '시스템 헤저드' 현상을 심도 있게 조명하고,<br>
                데이터 중심의 통합 아키텍처를 통해 전사적 효율성을 재건하기 위한 실무 지침서입니다.
            </p>
            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                © 2026 Architecture Board. All rights reserved.
            </div>
        </div>
    </footer>
</body>
</html>
"@

$finalHtml = $index + $partsHtml + $footer

Set-Content -Path "index.html" -Value $finalHtml -Encoding UTF8
Write-Host "Success"
