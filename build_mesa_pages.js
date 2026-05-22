const fs = require("fs");
const path = require("path");

const root = __dirname;
const mesaDir = path.join(root, "contents", "MES", "mesa");
const functionsDir = path.join(mesaDir, "functions");
fs.mkdirSync(functionsDir, { recursive: true });

const functions = [
  {
    id: "resource-allocation-status",
    title: "Resource Allocation and Status",
    ko: "자원 할당 및 상태 관리",
    purpose: "설비, 작업자, 금형/치공구, 자재, 작업장 같은 생산 자원의 현재 상태와 가용성을 관리하고 실행 가능한 자원을 작업에 연결합니다.",
    scope: ["설비/라인/작업장 가용 상태", "작업자 자격과 배치", "Tooling, Fixture, Carrier 상태", "자재와 WIP 위치", "ERP/APS 계획 대비 자원 준비 상태"],
    inputs: ["ERP 생산오더", "APS 또는 상세 스케줄", "설비 상태 이벤트", "작업자 근태/자격", "자재 입출고 정보"],
    outputs: ["작업 가능 자원 목록", "자원 상태 이력", "작업 배정 결과", "자원 부족 알림", "가용률/OEE 기초 데이터"],
    data: [
      ["resource_master", "resource_id, resource_type, name, area, line_id, capability, active_flag"],
      ["resource_status_history", "resource_id, status, reason_code, start_time, end_time, source_system"],
      ["resource_assignment", "assignment_id, work_order_id, operation_id, resource_id, planned_start, actual_start, status"],
      ["qualification_matrix", "person_id, skill_code, certified_flag, effective_from, expires_at"]
    ],
    flow: ["ERP/APS Plan", "MES Resource Check", "Resource Assignment", "Shopfloor Execution", "Status Feedback"],
    details: "MES는 계획을 단순히 내려보내는 시스템이 아니라, 지금 생산 가능한 조건인지 판단하는 실행 계층입니다. 자원 상태가 부정확하면 스케줄은 맞아도 실제 착수는 실패합니다."
  },
  {
    id: "operations-detail-scheduling",
    title: "Operations / Detail Scheduling",
    ko: "상세 생산 스케줄링",
    purpose: "상위 계획을 현장 실행 단위로 쪼개고, 공정 순서, 설비 능력, 셋업, 자재 준비, 우선순위를 반영해 상세 작업 순서를 만듭니다.",
    scope: ["라인/설비별 작업 순서", "Setup/Changeover 고려", "제약 기반 우선순위", "긴급오더 삽입", "Dispatch List 생성"],
    inputs: ["ERP/MRP 계획오더", "BOM/BOP/라우팅", "설비 캘린더", "자재 가용성", "납기와 우선순위"],
    outputs: ["작업 지시 후보", "라인별 상세 스케줄", "Dispatch Queue", "스케줄 변경 이력", "계획 대비 실행 차이"],
    data: [
      ["schedule_header", "schedule_id, area, horizon_start, horizon_end, version, status"],
      ["schedule_operation", "schedule_id, sequence_no, work_order_id, operation_id, resource_id, planned_start, planned_end"],
      ["schedule_constraint", "constraint_id, type, target_id, rule_value, priority"],
      ["dispatch_queue", "queue_id, resource_id, work_order_id, operation_id, priority, queue_state"]
    ],
    flow: ["ERP Plan", "Constraint Check", "Finite Schedule", "Dispatch Queue", "Execution Feedback"],
    details: "MESA 관점의 상세 스케줄은 현장의 실제 제약을 반영해야 합니다. MES는 APS가 만든 계획을 그대로 표시하는 것에서 끝나지 않고, 실행 직전의 상태로 재계산하거나 재정렬할 수 있어야 합니다."
  },
  {
    id: "dispatching-production-units",
    title: "Dispatching Production Units",
    ko: "작업 단위 디스패칭",
    purpose: "Lot, Batch, Serial, Carrier, Work Order 같은 생산 단위를 특정 설비나 작업자에게 내려보내고 착수, 보류, 재작업, 완료 흐름을 제어합니다.",
    scope: ["작업 착수/중지/완료", "Lot/Batch 우선순위", "Hold/Release", "Rework/Reroute", "작업자 작업 목록"],
    inputs: ["Dispatch Queue", "작업 지시", "작업 가능 자원", "품질 Hold 정보", "자재 준비 상태"],
    outputs: ["작업 시작 이벤트", "작업 완료 이벤트", "Hold/Release 이력", "실적 보고", "WIP 상태"],
    data: [
      ["work_dispatch", "dispatch_id, work_order_id, lot_id, operation_id, resource_id, priority, dispatch_state"],
      ["execution_event", "event_id, dispatch_id, event_type, event_time, actor_id, source_system"],
      ["hold_release", "hold_id, lot_id, reason_code, hold_time, release_time, approver_id"],
      ["rework_route", "rework_id, lot_id, from_operation, target_operation, reason_code, status"]
    ],
    flow: ["Dispatch Queue", "Operator/Tool Assignment", "Start", "Track Execution", "Complete/Hold/Rework"],
    details: "디스패칭은 MES의 현장 실행성이 가장 잘 드러나는 기능입니다. 계획과 실제 사이의 마지막 게이트이며, 품질/자재/설비/작업자 조건을 통과한 작업만 착수되어야 합니다."
  },
  {
    id: "document-control",
    title: "Document Control",
    ko: "문서 및 작업표준 관리",
    purpose: "작업 지시서, SOP, Recipe, 검사 기준서, 안전 지침, 도면의 최신 버전을 작업 시점에 맞게 제공하고 열람 이력을 남깁니다.",
    scope: ["SOP/작업표준 버전 관리", "작업별 문서 연결", "전자 서명/승인", "Recipe와 문서 동기화", "개정 이력 추적"],
    inputs: ["PLM/문서관리 시스템", "공정 라우팅", "제품/공정 변경 통보", "품질 기준", "EHS 문서"],
    outputs: ["작업 문서 표시", "문서 열람 이력", "개정 적용 이력", "전자 승인 기록", "작업 기준 위반 알림"],
    data: [
      ["document_master", "document_id, document_type, title, current_revision, owner_dept"],
      ["document_revision", "document_id, revision, effective_from, effective_to, approval_status, file_url"],
      ["operation_document", "operation_id, product_id, document_id, required_flag"],
      ["document_view_log", "document_id, revision, work_order_id, viewer_id, viewed_at"]
    ],
    flow: ["PLM/DMS", "MES Document Binding", "Operation Start", "Operator View", "Audit Log"],
    details: "문서 관리는 단순 게시판이 아닙니다. 작업이 시작되는 시점에 어떤 기준서가 유효했는지를 증명할 수 있어야 하며, 변경점이 Lot이나 Serial 이력과 연결되어야 합니다."
  },
  {
    id: "data-collection-acquisition",
    title: "Data Collection / Acquisition",
    ko: "데이터 수집",
    purpose: "설비, 작업자 입력, 검사 장비, Barcode/RFID, SCADA/PLC, EAP로부터 생산 실행 데이터를 수집해 Lot/공정/시간 문맥과 연결합니다.",
    scope: ["수동/자동 데이터 수집", "설비 이벤트/공정값", "작업 실적", "검사 결과", "데이터 품질 코드"],
    inputs: ["PLC/SCADA/EAP", "작업자 입력", "검사 장비", "Barcode/RFID", "ERP 기준정보"],
    outputs: ["원시 데이터", "정규화 데이터", "검사/공정 이력", "실적 집계", "데이터 품질 알림"],
    data: [
      ["collection_point", "point_id, source_type, source_name, parameter_code, unit, collection_rule"],
      ["raw_collection_event", "event_id, point_id, raw_value, raw_payload, collected_at, quality_code"],
      ["contextualized_data", "data_id, lot_id, operation_id, resource_id, parameter_code, value, event_time"],
      ["manual_entry_log", "entry_id, form_id, actor_id, value_json, entered_at, approval_status"]
    ],
    flow: ["Shopfloor Source", "Collector", "Validation", "Context Mapping", "MES History"],
    details: "수집 데이터는 값 자체보다 문맥이 중요합니다. 어떤 Lot, 어떤 공정, 어떤 설비 상태에서 나온 값인지 연결되어야 품질 분석과 KPI 계산에 사용할 수 있습니다."
  },
  {
    id: "labor-management",
    title: "Labor Management",
    ko: "작업자 및 노무 관리",
    purpose: "작업자 투입, 자격, 작업 시간, 교육 상태, 생산성, 간접 작업을 관리해 생산 실행과 인력 운용을 연결합니다.",
    scope: ["작업자 배치", "자격/교육 검증", "직접/간접 시간", "작업자별 실적", "교대조 관리"],
    inputs: ["HR/근태 시스템", "작업자 자격", "Dispatch 작업", "작업 시작/종료 이벤트", "교육 이력"],
    outputs: ["작업자 투입 이력", "자격 미충족 알림", "노무 실적", "작업자 생산성", "전자 서명 기록"],
    data: [
      ["operator_master", "person_id, name, team, shift_code, active_flag"],
      ["operator_assignment", "assignment_id, person_id, resource_id, operation_id, start_time, end_time"],
      ["labor_time", "person_id, work_order_id, activity_code, start_time, end_time, duration_min"],
      ["operator_certification", "person_id, certification_code, valid_from, valid_to, status"]
    ],
    flow: ["HR/Skill Master", "MES Qualification Check", "Operator Assignment", "Execution", "Labor Report"],
    details: "MES의 작업자 관리는 근태 계산만이 아니라 품질 리스크 관리입니다. 자격이 없는 작업자가 공정을 수행하지 않도록 실행 단계에서 차단해야 합니다."
  },
  {
    id: "quality-management",
    title: "Quality Management",
    ko: "품질 관리",
    purpose: "검사 계획, 공정 품질, 부적합, SPC, Sampling, Hold/Release를 관리하고 품질 의사결정을 생산 흐름에 즉시 반영합니다.",
    scope: ["검사 계획", "SPC/Trend", "부적합 처리", "Sampling", "품질 Hold/Release", "CAPA 연계"],
    inputs: ["검사 기준", "공정값", "검사 장비 결과", "Lot/Serial 이력", "고객 품질 요구사항"],
    outputs: ["검사 결과", "SPC 알림", "불량/부적합 이력", "Hold/Release", "품질 KPI"],
    data: [
      ["inspection_plan", "plan_id, product_id, operation_id, sample_rule, characteristic_set"],
      ["quality_result", "result_id, lot_id, operation_id, characteristic, value, spec_low, spec_high, result"],
      ["nonconformance", "nc_id, lot_id, defect_code, severity, disposition, created_at"],
      ["spc_signal", "signal_id, chart_id, rule_id, lot_id, detected_at, action_status"]
    ],
    flow: ["Inspection Plan", "Collect Result", "SPC/Spec Check", "Disposition", "Quality Feedback"],
    details: "품질 관리는 사후 보고보다 실행 제어가 중요합니다. 검사 결과와 SPC 신호가 즉시 Hold, 재검, Rework, Recipe 조정으로 이어져야 합니다."
  },
  {
    id: "process-management",
    title: "Process Management",
    ko: "공정 관리",
    purpose: "공정 조건, Recipe, 작업 순서, Parameter, 공정 상태를 관리하고 표준 조건에서 벗어난 실행을 감지합니다.",
    scope: ["Recipe/Parameter 관리", "공정 조건 검증", "공정 상태 추적", "Run 조건 비교", "공정 변경 이력"],
    inputs: ["BOP/라우팅", "Recipe", "공정 Parameter", "설비 상태", "품질 Feedback"],
    outputs: ["공정 실행 이력", "Recipe Download 이력", "Parameter 편차 알림", "공정 조건 승인", "Run Summary"],
    data: [
      ["process_route", "route_id, product_id, operation_sequence, revision, status"],
      ["recipe_master", "recipe_id, product_id, operation_id, revision, approval_status"],
      ["recipe_parameter", "recipe_id, parameter_name, target_value, lower_limit, upper_limit, unit"],
      ["process_run", "run_id, lot_id, operation_id, resource_id, recipe_id, start_time, end_time"]
    ],
    flow: ["Route/Recipe", "Pre-Check", "Recipe Download", "Process Run", "Run Review"],
    details: "공정 관리는 장비 제어와 품질의 중간에 있습니다. MES는 어떤 조건으로 생산했는지 증명하고, 승인되지 않은 조건 변경을 막아야 합니다."
  },
  {
    id: "maintenance-management",
    title: "Maintenance Management",
    ko: "설비 보전 관리",
    purpose: "설비 예방보전, 고장, 보전 작업, Spare Part, 보전 후 재가동 승인 상태를 생산 실행과 연결합니다.",
    scope: ["예방보전 일정", "고장/정지 이력", "보전 작업 지시", "Spare Part 사용", "보전 후 품질 확인"],
    inputs: ["설비 상태", "Run Hour/Shot Count", "보전 기준", "고장 알람", "Spare Part 재고"],
    outputs: ["PM 작업", "정비 이력", "MTBF/MTTR", "설비 Release", "보전 KPI"],
    data: [
      ["maintenance_plan", "plan_id, resource_id, trigger_type, threshold_value, task_template_id"],
      ["maintenance_work_order", "mw_id, resource_id, problem_code, priority, status, planned_time"],
      ["maintenance_activity", "activity_id, mw_id, technician_id, action_code, start_time, end_time"],
      ["spare_part_usage", "usage_id, mw_id, part_id, quantity, lot_no, used_at"]
    ],
    flow: ["Equipment Signal", "Maintenance Trigger", "Work Order", "Repair/PM", "Release to Production"],
    details: "MES의 보전 관리는 CMMS와 겹칠 수 있지만, 핵심은 생산 실행과 연결되는 지점입니다. 설비가 생산에 투입 가능한지, 보전 후 검증이 끝났는지가 MES에서 보여야 합니다."
  },
  {
    id: "product-tracking-genealogy",
    title: "Product Tracking and Genealogy",
    ko: "제품 추적 및 계보",
    purpose: "Lot, Batch, Serial, Wafer, Material의 이동과 투입 관계를 기록해 정방향/역방향 추적과 품질 이슈 분석을 가능하게 합니다.",
    scope: ["Lot/Serial Tracking", "Material Consumption", "Genealogy", "WIP 위치", "Traceability Report"],
    inputs: ["작업 실행 이벤트", "자재 투입", "설비/공정 이력", "검사 결과", "포장/출하 정보"],
    outputs: ["제품 이력", "자재 계보", "WIP 위치", "Recall 대상", "고객 추적성 보고"],
    data: [
      ["lot_history", "lot_id, operation_id, resource_id, event_type, event_time, actor_id"],
      ["material_consumption", "consumption_id, lot_id, material_lot_id, quantity, unit, consumed_at"],
      ["genealogy_link", "parent_id, child_id, link_type, operation_id, created_at"],
      ["wip_location", "lot_id, current_area, current_resource, current_operation, updated_at"]
    ],
    flow: ["Material Input", "Operation History", "Genealogy Link", "Inspection/Pack", "Trace Report"],
    details: "추적성은 문제가 생긴 뒤에만 쓰는 기능이 아닙니다. 실시간 WIP, 품질 분석, 고객 감사, Recall 범위 최소화까지 모두 계보 데이터 품질에 달려 있습니다."
  },
  {
    id: "performance-analysis",
    title: "Performance Analysis",
    ko: "성과 분석",
    purpose: "생산성, 품질, 납기, 설비 효율, 작업자 효율, 병목, 손실 시간을 분석해 운영 개선 지표를 제공합니다.",
    scope: ["OEE/가동률", "Throughput", "Cycle Time", "Yield", "Loss Pareto", "Plan vs Actual"],
    inputs: ["실적 이벤트", "설비 상태", "품질 결과", "계획 데이터", "작업자/자원 이력"],
    outputs: ["KPI Dashboard", "Loss 분석", "병목 분석", "추세/알림", "개선 과제"],
    data: [
      ["kpi_definition", "kpi_id, name, formula, grain, owner, target_value"],
      ["kpi_result", "kpi_id, area, resource_id, product_id, value, window_start, window_end"],
      ["loss_event", "loss_id, resource_id, loss_category, reason_code, duration_sec, event_time"],
      ["performance_snapshot", "snapshot_id, area, metric_json, captured_at"]
    ],
    flow: ["Execution Data", "KPI Engine", "Loss Classification", "Dashboard", "Improvement Action"],
    details: "성과 분석은 MES 데이터의 결과물입니다. 계산식보다 중요한 것은 상태/품질/계획/실적 데이터의 시간 기준과 분류 기준을 통일하는 것입니다."
  }
];

