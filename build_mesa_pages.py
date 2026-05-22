import os
import html

esc = html.escape
root = os.path.dirname(os.path.abspath(__file__))
mesa_dir = os.path.join(root, "contents", "MES", "mesa")
functions_dir = os.path.join(mesa_dir, "functions")
os.makedirs(functions_dir, exist_ok=True)

functions = [
  {
    "id": "resource-allocation-status",
    "title": "Resource Allocation and Status",
    "ko": "자원 할당 및 상태 관리",
    "purpose": "설비, 작업자, 금형/치공구, 자재, 작업장 같은 생산 자원의 현재 상태와 가용성을 관리하고 실행 가능한 자원을 작업에 연결합니다.",
    "scope": ["설비/라인/작업장 가용 상태", "작업자 자격과 배치", "Tooling, Fixture, Carrier 상태", "자재와 WIP 위치", "ERP/APS 계획 대비 자원 준비 상태"],
    "inputs": ["ERP 생산오더", "APS 또는 상세 스케줄", "설비 상태 이벤트", "작업자 근태/자격", "자재 입출고 정보"],
    "outputs": ["작업 가능 자원 목록", "자원 상태 이력", "작업 배정 결과", "자원 부족 알림", "가용률/OEE 기초 데이터"],
    "data": [
      ["resource_master", "resource_id, resource_type, name, area, line_id, capability, active_flag"],
      ["resource_status_history", "resource_id, status, reason_code, start_time, end_time, source_system"],
      ["resource_assignment", "assignment_id, work_order_id, operation_id, resource_id, planned_start, actual_start, status"],
      ["qualification_matrix", "person_id, skill_code, certified_flag, effective_from, expires_at"]
    ],
    "flow": ["ERP/APS Plan", "MES Resource Check", "Resource Assignment", "Shopfloor Execution", "Status Feedback"],
    "details": "MES는 계획을 단순히 내려보내는 시스템이 아니라, 지금 생산 가능한 조건인지 판단하는 실행 계층입니다. 자원 상태가 부정확하면 스케줄은 맞아도 실제 착수는 실패합니다."
  },
  {
    "id": "operations-detail-scheduling",
    "title": "Operations / Detail Scheduling",
    "ko": "상세 생산 스케줄링",
    "purpose": "상위 계획을 현장 실행 단위로 쪼개고, 공정 순서, 설비 능력, 셋업, 자재 준비, 우선순위를 반영해 상세 작업 순서를 만듭니다.",
    "scope": ["라인/설비별 작업 순서", "Setup/Changeover 고려", "제약 기반 우선순위", "긴급오더 삽입", "Dispatch List 생성"],
    "inputs": ["ERP/MRP 계획오더", "BOM/BOP/라우팅", "설비 캘린더", "자재 가용성", "납기와 우선순위"],
    "outputs": ["작업 지시 후보", "라인별 상세 스케줄", "Dispatch Queue", "스케줄 변경 이력", "계획 대비 실행 차이"],
    "data": [
      ["schedule_header", "schedule_id, area, horizon_start, horizon_end, version, status"],
      ["schedule_operation", "schedule_id, sequence_no, work_order_id, operation_id, resource_id, planned_start, planned_end"],
      ["schedule_constraint", "constraint_id, type, target_id, rule_value, priority"],
      ["dispatch_queue", "queue_id, resource_id, work_order_id, operation_id, priority, queue_state"]
    ],
    "flow": ["ERP Plan", "Constraint Check", "Finite Schedule", "Dispatch Queue", "Execution Feedback"],
    "details": "MESA 관점의 상세 스케줄은 현장의 실제 제약을 반영해야 합니다. MES는 APS가 만든 계획을 그대로 표시하는 것에서 끝나지 않고, 실행 직전의 상태로 재계산하거나 재정렬할 수 있어야 합니다."
  },
  {
    "id": "dispatching-production-units",
    "title": "Dispatching Production Units",
    "ko": "작업 단위 디스패칭",
    "purpose": "Lot, Batch, Serial, Carrier, Work Order 같은 생산 단위를 특정 설비나 작업자에게 내려보내고 착수, 보류, 재작업, 완료 흐름을 제어합니다.",
    "scope": ["작업 착수/중지/완료", "Lot/Batch 우선순위", "Hold/Release", "Rework/Reroute", "작업자 작업 목록"],
    "inputs": ["Dispatch Queue", "작업 지시", "작업 가능 자원", "품질 Hold 정보", "자재 준비 상태"],
    "outputs": ["작업 시작 이벤트", "작업 완료 이벤트", "Hold/Release 이력", "실적 보고", "WIP 상태"],
    "data": [
      ["work_dispatch", "dispatch_id, work_order_id, lot_id, operation_id, resource_id, priority, dispatch_state"],
      ["execution_event", "event_id, dispatch_id, event_type, event_time, actor_id, source_system"],
      ["hold_release", "hold_id, lot_id, reason_code, hold_time, release_time, approver_id"],
      ["rework_route", "rework_id, lot_id, from_operation, target_operation, reason_code, status"]
    ],
    "flow": ["Dispatch Queue", "Operator/Tool Assignment", "Start", "Track Execution", "Complete/Hold/Rework"],
    "details": "디스패칭은 MES의 현장 실행성이 가장 잘 드러나는 기능입니다. 계획과 실제 사이의 마지막 게이트이며, 품질/자재/설비/작업자 조건을 통과한 작업만 착수되어야 합니다."
  },
  {
    "id": "document-control",
    "title": "Document Control",
    "ko": "문서 및 작업표준 관리",
    "purpose": "작업 지시서, SOP, Recipe, 검사 기준서, 안전 지침, 도면의 최신 버전을 작업 시점에 맞게 제공하고 열람 이력을 남깁니다.",
    "scope": ["SOP/작업표준 버전 관리", "작업별 문서 연결", "전자 서명/승인", "Recipe와 문서 동기화", "개정 이력 추적"],
    "inputs": ["PLM/문서관리 시스템", "공정 라우팅", "제품/공정 변경 통보", "품질 기준", "EHS 문서"],
    "outputs": ["작업 문서 표시", "문서 열람 이력", "개정 적용 이력", "전자 승인 기록", "작업 기준 위반 알림"],
    "data": [
      ["document_master", "document_id, document_type, title, current_revision, owner_dept"],
      ["document_revision", "document_id, revision, effective_from, effective_to, approval_status, file_url"],
      ["operation_document", "operation_id, product_id, document_id, required_flag"],
      ["document_view_log", "document_id, revision, work_order_id, viewer_id, viewed_at"]
    ],
    "flow": ["PLM/DMS", "MES Document Binding", "Operation Start", "Operator View", "Audit Log"],
    "details": "문서 관리는 단순 게시판이 아닙니다. 작업이 시작되는 시점에 어떤 기준서가 유효했는지를 증명할 수 있어야 하며, 변경점이 Lot이나 Serial 이력과 연결되어야 합니다."
  },
  {
    "id": "data-collection-acquisition",
    "title": "Data Collection / Acquisition",
    "ko": "데이터 수집",
    "purpose": "설비, 작업자 입력, 검사 장비, Barcode/RFID, SCADA/PLC, EAP로부터 생산 실행 데이터를 수집해 Lot/공정/시간 문맥과 연결합니다.",
    "scope": ["수동/자동 데이터 수집", "설비 이벤트/공정값", "작업 실적", "검사 결과", "데이터 품질 코드"],
    "inputs": ["PLC/SCADA/EAP", "작업자 입력", "검사 장비", "Barcode/RFID", "ERP 기준정보"],
    "outputs": ["원시 데이터", "정규화 데이터", "검사/공정 이력", "실적 집계", "데이터 품질 알림"],
    "data": [
      ["collection_point", "point_id, source_type, source_name, parameter_code, unit, collection_rule"],
      ["raw_collection_event", "event_id, point_id, raw_value, raw_payload, collected_at, quality_code"],
      ["contextualized_data", "data_id, lot_id, operation_id, resource_id, parameter_code, value, event_time"],
      ["manual_entry_log", "entry_id, form_id, actor_id, value_json, entered_at, approval_status"]
    ],
    "flow": ["Shopfloor Source", "Collector", "Validation", "Context Mapping", "MES History"],
    "details": "수집 데이터는 값 자체보다 문맥이 중요합니다. 어떤 Lot, 어떤 공정, 어떤 설비 상태에서 나온 값인지 연결되어야 품질 분석과 KPI 계산에 사용할 수 있습니다."
  },
  {
    "id": "labor-management",
    "title": "Labor Management",
    "ko": "작업자 및 노무 관리",
    "purpose": "작업자 투입, 자격, 작업 시간, 교육 상태, 생산성, 간접 작업을 관리해 생산 실행과 인력 운용을 연결합니다.",
    "scope": ["작업자 배치", "자격/교육 검증", "직접/간접 시간", "작업자별 실적", "교대조 관리"],
    "inputs": ["HR/근태 시스템", "작업자 자격", "Dispatch 작업", "작업 시작/종료 이벤트", "교육 이력"],
    "outputs": ["작업자 투입 이력", "자격 미충족 알림", "노무 실적", "작업자 생산성", "전자 서명 기록"],
    "data": [
      ["operator_master", "person_id, name, team, shift_code, active_flag"],
      ["operator_assignment", "assignment_id, person_id, resource_id, operation_id, start_time, end_time"],
      ["labor_time", "person_id, work_order_id, activity_code, start_time, end_time, duration_min"],
      ["operator_certification", "person_id, certification_code, valid_from, valid_to, status"]
    ],
    "flow": ["HR/Skill Master", "MES Qualification Check", "Operator Assignment", "Execution", "Labor Report"],
    "details": "MES의 작업자 관리는 근태 계산만이 아니라 품질 리스크 관리입니다. 자격이 없는 작업자가 공정을 수행하지 않도록 실행 단계에서 차단해야 합니다."
  },
  {
    "id": "quality-management",
    "title": "Quality Management",
    "ko": "품질 관리",
    "purpose": "검사 계획, 공정 품질, 부적합, SPC, Sampling, Hold/Release를 관리하고 품질 의사결정을 생산 흐름에 즉시 반영합니다.",
    "scope": ["검사 계획", "SPC/Trend", "부적합 처리", "Sampling", "품질 Hold/Release", "CAPA 연계"],
    "inputs": ["검사 기준", "공정값", "검사 장비 결과", "Lot/Serial 이력", "고객 품질 요구사항"],
    "outputs": ["검사 결과", "SPC 알림", "불량/부적합 이력", "Hold/Release", "품질 KPI"],
    "data": [
      ["inspection_plan", "plan_id, product_id, operation_id, sample_rule, characteristic_set"],
      ["quality_result", "result_id, lot_id, operation_id, characteristic, value, spec_low, spec_high, result"],
      ["nonconformance", "nc_id, lot_id, defect_code, severity, disposition, created_at"],
      ["spc_signal", "signal_id, chart_id, rule_id, lot_id, detected_at, action_status"]
    ],
    "flow": ["Inspection Plan", "Collect Result", "SPC/Spec Check", "Disposition", "Quality Feedback"],
    "details": "품질 관리는 사후 보고보다 실행 제어가 중요합니다. 검사 결과와 SPC 신호가 즉시 Hold, 재검, Rework, Recipe 조정으로 이어져야 합니다."
  },
  {
    "id": "process-management",
    "title": "Process Management",
    "ko": "공정 관리",
    "purpose": "공정 조건, Recipe, 작업 순서, Parameter, 공정 상태를 관리하고 표준 조건에서 벗어난 실행을 감지합니다.",
    "scope": ["Recipe/Parameter 관리", "공정 조건 검증", "공정 상태 추적", "Run 조건 비교", "공정 변경 이력"],
    "inputs": ["BOP/라우팅", "Recipe", "공정 Parameter", "설비 상태", "품질 Feedback"],
    "outputs": ["공정 실행 이력", "Recipe Download 이력", "Parameter 편차 알림", "공정 조건 승인", "Run Summary"],
    "data": [
      ["process_route", "route_id, product_id, operation_sequence, revision, status"],
      ["recipe_master", "recipe_id, product_id, operation_id, revision, approval_status"],
      ["recipe_parameter", "recipe_id, parameter_name, target_value, lower_limit, upper_limit, unit"],
      ["process_run", "run_id, lot_id, operation_id, resource_id, recipe_id, start_time, end_time"]
    ],
    "flow": ["Route/Recipe", "Pre-Check", "Recipe Download", "Process Run", "Run Review"],
    "details": "공정 관리는 장비 제어와 품질의 중간에 있습니다. MES는 어떤 조건으로 생산했는지 증명하고, 승인되지 않은 조건 변경을 막아야 합니다."
  },
  {
    "id": "maintenance-management",
    "title": "Maintenance Management",
    "ko": "설비 보전 관리",
    "purpose": "설비 예방보전, 고장, 보전 작업, Spare Part, 보전 후 재가동 승인 상태를 생산 실행과 연결합니다.",
    "scope": ["예방보전 일정", "고장/정지 이력", "보전 작업 지시", "Spare Part 사용", "보전 후 품질 확인"],
    "inputs": ["설비 상태", "Run Hour/Shot Count", "보전 기준", "고장 알람", "Spare Part 재고"],
    "outputs": ["PM 작업", "정비 이력", "MTBF/MTTR", "설비 Release", "보전 KPI"],
    "data": [
      ["maintenance_plan", "plan_id, resource_id, trigger_type, threshold_value, task_template_id"],
      ["maintenance_work_order", "mw_id, resource_id, problem_code, priority, status, planned_time"],
      ["maintenance_activity", "activity_id, mw_id, technician_id, action_code, start_time, end_time"],
      ["spare_part_usage", "usage_id, mw_id, part_id, quantity, lot_no, used_at"]
    ],
    "flow": ["Equipment Signal", "Maintenance Trigger", "Work Order", "Repair/PM", "Release to Production"],
    "details": "MES의 보전 관리는 CMMS와 겹칠 수 있지만, 핵심은 생산 실행과 연결되는 지점입니다. 설비가 생산에 투입 가능한지, 보전 후 검증이 끝났는지가 MES에서 보여야 합니다."
  },
  {
    "id": "product-tracking-genealogy",
    "title": "Product Tracking and Genealogy",
    "ko": "제품 추적 및 계보",
    "purpose": "Lot, Batch, Serial, Wafer, Material의 이동과 투입 관계를 기록해 정방향/역방향 추적과 품질 이슈 분석을 가능하게 합니다.",
    "scope": ["Lot/Serial Tracking", "Material Consumption", "Genealogy", "WIP 위치", "Traceability Report"],
    "inputs": ["작업 실행 이벤트", "자재 투입", "설비/공정 이력", "검사 결과", "포장/출하 정보"],
    "outputs": ["제품 이력", "자재 계보", "WIP 위치", "Recall 대상", "고객 추적성 보고"],
    "data": [
      ["lot_history", "lot_id, operation_id, resource_id, event_type, event_time, actor_id"],
      ["material_consumption", "consumption_id, lot_id, material_lot_id, quantity, unit, consumed_at"],
      ["genealogy_link", "parent_id, child_id, link_type, operation_id, created_at"],
      ["wip_location", "lot_id, current_area, current_resource, current_operation, updated_at"]
    ],
    "flow": ["Material Input", "Operation History", "Genealogy Link", "Inspection/Pack", "Trace Report"],
    "details": "추적성은 문제가 생긴 뒤에만 쓰는 기능이 아닙니다. 실시간 WIP, 품질 분석, 고객 감사, Recall 범위 최소화까지 모두 계보 데이터 품질에 달려 있습니다."
  },
  {
    "id": "performance-analysis",
    "title": "Performance Analysis",
    "ko": "성과 분석",
    "purpose": "생산성, 품질, 납기, 설비 효율, 작업자 효율, 병목, 손실 시간을 분석해 운영 개선 지표를 제공합니다.",
    "scope": ["OEE/가동률", "Throughput", "Cycle Time", "Yield", "Loss Pareto", "Plan vs Actual"],
    "inputs": ["실적 이벤트", "설비 상태", "품질 결과", "계획 데이터", "작업자/자원 이력"],
    "outputs": ["KPI Dashboard", "Loss 분석", "병목 분석", "추세/알림", "개선 과제"],
    "data": [
      ["kpi_definition", "kpi_id, name, formula, grain, owner, target_value"],
      ["kpi_result", "kpi_id, area, resource_id, product_id, value, window_start, window_end"],
      ["loss_event", "loss_id, resource_id, loss_category, reason_code, duration_sec, event_time"],
      ["performance_snapshot", "snapshot_id, area, metric_json, captured_at"]
    ],
    "flow": ["Execution Data", "KPI Engine", "Loss Classification", "Dashboard", "Improvement Action"],
    "details": "성과 분석은 MES 데이터의 결과물입니다. 계산식보다 중요한 것은 상태/품질/계획/실적 데이터의 시간 기준과 분류 기준을 통일하는 것입니다."
  }
]

