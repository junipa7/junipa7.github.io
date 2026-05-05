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
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font-family:Arial,"Malgun Gothic",sans-serif;line-height:1.65}.page{max-width:1180px;margin:0 auto;padding:28px}.hero{background:#101826;color:#fff;border-radius:14px;padding:30px;box-shadow:var(--shadow);border-bottom:5px solid #65b8a6}.hero h1{margin:0 0 10px;font-size:clamp(26px,4vw,42px);letter-spacing:0}.hero p{margin:0;color:#dbe3ef;max-width:980px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.chip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}.section{background:var(--panel);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);padding:22px;margin-top:18px}.section h2{margin:0 0 12px;font-size:21px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}.card strong{display:block;color:#1d3557;margin-bottom:4px}.card span,.muted{color:var(--muted);font-size:13px}.diagram{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}svg{display:block;min-width:880px;width:100%;height:auto}.node rect{fill:#fff;stroke:#ccd6e2;stroke-width:1.4;rx:8}.node text{font-size:13px;fill:#182233;font-weight:700}.tiny{font-size:11px!important;fill:#667085!important;font-weight:400!important}.arrow{stroke:#2864a8;stroke-width:1.7;fill:none;marker-end:url(#arrow)}table{width:100%;border-collapse:collapse;background:#fff;font-size:13px}th,td{border:1px solid var(--line);padding:10px;vertical-align:top}th{background:#eef3f8;color:#24364b;text-align:left}.note{border-left:4px solid var(--orange);background:#fff8ef;border-radius:8px;padding:13px;color:#4c3a25}.crumbs{margin:16px 0;color:var(--muted);font-size:13px}.crumbs a{color:#1f68b3;text-decoration:none}.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.list a{display:block;border:1px solid var(--line);border-radius:9px;background:#fff;padding:12px;color:var(--ink);text-decoration:none}.list a:hover{border-color:var(--accent);background:#f0fbfa}ul{margin:0;padding-left:20px}@media(max-width:820px){.page{padding:14px}.grid,.list{grid-template-columns:1fr}.hero{padding:22px}}
`;

fs.writeFileSync(path.join(mesaDir, "mesa-page.css"), css, "utf8");

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
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
