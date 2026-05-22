$files = Get-ChildItem -Path c:\Users\junipa7\Documents\myhomepage -Recurse -Filter *.html
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$count = 0

$replacements = @(
    @{ Pattern = 'function executeMesaFunction\(command\):(?!\s*//)'; Replacement = 'function executeMesaFunction(command): // MESA 기능 실행 진입점' },
    @{ Pattern = 'validateRequiredKeys\(command\)(?!\s*//)'; Replacement = 'validateRequiredKeys(command) // 필수 파라미터 검증' },
    @{ Pattern = 'master = loadMasterData\(command\.productId, command\.operationId\)(?!\s*//)'; Replacement = 'master = loadMasterData(command.productId, command.operationId) // 기준 정보(제품, 공정 등) 조회' },
    @{ Pattern = 'current = loadCurrentShopfloorState\(command\.lotId, command\.resourceId\)(?!\s*//)'; Replacement = 'current = loadCurrentShopfloorState(command.lotId, command.resourceId) // 현장 상태(Lot, 설비 등) 확인' },
    @{ Pattern = 'decision = evaluateBusinessRules\(command, master, current\)(?!\s*//)'; Replacement = 'decision = evaluateBusinessRules(command, master, current) // 비즈니스 룰 및 제약 조건 검토' },
    @{ Pattern = 'saveRawCommand\(command\)(?!\s*//)'; Replacement = 'saveRawCommand(command) // 원본 명령어 저장 (이력 추적 목적)' },
    @{ Pattern = 'if decision\.allowed:(?!\s*//)'; Replacement = 'if decision.allowed: // 조건 만족 시' },
    @{ Pattern = 'applyStateTransition\(decision\)(?!\s*//)'; Replacement = 'applyStateTransition(decision) // 상태 변경 적용' },
    @{ Pattern = 'appendHistory\(decision\)(?!\s*//)'; Replacement = 'appendHistory(decision) // 처리 이력 추가' },
    @{ Pattern = 'publishMesEvent\(decision\)(?!\s*//)'; Replacement = 'publishMesEvent(decision) // 타 시스템으로 MES 이벤트 발행' },
    @{ Pattern = 'else:(?!\s*//)'; Replacement = 'else: // 조건 불만족 시' },
    @{ Pattern = 'createExceptionRecord\(command, decision\.reason\)(?!\s*//)'; Replacement = 'createExceptionRecord(command, decision.reason) // 예외 및 실패 사유 기록' },
    @{ Pattern = 'notifyOperatorIfNeeded\(\)(?!\s*//)'; Replacement = 'notifyOperatorIfNeeded() // 필요 시 작업자에게 알림 발송' },
    @{ Pattern = 'POST /api/mesa/([^/]+)/commands(?!\s*//)'; Replacement = 'POST /api/mesa/$1/commands // 기능 수행 요청 API' },
    @{ Pattern = 'GET  /api/mesa/([^/]+)/current-state\?lotId=\{lotId\}(?!\s*//)'; Replacement = 'GET  /api/mesa/$1/current-state?lotId={lotId} // 현재 상태 조회 API' },
    @{ Pattern = 'GET  /api/mesa/([^/]+)/history\?from=\{date\}&to=\{date\}(?!\s*//)'; Replacement = 'GET  /api/mesa/$1/history?from={date}&to={date} // 과거 이력 조회 API' },
    @{ Pattern = 'state_event_received(?!\s*//)'; Replacement = 'state_event_received // 장비 상태 이벤트 수신' },
    @{ Pattern = '-> validate_event_order(?!\s*//)'; Replacement = '-> validate_event_order // 이벤트 순서 및 유효성 검증' },
    @{ Pattern = '-> close_previous_interval_if_needed(?!\s*//)'; Replacement = '-> close_previous_interval_if_needed // 이전 구간 마감 처리 (필요시)' },
    @{ Pattern = '-> update_current_state(?!\s*//)'; Replacement = '-> update_current_state // 현재 상태 업데이트' },
    @{ Pattern = '-> append_history(?!\s*//)'; Replacement = '-> append_history // 이력 테이블에 저장' },
    @{ Pattern = '-> publish_business_event(?!\s*//)'; Replacement = '-> publish_business_event // 상위 시스템으로 비즈니스 이벤트 발행' },
    @{ Pattern = 'Controller/API(?!\s*//)'; Replacement = 'Controller/API // 외부 요청 및 이벤트 접수' },
    @{ Pattern = '-> Command Validator(?!\s*//)'; Replacement = '-> Command Validator // 명령어 형식 및 기본 검증' },
    @{ Pattern = '-> Standard Domain Service \((.*?)\)(?!\s*//)'; Replacement = '-> Standard Domain Service ($1) // 표준 비즈니스 로직 및 상태 전이 판단' },
    @{ Pattern = '-> State Repository(?!\s*//)'; Replacement = '-> State Repository // 현재 상태 DB 저장 및 조회' },
    @{ Pattern = '-> Event Publisher(?!\s*//)'; Replacement = '-> Event Publisher // 처리 결과 이벤트 발행' },
    @{ Pattern = '-> Audit/Metric Writer(?!\s*//)'; Replacement = '-> Audit/Metric Writer // 감사 로그 및 성능 지표 기록' },
    @{ Pattern = 'function handle(E\d+|GEM\d+)Event\(event\):(?!\s*//)'; Replacement = 'function handle$1Event(event): // 표준 이벤트 처리 진입점' },
    @{ Pattern = 'assert event\.equipmentId is not empty(?!\s*//)'; Replacement = 'assert event.equipmentId is not empty // 설비 식별자 존재 여부 확인' },
    @{ Pattern = 'assert event\.eventTime is not in the future beyond allowedSkew(?!\s*//)'; Replacement = 'assert event.eventTime is not in the future beyond allowedSkew // 발생 시간이 미래인지(허용 오차 내) 확인' },
    @{ Pattern = 'dictionary = loadDictionary\(event\.equipmentId, event\.standardVersion\)(?!\s*//)'; Replacement = 'dictionary = loadDictionary(event.equipmentId, event.standardVersion) // 설비별/표준버전별 사전(Dictionary) 로드' },
    @{ Pattern = 'normalized = normalize\(event, dictionary\)(?!\s*//)'; Replacement = 'normalized = normalize(event, dictionary) // 사전 기반 데이터 정규화 및 표준화' },
    @{ Pattern = 'validationResult = validateBusinessRule\(normalized\)(?!\s*//)'; Replacement = 'validationResult = validateBusinessRule(normalized) // 표준 비즈니스 룰 기반 유효성 검증' },
    @{ Pattern = 'saveRawEvent\(event\)(?!\s*//)'; Replacement = 'saveRawEvent(event) // 원본 이벤트 로우 데이터 저장' },
    @{ Pattern = 'if validationResult\.ok:(?!\s*//)'; Replacement = 'if validationResult.ok: // 검증 통과 시' },
    @{ Pattern = 'updateCurrentState\(normalized\)(?!\s*//)'; Replacement = 'updateCurrentState(normalized) // 현재 상태 DB 반영' },
    @{ Pattern = 'appendHistory\(normalized\)(?!\s*//)'; Replacement = 'appendHistory(normalized) // 이력 DB에 추가' },
    @{ Pattern = 'publishToConsumers\(normalized\)(?!\s*//)'; Replacement = 'publishToConsumers(normalized) // 구독 시스템(분석, UI 등)에 데이터 발행' },
    @{ Pattern = 'createExceptionRecord\(normalized, validationResult\.reason\)(?!\s*//)'; Replacement = 'createExceptionRecord(normalized, validationResult.reason) // 예외 상황 및 실패 사유 기록' }
)

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $original = $content
    foreach ($r in $replacements) {
        $content = [System.Text.RegularExpressions.Regex]::Replace($content, $r.Pattern, $r.Replacement)
    }
    if ($content -cne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content, $utf8NoBom)
        $count++
    }
}
Write-Output "Updated $count files."