def getMesaPseudocode(id):
    codes = {
        "resource-allocation-status": """// =================================================================
// 1. 자원 할당 및 상태 관리 (Resource Allocation and Status)
// =================================================================
// [목적] 생산 현장의 설비, 작업자, 금형/치공구 등 물리적/인적 자원의 가동 여부를 실시간 검증하고
//        공정 요구사항에 부합하는 적격 자원을 특정 작업에 동적으로 할당(Locking)합니다.
// =================================================================

function allocateResource(workOrderId, operationId, resourceId) {
    
    // [1단계] 자원 기준정보 마스터 및 실시간 가동 상태 조회
    // 데이터베이스 자원 마스터에서 설비 사양, 물리적 위치, 기본 가용성 설정을 로드합니다.
    const resource = loadResourceMaster(resourceId);
    
    
    // [2단계] 자원의 물리적/계통적 가용성(Availability) 및 보류(Hold) 상태 검증
    // 설비 고장, PM 점검 중이거나, 품질/안전 상의 이유로 홀드(Hold)된 자원은 투입을 즉시 차단합니다.
    if (resource.status !== "AVAILABLE" || resource.isHold) {
        throw new Error("[자원 배정 오류] 대상 자원이 현재 가동 불가 상태이거나, 보류(Hold) 조치 중입니다.");
    }
    
    
    // [3단계] 공정 기술 사양(Operation Capability Matrix) 적합성 검증
    // 배정하고자 하는 공정의 사양(가압력, 온도시스템, 툴링 호환성 등)을 설비가 실제로 충족하는지 대조합니다.
    const hasCapability = checkResourceCapability(resourceId, operationId);
    
    if (!hasCapability) {
        throw new Error("[자격 검증 오류] 해당 설비가 대상 공정의 품질/기술 사양(Capability)을 만족하지 못합니다.");
    }
    
    
    // [4단계] 트랜잭션 무결성 확보 하에 작업 배정 정보(Assignment) 생성
    // 특정 작업 오더 및 공정 단위에 설비를 선점(Preemption) 처리하기 위한 매핑 객체를 생성합니다.
    const assignment = {
        assignmentId: generateUniqueId("ASGN"), // 유일성을 보장하는 자원 할당 트랜잭션 고유 ID
        workOrderId: workOrderId,               // 연계할 상위 ERP/APS 생산 오더 ID
        operationId: operationId,               // 실행할 세부 공정 정의 ID
        resourceId: resourceId,                 // 배정 대상 물리 설비 ID
        allocatedAt: new Date().toISOString(),   // 배정 확정 시스템 시각
        status: "ALLOCATED"                     // 초기 배정 완료 상태 설정
    };
    
    // 데이터 무결성 보장을 위해 DB 내 자원 할당 테이블에 영구 저장합니다.
    saveResourceAssignment(assignment);
    
    
    // [5단계] 자원 마스터 가동 상태를 즉시 'BUSY(사용중)'로 상태 전이
    // 타 작업 오더로 인한 중복 할당(Double Booking)을 데이터 계층에서 원천 차단하기 위해 상태를 전환합니다.
    updateResourceStatus(resourceId, "BUSY", "WORK_ORDER_ASSIGNED");
    
    
    // [6단계] 타 시스템 및 연동 모듈에 비동기 실시간 이벤트(Domain Event) 발행
    // HMI 단말 화면 갱신 및 APS 상세 일정 재계산(상태 변화 반영)을 위한 도메인 이벤트를 브로커에 발행합니다.
    publishResourceEvent("RESOURCE_ALLOCATED", { 
        resourceId: resourceId, 
        workOrderId: workOrderId,
        timestamp: new Date().toISOString()
    });
    
}""",
        "operations-detail-scheduling": """// =================================================================
// 2. 상세 생산 스케줄링 (Operations / Detail Scheduling)
// =================================================================
// [목적] ERP의 일별/주별 대형 계획을 현장의 실시간 자원 제약(Finite Capacity), 품목 교체에 따른
//        설비 셋업 시간(Changeover), 교대조 일정을 반영해 분/초 단위의 실행 스케줄로 재조정합니다.
// =================================================================

function generateDetailSchedule(areaId, planOrders) {
    
    // [1단계] 지정된 생산 구역(Area) 내 실시간 가동 가능 설비 풀(Active Resources) 및 캘린더 분석
    // 설비 상태 이력 및 당일 근무 조별 가용 정비 시간을 확인하여 실시간 물리 생산 용량(Capacity)을 산출합니다.
    const activeResources = loadActiveResourcesInArea(areaId);
    
    
    // [2단계] 미실행 대기 오더들을 우선순위(납기 임박도, 중요도 가중치)를 기준으로 하강 정렬
    // 긴급 납기 오더 및 선공정 완료 대기 작업을 실행 우선순위 계산식에 의해 재배열합니다.
    const sortedOrders = sortOrdersByPriority(planOrders);
    
    const scheduleQueue = [];
    
    
    // [3단계] 각 오더에 대해 유한 부하(Finite Capacity) 하에 셋업 제약을 고려하여 최적 시간대 및 설비 탐색
    for (const order of sortedOrders) {
        
        // 3-1. 이전 작업 품목과의 차이에 따른 설비 세척 및 금형 교체(Changeover/Setup) 시간 산출
        // 동일 제품군 연속 생산 시 셋업 시간을 0으로 수렴시켜 생산 효율을 극대화(Campaign Scheduling)합니다.
        const lastAssignedProduct = getLastAssignedProduct(order.resourceId);
        const setupTime = calculateSetupTime(lastAssignedProduct, order.productId);
        
        
        // 3-2. 대상 설비별 가장 빠른 가용 슬롯(Earliest Available Slot)을 계산하여 최적 매치 분석
        const bestResource = findOptimalResource(activeResources, order, setupTime);
        
        
        // 3-3. 최적 자원 매칭 성공 시, 상세 시작/종료 예정 타임스탬프 계산 및 예약 설정
        if (bestResource) {
            const plannedStart = calculateNextAvailableTime(bestResource) + setupTime;
            const plannedEnd = plannedStart + order.runTime; // 순수 가동 시간(Run Time) 누적
            
            const scheduleItem = {
                scheduleId: generateUniqueId("SCHD"),  // 스케줄 슬롯 고유 식별 키
                workOrderId: order.workOrderId,        // 생산 지시 대상 오더 식별 ID
                resourceId: bestResource.resourceId,  // 매핑된 물리 설비 ID
                plannedStart: plannedStart,            // 셋업 준비가 끝난 후 가동 시작 시각
                plannedEnd: plannedEnd,                // 최종 생산 완료 예상 시각
                setupTime: setupTime                   // 설비 전환 셋업 소요 시간
            };
            
            scheduleQueue.push(scheduleItem);
            
            
            // 3-4. 스케줄 시뮬레이션 중 중복 할당 방지를 위해 메모리 상 자원 점유 예약 설정
            reserveResourceTime(bestResource.resourceId, plannedStart, plannedEnd);
        }
        
    }
    
    
    // [4단계] 확정된 실시간 상세 스케줄 데이터를 영구 적재하고 Dispatch Queue(실행 대기열)에 밀어넣기
    // 스케줄 확정 이력 관리 및 이전 이력 보존을 위해 새 버전을 릴리스하고 실행계에 전파합니다.
    saveDetailSchedule(scheduleQueue);
    
    publishScheduleEvent("SCHEDULE_UPDATED", { 
        areaId: areaId, 
        count: scheduleQueue.length,
        version: new Date().toISOString()
    });
    
}""",
        "dispatching-production-units": """// =================================================================
// 3. 작업 단위 디스패칭 (Dispatching Production Units)
// =================================================================
// [목적] 작업 실행 직전 단계에서 실시간 가용한 작업 대기열(Dispatch Queue) 중 
//        물리적 제약(자재, 치공구, 작업자 자격)을 완벽히 통과한 가장 가치 높은 작업을 현장에 착수(Run) 시킵니다.
// =================================================================

function dispatchNextJob(resourceId) {
    
    // [1단계] 해당 설비(Resource)에 할당된 실시간 실행 대기열(Dispatch Queue) 획득
    // 실시간 스케줄러와 연동된 라인별 실행 대기 큐에서 오더 목록을 읽어옵니다.
    const queue = loadDispatchQueue(resourceId);
    
    
    // [2단계] 3대 핵심 실행 정합성(자재 입고 여부, 치공구 준비 상태, 작업자 자격 인증) 동적 검증
    // 이 단계는 계획 대비 실제 착수가 지연되거나 불량 자재 투입으로 인한 대형 사고를 막는 핵심 필터입니다.
    const readyJobs = queue.filter(job => {
        return checkMaterialAvailability(job.workOrderId) && // 필요한 원부자재 lot이 작업장에 물리적으로 입고되었는가?
               checkFixtureAvailability(job.operationId) &&  // 전용 금형, 로봇 그리퍼 등이 점검 승인 상태인가?
               checkOperatorQualification(job.operationId);  // 현재 교대조 작업자가 해당 장비 운전 자격(Skill Level)이 있는가?
    });
    
    
    // [3단계] 착수 준비된 작업이 없는 경우 스캔 종료 및 대기 상태 유지
    if (readyJobs.length === 0) {
        return null; // 대기열 내 조건 만족 오더 부재
    }
    
    
    // [4단계] 현장 우선순위 점수 알고리즘을 적용하여 실행할 최적의 1순위 오더 최종 선택
    // 납기 긴급도 점수와 Campaign 연속 생산 시너지 점수를 반영하여 최선의 작업을 도출합니다.
    const targetJob = selectHighestPriorityJob(readyJobs);
    
    
    // [5단계] 선택된 오더를 '실행 중(STARTED)' 상태로 승격시키고 물리 착수 트랜잭션 개시
    const dispatchId = generateUniqueId("DISP");
    updateDispatchState(targetJob.queueId, "DISPATCHED");
    
    const execution = {
        executionId: generateUniqueId("EXEC"),       // 현장 실행 트랜잭션 고유 ID
        dispatchId: dispatchId,                     // 디스패칭 지시 트랜잭션 매핑 ID
        workOrderId: targetJob.workOrderId,         // 연결된 상위 작업 오더 ID
        lotId: targetJob.lotId,                     // 추적을 위한 결과물 Lot ID
        resourceId: resourceId,                     // 작업이 수행되는 설비 ID
        status: "STARTED",                          // 착수 완료 상태 지정
        actualStart: new Date().toISOString()       // 실제 공정 시작 시각 스탬프
    };
    
    createExecutionRecord(execution);
    
    
    // [6단계] 설비 데이터 게이트웨이(EAP/SCADA)에 Recipe 코드 다운로드 지시 및 셋업 명령 하달
    // 작업자가 Recipe를 수동으로 입력해 발생하는 휴먼 에러를 방지하기 위한 통합 자동화 필수 단계입니다.
    downloadRecipeToEquipment(resourceId, targetJob.recipeId);
    
    return execution;
    
}""",
        "document-control": """// =================================================================
// 4. 문서 및 작업표준 관리 (Document Control)
// =================================================================
// [목적] 규제 산업(제약, 반도체 등) 및 정밀 제조 공정에서 작업자 HMI 화면에 최신 SOP(작업표준서),
//        엔지니어링 변경 고시(ECN) 도면을 자동으로 실시간 바인딩하고 감사 추적(Audit Trail)용 열람 로그를 생성합니다.
// =================================================================

function bindAndDisplayDocument(workOrderId, operationId, operatorId) {
    
    // [1단계] 대상 세부 공정(Operation) 및 제조 품목에 매핑되어 있는 필수 유효 표준 문서 규격 로드
    // 기준정보 관리 모듈에서 해당 작업 절차상 요구하는 도면, SOP 문서 정보 매핑 테이블을 조회합니다.
    const requiredDocs = loadRequiredDocumentMapping(operationId);
    
    const displayList = [];
    
    
    // [2단계] 각 필수 문서 사양의 최신 개정본(Revision) 및 승인/유효성 만료일자 대조
    // 유효하지 않거나 폐기된 옛날 표준서가 작업장 단말에 뜨지 않도록 완벽히 검증 차단합니다.
    for (const doc of requiredDocs) {
        
        // PLM/문서관리 시스템(DMS) 인터페이스를 통해 현재 유효(Effective) 상태인 Revision을 가져옵니다.
        const activeRevision = getActiveDocumentRevision(doc.documentId);
        
        if (!activeRevision) {
            throw new Error(`[작업 표준 위반] 필수 바인딩 문서 [${doc.documentId}]의 유효한 승인 버전이 부재합니다.`);
        }
        
        
        // [3단계] 규정 준수 감사 추적(Audit Trail)을 위해 작업자의 문서 열람 로그 즉시 영구 적재
        // 향후 품질 불량 검토 시, 작업자가 실제 올바른 버전의 도면을 확인하고 조립했는지 입증하는 규제 필수 데이터입니다.
        const viewLog = {
            logId: generateUniqueId("VLOG"),         // 감사 로그 고유 식별 번호
            documentId: doc.documentId,             // 열람된 문서 ID
            revision: activeRevision.revision,       // 열람 시점의 문서 개정 버전 번호
            workOrderId: workOrderId,               // 작업이 진행 중이던 생산 Lot/오더 ID
            operatorId: operatorId,                 // 열람을 실행한 작업자 계정 ID
            viewedAt: new Date().toISOString()       // 정확한 열람 시각 타임스탬프
        };
        
        saveDocumentViewLog(viewLog);
        
        
        // 3-2. 검증이 통과된 최신 활성 문서만 리스트에 추가
        displayList.push({
            documentId: doc.documentId,
            title: doc.title,
            revision: activeRevision.revision,
            fileUrl: activeRevision.fileUrl
        });
        
    }
    
    
    // [4단계] 현장 HMI 및 키오스크 시스템 단말 화면에 PDF SOP 뷰어 레이아웃 호출 및 강제 렌더링
    // 작업자가 별도로 문서를 수동 검색할 필요 없이, 공정 시작과 동시에 화면에 문서를 띄워 가독성을 높입니다.
    renderSopViewer(displayList);
    
}""",
        "data-collection-acquisition": """// =================================================================
// 5. 데이터 수집 (Data Collection / Acquisition)
// =================================================================
// [목적] 설비 PLC 센서(온도, 압력 등) 및 HMI 바코드 터치 단말기로부터 초/밀리초 단위로 쏟아지는
//        생산 원천 데이터의 노이즈를 걸러내고, 유효 범위(Spec) 검증 후 실시간 제조 문맥(Context)을 엮어 적재합니다.
// =================================================================

function processCollectedData(rawEvent) {
    
    // [1단계] 유입 데이터 패킷 무결성(Data Integrity) 1차 하드웨어 레벨 검증
    // 수집 태그 식별자나 계측값이 유실된 비정상적인 손상 패킷은 로그를 남기고 폐기 처리합니다.
    if (!rawEvent.pointId || rawEvent.value === undefined) {
        logDataError("DATA_INTEGRITY_FAILED", rawEvent);
        return;
    }
    
    
    // [2단계] 설비 계측 데이터의 통계적 필터링 및 상하한 임계값(LSL/USL) 대조 분석
    // 비정상적인 스파이크 노이즈를 걸러내고 데이터 품질 상태를 정의합니다.
    const spec = loadCollectionPointSpec(rawEvent.pointId);
    const isValidValue = validateRange(rawEvent.value, spec.minLimit, spec.maxLimit);
    
    const qualityCode = isValidValue ? "GOOD" : "BAD_LIMIT_EXCEEDED";
    
    
    // [3단계] 수집된 데이터의 비즈니스 문맥화(Contextualization) - MES의 심장부 기능
    // 단순 원시 온도값 '250도'를 '현재 A장비에서 생산 중인 Lot01번의 용접 공정 실적'으로 엮어 가치를 창출합니다.
    const activeContext = getActiveEquipmentContext(spec.equipmentId);
    
    const contextualizedData = {
        dataId: generateUniqueId("CDAT"),                                     // 수집 정제 데이터 트랜잭션 ID
        pointId: rawEvent.pointId,                                           // 수집 태그 고유 ID (OPC-UA Tag 등)
        lotId: activeContext ? activeContext.lotId : "NO_LOT_CONTEXT",       // 동적으로 연계된 가동 중 Lot 번호
        operationId: activeContext ? activeContext.operationId : "NO_OP_CONTEXT", // 연계된 세부 공정 단계 코드
        equipmentId: spec.equipmentId,                                       // 계측 원천 설비 고유 ID
        value: rawEvent.value,                                               // 물리/화학적 가용 계측치
        qualityCode: qualityCode,                                           // 노이즈/이탈 여부를 담은 품질 구분 코드
        eventTime: rawEvent.timestamp,                                       // 설비 센서 단말 계측 실시간 물리 시각
        collectedAt: new Date().toISOString()                                 // MES 서버가 가공 및 적재한 저장 시각
    };
    
    
    // [4단계] 실시간 설비 가동 모니터링 DB(In-Memory) 및 영구 품질 분석 시계열 DB(TSDB)에 적재
    // 수율(Yield) 및 가동률 분석을 위해 데이터를 안전하게 디스크에 저장합니다.
    saveContextualizedData(contextualizedData);
    
    
    // [5단계] 계측치 위험 임계값 이탈이 확인될 경우 즉각적인 비정상 알림 이벤트 전파
    // 예외 처리를 위해 생산 설비 중단 이벤트 또는 품질 부적합 담당자 알람을 SMS/비동기 메시지로 쏩니다.
    if (qualityCode !== "GOOD") {
        publishAnomalyEvent("DATA_ANOMALY_DETECTED", contextualizedData);
    }
    
}""",
        "labor-management": """// =================================================================
// 6. 작업자 및 노무 관리 (Labor Management)
// =================================================================
// [목적] 현장 작업자가 자격 조건이 충족되지 않은 위험 장비나 특수 공정에 무단 투입되는 일을 막아 
//        품질 사고와 안전 재해를 미연에 방지하고, 작업의 시작/종료를 통해 순수 직접 노무 공수(Labor Hours)를 계산합니다.
// =================================================================

function assignOperatorToWork(personId, resourceId, operationId, workOrderId) {
    
    // [1단계] 투입 대상 작업자의 인사 마스터 활성(Active) 계정 및 근무 조 정보 확인
    // 현재 휴직 상태이거나 퇴사한 계정으로 장비를 조작하려는 시도를 원천 차단합니다.
    const operator = loadOperatorMaster(personId);
    
    if (!operator.activeFlag) {
        throw new Error("[보안/투입 차단] 유효하지 않거나 비활성화 상태인 작업자 계정입니다.");
    }
    
    
    // [2단계] 작업자가 해당 공정의 필요 자격증/스킬 매트릭스(Skill Matrix)를 통과했는지 실시간 대조
    // 자격 만료일, 숙련도 등급(Certified Level)을 동적으로 판별하여 무자격자 투입을 차단합니다.
    const qualification = getPersonnelQualification(personId, operationId);
    const currentDate = new Date().toISOString();
    
    if (!qualification || qualification.status !== "CERTIFIED" || qualification.expiresAt < currentDate) {
        throw new Error("[자격 검증 차단] 이 공정을 독립 수행하기 위한 유효한 기술 자격증(Certification)이 없습니다.");
    }
    
    
    // [3단계] 현장 노무 투입 트랜잭션 기록 생성 및 영구 적재
    // 원가 계산의 기초가 되는 노무 투입 공수 수집용 작업 배정 레코드를 활성화합니다.
    const assignmentId = generateUniqueId("LASGN");
    
    const laborAssignment = {
        assignmentId: assignmentId,                 // 노무 할당 식별 트랜잭션 고유 ID
        personId: personId,                         // 투입된 작업자 사번 ID
        resourceId: resourceId,                     // 작업자가 조작하는 설비 ID
        operationId: operationId,                   // 작업자가 배치된 세부 공정 코드
        workOrderId: workOrderId,                   // 생산 대상 Lot/오더 고유 ID
        startTime: currentDate,                     // 실제 조작 및 감시 시작 일시
        status: "ACTIVE"                            // 투입 상태 진행으로 마크
    };
    
    saveLaborAssignment(laborAssignment);
    
    
    // [4단계] 기존에 흘러가던 작업자의 비가동 간접 시간(회의, 교육, 대기) 세션 자동 마감 처리
    // 직접 가동 시간(Direct Labor Time)을 개시하여 제조원가의 직접 공수를 정확히 추적합니다.
    closeIndirectLaborTime(personId, currentDate);
    startDirectLaborTime(personId, workOrderId, assignmentId, currentDate);
    
}""",
        "quality-management": """// =================================================================
// 7. 품질 관리 (Quality Management)
// =================================================================
// [목적] 제조 공정 중 발생하는 검사 성적(치수, 중량 등)을 수집하여 통계적 관리 한계선(Spec Limit)과 비교하고,
//        불량 판정 시 즉각적인 물류 락(Hold)을 걸어 불량품이 후공정으로 흘러가는 대참사를 차단합니다.
// =================================================================

function recordInspectionResult(lotId, operationId, characteristic, measuredValue) {
    
    // [1단계] 대상 공정 및 품목 사양에 정의된 공식 품질 검사 규격서(Upper/Lower Spec Limit) 기준정보 로드
    // LSL, USL, target 값과 함께 통계적 공정 관리(SPC)의 제어선 설정을 확인합니다.
    const spec = loadInspectionSpec(operationId, characteristic);
    
    const specLow = spec.lowerLimit;
    const specHigh = spec.upperLimit;
    
    
    // [2단계] 계측된 물리 측정값과 Spec을 대조하여 합격(PASS) / 불합격(NG) 판정
    // 단순 크기 비교를 수행하여 범위 이탈 여부를 식별합니다.
    let result = "PASS";
    
    if (measuredValue < specLow || measuredValue > specHigh) {
        result = "NG";
    }
    
    
    // [3단계] 추적성과 품질 증명을 위해 검사 성적 레코드를 생성 및 데이터 계층 영구 저장
    // 고객 납품 시 제공할 수 있는 성적서 데이터(Certificate of Analysis)의 원천이 됩니다.
    const resultId = generateUniqueId("QRES");
    
    const qualityResult = {
        resultId: resultId,                         // 품질 성적 식별 고유 ID
        lotId: lotId,                               // 성적이 기록된 대상 생산 Lot ID
        operationId: operationId,                   // 검사가 이루어진 공정 단계 코드
        characteristic: characteristic,             // 검사 항목명 (예: "두께", "강도")
        measuredValue: measuredValue,               // 실 계측 측정값
        specLow: specLow,                           // 합격 한계선 최소값
        specHigh: specHigh,                         // 합격 한계선 최대값
        result: result,                             // 판정 결과 (PASS/NG)
        recordedAt: new Date().toISOString()         // 계측 및 판정 처리 일시
    };
    
    saveQualityResult(qualityResult);
    
    
    // [4단계] 불합격(NG) 발생 시 연쇄적인 자동 보류(Auto-Hold) 트랜잭션 발동 - 품질 관리의 핵심 무결성
    // 작업자의 개입 없이, 시스템이 즉시 해당 Lot의 물류를 락(Lock) 걸어 현장 적치장 밖으로 이동하지 못하게 막습니다.
    if (result === "NG") {
        const ncId = generateUniqueId("NC");
        
        // 부적합(Nonconformance) 처리 보고 객체 생성
        const nonconformance = {
            ncId: ncId,                             // 부적합 처리 프로세스 고유 ID
            lotId: lotId,                           // 대상 Lot ID
            defectCode: "DEF-MEASURE-OUT",           // 불량 유형 공통 코드
            severity: "CRITICAL",                   // 결함 치명도 등급 (치명 불량)
            recordedValue: measuredValue,           // 기준 이탈된 실제 원인 계측값
            disposition: "HOLD_FOR_REVIEW",         // 부적합 위원회(MRB) 검토 전까지 임시 대기 조치
            createdAt: new Date().toISOString()     // 부적합 보고 등록 일시
        };
        
        saveNonconformance(nonconformance);
        
        
        // Lot 마스터 테이블의 실시간 흐름 상태를 'HOLD'로 강제 수정하여 디스패칭에서 제외시킵니다.
        updateLotStatus(lotId, "HOLD", `QRES_NG_AUTO_HOLD: ${resultId}`);
        
        
        // 현장 및 품질 경보 시스템에 비동기 도메인 경보 이벤트 릴리스
        publishQualityEvent("LOT_HOLD_TRIGGERED", { 
            lotId: lotId, 
            ncId: ncId, 
            reason: "SPEC_LIMIT_EXCEEDED" 
        });
    }
    
    return qualityResult;
    
}""",
        "process-management": """// =================================================================
// 8. 공정 관리 (Process Management)
// =================================================================
// [목적] 작업 도중의 실시간 공정 진행 상태 전이를 매끄럽게 통제하고, 설비와의 Recipe 파라미터 매핑을
//        자동화하며 정해진 표준 라우팅 경로(Operation Sequence)를 이탈한 이상 작업 생성을 미연에 차단합니다.
// =================================================================

function startProcessRun(lotId, operationId, resourceId) {
    
    // [1단계] 공정 라우팅(제조 프로세스 맵) 규칙 검증 단계
    // 이전 공정이 아직 안 끝났거나, 순서가 스킵된 채 유입된 불량 공정 접근을 원천 철벽 방어합니다.
    const routing = loadActiveRoute(lotId);
    
    if (routing.currentOperationId !== operationId) {
        throw new Error("[공정 규칙 위반] 공정 순서가 맞지 않습니다. 라우팅 흐름상 이전 공정이 미완료 상태입니다.");
    }
    
    
    // [2단계] 생산 품목 및 공정에 할당된 유효 승인 Recipe Master 사양 검증
    // 미승인된 Recipe나 개발 중인 Recipe가 대량 양산 설비에 들어가는 오류를 차단합니다.
    const recipe = loadActiveRecipe(routing.productId, operationId);
    
    if (recipe.status !== "APPROVED") {
        throw new Error("[레시피 오류] 해당 공정에 적용 가능한 정식 승인 상태의 Recipe가 존재하지 않습니다.");
    }
    
    
    // [3단계] 투입 설비의 물리 상태 사전 체크 (Interlock 검증)
    // 고장(Down) 나 있거나 보전 중, 혹은 이미 타 작업을 수행 중인 설비에 중복 실행을 거부합니다.
    const equipment = getEquipmentState(resourceId);
    
    if (equipment.status !== "STANDBY") {
        throw new Error("[설비 인터락 차단] 대상 설비가 현재 생산 대기(STANDBY) 가능 상태가 아닙니다.");
    }
    
    
    // [4단계] 승인된 레시피 설정값(Recipe Parameters)을 EAP/PLC 게이트웨이를 통해 설비에 안전 다운로드
    // 온도, 가공 압력 등의 표준 값을 물리 장비 레지스터에 직접 하달하여 가공 품질 균일성을 확보합니다.
    const parameters = loadRecipeParameters(recipe.recipeId);
    const downloadStatus = downloadToEap(resourceId, recipe.recipeId, parameters);
    
    if (!downloadStatus.success) {
        throw new Error(`[설비 통신 실패] 레시피 다운로드 트랜잭션이 실패했습니다: ${downloadStatus.errorMessage}`);
    }
    
    
    // [5단계] 공정 가동 실행(Process Run) 관리 객체 영구 생성 및 설비 동작
    const runId = generateUniqueId("RUN");
    
    const processRun = {
        runId: runId,                               // 공정 실행 트랜잭션 고유 ID
        lotId: lotId,                               // 현재 가공하는 원자재/반제품 Lot ID
        operationId: operationId,                   // 세부 공정 단계 ID
        resourceId: resourceId,                     // 조작 대상 설비 고유 ID
        recipeId: recipe.recipeId,                 // 다운로드 완료된 레시피 마스터 ID
        startTime: new Date().toISOString(),         // 물리 가공 개시 시각 타임스탬프
        status: "RUNNING"                           // 가공 진행중 마크
    };
    
    saveProcessRun(processRun);
    
    
    // [6단계] 설비 마스터의 실시간 런타임 상태를 즉시 'PRODUCING(가동중)'으로 전이
    // 공장 전체 대시보드(ANDON) 및 가동 모니터링 모듈에 설비 사용 중 상태를 즉각 공유합니다.
    updateEquipmentState(resourceId, "PRODUCING");
    
    return runId;
    
}""",
        "maintenance-management": """// =================================================================
// 9. 설비 보전 관리 (Maintenance Management)
// =================================================================
// [목적] 설비에 치명적 고장 알람이 발생하거나 사전에 설정된 예방 보전 주기(런타임 시간, 누적 타수)에
//        도달했을 때, 생산 실행 계획을 일시 중단시키고 보전 작업 오더를 발행하여 긴급 수리 프로세스를 밟습니다.
// =================================================================

function triggerMaintenanceWork(resourceId, triggerType, reasonCode) {
    
    // [1단계] 보전 처리 대상 설비의 정보 및 사양 로드
    const equipment = loadResourceMaster(resourceId);
    
    
    // [2단계] 불필요한 보전 오더 중복 발행을 위한 활성 보전 세션 유무 체크
    // 동일 설비에 수리 작업 지시서가 중복 발행되어 통계가 왜곡되거나 리소스가 낭비되는 것을 방지합니다.
    const activeWo = getActiveMaintenanceOrder(resourceId);
    
    if (activeWo) {
        return activeWo.mwId; // 이미 수리 진행 중인 경우 해당 기존 오더 ID 반환하고 스킵
    }
    
    
    // [3단계] 신규 설비 보전 작업 오더(Maintenance Work Order) 생성 및 DB 적재
    // 고장 수리 및 예방 보전 시간 집계의 원천이 되는 보전 레코드를 기안합니다.
    const mwId = generateUniqueId("MWO");
    
    const workOrder = {
        mwId: mwId,                                 // 보전 작업 오더 고유 ID
        resourceId: resourceId,                     // 정비 대상 설비 ID
        triggerType: triggerType,                   // 보전 트리거 유형 ('EMERGENCY_BREAKDOWN' / 'PREVENTIVE_PM')
        reasonCode: reasonCode,                     // 상세 고장 원인/유형 구분 코드 (예: 스핀들 과부하)
        priority: triggerType === "EMERGENCY_BREAKDOWN" ? "CRITICAL" : "MEDIUM", // 등급 부여
        status: "CREATED",                          // 초기 발행 승인 대기 상태
        createdAt: new Date().toISOString()         // 보전 요청 등록 시각
    };
    
    saveMaintenanceWorkOrder(workOrder);
    
    
    // [4단계] 생산계 물류 차단을 위해 설비의 실시간 상태를 즉시 'DOWN(고장/정지)'으로 강제 잠금
    // 디스패칭 엔진이 이 설비로 작업을 배정하는 것을 즉각 원천 차단하는 가장 핵심적인 동적 연동 장치입니다.
    updateResourceStatus(resourceId, "DOWN", `MAINTENANCE_LOCK_REASON: ${reasonCode}`);
    
    
    // [5단계] 생산 스케줄 및 지포스 계획 모듈에 가동 정지 도메인 이벤트 실시간 발행
    // 스케줄러가 예정된 대기 오더들을 가동 가능한 타 대체 설비로 우회 배정(Rerouting)할 수 있게 신호를 전송합니다.
    publishResourceEvent("EQUIPMENT_UNAVAILABLE", { 
        resourceId: resourceId, 
        mwId: mwId, 
        expectedDownDurationMin: 120 // 추정 수리 소요 시간 가중치 전송
    });
    
    return mwId;
    
}""",
        "product-tracking-genealogy": """// =================================================================
// 10. 제품 추적 및 계보 (Product Tracking and Genealogy)
// =================================================================
// [목적] 공정 중 소모되는 자재의 품질 상태를 엄격히 검증하여 부적합 자재 유입을 막고, 
//        투입된 자재 Lot과 생산된 제품 Lot 간의 1:N, N:M 관계를 엮어 무결한 추적 계보(Genealogy)를 수립합니다.
// =================================================================

function recordMaterialConsumption(parentLotId, childLotId, materialDefId, quantity, uom) {
    
    // [1단계] 투입할 원부자재 Lot의 현재 창고 재고 수량 및 품질 승인(Released) 상태 검증
    // 수입 검사에서 불합격되었거나 보류(Hold) 상태인 자재 Lot이 기계 내부로 잘못 들어가는 대참사를 차단합니다.
    const materialLot = loadMaterialLot(parentLotId);
    
    if (materialLot.status !== "RELEASED") {
        throw new Error("[자재 검증 실패] 투입하려는 자재 Lot이 품질 격리(Hold) 상태이거나 미승인 상태입니다.");
    }
    
    if (materialLot.quantity < quantity) {
        throw new Error(`[자재 재고 부족] 현장 요청량 [${quantity}] 대비 원자재 실재고 [${materialLot.quantity}]가 부족합니다.`);
    }
    
    
    // [2단계] 자재 실 소모 이력(Material Consumption Log) 생성 및 RDB 영구 저장
    // 어떤 자재가 어느 시점에 정확히 소모되었는지 원가 집계와 BOM 오차 분석을 가능케 합니다.
    const consumptionId = generateUniqueId("CONS");
    
    const consumption = {
        consumptionId: consumptionId,               // 자재 소모 이력 고유 ID
        parentLotId: parentLotId,                   // 투입 소모된 원자재/반제품 Lot ID
        childLotId: childLotId,                     // 투입 결과로 태어난 완성물/반제품 Lot ID
        materialDefId: materialDefId,               // 소모 품목 기준 정보 ID
        quantity: quantity,                         // 실제 소모 투입량
        uom: uom,                                   // 단위 (예: "kg", "pcs")
        consumedAt: new Date().toISOString()         // 실제 소모가 처리된 공정 타임스탬프
    };
    
    saveMaterialConsumption(consumption);
    
    
    // [3단계] 정방향/역방향 리콜 추적을 보장하기 위한 원시 계보 링크(Genealogy Chain Link) 등록
    // 향후 부자재 불량 발생 시 해당 부자재를 쓴 모든 완제품 리콜 범위를 1초 이내에 밝혀내는 안전망입니다.
    const linkId = generateUniqueId("GLNK");
    
    const genealogyLink = {
        linkId: linkId,                             // 계보 링크 트랜잭션 고유 ID
        parentId: parentLotId,                      // 원인 부품/자재 부모 Lot ID
        childId: childLotId,                        // 결과 가공 제품 자식 Lot ID
        linkType: "LOT_CONSUMPTION",                // 링크 연계 관계 정의 유형
        createdAt: new Date().toISOString()         // 족보 연결 기록 일시
    };
    
    saveGenealogyLink(genealogyLink);
    
    
    // [4단계] 현장 자재 창고 재고 테이블의 수량을 소모량만큼 차감 업데이트
    // 시스템 재고와 실물 현장 재고를 동기화하여 현장의 자재 고갈을 즉시 예방합니다.
    const remainingQty = materialLot.quantity - quantity;
    updateMaterialLotQuantity(parentLotId, remainingQty);
    
    
    // [5단계] ERP 재고 차감(Backflush) 및 통합 물류 모듈에 비동기 실시간 재고 차감 정보 발행
    // 재고 실사와 결산 일치율을 99.9% 수준으로 유도하는 핵심 물류 게이트웨이 이벤트 전파입니다.
    publishInventoryEvent("MATERIAL_CONSUMED_FOR_LOT", { 
        parentLotId: parentLotId, 
        childLotId: childLotId, 
        consumedQty: quantity 
    });
    
}""",
        "performance-analysis": """// =================================================================
// 11. 성과 분석 (Performance Analysis)
// =================================================================
// [목적] 생산 현장에서 누적된 실시간 원천 데이터(가동 시간, 생산량, 불량 수량 등)를 집계하여
//        SEMI E10/E79 글로벌 표준 기반의 설비 종합 효율(OEE) 3대 핵심 KPI를 실시간 산출합니다.
// =================================================================

function calculateResourceOee(resourceId, startTime, endTime) {
    
    // [1단계] 분석 기준 기간 동안의 설비 물리 상태 로그(State History Logs) 전량 추출
    // 설비 상태가 Producing, Standby, Down, PM 등 어떤 타임 슬롯으로 채워져 있는지 획득합니다.
    const stateLogs = loadEquipmentStateHistory(resourceId, startTime, endTime);
    
    
    // [2단계] 상태별 지속 시간(Duration)의 통계적 분류 및 합계 분석
    const timeSummary = sumDurationByStateCategory(stateLogs);
    
    const totalTime = timeSummary.totalTimeSec;       // 기간 내 총 시간 (예: 하루 86,400초)
    const plannedDown = timeSummary.plannedDownSec;   // 계획된 정지 시간 (예: 계획 예방 보전, 정기 휴무)
    
    // 부하 가동 시간(Loading Time) = 전체 기간 시간 - 계획된 비생산 시간
    const loadingTime = totalTime - plannedDown;
    
    if (loadingTime <= 0) {
        return { oee: 0.0, availability: 0.0, performance: 0.0, quality: 0.0 };
    }
    
    
    // [3단계] OEE 3대 정량 지표 계산식 수행
    
    // A. 시간 가동률 (Availability) = 실제 제품 생산 가동 시간 / 부하 가동 시간
    // 설비 고장 및 돌발 정지로 인한 시간적 손실을 정밀하게 평가합니다.
    const runTime = timeSummary.producingTimeSec;
    const availability = runTime / loadingTime;
    
    
    // B. 성능 효율 (Performance) = (총 생산 수량 * 품목별 표준 Cycle Time) / 실제 가동 시간
    // 설비의 가동 속도가 표준 규격속도 대비 얼마나 느렸는지(속도 저하 손실)를 정량 집계합니다.
    const production = loadProductionSummary(resourceId, startTime, endTime);
    const standardCycleTime = loadStandardCycleTime(resourceId);
    
    const performance = runTime > 0 ? (production.totalQty * standardCycleTime) / runTime : 0.0;
    
    
    // C. 양품률 (Quality) = (전체 생산 수량 - 불량 및 재작업 수량) / 전체 생산 수량
    // 가동 중 발생한 불량 및 스타트업 불량 손실을 평가합니다.
    const goodQty = production.goodQty;
    const totalQty = production.totalQty;
    
    const quality = totalQty > 0 ? goodQty / totalQty : 0.0;
    
    
    // [4단계] 최종 종합 성과 지표 OEE 복합 공식 도출
    // OEE = 가동률 * 성능효율 * 양품률
    const oee = availability * performance * quality;
    
    
    // [5단계] 분석 결과 스냅샷 생성 및 트렌드 분석 모니터링 DB에 적재
    // 소수점 셋째 자리에서 반올림 처리하여 신뢰성 있고 안정적인 수치 데이터를 제공합니다.
    const oeeSnapshot = {
        snapshotId: generateUniqueId("OEE"),
        resourceId: resourceId,
        windowStart: startTime,
        windowEnd: endTime,
        availability: Math.round(availability * 10000) / 100, // 백분율 표시 (소수점 둘째자리)
        performance: Math.round(performance * 10000) / 100,
        quality: Math.round(quality * 10000) / 100,
        oee: Math.round(oee * 10000) / 100,
        calculatedAt: new Date().toISOString()
    };
    saveOeeSnapshot(oeeSnapshot);
    
    return oeeSnapshot;
}"""
    }
    return codes.get(id, "")

