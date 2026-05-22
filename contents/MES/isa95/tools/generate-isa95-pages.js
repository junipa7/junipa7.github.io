const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const activitiesDir = path.join(root, "activities");
const modelsDir = path.join(root, "models");

const notice = "이 문서는 ANSI/ISA-95를 기반으로 MES/MOM 시스템 설계를 학습하기 위한 교육용 해설입니다. 공식 표준 조항을 대체하지 않으며, 실제 프로젝트에서는 최신 ISA-95 문서, 고객 URS, 사이트 표준, ERP/PLC/SCADA 연동 규격을 함께 검토해야 합니다.";

const css = `:root{--ink:#17202a;--muted:#64748b;--line:#d7dde8;--panel:#fff;--paper:#f5f7fb;--accent:#137a7f;--blue:#2864a8;--orange:#b85c18;--green:#517d2f;--shadow:0 18px 42px rgba(25,35,58,.10)}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font-family:Arial,"Malgun Gothic",sans-serif;line-height:1.65}.page{max-width:1180px;margin:0 auto;padding:28px}.hero{background:#101826;color:#fff;border-radius:14px;padding:30px;box-shadow:var(--shadow);border-bottom:5px solid #65b8a6}.hero h1{margin:0 0 10px;font-size:clamp(26px,4vw,42px);letter-spacing:0}.hero p{margin:0;color:#dbe3ef;max-width:980px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.chip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}.section{background:var(--panel);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);padding:22px;margin-top:18px}.section h2{margin:0 0 12px;font-size:21px}.section h3{margin:20px 0 8px;font-size:16px;color:#1d3557}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}.card strong{display:block;color:#1d3557;margin-bottom:4px}.card span,.muted{color:var(--muted);font-size:13px}.diagram{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}svg{display:block;min-width:880px;width:100%;height:auto}.node rect{fill:#fff;stroke:#ccd6e2;stroke-width:1.4;rx:8}.node text{font-size:13px;fill:#182233;font-weight:700}.tiny{font-size:11px!important;fill:#667085!important;font-weight:400!important}.arrow{stroke:#2864a8;stroke-width:1.7;fill:none;marker-end:url(#arrow)}table{width:100%;border-collapse:collapse;background:#fff;font-size:13px}th,td{border:1px solid var(--line);padding:10px;vertical-align:top}th{background:#eef3f8;color:#24364b;text-align:left}.note,.callout{border-left:4px solid var(--orange);background:#fff8ef;border-radius:8px;padding:13px;color:#4c3a25}.callout{border-left-color:var(--accent);background:#eefafa;color:#213f42}.crumbs{margin:16px 0;color:var(--muted);font-size:13px}.crumbs a{color:#1f68b3;text-decoration:none}.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.list a{display:block;border:1px solid var(--line);border-radius:9px;background:#fff;padding:12px;color:var(--ink);text-decoration:none}.list a:hover{border-color:var(--accent);background:#f0fbfa}.list a strong{display:block;color:var(--blue);margin-bottom:4px}.lesson-index{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.lesson-index a{display:block;border:1px solid var(--line);border-radius:8px;padding:10px;text-decoration:none;color:var(--blue);background:#fff;font-weight:700;font-size:13px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}.codebox{background:#0f172a;color:#e2e8f0;border-radius:10px;padding:14px;overflow:auto;font-family:Consolas,monospace;font-size:13px;line-height:1.55}.badge{display:inline-block;border:1px solid #cbd5e1;border-radius:999px;padding:2px 8px;margin:2px;background:#f8fafc;font-size:12px}ul{margin:0;padding-left:20px}@media(max-width:900px){.page{padding:14px}.grid,.list,.lesson-index,.two-col{grid-template-columns:1fr}.hero{padding:22px}}`;

const domains = [
  {
    key: "production",
    ko: "생산 운영 관리",
    en: "Production Operations Management",
    object: "work order, lot, batch, serial",
    mainResource: "설비, 작업자, 자재, recipe",
    goal: "고객 주문과 생산 계획을 실제 제품 생산 활동으로 변환하고, 현장에서 발생한 실적을 ERP와 품질/성과 시스템으로 되돌려 주는 영역입니다.",
    examples: ["작업 오더를 lot 단위로 분해", "설비와 recipe 검증 후 작업 시작", "생산 실적, scrap, rework 기록", "납기와 throughput 분석"],
    dbPrefix: "prod"
  },
  {
    key: "maintenance",
    ko: "보전 운영 관리",
    en: "Maintenance Operations Management",
    object: "maintenance work order, equipment, spare part",
    mainResource: "보전 기술자, 설비, spare part, PM 절차서",
    goal: "설비의 예방보전, 고장보전, 점검, 수리 작업을 계획하고 실행하여 생산 중단과 품질 위험을 줄이는 영역입니다.",
    examples: ["PM due 계산", "고장 작업 오더 생성", "수리 담당자와 부품 배정", "MTBF/MTTR 분석"],
    dbPrefix: "mnt"
  },
  {
    key: "quality",
    ko: "품질 운영 관리",
    en: "Quality Operations Management",
    object: "inspection lot, sample, test result, nonconformance",
    mainResource: "검사 장비, 품질 담당자, spec, sampling rule",
    goal: "검사, 시험, SPC, 부적합 처리, release 의사결정을 생산 실행과 연결하여 품질 기준을 현장에서 바로 적용하는 영역입니다.",
    examples: ["검사 계획 생성", "측정값 수집과 spec 판정", "SPC signal 감지", "Hold, release, CAPA 연결"],
    dbPrefix: "qlt"
  },
  {
    key: "inventory",
    ko: "재고 운영 관리",
    en: "Inventory Operations Management",
    object: "material lot, container, location, inventory movement",
    mainResource: "창고 위치, 운반 장비, 자재 lot, 보관 조건",
    goal: "원자재, 반제품, 완제품, 포장재, spare part의 위치와 수량, 상태, 이동을 관리하여 생산이 필요한 시점에 필요한 자재를 사용할 수 있게 하는 영역입니다.",
    examples: ["입고/출고/이동 처리", "재고 상태와 보관 조건 관리", "lot trace와 FEFO/FIFO 적용", "ERP 재고와 현장 재고 동기화"],
    dbPrefix: "inv"
  }
];