const css = `
:root{--ink:#17202a;--muted:#64748b;--line:#d7dde8;--panel:#fff;--paper:#f5f7fb;--accent:#137a7f;--blue:#2864a8;--orange:#b85c18;--shadow:0 18px 42px rgba(25,35,58,.10)}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font-family:Arial,"Malgun Gothic",sans-serif;line-height:1.65}.page{max-width:1180px;margin:0 auto;padding:28px}.hero{background:#101826;color:#fff;border-radius:14px;padding:30px;box-shadow:var(--shadow);border-bottom:5px solid #65b8a6}.hero h1{margin:0 0 10px;font-size:clamp(26px,4vw,42px);letter-spacing:0}.hero p{margin:0;color:#dbe3ef;max-width:980px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.chip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}.section{background:var(--panel);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);padding:22px;margin-top:18px}.section h2{margin:0 0 12px;font-size:21px}.section h3{margin:18px 0 8px;font-size:16px;color:#1d3557}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}.card strong{display:block;color:#1d3557;margin-bottom:4px}.card span,.muted{color:var(--muted);font-size:13px}.diagram{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}svg{display:block;min-width:880px;width:100%;height:auto}.node rect{fill:#fff;stroke:#ccd6e2;stroke-width:1.4;rx:8}.node text{font-size:13px;fill:#182233;font-weight:700}.tiny{font-size:11px!important;fill:#667085!important;font-weight:400!important}.arrow{stroke:#2864a8;stroke-width:1.7;fill:none;marker-end:url(#arrow)}table{width:100%;border-collapse:collapse;background:#fff;font-size:13px}th,td{border:1px solid var(--line);padding:10px;vertical-align:top}th{background:#eef3f8;color:#24364b;text-align:left}.note{border-left:4px solid var(--orange);background:#fff8ef;border-radius:8px;padding:13px;color:#4c3a25}.crumbs{margin:16px 0;color:var(--muted);font-size:13px}.crumbs a{color:#1f68b3;text-decoration:none}.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.list a{display:block;border:1px solid var(--line);border-radius:9px;background:#fff;padding:12px;color:var(--ink);text-decoration:none}.list a:hover{border-color:var(--accent);background:#f0fbfa}.codebox{background:#0f172a;color:#e2e8f0;border-radius:10px;padding:14px;overflow:auto;font-family:Consolas,monospace;font-size:13px;line-height:1.55}ul{margin:0;padding-left:20px}@media(max-width:820px){.page{padding:14px}.grid,.list{grid-template-columns:1fr}.hero{padding:22px}}
`;

