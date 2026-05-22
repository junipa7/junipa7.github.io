import os
import re

workspace = r'c:\Users\junipa7\Documents\myhomepage'

replacements = [
    (r'function executeMesaFunction\(command\):(?!\s*//)', r'function executeMesaFunction(command): // MESA 기능 실행 진입점'),
    (r'validateRequiredKeys\(command\)(?!\s*//)', r'validateRequiredKeys(command) // 필수 파라미터 검증'),
    (r'master = loadMasterData\(command\.productId, command\.operationId\)(?!\s*//)', r'master = loadMasterData(command.productId, command.operationId) // 기준 정보(제품, 공정 등) 조회'),
    (r'current = loadCurrentShopfloorState\(command\.lotId, command\.resourceId\)(?!\s*//)', r'current = loadCurrentShopfloorState(command.lotId, command.resourceId) // 현장 상태(Lot, 설비 등) 확인'),
    (r'decision = evaluateBusinessRules\(command, master, current\)(?!\s*//)', r'decision = evaluateBusinessRules(command, master, current) // 비즈니스 룰 및 제약 조건 검토'),
    (r'saveRawCommand\(command\)(?!\s*//)', r'saveRawCommand(command) // 원본 명령어 저장 (이력 추적 목적)'),
    (r'if decision\.allowed:(?!\s*//)', r'if decision.allowed: // 조건 만족 시'),
    (r'applyStateTransition\(decision\)(?!\s*//)', r'applyStateTransition(decision) // 상태 변경 적용'),
    (r'appendHistory\(decision\)(?!\s*//)', r'appendHistory(decision) // 처리 이력 추가'),
    (r'publishMesEvent\(decision\)(?!\s*//)', r'publishMesEvent(decision) // 타 시스템으로 MES 이벤트 발행'),
    (r'else:(?!\s*//)', r'else: // 조건 불만족 시'),
    (r'createExceptionRecord\(command, decision\.reason\)(?!\s*//)', r'createExceptionRecord(command, decision.reason) // 예외 및 실패 사유 기록'),
    (r'notifyOperatorIfNeeded\(\)(?!\s*//)', r'notifyOperatorIfNeeded() // 필요 시 작업자에게 알림 발송'),
    (r'POST /api/mesa/([^/]+)/commands(?!\s*//)', r'POST /api/mesa/\1/commands // 기능 수행 요청 API'),
    (r'GET  /api/mesa/([^/]+)/current-state\?lotId=\{lotId\}(?!\s*//)', r'GET  /api/mesa/\1/current-state?lotId={lotId} // 현재 상태 조회 API'),
    (r'GET  /api/mesa/([^/]+)/history\?from=\{date\}&to=\{date\}(?!\s*//)', r'GET  /api/mesa/\1/history?from={date}&to={date} // 과거 이력 조회 API'),

    (r'state_event_received(?!\s*//)', r'state_event_received // 장비 상태 이벤트 수신'),
    (r'-> validate_event_order(?!\s*//)', r'-> validate_event_order // 이벤트 순서 및 유효성 검증'),
    (r'-> close_previous_interval_if_needed(?!\s*//)', r'-> close_previous_interval_if_needed // 이전 구간 마감 처리 (필요시)'),
    (r'-> update_current_state(?!\s*//)', r'-> update_current_state // 현재 상태 업데이트'),
    (r'-> append_history(?!\s*//)', r'-> append_history // 이력 테이블에 저장'),
    (r'-> publish_business_event(?!\s*//)', r'-> publish_business_event // 상위 시스템으로 비즈니스 이벤트 발행'),

    (r'Controller/API(?!\s*//)', r'Controller/API // 외부 요청 및 이벤트 접수'),
    (r'-> Command Validator(?!\s*//)', r'-> Command Validator // 명령어 형식 및 기본 검증'),
    (r'-> Standard Domain Service \((.*?)\)(?!\s*//)', r'-> Standard Domain Service (\1) // 표준 비즈니스 로직 및 상태 전이 판단'),
    (r'-> State Repository(?!\s*//)', r'-> State Repository // 현재 상태 DB 저장 및 조회'),
    (r'-> Event Publisher(?!\s*//)', r'-> Event Publisher // 처리 결과 이벤트 발행'),
    (r'-> Audit/Metric Writer(?!\s*//)', r'-> Audit/Metric Writer // 감사 로그 및 성능 지표 기록'),

    (r'function handle(E\d+|GEM\d+)Event\(event\):(?!\s*//)', r'function handle\1Event(event): // 표준 이벤트 처리 진입점'),
    (r'assert event\.equipmentId is not empty(?!\s*//)', r'assert event.equipmentId is not empty // 설비 식별자 존재 여부 확인'),
    (r'assert event\.eventTime is not in the future beyond allowedSkew(?!\s*//)', r'assert event.eventTime is not in the future beyond allowedSkew // 발생 시간이 미래인지(허용 오차 내) 확인'),
    (r'dictionary = loadDictionary\(event\.equipmentId, event\.standardVersion\)(?!\s*//)', r'dictionary = loadDictionary(event.equipmentId, event.standardVersion) // 설비별/표준버전별 사전(Dictionary) 로드'),
    (r'normalized = normalize\(event, dictionary\)(?!\s*//)', r'normalized = normalize(event, dictionary) // 사전 기반 데이터 정규화 및 표준화'),
    (r'validationResult = validateBusinessRule\(normalized\)(?!\s*//)', r'validationResult = validateBusinessRule(normalized) // 표준 비즈니스 룰 기반 유효성 검증'),
    (r'saveRawEvent\(event\)(?!\s*//)', r'saveRawEvent(event) // 원본 이벤트 로우 데이터 저장'),
    (r'if validationResult\.ok:(?!\s*//)', r'if validationResult.ok: // 검증 통과 시'),
    (r'updateCurrentState\(normalized\)(?!\s*//)', r'updateCurrentState(normalized) // 현재 상태 DB 반영'),
    (r'appendHistory\(normalized\)(?!\s*//)', r'appendHistory(normalized) // 이력 DB에 추가'),
    (r'publishToConsumers\(normalized\)(?!\s*//)', r'publishToConsumers(normalized) // 구독 시스템(분석, UI 등)에 데이터 발행'),
    (r'createExceptionRecord\(normalized, validationResult\.reason\)(?!\s*//)', r'createExceptionRecord(normalized, validationResult.reason) // 예외 상황 및 실패 사유 기록'),
]

updated_files = 0
for root, dirs, files in os.walk(workspace):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                continue

            original_content = content
            for pattern, repl in replacements:
                content = re.sub(pattern, repl, content)

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_files += 1

print(f"Updated {updated_files} files.")