const activities = [
  {
    key: "definition-management",
    ko: "정의 관리",
    en: "Definition Management",
    intent: "작업을 실행하기 전에 필요한 기준정보와 업무 규칙을 정의하고 version으로 통제합니다.",
    flowVerb: "기준정보 승인",
    scope: ["작업 정의, 절차, 기준값, 허용 범위 관리", "제품/설비/자원별 적용 조건 관리", "개정, 승인, 유효일, 폐기 상태 관리", "현장 실행 기능에 기준정보 배포"],
    rules: ["기준정보는 revision과 effective date를 가져야 합니다.", "승인되지 않은 정의는 현장 실행에 사용할 수 없습니다.", "변경 영향 분석을 통해 진행 중 작업과 미래 작업의 적용 범위를 나눕니다.", "과거 실적은 당시 기준정보 version으로 해석할 수 있어야 합니다."],
    tests: ["승인 전 기준정보 사용 차단", "유효일 이후 새 revision 적용", "기준정보 변경 영향 lot 조회", "폐기된 기준정보 선택 차단"]
  },
  {
    key: "resource-management",
    ko: "자원 관리",
    en: "Resource Management",
    intent: "작업 수행에 필요한 인력, 설비, 물리 자산, 자재의 능력과 현재 가용성을 관리합니다.",
    flowVerb: "자원 상태 판단",
    scope: ["자원 master와 capability 관리", "현재 상태와 상태 이력 관리", "자격, 교정, PM, hold 여부 확인", "작업 요구사항과 자원 능력 매칭"],
    rules: ["자원은 available, unavailable, busy, hold 같은 상태를 명확히 가져야 합니다.", "Capability와 qualification은 작업 요구 조건과 함께 검증합니다.", "자원 상태 변경은 관련 schedule과 dispatch queue에 영향을 줍니다.", "수동 상태 변경은 사유와 승인자를 남깁니다."],
    tests: ["가용 자원 조회", "자격 부족 자원 배정 차단", "자원 Down 후 queue 재계산", "수동 상태 변경 감사"]
  },
  {
    key: "detailed-scheduling",
    ko: "상세 스케줄링",
    en: "Detailed Scheduling",
    intent: "상위 계획을 현장에서 실행 가능한 시간, 순서, 자원 단위 계획으로 세분화합니다.",
    flowVerb: "상세 일정 생성",
    scope: ["작업 우선순위와 납기 반영", "자원 capacity와 shift 반영", "setup, campaign, sequence 제약 고려", "스케줄 변경과 영향 분석"],
    rules: ["스케줄은 hard constraint와 soft constraint를 구분해야 합니다.", "스케줄 확정 후에도 dispatch 시점에는 현장 상태를 재검증합니다.", "긴급 작업 삽입 시 밀려나는 작업의 영향도를 계산합니다.", "스케줄 변경 이력은 이전 계획과 새 계획을 모두 보존합니다."],
    tests: ["capacity 초과 일정 방지", "긴급 작업 삽입", "자원 휴무 반영", "변경 이력 저장"]
  },
  {
    key: "dispatching",
    ko: "디스패칭",
    en: "Dispatching",
    intent: "현재 시점에 어떤 작업을 어느 자원에서 시작할지 현장에 지시합니다.",
    flowVerb: "작업 지시",
    scope: ["실행 가능한 작업 목록 생성", "작업 시작 조건 최종 검증", "우선순위 점수와 dispatch rule 적용", "작업자 또는 자동화 시스템에 지시 전달"],
    rules: ["Dispatch는 항상 현재 상태를 기준으로 판단해야 합니다.", "Hold, 자원 불가, 기준정보 미승인, 자재 부족은 시작 차단 사유가 됩니다.", "수동 우선순위 변경은 권한과 사유를 요구합니다.", "지시 후 실제 실행 이벤트와 매칭해야 합니다."],
    tests: ["실행 가능 queue 생성", "Hold 대상 시작 차단", "수동 순서 변경 감사", "실행 실패 후 queue 복구"]
  },
  {
    key: "execution-management",
    ko: "실행 관리",
    en: "Execution Management",
    intent: "작업 시작부터 완료까지 상태 전이를 관리하고, 예외 상황을 업무 규칙에 따라 처리합니다.",
    flowVerb: "실행 상태 전이",
    scope: ["Start, pause, resume, complete, abort 상태 관리", "작업 지시와 실제 수행 이벤트 매칭", "예외, deviation, rework, scrap 처리", "ERP/MES/설비 상태 동기화"],
    rules: ["상태 전이는 허용된 이전 상태에서만 가능해야 합니다.", "작업 완료는 필수 데이터와 품질/자원 검증 후 확정합니다.", "Abort와 cancel은 원인과 책임 경계가 다르므로 구분합니다.", "중복 이벤트는 idempotency key로 처리합니다."],
    tests: ["정상 시작/완료", "잘못된 상태 전이 차단", "중복 완료 이벤트 무시", "Abort 사유 저장"]
  },
  {
    key: "data-collection",
    ko: "데이터 수집",
    en: "Data Collection",
    intent: "실행 과정에서 발생한 설비, 사람, 자재, 품질, 시간 데이터를 수집하고 검증합니다.",
    flowVerb: "실적 데이터 저장",
    scope: ["자동/수동 데이터 수집", "필수값, 범위, 코드, 시간 검증", "발생 시각과 수신 시각 관리", "다른 activity가 사용할 원천 데이터 제공"],
    rules: ["발생 시각과 수신 시각을 모두 저장합니다.", "수집 항목 mapping은 기준정보 version과 연결합니다.", "품질이 나쁜 데이터는 삭제하지 않고 quality code를 붙입니다.", "수동 입력은 권한과 audit trail을 남깁니다."],
    tests: ["자동 이벤트 저장", "필수 수동 입력 검증", "중복 sample 제거", "Bad quality 데이터 표시"]
  },
  {
    key: "tracking",
    ko: "추적",
    en: "Tracking",
    intent: "작업 대상, 자원, 상태, 위치, genealogy를 시간순으로 추적합니다.",
    flowVerb: "상태와 위치 추적",
    scope: ["현재 위치와 상태 관리", "상태/위치 이력 기록", "분할, 병합, 대체, 재작업 관계 기록", "정방향/역방향 trace 조회"],
    rules: ["현재 상태는 이력에서 재구성 가능해야 합니다.", "분할과 병합은 부모-자식 관계로 명확히 남깁니다.", "추적 이력은 삭제보다 correction event를 남기는 방식이 안전합니다.", "시간대와 event ordering을 일관되게 관리합니다."],
    tests: ["현재 위치 조회", "분할/병합 genealogy 생성", "역방향 trace", "잘못된 이동 correction"]
  },
  {
    key: "performance-analysis",
    ko: "성과 분석",
    en: "Performance Analysis",
    intent: "실행 데이터를 KPI로 계산하고 손실 원인을 분석하여 개선 활동으로 연결합니다.",
    flowVerb: "KPI 계산",
    scope: ["KPI 정의와 공식 관리", "기간/제품/자원별 집계", "손실 코드와 Pareto 분석", "목표 대비 실적과 개선 action 추적"],
    rules: ["KPI는 분자, 분모, 제외 조건, 집계 단위를 명확히 가져야 합니다.", "대시보드 값은 원천 이벤트로 drill-down 가능해야 합니다.", "실시간 값과 마감 값의 차이를 표시합니다.", "개선 action의 담당자와 완료 효과를 추적합니다."],
    tests: ["KPI 공식 검증", "기간별 집계", "손실 Pareto", "원천 이벤트 drill-down"]
  }
];