fs.writeFileSync(path.join(mesaDir, "mesa-page.css"), css, "utf8");

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
}

function getMesaPseudocode(id) {
  const codes = {
    "resource-allocation-status": `// =================================================================
// 1. 자원 할당 및 상태 관리 (Resource Allocation and Status)
// 설비, 작업자, 치공구 등 자원의 가용 여부를 체크하고 작업을 배정하는 트랜잭션
// =================================================================
function allocateResource(workOrderId, operationId, resourceId) {
    // 1-1. 대상 자원의 상태 정보 조회
    const resource = loadResourceMaster(resourceId);
    
    // 1-2. 자원이 가동 가능(Available) 상태인지와 Hold 여부 검증
    if (resource.status !== "AVAILABLE" || resource.isHold) {
        throw new Error("자원이 현재 가용하지 않거나 보류 상태입니다.");
    }
    
    // 1-3. 대상 공정(Operation)을 수행하기 위한 자원의 역량(Capability) 검증
    const hasCapability = checkResourceCapability(resourceId, operationId);
    if (!hasCapability) {
        throw new Error("해당 자원은 공정 요구 스펙을 충족하지 못합니다.");
    }
    
    // 1-4. 작업 배정 정보 생성 및 데이터베이스 등록
    const assignment = {
        assignmentId: generateUniqueId("ASGN"),
        workOrderId: workOrderId,
        operationId: operationId,
        resourceId: resourceId,
        allocatedAt: new Date().toISOString(),
        status: "ALLOCATED"
    };
    saveResourceAssignment(assignment);
    
    // 1-5. 자원 마스터의 현재 상태를 'BUSY(선점)'로 즉시 변경 및 이력 생성
    updateResourceStatus(resourceId, "BUSY", "WORK_ORDER_ASSIGNED");
    
    // 1-6. 실시간 자원 상태 변경 이벤트 발행 (SCADA 및 관련 모듈 통보용)
    publishResourceEvent("RESOURCE_ALLOCATED", { resourceId, workOrderId });
}`,
    "operations-detail-scheduling": `// =================================================================
// 2. 상세 생산 스케줄링 (Operations / Detail Scheduling)
// 실시간 설비 제약 조건 및 셋업 시간을 고려하여 최적의 상세 실행 스케줄 생성
// =================================================================
function generateDetailSchedule(areaId, planOrders) {
    // 2-1. 지정된 구역의 실시간 자원 목록 및 현재 가용 용량(Capacity) 산출
    const activeResources = loadActiveResourcesInArea(areaId);
    
    // 2-2. 확정 대기 오더들을 우선순위(납기, 중요도) 기준으로 1차 정렬
    const sortedOrders = sortOrdersByPriority(planOrders);
    
    const scheduleQueue = [];
    
    // 2-3. 각 오더에 대해 작업 순서 및 셋업(Setup/Changeover) 제약 반영하여 최적 자원 배정
    for (const order of sortedOrders) {
        // 해당 품목 교체 시 발생하는 셋업 시간(Changeover Time) 계산
        const lastAssignedProduct = getLastAssignedProduct(order.resourceId);
        const setupTime = calculateSetupTime(lastAssignedProduct, order.productId);
        
        // 제약 기준(Finite Capacity) 하에 설비별 가장 빠른 작업 가능 시간대 탐색
        const bestResource = findOptimalResource(activeResources, order, setupTime);
        
        if (bestResource) {
            const plannedStart = calculateNextAvailableTime(bestResource) + setupTime;
            const plannedEnd = plannedStart + order.runTime;
            
            const scheduleItem = {
                scheduleId: generateUniqueId("SCHD"),
                workOrderId: order.workOrderId,
                resourceId: bestResource.resourceId,
                plannedStart: plannedStart,
                plannedEnd: plannedEnd,
                setupTime: setupTime
            };
            scheduleQueue.push(scheduleItem);
            
            // 임시 자원 캘린더에 예약 상태 업데이트하여 중복 배정 방지
            reserveResourceTime(bestResource.resourceId, plannedStart, plannedEnd);
        }
    }
    
    // 2-4. 최종 확정된 라인별 상세 스케줄 일괄 저장 및 Dispatch Queue에 배포
    saveDetailSchedule(scheduleQueue);
    publishScheduleEvent("SCHEDULE_UPDATED", { areaId, count: scheduleQueue.length });
}`,
    "dispatching-production-units": `// =================================================================
// 3. 작업 단위 디스패칭 (Dispatching Production Units)
// 실행 대기열(Dispatch Queue)에서 가장 최적의 작업을 작업자/설비에 물리적으로 착수 지시
// =================================================================
function dispatchNextJob(resourceId) {
    // 3-1. 해당 자원의 현시점 Dispatch 대기열 목록을 조회
    const queue = loadDispatchQueue(resourceId);
    
    // 3-2. 자재, 치공구, 작업자 자격이 모두 갖춰진 즉시 실행 가능한 오더 선별
    const readyJobs = queue.filter(job => {
        return checkMaterialAvailability(job.workOrderId) &&
               checkFixtureAvailability(job.operationId) &&
               checkOperatorQualification(job.operationId);
    });
    
    if (readyJobs.length === 0) {
        return null; // 실행 조건 만족 오더 없음
    }
    
    // 3-3. 우선순위 및 납기 임박도 점수가 가장 높은 오더 결정
    const targetJob = selectHighestPriorityJob(readyJobs);
    
    // 3-4. 대상 작업을 '착수(RUNNING)' 상태로 전환하며 작업 실적 추적 개시
    const dispatchId = generateUniqueId("DISP");
    updateDispatchState(targetJob.queueId, "DISPATCHED");
    
    const execution = {
        executionId: generateUniqueId("EXEC"),
        dispatchId: dispatchId,
        workOrderId: targetJob.workOrderId,
        lotId: targetJob.lotId,
        resourceId: resourceId,
        status: "STARTED",
        actualStart: new Date().toISOString()
    };
    createExecutionRecord(execution);
    
    // 3-5. EAP(설비 인터페이스) 또는 HMI 단말기에 Recipe 전송 및 작업 개정 승인 처리
    downloadRecipeToEquipment(resourceId, targetJob.recipeId);
    
    return execution;
}`,
    "document-control": `// =================================================================
// 4. 문서 및 작업표준 관리 (Document Control)
// 작업 착수 시 최신 승인 버전의 SOP 및 기준 도면을 매핑하여 현장에 배포하고 열람 보장
// =================================================================
function bindAndDisplayDocument(workOrderId, operationId, operatorId) {
    // 4-1. 대상 공정 및 품목에 필수 매핑된 최신 승인 문서 목록 조회
    const requiredDocs = loadRequiredDocumentMapping(operationId);
    
    const displayList = [];
    
    for (const doc of requiredDocs) {
        // DMS/PLM으로부터 현재 승인 및 유효(Effective) 상태인 Revision 확인
        const activeRevision = getActiveDocumentRevision(doc.documentId);
        
        if (!activeRevision) {
            throw new Error(\`필수 문서 [\${doc.documentId}]의 유효한 승인 버전이 없습니다.\`);
        }
        
        // 4-2. 감사 추적(Audit Trail) 및 규정 준수를 위해 작업자의 문서 열람 이력 기록
        const viewLog = {
            logId: generateUniqueId("VLOG"),
            documentId: doc.documentId,
            revision: activeRevision.revision,
            workOrderId: workOrderId,
            operatorId: operatorId,
            viewedAt: new Date().toISOString()
        };
        saveDocumentViewLog(viewLog);
        
        displayList.push({
            documentId: doc.documentId,
            title: doc.title,
            revision: activeRevision.revision,
            fileUrl: activeRevision.fileUrl
        });
    }
    
    // 4-3. 현장 HMI 화면 단말기에 최신 SOP 파일 뷰어 컴포넌트 호출 및 렌더링
    renderSopViewer(displayList);
}`,
    "data-collection-acquisition": `// =================================================================
// 5. 데이터 수집 (Data Collection / Acquisition)
// OPC-UA/PLC/SCADA 혹은 바코드 스캔으로부터 발생한 로우 데이터를 정제하고 문맥 바인딩
// =================================================================
function processCollectedData(rawEvent) {
    // 5-1. 데이터 무결성 검증 (필수 키 누락 및 데이터 포맷 무결 확인)
    if (!rawEvent.pointId || rawEvent.value === undefined) {
        logDataError("DATA_INTEGRITY_FAILED", rawEvent);
        return;
    }
    
    // 5-2. 설비 수집 포인트의 스케일링 필터 및 이상치 감지 필터 적용
    const spec = loadCollectionPointSpec(rawEvent.pointId);
    const isValidValue = validateRange(rawEvent.value, spec.minLimit, spec.maxLimit);
    
    const qualityCode = isValidValue ? "GOOD" : "BAD_LIMIT_EXCEEDED";
    
    // 5-3. 현재 해당 설비(Resource)에서 작업 중인 Lot/공정/작업자 문맥(Context) 자동 병합
    const activeContext = getActiveEquipmentContext(spec.equipmentId);
    
    const contextualizedData = {
        dataId: generateUniqueId("CDAT"),
        pointId: rawEvent.pointId,
        lotId: activeContext ? activeContext.lotId : "NO_LOT_CONTEXT",
        operationId: activeContext ? activeContext.operationId : "NO_OP_CONTEXT",
        equipmentId: spec.equipmentId,
        value: rawEvent.value,
        qualityCode: qualityCode,
        eventTime: rawEvent.timestamp, // 실제 설비 센서 계측 시각
        collectedAt: new Date().toISOString() // MES 수신 저장 시각
    };
    
    // 5-4. 실시간 가동 모니터링 테이블 및 품질 분석용 시계열 DB에 저장
    saveContextualizedData(contextualizedData);
    
    // 5-5. 데이터 품질이 비정상일 경우 즉시 알람 이벤트 발생
    if (qualityCode !== "GOOD") {
        publishAnomalyEvent("DATA_ANOMALY_DETECTED", contextualizedData);
    }
}`,
    "labor-management": `// =================================================================
// 6. 작업자 및 노무 관리 (Labor Management)
// 특정 공정에 작업자를 투입하기 전 자격을 엄격히 검증하고 작업 이력 및 노무 공수 기록
// =================================================================
function assignOperatorToWork(personId, resourceId, operationId, workOrderId) {
    // 6-1. 투입 대상 작업자의 상태가 활성(Active)인지 확인
    const operator = loadOperatorMaster(personId);
    if (!operator.activeFlag) {
        throw new Error("투입 불가: 비활성 처리된 작업자 계정입니다.");
    }
    
    // 6-2. 해당 공정을 독립 수행할 수 있는 필수 자격 요건(Qualification) 충족 여부 검토
    const qualification = getPersonnelQualification(personId, operationId);
    const currentDate = new Date().toISOString();
    
    if (!qualification || qualification.status !== "CERTIFIED" || qualification.expiresAt < currentDate) {
        throw new Error("투입 실패: 해당 공정 수행을 위한 유효한 기술 자격이 존재하지 않습니다.");
    }
    
    // 6-3. 작업자 투입 기록(Assignment) 생성 및 실제 근무 시작 상태 변경
    const assignmentId = generateUniqueId("LASGN");
    const laborAssignment = {
        assignmentId: assignmentId,
        personId: personId,
        resourceId: resourceId,
        operationId: operationId,
        workOrderId: workOrderId,
        startTime: currentDate,
        status: "ACTIVE"
    };
    saveLaborAssignment(laborAssignment);
    
    // 6-4. 기존 활성화된 간접 시간(교육, 대기 등) 로그 마감 처리 및 직접 공수(Direct Labor) 전환
    closeIndirectLaborTime(personId, currentDate);
    startDirectLaborTime(personId, workOrderId, assignmentId, currentDate);
}`,
    "quality-management": `// =================================================================
// 7. 품질 관리 (Quality Management)
// 측정값을 수집해 Spec 한계를 대조 판정하고 부적합 발생 시 즉시 Lot 보류(Hold) 연계
// =================================================================
function recordInspectionResult(lotId, operationId, characteristic, measuredValue) {
    // 7-1. 해당 공정 및 품목에 사전 승인된 검사 스펙(LSL, USL, Target) 로드
    const spec = loadInspectionSpec(operationId, characteristic);
    
    const specLow = spec.lowerLimit;
    const specHigh = spec.upperLimit;
    
    // 7-2. 측정값의 Spec 통과 여부 및 적격(PASS/NG) 1차 판정
    let result = "PASS";
    if (measuredValue < specLow || measuredValue > specHigh) {
        result = "NG";
    }
    
    // 7-3. 검사 결과 레코드 생성 및 저장
    const resultId = generateUniqueId("QRES");
    const qualityResult = {
        resultId: resultId,
        lotId: lotId,
        operationId: operationId,
        characteristic: characteristic,
        measuredValue: measuredValue,
        specLow: specLow,
        specHigh: specHigh,
        result: result,
        recordedAt: new Date().toISOString()
    };
    saveQualityResult(qualityResult);
    
    // 7-4. 부적합(NG) 발생 시 즉시 자동 홀드(Hold) 조치 및 부적합(Nonconformance) 처리 연계
    if (result === "NG") {
        const ncId = generateUniqueId("NC");
        const nonconformance = {
            ncId: ncId,
            lotId: lotId,
            defectCode: "DEF-MEASURE-OUT",
            severity: "CRITICAL",
            recordedValue: measuredValue,
            disposition: "HOLD_FOR_REVIEW",
            createdAt: new Date().toISOString()
        };
        saveNonconformance(nonconformance);
        
        // 실시간 물류 흐름에 지장을 주지 않도록 Lot 마스터 상태를 'HOLD'로 자동 강제 변경
        updateLotStatus(lotId, "HOLD", \`QRES_NG_AUTO_HOLD: \${resultId}\`);
        publishQualityEvent("LOT_HOLD_TRIGGERED", { lotId, ncId, reason: "NG_DETECTED" });
    }
    
    return qualityResult;
}`,
    "process-management": `// =================================================================
// 8. 공정 관리 (Process Management)
// 표준 레시피 파라미터를 설비에 다운로드하고 가동 전 적격 조건 확인
// =================================================================
function startProcessRun(lotId, operationId, resourceId) {
    // 8-1. 공정 라우팅 및 승인된 최신 Recipe Master 로드
    const routing = loadActiveRoute(lotId);
    if (routing.currentOperationId !== operationId) {
        throw new Error("공정 순서 불일치: 현재 진행할 정규 공정이 아닙니다.");
    }
    
    const recipe = loadActiveRecipe(routing.productId, operationId);
    if (recipe.status !== "APPROVED") {
        throw new Error("레시피 오류: 사용 가능한 승인 상태의 레시피가 존재하지 않습니다.");
    }
    
    // 8-2. 설비가 현재 '대기(READY/STANDBY)' 상태인지 최종 사전 체크
    const equipment = getEquipmentState(resourceId);
    if (equipment.status !== "STANDBY") {
        throw new Error("설비 차단: 설비가 생산 대기(STANDBY) 상태가 아닙니다.");
    }
    
    // 8-3. 레시피 파라미터 한계 범위 스펙을 설비에 안전 다운로드(EAP 연동)
    const parameters = loadRecipeParameters(recipe.recipeId);
    const downloadStatus = downloadToEap(resourceId, recipe.recipeId, parameters);
    
    if (!downloadStatus.success) {
        throw new Error(\`레시피 다운로드 실패: \${downloadStatus.errorMessage}\`);
    }
    
    // 8-4. 생산 가동(Process Run) 레코드 개시 등록
    const runId = generateUniqueId("RUN");
    const processRun = {
        runId: runId,
        lotId: lotId,
        operationId: operationId,
        resourceId: resourceId,
        recipeId: recipe.recipeId,
        startTime: new Date().toISOString(),
        status: "RUNNING"
    };
    saveProcessRun(processRun);
    
    // 8-5. 설비 가동 상태를 'PRODUCING'으로 변경 처리
    updateEquipmentState(resourceId, "PRODUCING");
    
    return runId;
}`,
    "maintenance-management": `// =================================================================
// 9. 설비 보전 관리 (Maintenance Management)
// 설비 상태가 고장(DOWN)나거나 PM 주기에 도달했을 때 보전 지시를 생성하고 생산 투입 제어
// =================================================================
function triggerMaintenanceWork(resourceId, triggerType, reasonCode) {
    // 9-1. 보전 대상 설비의 정보 로드
    const equipment = loadResourceMaster(resourceId);
    
    // 9-2. 중복 보전 오더 생성 방지를 위해 현재 실행 중인 보전 활동 유무 체크
    const activeWo = getActiveMaintenanceOrder(resourceId);
    if (activeWo) {
        return activeWo.mwId; // 이미 보전 진행 중인 경우 해당 오더 ID 반환
    }
    
    // 9-3. 설비 보전 오더(Maintenance Work Order) 신규 생성 및 데이터베이스 등록
    const mwId = generateUniqueId("MWO");
    const workOrder = {
        mwId: mwId,
        resourceId: resourceId,
        triggerType: triggerType, // 'EMERGENCY_BREAKDOWN' 또는 'PREVENTIVE_PM'
        reasonCode: reasonCode,
        priority: triggerType === "EMERGENCY_BREAKDOWN" ? "CRITICAL" : "MEDIUM",
        status: "CREATED",
        createdAt: new Date().toISOString()
    };
    saveMaintenanceWorkOrder(workOrder);
    
    // 9-4. 생산 차단을 위해 해당 설비의 운영 가용 상태를 'DOWN_MAINTENANCE'로 즉시 변경
    updateResourceStatus(resourceId, "DOWN", \`MAINTENANCE_LOCK_REASON: \${reasonCode}\`);
    
    // 9-5. 스케줄링 및 디스패칭 엔진에 설비 점유 불가 상태 이벤트를 동기 발행
    publishResourceEvent("EQUIPMENT_UNAVAILABLE", { resourceId, mwId, expectedDownDurationMin: 120 });
    
    return mwId;
}`,
    "product-tracking-genealogy": `// =================================================================
// 10. 제품 추적 및 계보 (Product Tracking and Genealogy)
// 자재 투입 이력 및 모자 Lot 간의 분할, 병합 관계를 계보(Genealogy) 구조로 정밀 연동
// =================================================================
function recordMaterialConsumption(parentLotId, childLotId, materialDefId, quantity, uom) {
    // 10-1. 투입되는 자재 Lot의 재고 보유량(WIP Inventory) 유효성 및 상태 검증
    const materialLot = loadMaterialLot(parentLotId);
    if (materialLot.status !== "RELEASED") {
        throw new Error("투입 불가: 자재가 아직 품질 검사에서 승인(RELEASED)되지 않았습니다.");
    }
    if (materialLot.quantity < quantity) {
        throw new Error(\`재고 부족: 요청량 [\${quantity}] 대비 현재고 [\${materialLot.quantity}]가 부족합니다.\`);
    }
    
    // 10-2. 자재 실 소모 이력(Material Consumption) 레코드 생성 및 저장
    const consumptionId = generateUniqueId("CONS");
    const consumption = {
        consumptionId: consumptionId,
        parentLotId: parentLotId,     // 소비된 원부자재 Lot
        childLotId: childLotId,       // 생산중인 결과물 Lot
        materialDefId: materialDefId,
        quantity: quantity,
        uom: uom,
        consumedAt: new Date().toISOString()
    };
    saveMaterialConsumption(consumption);
    
    // 10-3. 물리적 추적 체계 무결성을 위한 계보 링크(Genealogy Link) 등록
    const linkId = generateUniqueId("GLNK");
    const genealogyLink = {
        linkId: linkId,
        parentId: parentLotId,
        childId: childLotId,
        linkType: "LOT_CONSUMPTION",
        createdAt: new Date().toISOString()
    };
    saveGenealogyLink(genealogyLink);
    
    // 10-4. 자재 Lot의 실재고 수량을 소모량만큼 차감 업데이트
    const remainingQty = materialLot.quantity - quantity;
    updateMaterialLotQuantity(parentLotId, remainingQty);
    
    // 10-5. 실시간 자재 차감 이벤트 발행 (ERP 재고 관리 모듈 비동기 연동용)
    publishInventoryEvent("MATERIAL_CONSUMED_FOR_LOT", { parentLotId, childLotId, consumedQty: quantity });
}`,
    "performance-analysis": `// =================================================================
// 11. 성과 분석 (Performance Analysis)
// 가동/정지 및 생산 이벤트를 집계하여 SEMI E10/E79 기준 설비 종합 효율(OEE) 산출
// =================================================================
function calculateResourceOee(resourceId, startTime, endTime) {
    // 11-1. 특정 분석 기간 동안의 설비 가동 이력 로드
    const stateLogs = loadEquipmentStateHistory(resourceId, startTime, endTime);
    
    // 11-2. 시간 구분 계산 (총시간, 계획정지시간, 실가동시간, 손실시간)
    const timeSummary = sumDurationByStateCategory(stateLogs);
    
    const totalTime = timeSummary.totalTimeSec;
    const plannedDown = timeSummary.plannedDownSec;
    
    // 부하 시간 (Loading Time) = 총시간 - 계획 정지 시간
    const loadingTime = totalTime - plannedDown;
    if (loadingTime <= 0) return { oee: 0.0, availability: 0.0, performance: 0.0, quality: 0.0 };
    
    // 11-3. 3대 OEE 지표 계산
    
    // A. 가동율 (Availability) = 가동 시간 (Run Time) / 부하 시간 (Loading Time)
    const runTime = timeSummary.producingTimeSec;
    const availability = runTime / loadingTime;
    
    // B. 성능 효율 (Performance) = (총 생산량 * 표준 Cycle Time) / 가동 시간 (Run Time)
    const production = loadProductionSummary(resourceId, startTime, endTime);
    const standardCycleTime = loadStandardCycleTime(resourceId);
    const performance = runTime > 0 ? (production.totalQty * standardCycleTime) / runTime : 0.0;
    
    // C. 양품률 (Quality) = 양품 생산량 / 총 생산량
    const goodQty = production.goodQty;
    const totalQty = production.totalQty;
    const quality = totalQty > 0 ? goodQty / totalQty : 0.0;
    
    // 11-4. 최종 설비 종합 효율(OEE) 계산
    const oee = availability * performance * quality;
    
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
}`
  };
  return codes[id] || "";
}