def getMesaApiExample(id):
    apis = {
        "resource-allocation-status": """// =================================================================
// MESA 자원 배정 트랜잭션 요청 API
// =================================================================
POST /api/mesa/resources/assignments
Content-Type: application/json
{
    "workOrderId": "WO-2026-0001",
    "operationId": "OP-10-PRESS",
    "resourceId": "EQP-PRESS-03"
}

Response: 201 Created
{
    "assignmentId": "ASGN-98723948",
    "resourceId": "EQP-PRESS-03",
    "status": "ALLOCATED",
    "allocatedAt": "2026-05-22T20:15:00Z"
}""",
        "operations-detail-scheduling": """// =================================================================
// MESA 구역별 상세 스케줄링 생성 및 배포 요청 API
// =================================================================
POST /api/mesa/scheduling/detail
Content-Type: application/json
{
    "areaId": "AREA-ASSEMBLY-02",
    "horizonStart": "2026-05-23T00:00:00Z",
    "horizonEnd": "2026-05-23T23:59:59Z",
    "forceReoptimize": true
}

Response: 200 OK
{
    "scheduleId": "SCHD-VERSION-260523",
    "scheduledJobsCount": 42,
    "totalSetupTimeMinutes": 180,
    "status": "PUBLISHED"
}""",
        "dispatching-production-units": """// =================================================================
// MESA 특정 설비의 대기열에서 다음 작업을 착수(Dispatch) 지시 API
// =================================================================
POST /api/mesa/dispatching/dispatch-next
Content-Type: application/json
{
    "resourceId": "EQP-CNC-05",
    "operatorId": "OPR-USER-2394"
}

Response: 200 OK
{
    "dispatchId": "DISP-23948239",
    "workOrderId": "WO-2026-0542",
    "lotId": "LOT-20260522-09",
    "recipeId": "REC-CNC-T5",
    "status": "STARTED",
    "actualStart": "2026-05-22T20:20:00Z"
}""",
        "document-control": """// =================================================================
// MESA 작업 시작 전 필수 SOP 문서 바인딩 및 URL 획득 API
// =================================================================
GET /api/mesa/documents/bind-active?workOrderId=WO-2026-0001&operationId=OP-30-WELD&operatorId=OPR-9932

Response: 200 OK
{
    "boundDocuments": [
        {
            "documentId": "SOP-WELD-30",
            "title": "정밀 용접 공정 표준 작업지도서",
            "revision": "REV-3.2",
            "viewLogId": "VLOG-93829482",
            "fileUrl": "https://dms.factory.internal/sop/sop-weld-30-rev3.2.pdf"
        }
    ]
}""",
        "data-collection-acquisition": """// =================================================================
// MESA EAP/PLC 게이트웨이 전송 실시간 센서 수집 데이터 수신 API
// =================================================================
POST /api/mesa/datacollection/events
Content-Type: application/json
{
    "pointId": "TAG-TEMP-HEATER-01",
    "value": 245.8,
    "timestamp": "2026-05-22T20:10:05.123Z"
}

Response: 202 Accepted
{
    "dataId": "CDAT-93849182739",
    "qualityCode": "GOOD",
    "contextLotId": "LOT-2026-X100"
}""",
        "labor-management": """// =================================================================
// MESA 특정 공정에 작업자 투입 및 자격 검증 API
// =================================================================
POST /api/mesa/labor/assign
Content-Type: application/json
{
    "personId": "EMP-OPR-4019",
    "resourceId": "EQP-CNC-05",
    "operationId": "OP-20-MILLING",
    "workOrderId": "WO-2026-0921"
}

Response: 200 OK
{
    "assignmentId": "LASGN-82938192",
    "certifiedLevel": "GRADE-A",
    "laborDirectStatus": "STARTED",
    "startTime": "2026-05-22T20:25:00Z"
}""",
        "quality-management": """// =================================================================
// MESA 품질 검사 결과 수집 및 자동 판정/보류 처리 API
// =================================================================
POST /api/mesa/quality/inspect
Content-Type: application/json
{
    "lotId": "LOT-20260522-W4",
    "operationId": "OP-40-INSPECT-VISUAL",
    "characteristic": "Thickness_mm",
    "measuredValue": 1.285
}

Response: 200 OK
{
    "resultId": "QRES-938294829",
    "result": "NG",
    "measuredValue": 1.285,
    "limits": { "lsl": 1.300, "usl": 1.400 },
    "autoHoldExecuted": True,
    "nonconformanceId": "NC-8293849182"
}""",
        "process-management": """// =================================================================
// MESA 공정 가동 착수 및 설비 레시피 매핑 다운로드 API
// =================================================================
POST /api/mesa/process/start-run
Content-Type: application/json
{
    "lotId": "LOT-2026-X100",
    "operationId": "OP-10-HEATING",
    "resourceId": "EQP-OVEN-02"
}

Response: 200 OK
{
    "runId": "RUN-9838294273",
    "recipeId": "REC-HEATING-V2",
    "downloadedParametersCount": 8,
    "equipmentState": "PRODUCING",
    "startTime": "2026-05-22T20:30:00Z"
}""",
        "maintenance-management": """// =================================================================
// MESA 설비 보전 작업 수동/자동 트리거 API
// =================================================================
POST /api/mesa/maintenance/trigger
Content-Type: application/json
{
    "resourceId": "EQP-CNC-05",
    "triggerType": "EMERGENCY_BREAKDOWN",
    "reasonCode": "ERR-SPINDLE-OVERHEAT"
}

Response: 201 Created
{
    "maintenanceWorkOrderId": "MWO-8293849182",
    "resourceId": "EQP-CNC-05",
    "lockedStatus": "DOWN",
    "notifiedTeam": "TEAM-MAINTENANCE-MECHANICAL",
    "createdAt": "2026-05-22T20:35:00Z"
}""",
        "product-tracking-genealogy": """// =================================================================
// MESA 공정 생산 중 투입된 자재 Lot 소모 및 계보 등록 API
// =================================================================
POST /api/mesa/tracking/consume-material
Content-Type: application/json
{
    "parentLotId": "LOT-MAT-STEEL-99",
    "childLotId": "LOT-2026-X100",
    "materialDefId": "MAT-DEF-022",
    "quantity": 12.5,
    "uom": "kg"
}

Response: 200 OK
{
    "consumptionId": "CONS-839284918239",
    "genealogyLinkId": "GLNK-839284920",
    "remainingMaterialQuantity": 87.5,
    "status": "RECORDED"
}""",
        "performance-analysis": """// =================================================================
// MESA 설비별 분석 기간 OEE 성과 분석 결과 조회 API
// =================================================================
GET /api/mesa/performance/oee?resourceId=EQP-CNC-05&from=2026-05-22T00:00:00Z&to=2026-05-22T23:59:59Z

Response: 200 OK
{
    "resourceId": "EQP-CNC-05",
    "window": {
        "start": "2026-05-22T00:00:00Z",
        "end": "2026-05-22T23:59:59Z"
    },
    "kpi": {
        "availabilityPercent": 87.5,
        "performancePercent": 92.4,
        "qualityPercent": 99.1,
        "oeePercent": 80.12
    },
    "calculatedAt": "2026-05-22T20:40:00Z"
}"""
    }
    return apis.get(id, "")