const models = [
  {
    file: "functional-hierarchy-model.html",
    titleKo: "기능 계층 모델",
    titleEn: "Functional Hierarchy Model",
    summary: "ISA-95의 Level 0~4 계층을 통해 설비 제어, 현장 운영, 비즈니스 계획의 책임 경계를 나눕니다.",
    flow: ["Level 4 Business Planning", "Level 3 MOM/MES", "Level 2 Supervisory Control", "Level 1 Sensing/Manipulation", "Level 0 Physical Process"],
    objects: [["Level 4", "ERP/SCM/PLM", "주문, 원가, 장기 계획, 구매와 같은 비즈니스 활동입니다."], ["Level 3", "MOM/MES", "생산, 품질, 보전, 재고 운영을 현장 실행 단위로 관리합니다."], ["Level 2", "SCADA/HMI/Batch", "감시 제어, recipe 실행, 공정 값 수집을 담당합니다."], ["Level 1/0", "PLC/센서/구동기", "물리 공정과 직접 상호작용합니다."]],
    db: [["integration_boundary", "boundary_id, source_level, target_level, message_name, owner_system, sla_sec"], ["level3_event", "event_id, domain, event_type, object_id, event_time, source_system"]],
    rules: ["Level 4는 상세 제어 명령을 직접 PLC에 보내지 않고 Level 3/2를 통해 책임을 나눕니다.", "Level 3는 계획을 실행 가능한 작업 단위로 만들고 실적을 다시 Level 4로 전달합니다.", "계층 경계마다 소유 시스템, 데이터 책임, 동기화 주기를 명확히 정의합니다."],
    tests: ["ERP 작업 오더가 MES 작업으로 변환", "MES 완료 실적이 ERP로 반환", "Level 2 이벤트가 Level 3 이력으로 저장", "계층 경계 메시지 실패 재처리"]
  },
  {
    file: "equipment-hierarchy-model.html",
    titleKo: "설비 계층 모델",
    titleEn: "Equipment Hierarchy Model",
    summary: "Enterprise, Site, Area, Work Center, Work Unit 같은 계층으로 생산 자원의 위치와 책임 범위를 표현합니다.",
    flow: ["Enterprise", "Site", "Area", "Work Center", "Work Unit"],
    objects: [["Enterprise", "회사 또는 사업 단위", "여러 site를 포괄하는 최상위 조직입니다."], ["Site", "공장", "하나의 물리적 생산 사업장입니다."], ["Area", "생산 구역", "라인, 공정군, 창고 구역처럼 운영 단위를 나눕니다."], ["Work Center", "작업 센터", "스케줄과 capacity를 관리하는 단위입니다."], ["Work Unit", "작업 설비", "실제 작업이 수행되는 설비, 셀, 장치입니다."]],
    db: [["equipment_hierarchy", "node_id, parent_node_id, node_type, name, site_code, active_flag"], ["equipment_capability", "node_id, capability_type, product_family, capacity_value, unit"]],
    rules: ["계층 ID는 ERP, MES, SCADA에서 공통으로 매핑되어야 합니다.", "상위 계층 상태가 내려가면 하위 자원 가용성에도 영향을 줍니다.", "Capacity 집계는 Work Unit에서 시작해 Work Center, Area로 올라갑니다."],
    tests: ["계층 tree 조회", "Work Unit 상태 변경 후 Work Center capacity 재계산", "site별 자원 필터", "비활성 계층 사용 차단"]
  },
  {
    file: "personnel-model.html",
    titleKo: "인력 모델",
    titleEn: "Personnel Model",
    summary: "작업자, 역할, 자격, 숙련도, 교육 이력을 구조화하여 누가 어떤 작업을 수행할 수 있는지 판단합니다.",
    flow: ["Person", "Role", "Qualification", "Shift", "Assignment"],
    objects: [["Person", "작업자", "실제 작업 또는 승인을 수행하는 사람입니다."], ["Role", "역할", "Operator, Engineer, Quality Approver처럼 권한과 책임을 묶습니다."], ["Qualification", "자격", "제품, 공정, 설비별 수행 가능성을 나타냅니다."], ["Shift", "근무", "가용 시간과 근무 상태를 표현합니다."]],
    db: [["person", "person_id, name, department, active_flag"], ["personnel_qualification", "person_id, qualification_code, level, effective_from, expires_at"], ["personnel_assignment", "assignment_id, person_id, operation_id, resource_id, role, start_time, end_time"]],
    rules: ["작업 실행 전 필요한 qualification을 확인합니다.", "자격은 유효기간과 level을 함께 가져야 합니다.", "승인 권한과 작업 권한은 분리할 수 있어야 합니다."],
    tests: ["자격 보유자 작업 시작", "자격 만료자 차단", "승인 권한 검증", "근무시간 외 배정 경고"]
  },
  {
    file: "equipment-model.html",
    titleKo: "설비 모델",
    titleEn: "Equipment Model",
    summary: "생산 또는 운영 활동에 쓰이는 장비의 capability, 상태, 위치, 제약 조건을 표현합니다.",
    flow: ["Equipment Class", "Equipment", "Capability", "Status", "Assignment"],
    objects: [["Equipment Class", "설비 유형", "같은 기능을 가진 설비 그룹입니다."], ["Equipment", "개별 설비", "작업이 배정되는 실제 자원입니다."], ["Capability", "수행 능력", "제품, 공정, recipe, capacity 수행 가능성을 나타냅니다."], ["Status", "상태", "Available, Busy, Down, PM 등입니다."]],
    db: [["equipment", "equipment_id, equipment_class, hierarchy_node_id, name, active_flag"], ["equipment_status", "equipment_id, status, reason_code, updated_at"], ["equipment_capability", "equipment_id, operation_id, product_id, recipe_family, capacity"]],
    rules: ["설비 상태와 capability를 모두 만족해야 작업을 배정할 수 있습니다.", "PM, 교정, qualification 상태는 production availability와 분리해 관리합니다.", "설비 상태 변경은 schedule, dispatch, KPI에 이벤트를 발행합니다."],
    tests: ["capability matching", "Down 설비 배정 차단", "상태 이력 저장", "capacity 집계"]
  },
  {
    file: "physical-asset-model.html",
    titleKo: "물리 자산 모델",
    titleEn: "Physical Asset Model",
    summary: "설비와 별도로 실제 자산의 구매, 설치, 교정, 보전, 수명주기 정보를 관리합니다.",
    flow: ["Asset Class", "Asset", "Installation", "Calibration/PM", "Retirement"],
    objects: [["Physical Asset", "물리 자산", "설비, 계측기, 금형, 운반 장비 같은 추적 대상입니다."], ["Asset Class", "자산 유형", "동일한 관리 규칙을 공유하는 유형입니다."], ["Lifecycle", "수명주기", "구매, 설치, 운전, 이동, 폐기 단계를 표현합니다."], ["Maintenance Link", "보전 연결", "보전 활동과 자산 이력을 연결합니다."]],
    db: [["physical_asset", "asset_id, asset_class, serial_no, vendor, purchase_date, lifecycle_status"], ["asset_installation", "asset_id, equipment_id, location_id, installed_at, removed_at"], ["asset_calibration", "asset_id, calibration_due_at, result, certificate_no"]],
    rules: ["자산 ID와 운영 설비 ID는 다를 수 있으므로 매핑 이력을 유지합니다.", "교정 만료 자산은 품질 또는 생산 사용을 제한할 수 있습니다.", "자산 이동과 교체는 genealogy와 보전 이력에 영향을 줍니다."],
    tests: ["자산 설치 이력", "교정 만료 경고", "자산-설비 매핑 변경", "폐기 자산 사용 차단"]
  },
  {
    file: "material-model.html",
    titleKo: "자재 모델",
    titleEn: "Material Model",
    summary: "원자재, 반제품, 완제품, 소모품의 lot, sublot, serial, quantity, 상태, 위치를 표현합니다.",
    flow: ["Material Class", "Material Definition", "Material Lot", "Material Sublot", "Inventory/Consumption"],
    objects: [["Material Class", "자재 분류", "제품군 또는 자재 유형을 나타냅니다."], ["Material Definition", "자재 정의", "품목 코드, 단위, spec, 보관 조건입니다."], ["Material Lot", "자재 lot", "동일 조건으로 식별되는 재고 단위입니다."], ["Sublot/Serial", "세부 단위", "추적이 필요한 하위 단위입니다."]],
    db: [["material_definition", "material_def_id, item_code, revision, uom, status"], ["material_lot", "material_lot_id, material_def_id, lot_no, quantity, status, location_id"], ["material_movement", "movement_id, material_lot_id, from_location, to_location, quantity, event_time"]],
    rules: ["자재 사용은 lot 상태, 유효기간, 보관 조건, 품질 release 여부를 확인합니다.", "소비와 생산은 genealogy link로 연결합니다.", "단위 변환과 수량 정밀도 정책을 명확히 둡니다."],
    tests: ["자재 lot 입고", "Hold 자재 사용 차단", "소비 이력과 genealogy 생성", "수량 부족 차단"]
  },
  {
    file: "process-segment-model.html",
    titleKo: "공정 세그먼트 모델",
    titleEn: "Process Segment Model",
    summary: "제품을 만들기 위한 공정 단위를 정의하고 해당 공정에 필요한 자원, 조건, 능력을 연결합니다.",
    flow: ["Process Segment", "Resource Requirement", "Parameter", "Capability", "Operation Segment"],
    objects: [["Process Segment", "공정 단위", "작업이 수행되는 논리적 공정 단계입니다."], ["Resource Requirement", "자원 요구", "필요 설비, 인력, 자재, 자산 조건입니다."], ["Parameter", "공정 조건", "목표값, 허용 범위, recipe 조건입니다."], ["Capability", "수행 능력", "해당 segment를 수행할 수 있는 자원 능력입니다."]],
    db: [["process_segment", "segment_id, name, product_family, revision, status"], ["segment_resource_requirement", "segment_id, resource_type, capability_code, quantity, required_flag"], ["segment_parameter", "segment_id, parameter_name, target_value, low_limit, high_limit, unit"]],
    rules: ["Segment 요구 조건은 schedule과 dispatch에서 재사용되어야 합니다.", "공정 조건 변경은 revision과 approval을 거칩니다.", "Capability가 없는 자원에는 segment를 배정하지 않습니다."],
    tests: ["segment 요구 자원 조회", "parameter 범위 검증", "capability 없는 설비 배정 차단", "revision별 segment 적용"]
  },
  {
    file: "operations-definition-model.html",
    titleKo: "운영 정의 모델",
    titleEn: "Operations Definition Model",
    summary: "생산, 품질, 보전, 재고 활동을 실행하기 위한 작업 정의, 절차, 세그먼트, 자원 요구사항을 묶습니다.",
    flow: ["Operations Definition", "Operations Segment", "Material/Personnel/Equipment Requirement", "Work Master"],
    objects: [["Operations Definition", "운영 정의", "실행할 업무의 표준 정의입니다."], ["Operations Segment", "운영 세그먼트", "정의 안의 세부 활동 단위입니다."], ["Resource Requirement", "자원 요구", "인력, 설비, 자재, 자산 조건입니다."], ["Work Master", "작업 표준", "현장 실행의 기준이 되는 master입니다."]],
    db: [["operations_definition", "definition_id, domain, name, revision, status, effective_from"], ["operations_segment", "segment_id, definition_id, sequence_no, segment_name"], ["operations_requirement", "requirement_id, segment_id, resource_type, requirement_code, quantity"]],
    rules: ["정의는 domain과 revision으로 관리합니다.", "실행 작업은 승인된 definition에서 생성되어야 합니다.", "정의 변경 시 진행 중 작업에 적용할지 별도 정책이 필요합니다."],
    tests: ["정의 승인", "작업 생성 시 definition 연결", "revision 변경 영향 분석", "미승인 정의 사용 차단"]
  },
  {
    file: "operations-capability-model.html",
    titleKo: "운영 능력 모델",
    titleEn: "Operations Capability Model",
    summary: "특정 기간에 어떤 자원이 어떤 작업을 얼마나 수행할 수 있는지 표현하여 계획과 스케줄의 근거로 사용합니다.",
    flow: ["Capability Request", "Resource Capability", "Available Capacity", "Committed Capacity", "Capability Response"],
    objects: [["Capability", "수행 가능성", "자원이 특정 작업을 할 수 있는지 나타냅니다."], ["Capacity", "수행량", "기간별 가능 수량 또는 시간입니다."], ["Committed Capacity", "이미 배정된 능력", "확정 일정으로 사용된 capacity입니다."], ["Available Capacity", "남은 능력", "추가 작업 가능 범위입니다."]],
    db: [["operations_capability", "capability_id, domain, resource_id, segment_id, start_time, end_time, capacity_value"], ["capacity_commitment", "commitment_id, capability_id, work_request_id, committed_value, status"]],
    rules: ["Capability는 시간 구간과 자원 범위를 함께 가져야 합니다.", "Schedule은 available capacity를 초과하지 않아야 합니다.", "설비 Down, 작업자 결근, 자재 부족은 capability를 즉시 낮춥니다."],
    tests: ["기간별 capability 조회", "capacity 초과 배정 차단", "자원 상태 변경 후 capability 갱신", "committed capacity 계산"]
  },
  {
    file: "operations-schedule-model.html",
    titleKo: "운영 스케줄 모델",
    titleEn: "Operations Schedule Model",
    summary: "계획된 작업 요청을 언제, 어디서, 어떤 순서로 실행할지 표현합니다.",
    flow: ["Operations Request", "Operations Schedule", "Operations Segment Request", "Dispatchable Work", "Schedule Response"],
    objects: [["Operations Request", "작업 요청", "상위 계획에서 내려온 실행 요청입니다."], ["Operations Schedule", "운영 일정", "시간과 순서를 포함한 실행 계획입니다."], ["Segment Request", "세그먼트 요청", "작업을 세부 operation 단위로 나눈 항목입니다."], ["Schedule Response", "스케줄 응답", "가능/불가능, 예정 시간, 제약 사유를 반환합니다."]],
    db: [["operations_request", "request_id, domain, source_order_id, priority, due_date, status"], ["operations_schedule", "schedule_id, request_id, resource_id, planned_start, planned_end, status"], ["segment_request", "segment_request_id, schedule_id, segment_id, sequence_no, status"]],
    rules: ["스케줄은 요청, 자원, 세그먼트, 시간 구간을 연결해야 합니다.", "계획 변경은 이전 schedule을 보존하고 새 revision으로 관리합니다.", "Dispatch 전에는 최신 shopfloor 상태로 재검증합니다."],
    tests: ["요청에서 schedule 생성", "우선순위 반영", "스케줄 revision 생성", "dispatch 가능 항목 추출"]
  },
  {
    file: "operations-performance-model.html",
    titleKo: "운영 성과 모델",
    titleEn: "Operations Performance Model",
    summary: "실제 수행 결과, 사용 자원, 시간, 품질, 수량, 손실 정보를 계획과 비교할 수 있는 형태로 표현합니다.",
    flow: ["Execution Event", "Operations Performance", "Segment Response", "Resource Actual", "KPI/ERP Feedback"],
    objects: [["Operations Performance", "운영 성과", "작업 완료와 실적을 담는 결과 모델입니다."], ["Segment Response", "세그먼트 결과", "세부 operation별 실제 시작/종료, 수량, 상태입니다."], ["Resource Actual", "실제 사용 자원", "실제로 사용된 설비, 인력, 자재, 자산입니다."], ["Performance KPI", "성과 지표", "계획 대비 실적, 손실, 품질 결과입니다."]],
    db: [["operations_performance", "performance_id, request_id, domain, result_status, started_at, ended_at"], ["segment_response", "segment_response_id, performance_id, segment_id, actual_start, actual_end, good_qty, bad_qty"], ["resource_actual", "actual_id, segment_response_id, resource_type, resource_id, usage_qty, usage_time_sec"]],
    rules: ["성과는 계획 request와 연결되어야 계획 대비 차이를 계산할 수 있습니다.", "실제 사용 자원은 계획 자원과 다를 수 있으므로 별도로 저장합니다.", "부분 완료와 실패 상태를 표현할 수 있어야 합니다."],
    tests: ["완료 실적 생성", "계획 대비 지연 계산", "대체 자원 사용 기록", "부분 완료 실적 ERP 전송"]
  },
  {
    file: "integration-object-model.html",
    titleKo: "통합 객체 모델",
    titleEn: "Integration Object Model",
    summary: "ISA-95 객체 모델을 ERP, MES, SCADA, 데이터 플랫폼 사이의 메시지 계약으로 옮기는 방법을 설명합니다.",
    flow: ["Master Data", "Operations Request", "Operations Schedule", "Operations Performance", "Business Feedback"],
    objects: [["Master Data", "기준정보", "품목, 자원, 공정 정의입니다."], ["Request", "요청", "ERP 또는 계획 시스템이 MES에 주는 실행 요구입니다."], ["Response", "응답", "MES가 가능 여부, 일정, 실적을 반환합니다."], ["Event", "이벤트", "상태 변화와 실행 결과를 비동기로 전달합니다."]],
    db: [["integration_message", "message_id, message_type, source_system, target_system, object_key, status, created_at"], ["integration_mapping", "mapping_id, isa95_object, external_object, field_map_json, version"]],
    rules: ["통합 메시지는 객체 ID, source system, version, correlation id를 가져야 합니다.", "동기 API와 비동기 이벤트의 책임을 구분합니다.", "실패 메시지는 재처리 queue와 운영 알림을 가져야 합니다."],
    tests: ["ERP request 수신", "MES performance 송신", "매핑 version 변경", "실패 메시지 재처리"]
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
  return `<div class="diagram"><svg viewBox="0 0 ${width} 164" aria-label="ISA-95 DFD"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2864a8"></path></marker></defs>${nodes}</svg></div>`;
}

function pageShell({ title, subtitle, chips, crumbs, cssHref, body }) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <link rel="stylesheet" href="${cssHref}">
</head>
<body>
  <main class="page">
    ${crumbs}
    <section class="hero">
      <h1>${esc(title)}</h1>
      <p>${esc(subtitle)}</p>
      <div class="chips">${chips.map((chip) => `<span class="chip">${esc(chip)}</span>`).join("")}</div>
    </section>
    ${body}
  </main>
</body>
</html>
`;
}

function activityFilename(domain, activity) {
  return `${domain.key}-${activity.key}.html`;
}

function renderActivity(domain, activity) {
  const title = `${domain.ko} - ${activity.ko}`;
  const flow = [`${domain.ko} 요청`, "기준정보/자원 확인", activity.flowVerb, "상태와 이력 저장", "성과/통합 피드백"];
  const db = [
    [`${domain.dbPrefix}_${activity.key.replaceAll("-", "_")}_rule`, "rule_id, revision, domain, rule_type, condition_json, action_json, active_flag"],
    [`${domain.dbPrefix}_${activity.key.replaceAll("-", "_")}_state`, "object_id, object_type, current_state, reason_code, updated_at, owner_system"],
    [`${domain.dbPrefix}_${activity.key.replaceAll("-", "_")}_history`, "history_id, object_id, event_type, before_state, after_state, event_time, payload_json"],
    [`${domain.dbPrefix}_${activity.key.replaceAll("-", "_")}_exception`, "exception_id, object_id, severity, reason_code, disposition, created_at, closed_at"]
  ];
  const scopeRows = activity.scope.map((scope, index) => [
    `<strong>${index + 1}. ${esc(scope)}</strong>`,
    index === 0 ? `${domain.object}의 실행 조건을 표준화합니다.` : `${domain.mainResource}와 연결하여 현장 판단을 자동화합니다.`,
    "화면, API, 상태 테이블, 이력 테이블, 권한 정책으로 구현합니다."
  ]);
  const flowRows = flow.map((step, i) => [
    `<strong>${i + 1}. ${esc(step)}</strong>`,
    i === 0 ? "상위 계획, 현장 요청, 외부 시스템 이벤트가 들어오는 단계입니다." : i === flow.length - 1 ? "ERP, APS, KPI, 데이터 플랫폼 또는 다른 MOM activity로 결과를 넘깁니다." : "ISA-95 Level 3에서 검증, 판단, 실행 상태 전이를 수행합니다.",
    i === 0 ? "source system, correlation id, 수신 시각을 저장합니다." : "상태, 이력, 오류 사유, 기준정보 revision을 남깁니다."
  ]);
  const body = `
    <section class="section">
      <h2>학습 목표</h2>
      <div class="lesson-index">
        <a href="#concept">1. 활동 목적</a>
        <a href="#scope">2. 기능 범위</a>
        <a href="#dfd">3. Activity DFD</a>
        <a href="#model">4. 데이터 모델</a>
        <a href="#logic">5. 업무 규칙</a>
        <a href="#ui">6. 화면/API</a>
        <a href="#test">7. 테스트</a>
        <a href="#ops">8. 운영 체크</a>
      </div>
      <div class="callout">${esc(notice)}</div>
      <p><strong>핵심 질문:</strong> ${esc(activity.ko)} 활동은 ${esc(domain.ko)}에서 어떤 결정을 표준화하고, 어떤 객체의 상태를 바꾸며, 어떤 실적을 남기는가?</p>
    </section>

    <section id="concept" class="section">
      <h2>1. 활동 목적과 ISA-95 위치</h2>
      <p>${esc(activity.intent)} ${esc(domain.goal)}</p>
      <div class="two-col">
        <div class="card"><strong>ISA-95 관점</strong><span>${esc(domain.en)}의 activity 중 하나로, Level 4의 계획과 Level 2/1의 실제 제어 사이에서 실행 가능한 업무 판단을 담당합니다.</span></div>
        <div class="card"><strong>학생에게 설명하는 비유</strong><span>계획표가 있어도 지금 실행할 수 있는지, 필요한 조건이 맞는지, 실행 결과를 어떻게 기록할지 정하지 않으면 현장은 움직이지 않습니다. 이 activity는 그 판단 규칙을 담당합니다.</span></div>
      </div>
      <h3>현장 예시</h3>
      ${list(domain.examples)}
    </section>

    <section id="scope" class="section">
      <h2>2. 기능 범위</h2>
      <p>${esc(title)}는 아래 범위를 하나의 업무 서비스로 묶어 생각하면 이해가 쉽습니다. 각 범위는 요구사항, 화면, API, 테스트 케이스로 이어집니다.</p>
      <table>
        <thead><tr><th>범위</th><th>업무 의미</th><th>구현 산출물</th></tr></thead>
        <tbody>${rows(scopeRows)}</tbody>
      </table>
    </section>

    <section id="dfd" class="section">
      <h2>3. Activity DFD</h2>
      ${flowSvg(flow)}
      <p style="margin-top:14px">이 DFD는 ISA-95 activity를 코드로 옮길 때의 기본 흐름입니다. 핵심은 입력을 바로 실행하지 않고 기준정보, 자원 상태, 권한, 품질 조건을 거쳐 상태와 이력을 남기는 것입니다.</p>
      <table>
        <thead><tr><th>단계</th><th>처리 의미</th><th>저장/검증 포인트</th></tr></thead>
        <tbody>${rows(flowRows)}</tbody>
      </table>
    </section>

    <section id="model" class="section">
      <h2>4. 권장 데이터 모델</h2>
      <p>ISA-95 activity는 object request, schedule, performance와 연결되어야 합니다. 현재 상태와 이력을 분리하고, 기준정보 revision을 반드시 보존합니다.</p>
      <table>
        <thead><tr><th>테이블</th><th>주요 컬럼</th><th>설계 이유</th></tr></thead>
        <tbody>${rows(db.map(([table, cols]) => [`<strong>${esc(table)}</strong>`, `<code>${esc(cols)}</code>`, "규칙, 현재 상태, 실행 이력, 예외 처리를 분리하여 재처리와 감사 추적을 가능하게 합니다."]))}</tbody>
      </table>
      <h3>ISA-95 객체 연결</h3>
      <div class="grid">
        <div class="card"><strong>Operations Request</strong><span>상위 계획 또는 현장 요청으로부터 생성되는 실행 요구입니다.</span></div>
        <div class="card"><strong>Operations Schedule</strong><span>언제 어떤 자원으로 실행할지 계획한 결과입니다.</span></div>
        <div class="card"><strong>Operations Performance</strong><span>실제로 수행된 시간, 수량, 자원, 품질 결과입니다.</span></div>
      </div>
    </section>

    <section id="logic" class="section">
      <h2>5. 처리 로직과 업무 규칙</h2>
      <table>
        <thead><tr><th>규칙 ID</th><th>업무 규칙</th><th>시스템 반영 방식</th></tr></thead>
        <tbody>${rows(activity.rules.map((rule, i) => [`BR-${String(i + 1).padStart(2, "0")}`, esc(rule), "Domain Service, Rule Engine, DB constraint, Workflow, Integration Contract로 구현"]))}</tbody>
      </table>
      <h3>의사코드</h3>
      <div class="codebox">// =================================================================
// ANSI/ISA-95 Level 3 MOM Activity 핵심 트랜잭션 처리 로직
// =================================================================
function handleIsa95Activity(command) {
    // 1. 중복 요청 방지 및 감사 추적을 위한 고유 요청 ID(Correlation ID) 검증
    validateCorrelationId(command);

    // 2. 실행 기준이 되는 표준 정의 및 규칙(Operations Definition) 버전 정보 로드
    const definition = loadOperationsDefinition(command.definitionId, command.revision);

    // 3. 대상 공정 영역 및 가용 시간 범위 내의 자원 수행 능력(Capability) 상태 로드
    const capability = loadOperationsCapability(command.resourceScope, command.timeWindow);

    // 4. 추적 대상 물리 객체(Lot, Batch, Equipment 등)의 현재 상태 정보 획득
    const current = loadCurrentState(command.objectId);

    // 5. 비즈니스 규칙(BR) 및 적합성 조건 엔진을 통해 실행 적격 여부 최종 평가
    const decision = evaluateRules(command, definition, capability, current);

    // 6. 트랜잭션 추적 및 사후 감사를 위한 원시 커맨드 로그 영구 저장
    saveRawCommand(command);

    // 7. 평가 결과에 따른 상태 전이 및 이벤트 발행 처리
    if (decision.allowed) {
        // [정상 흐름]: 적격성 검증 통과 시 상태 전이 및 이력 기록
        updateCurrentState(decision);
        appendActivityHistory(decision);
        
        // 타 계층(Level 4 ERP 또는 Level 2 SCADA) 및 타 도메인에 비동기 실적 이벤트 발행
        publishOperationsEvent(decision);
    } else {
        // [예외 흐름]: 규칙 위반 시 예외 개체 생성 및 담당 교대조/관리자 알림
        createException(decision.reasonCode);
        notifyOwner(decision.ownerRole);
    }
}</div>
    </section>

    <section id="ui" class="section">
      <h2>6. 화면과 API 설계</h2>
      <p>현장 화면은 ISA-95 용어를 그대로 나열하기보다, 작업자가 지금 할 수 있는 action과 차단 사유를 명확하게 보여줘야 합니다.</p>
      <div class="grid">
        <div class="card"><strong>현장 실행 화면</strong><span>현재 객체 상태, 가능 action, 차단 조건, 관련 기준정보 revision을 표시합니다.</span></div>
        <div class="card"><strong>관리자 화면</strong><span>업무 규칙, 기준정보, 예외 승인, 변경 이력을 관리합니다.</span></div>
        <div class="card"><strong>통합 API</strong><span>ERP, APS, SCADA, 데이터 플랫폼과 request/schedule/performance를 주고받습니다.</span></div>
      </div>
      <h3>API 예시</h3>
      <div class="codebox">// =================================================================
// ANSI/ISA-95 Level 3 MOM Activity 통합 인터페이스 API 스펙
// =================================================================

// 1. 새로운 커맨드(작업 지시, 상태 변경, 실적 보고 등)를 수신하여 처리
POST /api/isa95/${esc(domain.key)}/${esc(activity.key)}/commands
Content-Type: application/json
{
    "commandId": "CMD-20260522-0001",
    "objectId": "LOT-2026-A95",
    "definitionId": "DEF-OP-CELL-A",
    "revision": "REV-2.1.0",
    "resourceScope": "AREA-CLEAN-01",
    "timeWindow": "SHIFT-A",
    "timestamp": "2026-05-22T20:10:00Z"
}

// 2. 특정 물리 객체(Lot, Batch 등)의 현재 운영 계층 상태 및 가용 정보 조회
GET  /api/isa95/${esc(domain.key)}/${esc(activity.key)}/current-state?objectId={id}
Response: 200 OK
{
    "objectId": "LOT-2026-A95",
    "currentState": "IN_PROGRESS",
    "lastUpdated": "2026-05-22T20:12:30Z"
}

// 3. 감사 및 추적을 위해 특정 시간 범위 내에서 발생한 상태 전이 이력 목록 조회
GET  /api/isa95/${esc(domain.key)}/${esc(activity.key)}/history?from={date}&to={date}</div>
    </section>

    <section id="test" class="section">
      <h2>7. 테스트 시나리오</h2>
      <table>
        <thead><tr><th>테스트 ID</th><th>시나리오</th><th>기대 결과</th></tr></thead>
        <tbody>${rows(activity.tests.map((test, i) => [`TC-${String(i + 1).padStart(2, "0")}`, esc(test), "상태, 이력, 예외, 통합 메시지, 권한 결과가 설계와 일치해야 합니다."]))}</tbody>
      </table>
      <h3>자주 놓치는 위험</h3>
      <div>
        <span class="badge">기준정보 revision 누락</span>
        <span class="badge">ERP/MES 상태 불일치</span>
        <span class="badge">중복 이벤트 처리 실패</span>
        <span class="badge">수동 변경 감사 누락</span>
        <span class="badge">권한 없는 승인</span>
      </div>
    </section>

    <section id="ops" class="section">
      <h2>8. 운영 체크리스트</h2>
      ${list([
        "현재 상태와 마지막 정상 이벤트, 마지막 오류 이벤트를 한 화면에서 확인할 수 있다.",
        "모든 action은 실행자, 시각, 변경 전/후 상태, 사유, correlation id를 남긴다.",
        "외부 시스템 연동 실패 시 재처리 queue와 운영 알림이 있다.",
        "기준정보 변경 시 진행 중 작업과 미래 작업의 영향도를 조회할 수 있다.",
        "성과 분석과 추적 모델에서 이 activity의 이력을 재사용할 수 있다."
      ])}
    </section>`;
  return pageShell({
    title,
    subtitle: `${domain.en} / ${activity.en}. ${activity.intent}`,
    chips: ["ANSI/ISA-95", domain.en, activity.en],
    crumbs: `<div class="crumbs"><a href="../ISA95_MES_Overview.html">ISA-95 MES Model</a> / ${esc(domain.ko)} / ${esc(activity.ko)}</div>`,
    cssHref: "../isa95-page.css",
    body
  });
}

function renderModel(model) {
  const flowRows = model.flow.map((step, i) => [
    `<strong>${i + 1}. ${esc(step)}</strong>`,
    i === 0 ? "상위 개념 또는 입력 객체입니다." : i === model.flow.length - 1 ? "하위 시스템이나 통합 메시지가 사용하는 결과입니다." : "관계, 계층, 상태 또는 능력을 해석하는 중간 모델입니다.",
    "ID, parent 관계, revision, owner system, effective date를 관리합니다."
  ]);
  const body = `
    <section class="section">
      <h2>학습 목표</h2>
      <div class="lesson-index">
        <a href="#concept">1. 모델 목적</a>
        <a href="#structure">2. 구조</a>
        <a href="#dfd">3. 모델 DFD</a>
        <a href="#data">4. 데이터 모델</a>
        <a href="#logic">5. 설계 규칙</a>
        <a href="#integration">6. 통합 관점</a>
        <a href="#test">7. 테스트</a>
        <a href="#ops">8. 운영 체크</a>
      </div>
      <div class="callout">${esc(notice)}</div>
    </section>

    <section id="concept" class="section">
      <h2>1. 모델 목적</h2>
      <p>${esc(model.summary)}</p>
      <p>ISA-95 모델은 화면 이름을 정하는 용도가 아니라 시스템 사이의 데이터 계약을 정하는 기준입니다. 같은 설비, 자재, 작업 요청을 ERP, MES, SCADA가 서로 다르게 해석하면 통합 비용이 커지므로 객체의 경계와 관계를 먼저 맞춰야 합니다.</p>
    </section>

    <section id="structure" class="section">
      <h2>2. 핵심 구조</h2>
      <table>
        <thead><tr><th>객체</th><th>역할</th><th>수업식 해설</th></tr></thead>
        <tbody>${rows(model.objects.map(([a, b, c]) => [`<strong>${esc(a)}</strong>`, esc(b), esc(c)]))}</tbody>
      </table>
    </section>

    <section id="dfd" class="section">
      <h2>3. 모델 DFD</h2>
      ${flowSvg(model.flow)}
      <table>
        <thead><tr><th>단계</th><th>의미</th><th>모델링 포인트</th></tr></thead>
        <tbody>${rows(flowRows)}</tbody>
      </table>
    </section>

    <section id="data" class="section">
      <h2>4. 권장 데이터 모델</h2>
      <table>
        <thead><tr><th>테이블</th><th>주요 컬럼</th><th>설계 이유</th></tr></thead>
        <tbody>${rows(model.db.map(([table, cols]) => [`<strong>${esc(table)}</strong>`, `<code>${esc(cols)}</code>`, "ISA-95 객체를 MES 내부 모델과 외부 통합 메시지로 안정적으로 연결하기 위한 기본 구조입니다."]))}</tbody>
      </table>
    </section>

    <section id="logic" class="section">
      <h2>5. 설계 규칙</h2>
      <table>
        <thead><tr><th>규칙 ID</th><th>설계 규칙</th><th>검증 방법</th></tr></thead>
        <tbody>${rows(model.rules.map((rule, i) => [`MR-${String(i + 1).padStart(2, "0")}`, esc(rule), "모델 validation, master data governance, integration contract test로 검증"]))}</tbody>
      </table>
      <h3>모델 검증 의사코드</h3>
      <div class="codebox">// =================================================================
// ANSI/ISA-95 Object Model 데이터 무결성 및 구조적 일관성 검증 로직
// =================================================================
function validateIsa95Model(modelObject) {
    // 1. 객체의 고유 식별자(ID)가 영속적이고 안정적으로 생성되었는지 확인
    assert(modelObject.id !== null && modelObject.id !== undefined, "객체 ID는 필수값이며 고유해야 합니다.");

    // 2. 마스터 데이터 거버넌스 보장을 위해 마스터 시스템(Owner System) 소유권 검증
    assert(modelObject.ownerSystem !== "", "소유 시스템 정보가 명시되어야 합니다.");

    // 3. 시간 경과에 따른 정보의 신뢰성을 위해 효력 개시일(Effective From) 유효성 검증
    assert(isValidDate(modelObject.effectiveFrom), "효력 개시일 포맷이 유효해야 합니다.");

    // 4. 설비/기능/자재 등 계층 구조(Hierarchy) 또는 부모-자식 간 참조 관계가 유효한지 확인
    validateHierarchyOrRelationship(modelObject);

    // 5. 외부 시스템(ERP 품목, MES 자재 코드, 설비 TAG 등) 간 상호 참조 맵 검증
    validateExternalMappings(modelObject);

    // 6. 모델 데이터 변경 시 타 계층 및 다운스트림 시스템과의 정합성을 위해 비동기 변경 이벤트 발행
    publishModelChangedEvent(modelObject);
}</div>
    </section>

    <section id="integration" class="section">
      <h2>6. 통합 관점</h2>
      <div class="grid">
        <div class="card"><strong>ERP</strong><span>계획, 품목, 주문, 원가와 연결되는 상위 기준정보를 제공합니다.</span></div>
        <div class="card"><strong>MES/MOM</strong><span>실행 상태, schedule, performance, genealogy를 관리합니다.</span></div>
        <div class="card"><strong>SCADA/PLC</strong><span>실제 설비 상태와 공정 데이터를 이벤트로 제공합니다.</span></div>
      </div>
    </section>

    <section id="test" class="section">
      <h2>7. 테스트 시나리오</h2>
      <table>
        <thead><tr><th>테스트 ID</th><th>시나리오</th><th>기대 결과</th></tr></thead>
        <tbody>${rows(model.tests.map((test, i) => [`TC-${String(i + 1).padStart(2, "0")}`, esc(test), "객체 관계, ID 매핑, revision, 통합 메시지가 설계와 일치해야 합니다."]))}</tbody>
      </table>
    </section>

    <section id="ops" class="section">
      <h2>8. 운영 체크리스트</h2>
      ${list([
        "객체 ID와 외부 시스템 ID 매핑표가 있다.",
        "기준정보 owner system과 변경 승인 절차가 명확하다.",
        "모델 변경 시 영향받는 schedule, request, performance를 조회할 수 있다.",
        "통합 메시지 실패를 재처리할 수 있다.",
        "과거 실적을 당시 모델 revision 기준으로 해석할 수 있다."
      ])}
    </section>`;
  return pageShell({
    title: `ISA-95 ${model.titleKo}`,
    subtitle: `${model.titleEn}. ${model.summary}`,
    chips: ["ANSI/ISA-95", "Object Model", model.titleEn],
    crumbs: `<div class="crumbs"><a href="../ISA95_MES_Overview.html">ISA-95 MES Model</a> / ${esc(model.titleKo)}</div>`,
    cssHref: "../isa95-page.css",
    body
  });
}

function renderIndex() {
  const activityLinks = domains.map((domain) => {
    const links = activities.map((activity) => `<a href="activities/${activityFilename(domain, activity)}"><strong>${esc(domain.ko)} - ${esc(activity.ko)}</strong><span class="muted">${esc(domain.en)} / ${esc(activity.en)}</span></a>`).join("");
    return `<h3>${esc(domain.ko)}</h3><div class="list">${links}</div>`;
  }).join("");
  const modelLinks = models.map((model) => `<a href="models/${model.file}"><strong>${esc(model.titleKo)}</strong><span class="muted">${esc(model.titleEn)}</span></a>`).join("");
  const body = `
    <section class="section">
      <h2>ISA-95 전체 관점</h2>
      ${flowSvg(["ERP/Business Planning", "ISA-95 Level 3 MOM", "Operations Activities", "Object Models", "Shopfloor Execution"])}
      <p style="margin-top:14px">ISA-95는 MES를 단순 화면 묶음이 아니라 Level 4 비즈니스 계획과 Level 2/1 현장 제어 사이의 표준 모델로 바라봅니다. 핵심은 Production, Maintenance, Quality, Inventory 운영 활동을 같은 패턴으로 정의하고, Personnel, Equipment, Material, Operations 객체 모델로 데이터를 연결하는 것입니다.</p>
      <div class="callout">${esc(notice)}</div>
    </section>
    <section class="section">
      <h2>활동 모델 문서</h2>
      <p>4개 운영 영역마다 8개 공통 activity를 개별 HTML로 정리했습니다. 수업에서는 먼저 Production 활동을 읽고, 같은 패턴이 Maintenance, Quality, Inventory로 어떻게 확장되는지 비교하면 좋습니다.</p>
      ${activityLinks}
    </section>
    <section class="section">
      <h2>객체 및 계층 모델 문서</h2>
      <div class="list">${modelLinks}</div>
    </section>
    <section class="section">
      <h2>학습 순서 추천</h2>
      <div class="grid">
        <div class="card"><strong>1. 계층 이해</strong><span>기능 계층 모델과 설비 계층 모델로 Level 3의 책임 범위를 먼저 잡습니다.</span></div>
        <div class="card"><strong>2. 객체 이해</strong><span>인력, 설비, 자재, 공정 세그먼트 모델을 읽어 MES 기준정보 구조를 이해합니다.</span></div>
        <div class="card"><strong>3. 활동 이해</strong><span>정의, 자원, 스케줄, 디스패칭, 실행, 수집, 추적, 성과 분석 흐름을 도메인별로 비교합니다.</span></div>
      </div>
    </section>`;
  return pageShell({
    title: "ANSI/ISA-95 MES Model Guide",
    subtitle: "ISA-95에서 정의하는 MOM/MES 기능요소, 객체 모델, 운영 activity를 교육용 HTML 문서로 정리한 가이드입니다.",
    chips: ["ANSI/ISA-95", "MES / MOM", "Activity & Object Model"],
    crumbs: "",
    cssHref: "isa95-page.css",
    body
  });
}

fs.mkdirSync(activitiesDir, { recursive: true });
fs.mkdirSync(modelsDir, { recursive: true });
fs.writeFileSync(path.join(root, "isa95-page.css"), css, "utf8");
fs.writeFileSync(path.join(root, "ISA95_MES_Overview.html"), renderIndex(), "utf8");

let count = 1;
for (const domain of domains) {
  for (const activity of activities) {
    fs.writeFileSync(path.join(activitiesDir, activityFilename(domain, activity)), renderActivity(domain, activity), "utf8");
    count += 1;
  }
}
for (const model of models) {
  fs.writeFileSync(path.join(modelsDir, model.file), renderModel(model), "utf8");
  count += 1;
}

console.log(`Generated ${count} ISA-95 pages in ${root}`);