function getMesaApiExample(id) {
  const apis = {
    "resource-allocation-status": `// =================================================================
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
}`,
    "operations-detail-scheduling": `// =================================================================
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
}`,
    "dispatching-production-units": `// =================================================================
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
}`,
    "document-control": `// =================================================================
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
}`,
    "data-collection-acquisition": `// =================================================================
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
}`,
    "labor-management": `// =================================================================
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
    "laborDirectStartTime": "2026-05-22T20:25:00Z"
}`,
    "quality-management": `// =================================================================
// MESA 실시간 품질 검사 측정치 전송 및 자동 적격 판정 API
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
    "autoHoldExecuted": true,
    "nonconformanceId": "NC-8293849182"
}`,
    "process-management": `// =================================================================
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
}`,
    "maintenance-management": `// =================================================================
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
}`,
    "product-tracking-genealogy": `// =================================================================
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
}`,
    "performance-analysis": `// =================================================================
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
}`
  };
  return apis[id] || "";
}

function diagram(steps) {
  const gap = 180;
  const width = Math.max(860, 105 + steps.length * gap);
  const nodes = steps.map((step, i) => {
    const x = 36 + i * gap;
    return `<g class="node"><rect x="${x}" y="44" width="148" height="76"></rect><text x="${x + 74}" y="76" text-anchor="middle">${esc(step)}</text><text class="tiny" x="${x + 74}" y="100" text-anchor="middle">${i === 0 ? "Input" : i === steps.length - 1 ? "Output" : "Process"}</text></g>`;
  }).join("");
  const arrows = steps.slice(1).map((_, i) => `<path class="arrow" d="M${184 + i * gap} 82 H${216 + i * gap}"></path>`).join("");
  return `<svg viewBox="0 0 ${width} 164" aria-label="MES DFD"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2864a8"></path></marker></defs>${nodes}${arrows}</svg>`;
}