def diagram(steps):
    gap = 180
    width = max(860, 105 + len(steps) * gap)
    nodes = []
    for i, step in enumerate(steps):
        x = 36 + i * gap
        role = "Input" if i == 0 else "Output" if i == len(steps) - 1 else "Process"
        nodes.append(f'<g class="node"><rect x="{x}" y="44" width="148" height="76"></rect><text x="{x + 74}" y="76" text-anchor="middle">{esc(step)}</text><text class="tiny" x="{x + 74}" y="100" text-anchor="middle">{role}</text></g>')
    arrows = []
    for i in range(len(steps) - 1):
        arrows.append(f'<path class="arrow" d="M{184 + i * gap} 82 H{216 + i * gap}"></path>')
    return f'<svg viewBox="0 0 {width} 164" aria-label="MES DFD"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2864a8"></path></marker></defs>{"".join(nodes)}{"".join(arrows)}</svg>'

def list_to_html(items):
    return f'<ul>{"".join(f"<li>{esc(item)}</li>" for item in items)}</ul>'

def shell(title, body, css_path="mesa-page.css"):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)}</title><link rel="stylesheet" href="{css_path}"></head><body><main class="page">{body}</main></body></html>'

def functionPage(f):
    return shell(f"MESA MES - {f['ko']}", f"""
    <div class="crumbs"><a href="../MESA_MES_Overview.html">MESA MES 기능</a> / {esc(f['ko'])}</div>
    <section class="hero"><h1>{esc(f['ko'])}</h1><p>{esc(f['title'])} 기반 MES 기능 정리</p><div class="chips"><span class="chip">MESA MES Function</span><span class="chip">ISA-95 Level 3</span></div></section>
    <section class="section"><h2>목적</h2><p>{esc(f['purpose'])}</p><div class="note">{esc(f['details'])}</div></section>
    <section class="section"><h2>기능 범위</h2><div class="grid"><div class="card"><strong>주요 범위</strong>{list_to_html(f['scope'])}</div><div class="card"><strong>입력 정보</strong>{list_to_html(f['inputs'])}</div><div class="card"><strong>출력 정보</strong>{list_to_html(f['outputs'])}</div></div></section>
    <section class="section"><h2>업무 DFD</h2><div class="diagram">{diagram(f['flow'])}</div></section>
    <section class="section"><h2>처리 로직 및 API 설계</h2>
      <h3>핵심 의사코드</h3>
      <div class="codebox"><pre>{esc(getMesaPseudocode(f['id']))}</pre></div>
      <h3>API 설계 예시</h3>
      <div class="codebox"><pre>{esc(getMesaApiExample(f['id']))}</pre></div>
    </section>
    <section class="section"><h2>권장 데이터 구성</h2><table><thead><tr><th>테이블</th><th>주요 컬럼</th></tr></thead><tbody>{"".join(f"<tr><td><strong>{esc(t)}</strong></td><td>{esc(c)}</td></tr>" for t, c in f['data'])}</tbody></table></section>
    <section class="section"><h2>구현/운영 체크포인트</h2><div class="grid"><div class="card"><strong>기준정보</strong><span>ERP, PLM, 설비 기준정보와 키 체계를 맞추고 변경 이력을 남깁니다.</span></div><div class="card"><strong>현장 실행</strong><span>작업자가 실제로 쓰는 화면, 스캔, 승인, 예외 처리 흐름을 우선 설계합니다.</span></div><div class="card"><strong>감사 추적</strong><span>누가, 언제, 어떤 기준으로 실행/변경/승인했는지 추적 가능해야 합니다.</span></div></div></section>
    """, "../mesa-page.css")

