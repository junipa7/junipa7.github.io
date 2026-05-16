const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "functions");

const notice = "이 문서는 MESA MES 기능 모델을 학생과 개발자가 이해하기 쉽도록 재구성한 교육용 해설입니다. 실제 프로젝트에서는 회사의 MOM/MES 표준, ISA-95 모델, 고객 요구사항, 현장 운영 절차를 함께 확인해야 합니다.";

const functions = [
  {
    file: "resource-allocation-status.html",
    titleKo: "자원 할당 및 상태 관리",
    titleEn: "Resource Allocation and Status",
    summary: "생산에 필요한 설비, 라인, 작업자, 금형, 치공구, 자재, 공간 같은 자원이 지금 사용 가능한지 판단하고 작업에 배정하는 MES의 출발점입니다.",
    classroom: "교실 수업으로 비유하면, 수업을 시작하기 전에 강의실, 교사, 교재, 실습 장비가 모두 준비되었는지 확인하고 학생에게 자리를 배정하는 과정입니다.",
    flow: ["ERP/APS 작업 계획", "자원 가용성 확인", "자격/능력 검증", "작업 자원 배정", "현장 상태 피드백"],
    scope: [
      ["설비/라인 상태", "Running, Idle, Down, PM, Setup 같은 상태를 실시간으로 관리합니다."],
      ["작업자 자격", "작업자가 해당 공정, 제품, 설비를 수행할 자격을 갖췄는지 확인합니다."],
      ["Tooling/Fixture", "금형, 마스크, 치공구, carrier 같은 보조 자원의 위치와 사용 가능 여부를 관리합니다."],
      ["자재/WIP", "작업 시작에 필요한 원자재, 반제품, lot의 위치와 수량을 확인합니다."]
    ],
    db: [
      ["resource_master", "resource_id, resource_type, name, area, line_id, capability, active_flag"],
      ["resource_status_history", "resource_id, status, reason_code, start_time, end_time, source_system"],
      ["resource_assignment", "assignment_id, work_order_id, operation_id, resource_id, planned_start, actual_start, status"],
      ["qualification_matrix", "person_id, skill_code, resource_type, certified_flag, effective_from, expires_at"]
    ],
    rules: [
      "작업 시작 전 자원 상태는 available이어야 하며, unavailable 또는 hold 상태의 자원은 자동 배정에서 제외합니다.",
      "작업자 자격은 제품, 공정, 설비, 유효기간을 함께 확인합니다.",
      "설비 상태가 변경되면 진행 중 assignment의 영향도를 계산하고 dispatch queue를 갱신합니다.",
      "자원 배정 변경은 누가, 언제, 어떤 사유로 변경했는지 감사 이력을 남깁니다."
    ],
    tests: ["사용 가능한 설비 자동 배정", "자격 만료 작업자 배정 차단", "설비 Down 발생 시 작업 재배정", "금형 위치 불일치 시 시작 차단"]
  },
  {
    file: "operations-detail-scheduling.html",
    titleKo: "상세 생산 스케줄링",
    titleEn: "Operations / Detail Scheduling",
    summary: "ERP나 APS가 만든 큰 계획을 현장에서 실행 가능한 작업 순서, 시간, 설비, 작업자 단위로 세분화하는 기능입니다.",
    classroom: "학교 시간표를 짜는 일과 비슷합니다. 같은 과목이라도 교실, 교사, 학생, 실습 장비가 겹치지 않도록 실제 시간표로 배치해야 합니다.",
    flow: ["수요/작업 오더", "공정 라우팅 확인", "제약 조건 계산", "상세 스케줄 생성", "Dispatch Queue 배포"],
    scope: [
      ["작업 순서", "라우팅, 우선순위, 납기, setup 최소화를 고려하여 순서를 결정합니다."],
      ["능력 제약", "설비 capacity, 작업자 shift, tooling availability를 반영합니다."],
      ["재스케줄", "긴급 오더, 설비 고장, 품질 hold가 생기면 영향을 받은 일정만 조정합니다."],
      ["현장 배포", "확정된 스케줄을 dispatching 기능으로 전달해 실행 queue를 만듭니다."]
    ],
    db: [
      ["operation_schedule", "schedule_id, work_order_id, operation_id, resource_id, planned_start, planned_end, priority, status"],
      ["schedule_constraint", "constraint_id, schedule_id, constraint_type, constraint_value, hard_flag"],
      ["schedule_change_log", "change_id, schedule_id, before_json, after_json, reason_code, changed_by, changed_at"]
    ],
    rules: [
      "스케줄은 계획일 뿐이며, dispatch 시점에는 자원 상태를 다시 확인해야 합니다.",
      "hard constraint는 위반하면 생성하지 않고, soft constraint는 점수화하여 최적안을 선택합니다.",
      "재스케줄링은 전체 계획을 매번 흔들기보다 영향 받은 시간 구간과 라인부터 조정합니다.",
      "작업자 화면에는 과도한 미래 계획보다 당장 실행할 수 있는 queue가 우선 표시되어야 합니다."
    ],
    tests: ["납기 우선 스케줄 생성", "설비 capacity 초과 방지", "긴급 오더 삽입", "설비 고장 후 영향 일정 재계산"]
  },
  {
    file: "dispatching-production-units.html",
    titleKo: "작업 단위 디스패칭",
    titleEn: "Dispatching Production Units",
    summary: "스케줄과 현장 상태를 바탕으로 지금 어떤 lot, batch, serial, 작업 오더를 어느 설비에서 시작해야 하는지 작업자와 장비에 지시하는 기능입니다.",
    classroom: "스케줄표가 수업 계획이라면, 디스패칭은 지금 종이 울렸을 때 어느 반이 어느 교실로 이동해야 하는지 안내 방송을 하는 역할입니다.",
    flow: ["확정 스케줄", "현장 상태 확인", "우선순위 계산", "작업 시작 지시", "실행 결과 반영"],
    scope: [
      ["Dispatch List", "작업자 또는 장비가 실행 가능한 작업 목록을 우선순위로 제공합니다."],
      ["Start 조건 검증", "자원, 자재, 문서, 품질 hold, recipe, 작업자 자격을 확인합니다."],
      ["작업 지시", "Start, pause, resume, complete 같은 실행 명령을 관리합니다."],
      ["예외 처리", "작업 불가, skip, rework, split, merge 같은 현장 예외를 처리합니다."]
    ],
    db: [
      ["dispatch_queue", "queue_id, work_order_id, lot_id, operation_id, resource_id, priority_score, queue_status"],
      ["dispatch_rule", "rule_id, product_id, operation_id, rule_type, weight, active_flag"],
      ["production_execution", "execution_id, queue_id, start_time, end_time, result, operator_id"]
    ],
    rules: [
      "dispatch 가능 여부는 시작 직전에 다시 검증합니다. 몇 분 전 스케줄이 지금도 유효하다고 가정하면 안 됩니다.",
      "우선순위 점수는 납기, setup, lot age, 품질 위험, 고객 우선순위를 함께 고려합니다.",
      "작업자가 수동으로 순서를 바꿀 수 있다면 사유 입력과 승인 권한을 둡니다.",
      "작업 시작 지시 후 장비 실제 상태 이벤트를 받아 execution과 맞춰야 합니다."
    ],
    tests: ["우선순위 queue 정렬", "Hold lot 시작 차단", "작업자 수동 변경 감사", "장비 시작 실패 시 queue 복구"]
  },
  {
    file: "document-control.html",
    titleKo: "문서 및 작업표준 관리",
    titleEn: "Document Control",
    summary: "작업자가 현장에서 사용하는 SOP, 작업지시서, 검사 기준서, recipe 변경 지침, 안전 문서가 올바른 버전인지 관리하는 기능입니다.",
    classroom: "시험을 볼 때 학생들이 서로 다른 버전의 문제지를 받으면 안 되는 것처럼, 생산 현장에서도 작업자는 현재 승인된 문서만 봐야 합니다.",
    flow: ["문서 작성/개정", "검토 및 승인", "유효 버전 배포", "작업 화면 표시", "열람/준수 이력"],
    scope: [
      ["문서 버전", "문서번호, revision, effective date, obsolete 상태를 관리합니다."],
      ["승인 워크플로", "작성, 검토, 승인, 배포, 폐기 과정을 추적합니다."],
      ["작업 연결", "제품, 공정, 설비, 고객 조건에 맞는 문서를 작업 화면에 연결합니다."],
      ["교육/숙련", "작업자가 새 문서를 열람하거나 교육받았는지 확인합니다."]
    ],
    db: [
      ["controlled_document", "document_id, doc_no, title, revision, status, effective_from, obsolete_at"],
      ["document_approval", "approval_id, document_id, step_name, approver_id, result, approved_at"],
      ["document_binding", "binding_id, document_id, product_id, operation_id, resource_id, required_flag"],
      ["document_acknowledgement", "ack_id, document_id, person_id, acknowledged_at, training_required"]
    ],
    rules: [
      "작업 시작 시점에는 effective 상태의 문서만 표시합니다.",
      "공정 변경이 승인되기 전에는 새 문서를 현장에 배포하지 않습니다.",
      "중요 문서 변경 후에는 작업자 열람 또는 교육 확인을 시작 조건에 포함할 수 있습니다.",
      "폐기된 문서는 검색은 가능하되 작업 화면에서는 선택할 수 없어야 합니다."
    ],
    tests: ["승인 전 문서 배포 차단", "유효일 이후 새 revision 표시", "작업자 미열람 시 시작 경고", "obsolete 문서 선택 차단"]
  },
  {
    file: "data-collection-acquisition.html",
    titleKo: "데이터 수집 및 취득",
    titleEn: "Data Collection / Acquisition",
    summary: "생산 실행 중 발생하는 설비 데이터, 작업자 입력, 검사 결과, 공정 조건, 자재 사용량을 수집하여 MES의 사실 기록으로 만드는 기능입니다.",
    classroom: "실험 수업에서 온도, 시간, 시약량, 관찰 결과를 기록해야 실험을 재현할 수 있듯이, MES도 생산의 증거 데이터를 빠짐없이 모아야 합니다.",
    flow: ["장비/작업자 입력", "데이터 검증", "표준 코드 변환", "이력 저장", "품질/KPI/추적 활용"],
    scope: [
      ["자동 수집", "PLC, SCADA, SECS/GEM, EDA, 센서 gateway에서 값을 받습니다."],
      ["수동 입력", "작업자 확인, 불량 코드, 자재 투입량, 특이사항을 입력합니다."],
      ["데이터 품질", "결측, 범위 초과, 중복, 시간 지연을 검증합니다."],
      ["이벤트 이력", "작업 시작, 완료, hold, scrap, rework 같은 핵심 이벤트를 기록합니다."]
    ],
    db: [
      ["production_event", "event_id, event_type, lot_id, operation_id, resource_id, event_time, source_system"],
      ["process_data_sample", "sample_id, resource_id, tag_id, value_text, unit, sample_time, quality_code"],
      ["manual_entry", "entry_id, form_id, lot_id, field_name, value_text, entered_by, entered_at"]
    ],
    rules: [
      "수집 데이터에는 발생 시각과 수신 시각을 모두 저장합니다.",
      "장비 tag와 MES 공정 항목의 mapping은 version으로 관리합니다.",
      "수동 입력값은 범위, 필수 여부, 코드 사전 검증을 수행합니다.",
      "KPI와 품질 판단에 쓰이는 데이터는 raw value와 보정 value를 분리합니다."
    ],
    tests: ["장비 자동 sample 저장", "수동 입력 필수값 검증", "중복 이벤트 제거", "품질 코드 Bad 데이터 제외"]
  },
  {
    file: "labor-management.html",
    titleKo: "작업자 및 인력 관리",
    titleEn: "Labor Management",
    summary: "생산 작업에 필요한 작업자의 근무 상태, 배치, 자격, 교육, 실적을 관리하여 현장 실행 가능성을 판단하는 기능입니다.",
    classroom: "실습실에 장비가 있어도 실습을 지도할 수 있는 선생님이 없으면 수업을 시작할 수 없습니다. 인력 관리는 이 조건을 MES에서 확인하는 기능입니다.",
    flow: ["근무/Shift 계획", "작업자 출근 확인", "자격 검증", "작업 배치", "작업 실적/교육 이력"],
    scope: [
      ["근무 상태", "출근, 휴식, 교육, 지원, 결근 같은 상태를 관리합니다."],
      ["Skill Matrix", "제품, 공정, 설비별 작업자 자격과 만료일을 관리합니다."],
      ["작업 배치", "라인/셀/작업 오더에 필요한 인력을 배정합니다."],
      ["실적 분석", "작업 시간, 생산량, 품질 이슈, 재교육 필요성을 분석합니다."]
    ],
    db: [
      ["person_master", "person_id, name, department, employment_type, active_flag"],
      ["labor_shift", "shift_id, person_id, shift_date, start_time, end_time, attendance_status"],
      ["skill_certification", "person_id, skill_code, level, certified_at, expires_at, trainer_id"],
      ["labor_assignment", "assignment_id, person_id, work_order_id, operation_id, role, start_time, end_time"]
    ],
    rules: [
      "작업 시작 전 해당 operation에 필요한 skill을 작업자가 보유해야 합니다.",
      "자격 만료, 교육 미이수, 휴식 상태 작업자는 배정에서 제외합니다.",
      "작업자 변경은 lot genealogy와 품질 이력에 남겨야 합니다.",
      "개인정보와 성과 데이터는 접근 권한을 분리합니다."
    ],
    tests: ["자격 보유 작업자 배정", "자격 만료자 시작 차단", "shift 외 작업 경고", "작업자 변경 이력 저장"]
  },
  {
    file: "quality-management.html",
    titleKo: "품질 관리",
    titleEn: "Quality Management",
    summary: "검사 계획, 공정 품질, SPC, 부적합, Hold/Release, rework, CAPA를 관리하여 품질 의사결정을 생산 흐름에 즉시 반영하는 기능입니다.",
    classroom: "숙제를 제출한 뒤 나중에만 채점하면 틀린 방식으로 계속 공부하게 됩니다. 품질 관리는 생산 중간에 바로 이상을 잡아 흐름을 제어합니다.",
    flow: ["검사 계획", "검사/측정 결과 수집", "Spec/SPC 판정", "Hold/Rework/Scrap 결정", "품질 피드백"],
    scope: [
      ["검사 계획", "제품, 공정, 고객 조건별 검사 항목과 sampling rule을 정의합니다."],
      ["Spec 판정", "측정값이 기준 범위 안에 있는지 판단합니다."],
      ["SPC", "관리도와 rule을 통해 trend, shift, out-of-control을 감지합니다."],
      ["부적합 처리", "Hold, release, rework, scrap, deviation, CAPA를 관리합니다."]
    ],
    db: [
      ["inspection_plan", "plan_id, product_id, operation_id, sample_rule, characteristic_set, effective_from"],
      ["quality_result", "result_id, lot_id, operation_id, characteristic, value, spec_low, spec_high, result"],
      ["nonconformance", "nc_id, lot_id, defect_code, severity, disposition, created_at, closed_at"],
      ["spc_signal", "signal_id, chart_id, rule_id, lot_id, detected_at, action_status"]
    ],
    rules: [
      "검사 결과가 spec out이면 lot 또는 serial을 자동 hold할 수 있어야 합니다.",
      "SPC signal은 단순 알람이 아니라 작업 중지, recipe 조정, 추가 검사 같은 action과 연결합니다.",
      "부적합 disposition은 권한 있는 품질 담당자만 확정합니다.",
      "검사 기준 변경은 적용 시작일과 revision을 관리해 과거 결과 해석을 보존합니다."
    ],
    tests: ["Spec out 자동 Hold", "SPC rule 위반 signal 생성", "품질 승인 전 release 차단", "검사 기준 revision별 판정"]
  },
  {
    file: "process-management.html",
    titleKo: "공정 관리",
    titleEn: "Process Management",
    summary: "제품이 어떤 라우팅, 공정 조건, recipe, 작업 방법을 따라 생산되어야 하는지 관리하고 실제 실행이 기준에서 벗어나지 않게 제어하는 기능입니다.",
    classroom: "요리 실습에서 레시피, 순서, 불 세기, 시간, 재료 투입 순서를 지키는 것과 같습니다. 공정 관리는 생산의 조리법과 실행 조건을 관리합니다.",
    flow: ["라우팅/Recipe 기준", "작업 시작 조건 확인", "공정 조건 적용", "실행 모니터링", "변경/편차 관리"],
    scope: [
      ["Routing", "제품이 거쳐야 할 operation 순서와 대체 경로를 관리합니다."],
      ["Recipe/Parameter", "설비 recipe, 공정 조건, 허용 범위를 관리합니다."],
      ["Process Enforcement", "잘못된 순서, 잘못된 recipe, 조건 누락을 차단합니다."],
      ["Deviation", "승인된 일탈, engineering run, 실험 조건을 관리합니다."]
    ],
    db: [
      ["process_route", "route_id, product_id, revision, status, effective_from"],
      ["route_operation", "route_id, operation_id, sequence_no, required_resource_type, next_rule"],
      ["process_parameter", "parameter_id, operation_id, recipe_id, name, target_value, min_value, max_value"],
      ["process_deviation", "deviation_id, lot_id, operation_id, reason, approved_by, expires_at"]
    ],
    rules: [
      "Lot은 routing 순서에 맞는 operation에서만 시작할 수 있습니다.",
      "Recipe와 parameter는 제품, operation, 설비 capability와 일치해야 합니다.",
      "공정 조건 변경은 승인과 version이 필요합니다.",
      "Deviation은 만료일과 적용 범위를 가져야 하며 무제한 예외가 되어서는 안 됩니다."
    ],
    tests: ["라우팅 순서 위반 차단", "잘못된 recipe 선택 차단", "parameter 범위 초과 경고", "승인된 deviation만 허용"]
  },
  {
    file: "maintenance-management.html",
    titleKo: "설비 보전 관리",
    titleEn: "Maintenance Management",
    summary: "설비의 예방보전, 고장보전, 점검, spare part, 보전 작업 이력을 관리하여 생산 중단을 줄이고 설비 신뢰성을 높이는 기능입니다.",
    classroom: "버스가 정비 없이 계속 운행하면 언젠가 고장으로 멈춥니다. 보전 관리는 멈추기 전에 점검하고, 멈췄을 때 빠르게 복구하는 체계입니다.",
    flow: ["설비 상태/카운터", "PM Due 계산", "보전 작업 오더", "수리/점검 실행", "가동 복귀 및 이력 분석"],
    scope: [
      ["Preventive Maintenance", "시간, shot count, run hour, cycle count 기준으로 PM을 계획합니다."],
      ["Corrective Maintenance", "고장 발생 후 수리 작업, 원인, 부품, 시간을 기록합니다."],
      ["Spare Part", "보전 부품의 재고, 사용, 교체 이력을 관리합니다."],
      ["Reliability KPI", "MTBF, MTTR, downtime, PM compliance를 분석합니다."]
    ],
    db: [
      ["maintenance_plan", "plan_id, resource_id, pm_type, interval_type, interval_value, next_due_at"],
      ["maintenance_work_order", "mwo_id, resource_id, work_type, priority, status, opened_at, closed_at"],
      ["maintenance_activity", "activity_id, mwo_id, action_code, technician_id, start_time, end_time, result"],
      ["spare_part_usage", "usage_id, mwo_id, part_id, quantity, lot_no, used_at"]
    ],
    rules: [
      "PM due가 지난 설비는 dispatch에서 제한하거나 승인 절차를 요구할 수 있습니다.",
      "고장 수리는 원인 코드, 조치 코드, 사용 부품, downtime 구간을 함께 기록합니다.",
      "보전 완료 후 생산 복귀 전 qualification 또는 test run을 요구할 수 있습니다.",
      "PM 주기는 실제 고장 이력과 사용량을 바탕으로 조정해야 합니다."
    ],
    tests: ["PM due 설비 시작 경고", "고장 작업 오더 생성", "부품 사용 재고 차감", "보전 완료 후 설비 상태 복귀"]
  },
  {
    file: "product-tracking-genealogy.html",
    titleKo: "제품 추적 및 계보",
    titleEn: "Product Tracking and Genealogy",
    summary: "Lot, batch, serial, wafer, 자재, 설비, 작업자, 공정 조건을 연결해 제품이 어떤 경로와 조건으로 만들어졌는지 추적하는 기능입니다.",
    classroom: "음식의 원산지 추적처럼, 제품도 어떤 재료로, 누가, 어떤 설비에서, 어떤 조건으로 만들었는지 나중에 거꾸로 따라갈 수 있어야 합니다.",
    flow: ["제품/자재 식별", "공정 이동 기록", "자원/조건 연결", "분할/병합/재작업 기록", "정방향/역방향 추적"],
    scope: [
      ["WIP Tracking", "현재 lot, batch, serial의 위치와 상태를 추적합니다."],
      ["Genealogy", "투입 자재와 산출 제품의 부모-자식 관계를 저장합니다."],
      ["Process History", "각 공정의 설비, 작업자, 시간, recipe, 품질 결과를 연결합니다."],
      ["Trace Query", "불량 제품에서 원인 lot을 찾거나 특정 자재가 들어간 제품을 찾습니다."]
    ],
    db: [
      ["material_lot", "material_id, material_type, product_id, lot_no, serial_no, status"],
      ["wip_history", "history_id, material_id, operation_id, resource_id, event_type, event_time"],
      ["genealogy_link", "link_id, parent_material_id, child_material_id, relation_type, quantity"],
      ["process_context", "context_id, material_id, operation_id, recipe_id, operator_id, resource_id, start_time, end_time"]
    ],
    rules: [
      "분할, 병합, 대체 투입은 genealogy link로 명확히 남깁니다.",
      "WIP 현재 상태는 이력에서 재생성 가능해야 합니다.",
      "추적 조회는 정방향과 역방향 모두 지원해야 합니다.",
      "scrap, rework, hold 상태도 정상 생산과 같은 수준으로 기록합니다."
    ],
    tests: ["Lot 이동 이력 저장", "자재 투입 genealogy 생성", "split/merge 관계 추적", "불량 serial 역추적"]
  },
  {
    file: "performance-analysis.html",
    titleKo: "성과 분석",
    titleEn: "Performance Analysis",
    summary: "MES에 쌓인 실행 데이터를 이용해 생산량, 수율, cycle time, OEE, downtime, schedule adherence 같은 KPI를 계산하고 개선 과제를 찾는 기능입니다.",
    classroom: "시험이 끝난 뒤 평균 점수만 보는 것이 아니라 어떤 단원에서 틀렸는지, 시간이 부족했는지, 반별 차이가 있는지 분석하는 과정입니다.",
    flow: ["실행 이력 수집", "KPI 정의 적용", "집계/계산", "원인 Drill-down", "개선 Action 추적"],
    scope: [
      ["Production KPI", "생산량, throughput, attainment, schedule adherence를 계산합니다."],
      ["Quality KPI", "수율, 불량률, rework, scrap, first pass yield를 분석합니다."],
      ["Equipment KPI", "OEE, availability, utilization, downtime Pareto를 제공합니다."],
      ["Cycle Time", "공정별 대기, 처리, 이동, hold 시간을 나누어 병목을 찾습니다."]
    ],
    db: [
      ["kpi_definition", "kpi_id, name, formula, grain, owner_team, active_flag"],
      ["kpi_result", "kpi_id, period_start, period_end, area, resource_id, product_id, value, numerator, denominator"],
      ["performance_loss", "loss_id, loss_type, resource_id, product_id, duration_sec, quantity_loss, reason_code"]
    ],
    rules: [
      "KPI는 정의, 계산 주기, 분자/분모, 제외 조건을 문서화해야 합니다.",
      "대시보드 값은 항상 drill-down 가능한 원천 이벤트와 연결합니다.",
      "일별 집계와 실시간 집계는 latency와 정확도 차이를 표시합니다.",
      "개선 action은 KPI 알람에서 끝나지 않고 담당자, due date, 완료 효과까지 추적합니다."
    ],
    tests: ["OEE 분자/분모 검증", "수율 집계 검증", "cycle time 구간 분해", "KPI drill-down 원천 이벤트 연결"]
  }
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function rows(items) {
  return items.map((cells) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("\n");
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("\n")}</ul>`;
}

function flowSvg(flow) {
  const width = 185 * flow.length + 80;
  const nodes = flow.map((label, index) => {
    const x = 36 + index * 185;
    const role = index === 0 ? "Input" : index === flow.length - 1 ? "Output" : "Process";
    const arrow = index < flow.length - 1 ? `<path class="arrow" d="M${x + 148} 82 H${x + 180}"></path>` : "";
    return `<g class="node"><rect x="${x}" y="44" width="148" height="76"></rect><text x="${x + 74}" y="75" text-anchor="middle">${esc(label)}</text><text class="tiny" x="${x + 74}" y="100" text-anchor="middle">${role}</text></g>${arrow}`;
  }).join("");
  return `<div class="diagram"><svg viewBox="0 0 ${width} 164" aria-label="MES DFD"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2864a8"></path></marker></defs>${nodes}</svg></div>`;
}

function render(page) {
  const flowRows = page.flow.map((step, i) => [
    `<strong>${i + 1}. ${esc(step)}</strong>`,
    i === 0 ? "계획, 현장 이벤트, 기준정보처럼 기능을 시작시키는 입력입니다." : i === page.flow.length - 1 ? "다른 MES 기능, ERP, 품질, KPI 화면으로 전달되는 결과입니다." : "MES가 검증, 판단, 저장, 상태 전이를 수행하는 핵심 처리 단계입니다.",
    i === 0 ? "입력 원천, 수신 시각, 기준정보 버전을 남깁니다." : "상태 변경 이력, 오류 사유, 담당자 또는 시스템 ID를 남깁니다."
  ]);
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>MESA MES - ${esc(page.titleKo)}</title>
  <link rel="stylesheet" href="../mesa-page.css">
  <style>
    .lesson-index{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    .lesson-index a{display:block;border:1px solid var(--line);border-radius:8px;padding:10px;text-decoration:none;color:var(--blue);background:#fff;font-weight:700;font-size:13px}
    .callout{border-left:5px solid var(--accent);background:#eefafa;padding:14px 16px;border-radius:8px;margin:14px 0}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .codebox{background:#0f172a;color:#e2e8f0;border-radius:10px;padding:14px;overflow:auto;font-family:Consolas,monospace;font-size:13px;line-height:1.55}
    .badge{display:inline-block;border:1px solid #cbd5e1;border-radius:999px;padding:2px 8px;margin:2px;background:#f8fafc;font-size:12px}
    .section h3{margin:20px 0 8px;font-size:16px;color:#1d3557}
    @media(max-width:900px){.lesson-index,.two-col{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main class="page">
    <div class="crumbs"><a href="../MESA_MES_Overview.html">MESA MES 기능</a> / ${esc(page.titleKo)}</div>

    <section class="hero">
      <h1>${esc(page.titleKo)}</h1>
      <p>${esc(page.titleEn)}. ${esc(page.summary)}</p>
      <div class="chips">
        <span class="chip">MESA MES Function</span>
        <span class="chip">ISA-95 Level 3</span>
        <span class="chip">교육용 상세 문서</span>
      </div>
    </section>

    <section class="section">
      <h2>학습 목표</h2>
      <div class="lesson-index">
        <a href="#concept">1. 기능의 목적</a>
        <a href="#scope">2. 기능 범위</a>
        <a href="#dfd">3. 업무 DFD</a>
        <a href="#model">4. 데이터 모델</a>
        <a href="#logic">5. 처리 로직</a>
        <a href="#ui">6. 화면/API</a>
        <a href="#test">7. 테스트</a>
        <a href="#ops">8. 운영 체크</a>
      </div>
      <div class="callout">${esc(notice)}</div>
      <p><strong>핵심 질문:</strong> 이 기능은 현장에서 어떤 의사결정을 자동화하거나 표준화하는가? 어떤 입력을 받아 어떤 상태와 이력을 만들며, 다른 MES 기능에 어떤 결과를 넘기는가?</p>
    </section>

    <section id="concept" class="section">
      <h2>1. 기능의 목적과 현장 배경</h2>
      <p>${esc(page.summary)}</p>
      <div class="two-col">
        <div class="card"><strong>학생에게 설명하는 비유</strong><span>${esc(page.classroom)}</span></div>
        <div class="card"><strong>개발자 관점</strong><span>이 기능은 단순 입력 화면이 아니라 기준정보, 현장 이벤트, 상태 전이, 권한, 감사 이력이 함께 움직이는 업무 서비스입니다. 따라서 DB, API, 화면을 한 덩어리로 설계해야 합니다.</span></div>
      </div>
      <p>MES는 ERP의 계획을 현장 실행으로 바꾸는 Level 3 시스템입니다. ${esc(page.titleKo)} 기능은 계획과 실제 사이의 차이를 줄이고, 작업자가 같은 기준으로 판단하도록 만드는 역할을 합니다.</p>
    </section>

    <section id="scope" class="section">
      <h2>2. 기능 범위</h2>
      <p>아래 범위는 프로젝트에서 요구사항을 나눌 때 사용할 수 있는 기본 단위입니다. 각 항목은 화면, API, 권한, 이력, 테스트 케이스로 이어져야 합니다.</p>
      <table>
        <thead><tr><th>세부 기능</th><th>설명</th><th>구현 산출물</th></tr></thead>
        <tbody>${rows(page.scope.map(([name, desc]) => [`<strong>${esc(name)}</strong>`, esc(desc), "화면/서비스/API/이력 테이블/권한 정책"]))}</tbody>
      </table>
    </section>

    <section id="dfd" class="section">
      <h2>3. 업무 DFD</h2>
      ${flowSvg(page.flow)}
      <p style="margin-top:14px">DFD는 프로그램 구조를 잡는 데 매우 유용합니다. 각 단계는 독립 서비스가 될 수도 있고, 하나의 transaction 안에서 처리되는 내부 단계가 될 수도 있습니다.</p>
      <table>
        <thead><tr><th>단계</th><th>업무 의미</th><th>저장/검증 포인트</th></tr></thead>
        <tbody>${rows(flowRows)}</tbody>
      </table>
    </section>

    <section id="model" class="section">
      <h2>4. 권장 데이터 모델</h2>
      <p>MES 데이터 모델은 현재 상태와 이력을 분리하는 것이 중요합니다. 현재 상태는 작업자 화면과 제어 판단에 쓰이고, 이력은 추적, 품질, KPI, 감사에 사용됩니다.</p>
      <table>
        <thead><tr><th>테이블</th><th>주요 컬럼</th><th>설계 이유</th></tr></thead>
        <tbody>${rows(page.db.map(([table, cols]) => [`<strong>${esc(table)}</strong>`, `<code>${esc(cols)}</code>`, "업무 상태, 기준정보, 실행 이력, 감사 추적을 분리해 관리하기 위한 기본 구조입니다."]))}</tbody>
      </table>
      <h3>공통 ERD 원칙</h3>
      ${list([
        "work_order_id, lot_id, operation_id, resource_id, person_id는 MES 기능을 연결하는 대표 키입니다.",
        "기준정보는 revision 또는 effective date를 가져야 과거 이력을 당시 기준으로 해석할 수 있습니다.",
        "작업자가 바꿀 수 있는 값은 변경 전/후와 변경 사유를 남깁니다.",
        "현장 이벤트는 나중에 재처리할 수 있도록 원본 payload나 source event id를 보존합니다."
      ])}
    </section>

    <section id="logic" class="section">
      <h2>5. 처리 로직과 업무 규칙</h2>
      <p>아래 규칙은 이 기능을 구현할 때 반드시 코드나 설정으로 표현되어야 합니다. 회의록에만 남아 있으면 운영 중 예외가 반복됩니다.</p>
      <table>
        <thead><tr><th>번호</th><th>업무 규칙</th><th>시스템 반영 방식</th></tr></thead>
        <tbody>${rows(page.rules.map((rule, i) => [`BR-${String(i + 1).padStart(2, "0")}`, esc(rule), "Domain Service 검증, Rule Engine, DB constraint, 또는 승인 workflow로 구현"]))}</tbody>
      </table>
      <h3>의사코드</h3>
      <div class="codebox">function executeMesaFunction(command):
  validateRequiredKeys(command)
  master = loadMasterData(command.productId, command.operationId)
  current = loadCurrentShopfloorState(command.lotId, command.resourceId)
  decision = evaluateBusinessRules(command, master, current)
  saveRawCommand(command)
  if decision.allowed:
      applyStateTransition(decision)
      appendHistory(decision)
      publishMesEvent(decision)
  else:
      createException(decision.reason)
      notifyResponsibleRole(decision.ownerRole)</div>
    </section>

    <section id="ui" class="section">
      <h2>6. 화면과 API 설계</h2>
      <p>현장 MES 화면은 설명서가 아니라 작업 도구여야 합니다. 작업자가 다음 행동을 바로 선택할 수 있게 현재 상태, 가능 작업, 차단 사유, 관련 문서를 함께 보여줘야 합니다.</p>
      <div class="grid">
        <div class="card"><strong>현장 작업 화면</strong><span>현재 lot/작업/자원 상태, 시작 가능 여부, 차단 사유, 다음 action 버튼을 제공합니다.</span></div>
        <div class="card"><strong>관리자 화면</strong><span>기준정보, 규칙, 우선순위, 예외 승인, 변경 이력을 관리합니다.</span></div>
        <div class="card"><strong>연동 API</strong><span>ERP, APS, 설비, 품질, KPI 시스템과 이벤트 기반으로 데이터를 주고받습니다.</span></div>
      </div>
      <h3>API 예시</h3>
      <div class="codebox">POST /api/mesa/${esc(page.file.replace(".html", ""))}/commands
GET  /api/mesa/${esc(page.file.replace(".html", ""))}/current-state?lotId={lotId}
GET  /api/mesa/${esc(page.file.replace(".html", ""))}/history?from={date}&to={date}</div>
    </section>

    <section id="test" class="section">
      <h2>7. 테스트 시나리오</h2>
      <p>MES 기능 테스트는 정상 등록 테스트만으로 부족합니다. 현장에서는 지연 이벤트, 잘못된 기준정보, 수동 변경, 권한 부족, 설비 장애가 자주 발생하므로 예외 시나리오가 더 중요합니다.</p>
      <table>
        <thead><tr><th>테스트 ID</th><th>시나리오</th><th>기대 결과</th></tr></thead>
        <tbody>${rows(page.tests.map((test, i) => [`TC-${String(i + 1).padStart(2, "0")}`, esc(test), "상태, 이력, 알림, 권한, 외부 연동 결과가 설계와 일치해야 합니다."]))}</tbody>
      </table>
      <h3>추가로 확인할 위험</h3>
      <div>
        <span class="badge">기준정보 revision 불일치</span>
        <span class="badge">수동 변경 감사 누락</span>
        <span class="badge">중복 이벤트 처리</span>
        <span class="badge">권한 없는 승인</span>
        <span class="badge">ERP/MES 상태 불일치</span>
      </div>
    </section>

    <section id="ops" class="section">
      <h2>8. 운영 체크리스트</h2>
      <p>운영 단계에서는 기능이 동작하는지보다, 문제가 생겼을 때 원인을 빠르게 찾을 수 있는지가 중요합니다. 아래 항목은 Go-Live 전에 반드시 확인하는 편이 좋습니다.</p>
      ${list([
        "현재 상태 화면에서 lot, operation, resource, person, hold 여부를 한 번에 확인할 수 있다.",
        "모든 주요 action은 실행자, 실행 시각, 변경 전/후 상태, 사유 코드를 남긴다.",
        "외부 시스템 연동 실패 시 재처리 queue와 운영 알림이 있다.",
        "기준정보 변경은 승인, 유효일, revision을 통해 통제된다.",
        "KPI 또는 추적 기능에서 이 기능의 실행 이력을 재사용할 수 있다."
      ])}
    </section>
  </main>
</body>
</html>
`;
}

fs.mkdirSync(outDir, { recursive: true });
for (const page of functions) {
  fs.writeFileSync(path.join(outDir, page.file), render(page), "utf8");
}

console.log(`Generated ${functions.length} MESA MES function pages in ${outDir}`);