function list(items) {
  return `<ul>${items.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function shell(title, body, cssPath = "mesa-page.css") {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><link rel="stylesheet" href="${cssPath}"></head><body><main class="page">${body}</main></body></html>`;
}

function functionPage(f) {
  return shell(`MESA MES - ${f.ko}`, `
    <div class="crumbs"><a href="../MESA_MES_Overview.html">MESA MES 기능</a> / ${esc(f.ko)}</div>
    <section class="hero"><h1>${esc(f.ko)}</h1><p>${esc(f.title)} 기반 MES 기능 정리</p><div class="chips"><span class="chip">MESA MES Function</span><span class="chip">ISA-95 Level 3</span></div></section>
    <section class="section"><h2>목적</h2><p>${esc(f.purpose)}</p><div class="note">${esc(f.details)}</div></section>
    <section class="section"><h2>기능 범위</h2><div class="grid"><div class="card"><strong>주요 범위</strong>${list(f.scope)}</div><div class="card"><strong>입력 정보</strong>${list(f.inputs)}</div><div class="card"><strong>출력 정보</strong>${list(f.outputs)}</div></div></section>
    <section class="section"><h2>업무 DFD</h2><div class="diagram">${diagram(f.flow)}</div></section>
    <section class="section"><h2>처리 로직 및 API 설계</h2>
      <h3>핵심 의사코드</h3>
      <div class="codebox">${esc(getMesaPseudocode(f.id))}</div>
      <h3>API 설계 예시</h3>
      <div class="codebox">${esc(getMesaApiExample(f.id))}</div>
    </section>
    <section class="section"><h2>권장 데이터 구성</h2><table><thead><tr><th>테이블</th><th>주요 컬럼</th></tr></thead><tbody>${f.data.map(([t, c]) => `<tr><td><strong>${esc(t)}</strong></td><td>${esc(c)}</td></tr>`).join("")}</tbody></table></section>
    <section class="section"><h2>구현/운영 체크포인트</h2><div class="grid"><div class="card"><strong>기준정보</strong><span>ERP, PLM, 설비 기준정보와 키 체계를 맞추고 변경 이력을 남깁니다.</span></div><div class="card"><strong>현장 실행</strong><span>작업자가 실제로 쓰는 화면, 스캔, 승인, 예외 처리 흐름을 우선 설계합니다.</span></div><div class="card"><strong>감사 추적</strong><span>누가, 언제, 어떤 기준으로 실행/변경/승인했는지 추적 가능해야 합니다.</span></div></div></section>
  `, "../mesa-page.css");
}