def overviewPage():
    links = "".join(f'<a href="functions/{f["id"]}.html"><strong>{esc(f["ko"])}</strong><span class="muted">{esc(f["title"])}</span></a>' for f in functions)
    return shell("MESA 기반 MES 기능", f"""
    <section class="hero"><h1>MESA 기반 MES 기능 가이드</h1><p>MESA-11로 알려진 전통적 MES 핵심 기능을 ISA-95 Level 3/MOM 관점과 함께 재정리했습니다. ERP 계획과 현장 제어 사이에서 MES가 담당해야 할 실행, 추적, 품질, 성과 기능을 세부 페이지로 나누었습니다.</p><div class="chips"><span class="chip">MESA Model</span><span class="chip">MES / MOM</span><span class="chip">ISA-95 Level 3</span></div></section>
    <section class="section"><h2>MES 전체 기능 흐름</h2><div class="diagram">{diagram(["ERP/Planning", "MES Scheduling", "Dispatch/Execution", "Quality/Process", "Tracking/Genealogy", "Performance/KPI"])}</div></section>
    <section class="section"><h2>세부 기능 문서</h2><div class="list">{links}</div></section>
    <section class="section"><h2>적용 관점</h2><div class="grid"><div class="card"><strong>계층</strong><span>MES는 ERP/SCM/PLM과 설비/SCADA/PLC 사이의 Level 3 운영 관리 계층입니다.</span></div><div class="card"><strong>핵심</strong><span>계획을 현장 실행 단위로 바꾸고, 실행 결과를 추적 가능한 데이터로 되돌립니다.</span></div><div class="card"><strong>범위 관리</strong><span>품질, 보전, 인력, 자재 기능은 독립 시스템과 겹칠 수 있으므로 책임 경계를 명확히 해야 합니다.</span></div></div></section>
    """)

for f in functions:
    with open(os.path.join(functions_dir, f"{f['id']}.html"), "w", encoding="utf8") as file:
        file.write(functionPage(f))

with open(os.path.join(mesa_dir, "MESA_MES_Overview.html"), "w", encoding="utf8") as file:
    file.write(overviewPage())

print(f"[성공] 총 {len(functions)}개의 MESA MES 세부 기능 및 오버뷰 페이지를 빌드 완료했습니다.")