function overviewPage() {
  const links = functions.map(f => `<a href="functions/${f.id}.html"><strong>${esc(f.ko)}</strong><span class="muted">${esc(f.title)}</span></a>`).join("");
  return shell("MESA 기반 MES 기능", `
    <section class="hero"><h1>MESA 기반 MES 기능 가이드</h1><p>MESA-11로 알려진 전통적 MES 핵심 기능을 ISA-95 Level 3/MOM 관점과 함께 재정리했습니다. ERP 계획과 현장 제어 사이에서 MES가 담당해야 할 실행, 추적, 품질, 성과 기능을 세부 페이지로 나누었습니다.</p><div class="chips"><span class="chip">MESA Model</span><span class="chip">MES / MOM</span><span class="chip">ISA-95 Level 3</span></div></section>
    <section class="section"><h2>MES 전체 기능 흐름</h2><div class="diagram">${diagram(["ERP/Planning", "MES Scheduling", "Dispatch/Execution", "Quality/Process", "Tracking/Genealogy", "Performance/KPI"])}</div></section>
    <section class="section"><h2>세부 기능 문서</h2><div class="list">${links}</div></section>
    <section class="section"><h2>적용 관점</h2><div class="grid"><div class="card"><strong>계층</strong><span>MES는 ERP/SCM/PLM과 설비/SCADA/PLC 사이의 Level 3 운영 관리 계층입니다.</span></div><div class="card"><strong>핵심</strong><span>계획을 현장 실행 단위로 바꾸고, 실행 결과를 추적 가능한 데이터로 되돌립니다.</span></div><div class="card"><strong>범위 관리</strong><span>품질, 보전, 인력, 자재 기능은 독립 시스템과 겹칠 수 있으므로 책임 경계를 명확히 해야 합니다.</span></div></div></section>
  `);
}

for (const f of functions) {
  fs.writeFileSync(path.join(functionsDir, `${f.id}.html`), functionPage(f), "utf8");
}
fs.writeFileSync(path.join(mesaDir, "MESA_MES_Overview.html"), overviewPage(), "utf8");
console.log(`Generated ${functions.length} MESA MES function pages.`);
