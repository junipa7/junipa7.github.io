import os
import html

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
activities_dir = os.path.join(root, "activities")
models_dir = os.path.join(root, "models")

os.makedirs(activities_dir, exist_ok=True)
os.makedirs(models_dir, exist_ok=True)

notice = "이 문서는 ANSI/ISA-95를 기반으로 MES/MOM 시스템 설계를 학습하기 위한 교육용 해설입니다. 공식 표준 조항을 대체하지 않으며, 실제 프로젝트에서는 최신 ISA-95 문서, 고객 URS, 사이트 표준, ERP/PLC/SCADA 연동 규격을 함께 검토해야 합니다."

css = """:root{--ink:#17202a;--muted:#64748b;--line:#d7dde8;--panel:#fff;--paper:#f5f7fb;--accent:#137a7f;--blue:#2864a8;--orange:#b85c18;--green:#517d2f;--shadow:0 18px 42px rgba(25,35,58,.10)}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font-family:Arial,"Malgun Gothic",sans-serif;line-height:1.65}.page{max-width:1180px;margin:0 auto;padding:28px}.hero{background:#101826;color:#fff;border-radius:14px;padding:30px;box-shadow:var(--shadow);border-bottom:5px solid #65b8a6}.hero h1{margin:0 0 10px;font-size:clamp(26px,4vw,42px);letter-spacing:0}.hero p{margin:0;color:#dbe3ef;max-width:980px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.chip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}.section{background:var(--panel);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);padding:22px;margin-top:18px}.section h2{margin:0 0 12px;font-size:21px}.section h3{margin:20px 0 8px;font-size:16px;color:#1d3557}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}.card strong{display:block;color:#1d3557;margin-bottom:4px}.card span,.muted{color:var(--muted);font-size:13px}.diagram{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}svg{display:block;min-width:880px;width:100%;height:auto}.node rect{fill:#fff;stroke:#ccd6e2;stroke-width:1.4;rx:8}.node text{font-size:13px;fill:#182233;font-weight:700}.tiny{font-size:11px!important;fill:#667085!important;font-weight:400!important}.arrow{stroke:#2864a8;stroke-width:1.7;fill:none;marker-end:url(#arrow)}table{width:100%;border-collapse:collapse;background:#fff;font-size:13px}th,td{border:1px solid var(--line);padding:10px;vertical-align:top}th{background:#eef3f8;color:#24364b;text-align:left}.note,.callout{border-left:4px solid var(--orange);background:#fff8ef;border-radius:8px;padding:13px;color:#4c3a25}.callout{border-left-color:var(--accent);background:#eefafa;color:#213f42}.crumbs{margin:16px 0;color:var(--muted);font-size:13px}.crumbs a{color:#1f68b3;text-decoration:none}.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.list a{display:block;border:1px solid var(--line);border-radius:9px;background:#fff;padding:12px;color:var(--ink);text-decoration:none}.list a:hover{border-color:var(--accent);background:#f0fbfa}.list a strong{display:block;color:var(--blue);margin-bottom:4px}.lesson-index{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.lesson-index a{display:block;border:1px solid var(--line);border-radius:8px;padding:10px;text-decoration:none;color:var(--blue);background:#fff;font-weight:700;font-size:13px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}.codebox{background:#0f172a;color:#e2e8f0;border-radius:10px;padding:14px;overflow:auto;font-family:Consolas,monospace;font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-all;margin:12px 0}.badge{display:inline-block;border:1px solid #cbd5e1;border-radius:999px;padding:2px 8px;margin:2px;background:#f8fafc;font-size:12px}ul{margin:0;padding-left:20px}@media(max-width:900px){.page{padding:14px}.grid,.list,.lesson-index,.two-col{grid-template-columns:1fr}.hero{padding:22px}}"""

with open(os.path.join(root, "isa95-page.css"), "w", encoding="utf8") as f:
    f.write(css)

domains = [
  {
    "key": "production",
    "ko": "생산 운영 관리",
    "en": "Production Operations Management",
    "object": "work order, lot, batch, serial",
    "mainResource": "설비, 작업자, 자재, recipe",
    "goal": "고객 주문과 생산 계획을 실제 제품 생산 활동으로 변환하고, 현장에서 발생한 실적을 ERP와 품질/성과 시스템으로 되돌려 주는 영역입니다.",
    "examples": ["작업 오더를 lot 단위로 분해", "설비와 recipe 검증 후 작업 시작", "생산 실적, scrap, rework 기록", "납기와 throughput 분석"],
    "dbPrefix": "prod"
  },
  {
    "key": "maintenance",
    "ko": "보전 운영 관리",
    "en": "Maintenance Operations Management",
    "object": "maintenance work order, equipment, spare part",
    "mainResource": "보전 기술자, 설비, spare part, PM 절차서",
    "goal": "설비의 예방보전, 고장보전, 점검, 수리 작업을 계획하고 실행하여 생산 중단과 품질 위험을 줄이는 영역입니다.",
    "examples": ["PM due 계산", "고장 작업 오더 생성", "수리 담당자와 부품 배정", "MTBF/MTTR 분석"],
    "dbPrefix": "mnt"
  },
  {
    "key": "quality",
    "ko": "품질 운영 관리",
    "en": "Quality Operations Management",
    "object": "inspection lot, sample, test result, nonconformance",
    "mainResource": "검사 장비, 품질 담당자, spec, sampling rule",
    "goal": "검사, 시험, SPC, 부적합 처리, release 의사결정을 생산 실행과 연결하여 품질 기준을 현장에서 바로 적용하는 영역입니다.",
    "examples": ["검사 계획 생성", "측정값 수집과 spec 판정", "SPC signal 감지", "Hold, release, CAPA 연결"],
    "dbPrefix": "qlt"
  },
  {
    "key": "inventory",
    "ko": "재고 운영 관리",
    "en": "Inventory Operations Management",
    "object": "material lot, container, location, inventory movement",
    "mainResource": "창고 위치, 운반 장비, 자재 lot, 보관 조건",
    "goal": "원자재, 반제품, 완제품, 포장재, spare part의 위치와 수량, 상태, 이동을 관리하여 생산이 필요한 시점에 필요한 자재를 사용할 수 있게 하는 영역입니다.",
    "examples": ["입고/출고/이동 처리", "재고 상태와 보관 조건 관리", "lot trace와 FEFO/FIFO 적용", "ERP 재고와 현장 재고 동기화"],
    "dbPrefix": "inv"
  }
]

activities = [
  {
    "key": "definition-management",
    "ko": "정의 관리",
    "en": "Definition Management",
    "intent": "작업을 실행하기 전에 필요한 기준정보와 업무 규칙을 정의하고 version으로 통제합니다.",
    "flowVerb": "기준정보 승인",
    "scope": ["작업 정의, 절차, 기준값, 허용 범위 관리", "제품/설비/자원별 적용 조건 관리", "개정, 승인, 유효일, 폐기 상태 관리", "현장 실행 기능에 기준정보 배포"],
    "rules": ["기준정보는 revision과 effective date를 가져야 합니다.", "승인되지 않은 정의는 현장 실행에 사용할 수 없습니다.", "변경 영향 분석을 통해 진행 중 작업과 미래 작업의 적용 범위를 나눕니다.", "과거 실적은 당시 기준정보 version으로 해석할 수 있어야 합니다."],
    "tests": ["승인 전 기준정보 사용 차단", "유효일 이후 새 revision 적용", "기준정보 변경 영향 lot 조회", "폐기된 기준정보 선택 차단"]
  },
  {
    "key": "resource-management",
    "ko": "자원 관리",
    "en": "Resource Management",
    "intent": "작업 수행에 필요한 인력, 설비, 물리 자산, 자재의 능력과 현재 가용성을 관리합니다.",
    "flowVerb": "자원 상태 판단",
    "scope": ["자원 master와 capability 관리", "현재 상태와 상태 이력 관리", "자격, 교정, PM, hold 여부 확인", "작업 요구사항과 자원 능력 매칭"],
    "rules": ["자원은 available, unavailable, busy, hold 같은 상태를 명확히 가져야 합니다.", "Capability와 qualification은 작업 요구 조건과 함께 검증합니다.", "자원 상태 변경은 관련 schedule과 dispatch queue에 영향을 줍니다.", "수동 상태 변경은 사유와 승인자를 남깁니다."],
    "tests": ["가용 자원 조회", "자격 부족 자원 배정 차단", "자원 Down 후 queue 재계산", "수동 상태 변경 감사"]
  },
  {
    "key": "detailed-scheduling",
    "ko": "상세 스케줄링",
    "en": "Detailed Scheduling",
    "intent": "상위 계획을 현장에서 실행 가능한 시간, 순서, 자원 단위 계획으로 세분화합니다.",
    "flowVerb": "상세 일정 생성",
    "scope": ["작업 우선순위와 납기 반영", "자원 capacity와 shift 반영", "setup, campaign, sequence 제약 고려", "스케줄 변경과 영향 분석"],
    "rules": ["스케줄은 hard constraint와 soft constraint를 구분해야 합니다.", "스케줄 확정 후에도 dispatch 시점에는 현장 상태를 재검증합니다.", "긴급 작업 삽입 시 밀려나는 작업의 영향도를 계산합니다.", "스케줄 변경 이력은 이전 계획과 새 계획을 모두 보존합니다."],
    "tests": ["capacity 초과 일정 방지", "긴급 작업 삽입", "자원 휴무 반영", "변경 이력 저장"]
  },
  {
    "key": "dispatching",
    "ko": "디스패칭",
    "en": "Dispatching",
    "intent": "현재 시점에 어떤 작업을 어느 자원에서 시작할지 현장에 지시합니다.",
    "flowVerb": "작업 지시",
    "scope": ["실행 가능한 작업 목록 생성", "작업 시작 조건 최종 검증", "우선순위 점수와 dispatch rule 적용", "작업자 또는 자동화 시스템에 지시 전달"],
    "rules": ["Dispatch는 항상 현재 상태를 기준으로 판단해야 합니다.", "Hold, 자원 불가, 기준정보 미승인, 자재 부족은 시작 차단 사유가 됩니다.", "수동 우선순위 변경은 권한과 사유를 요구합니다.", "지시 후 실제 실행 이벤트와 매칭해야 합니다."],
    "tests": ["실행 가능 queue 생성", "Hold 대상 시작 차단", "수동 순서 변경 감사", "실행 실패 후 queue 복구"]
  },
  {
    "key": "execution-management",
    "ko": "실행 관리",
    "en": "Execution Management",
    "intent": "작업 시작부터 완료까지 상태 전이를 관리하고, 예외 상황을 업무 규칙에 따라 처리합니다.",
    "flowVerb": "실행 상태 전이",
    "scope": ["Start, pause, resume, complete, abort 상태 관리", "작업 지시와 실제 수행 이벤트 매칭", "예외, deviation, rework, scrap 처리", "ERP/MES/설비 상태 동기화"],
    "rules": ["상태 전이는 허용된 이전 상태에서만 가능해야 합니다.", "작업 완료는 필수 데이터와 품질/자원 검증 후 확정합니다.", "Abort와 cancel은 원인과 책임 경계가 다르므로 구분합니다.", "중복 이벤트는 idempotency key로 처리합니다."],
    "tests": ["정상 시작/완료", "잘못된 상태 전이 차단", "중복 완료 이벤트 무시", "Abort 사유 저장"]
  },
  {
    "key": "data-collection",
    "ko": "데이터 수집",
    "en": "Data Collection",
    "intent": "실행 과정에서 발생한 설비, 사람, 자재, 품질, 시간 데이터를 수집하고 검증합니다.",
    "flowVerb": "실적 데이터 저장",
    "scope": ["자동/수동 데이터 수집", "필수값, 범위, 코드, 시간 검증", "발생 시각과 수신 시각 관리", "다른 activity가 사용할 원천 데이터 제공"],
    "rules": ["발생 시각과 수신 시각을 모두 저장합니다.", "수집 항목 mapping은 기준정보 version과 연결합니다.", "품질이 나쁜 데이터는 삭제하지 않고 quality code를 붙집니다.", "수동 입력은 권한과 audit trail을 남깁니다."],
    "tests": ["자동 이벤트 저장", "필수 수동 입력 검증", "중복 sample 제거", "Bad quality 데이터 표시"]
  },
  {
    "key": "tracking",
    "ko": "추적",
    "en": "Tracking",
    "intent": "작업 대상, 자원, 상태, 위치, genealogy를 시간순으로 추적합니다.",
    "flowVerb": "상태와 위치 추적",
    "scope": ["현재 위치와 상태 관리", "상태/위치 이력 기록", "분할, 병합, 대체, 재작업 관계 기록", "정방향/역방향 trace 조회"],
    "rules": ["현재 상태는 이력에서 재구성 가능해야 합니다.", "분할과 병합은 부모-자식 관계로 명확히 남깁니다.", "추적 이력은 삭제보다 correction event를 남기는 방식이 안전합니다.", "시간대와 event ordering을 일관되게 관리합니다."],
    "tests": ["현재 위치 조회", "분할/병합 genealogy 생성", "역방향 trace", "잘못된 이동 correction"]
  },
  {
    "key": "performance-analysis",
    "ko": "성과 분석",
    "en": "Performance Analysis",
    "intent": "실행 데이터를 KPI로 계산하고 손실 원인을 분석하여 개선 활동으로 연결합니다.",
    "flowVerb": "KPI 계산",
    "scope": ["KPI 정의와 공식 관리", "기간/제품/자원별 집계", "손실 코드와 Pareto 분석", "목표 대비 실적과 개선 action 추적"],
    "rules": ["KPI는 분자, 분모, 제외 조건, 집계 단위를 명확히 가져야 합니다.", "대시보드 값은 원천 이벤트로 drill-down 가능해야 합니다.", "실시간 값과 마감 값의 차이를 표시합니다.", "개선 action의 담당자와 완료 효과를 추적합니다."],
    "tests": ["KPI 공식 검증", "기간별 집계", "손실 Pareto", "원천 이벤트 drill-down"]
  }
]

models = [
  {
    "file": "functional-hierarchy-model.html",
    "titleKo": "기능 계층 모델",
    "titleEn": "Functional Hierarchy Model",
    "summary": "ISA-95의 Level 0~4 계층을 통해 설비 제어, 현장 운영, 비즈니스 계획의 책임 경계를 나눕니다.",
    "flow": ["Level 4 Business Planning", "Level 3 MOM/MES", "Level 2 Supervisory Control", "Level 1 Sensing/Manipulation", "Level 0 Physical Process"],
    "objects": [["Level 4", "ERP/SCM/PLM", "주문, 원가, 장기 계획, 구매와 같은 비즈니스 활동입니다."], ["Level 3", "MOM/MES", "생산, 품질, 보전, 재고 운영을 현장 실행 단위로 관리합니다."], ["Level 2", "SCADA/HMI/Batch", "감시 제어, recipe 실행, 공정 값 수집을 담당합니다."], ["Level 1/0", "PLC/센서/구동기", "물리 공정과 직접 상호작용합니다."]],
    "db": [["integration_boundary", "boundary_id, source_level, target_level, message_name, owner_system, sla_sec"], ["level3_event", "event_id, domain, event_type, object_id, event_time, source_system"]],
    "rules": ["Level 4는 상세 제어 명령을 직접 PLC에 보내지 않고 Level 3/2를 통해 책임을 나눕니다.", "Level 3는 계획을 실행 가능한 작업 단위로 만들고 실적을 다시 Level 4로 전달합니다.", "계층 경계 메시지 실패 재처리", "계층 경계마다 소유 시스템, 데이터 책임, 동기화 주기를 명확히 정의합니다."],
    "tests": ["ERP 작업 오더가 MES 작업으로 변환", "MES 완료 실적이 ERP로 반환", "Level 2 이벤트가 Level 3 이력으로 저장", "계층 경계 메시지 실패 재처리"]
  },
  {
    "file": "equipment-hierarchy-model.html",
    "titleKo": "설비 계층 모델",
    "titleEn": "Equipment Hierarchy Model",
    "summary": "Enterprise, Site, Area, Work Center, Work Unit 같은 계층으로 생산 자원의 위치와 책임 범위를 표현합니다.",
    "flow": ["Enterprise", "Site", "Area", "Work Center", "Work Unit"],
    "objects": [["Enterprise", "회사 또는 사업 단위", "여러 site를 포괄하는 최상위 조직입니다."], ["Site", "공장", "하나의 물리적 생산 사업장입니다."], ["Area", "생산 구역", "라인, 공정군, 창고 구역처럼 운영 단위를 나눕니다."], ["Work Center", "작업 센터", "스케줄과 capacity를 관리하는 단위입니다."], ["Work Unit", "작업 설비", "실제 작업이 수행되는 설비, 셀, 장치입니다."]],
    "db": [["equipment_hierarchy", "node_id, parent_node_id, node_type, name, site_code, active_flag"], ["equipment_capability", "node_id, capability_type, product_family, capacity_value, unit"]],
    "rules": ["계층 ID는 ERP, MES, SCADA에서 공통으로 매핑되어야 합니다.", "상위 계층 상태가 내려가면 하위 자원 가용성에도 영향을 줍니다.", "Capacity 집계는 Work Unit에서 시작해 Work Center, Area로 올라갑니다."],
    "tests": ["계층 tree 조회", "Work Unit 상태 변경 후 Work Center capacity 재계산", "site별 자원 필터", "비활성 계층 사용 차단"]
  },
  {
    "file": "personnel-model.html",
    "titleKo": "인력 모델",
    "titleEn": "Personnel Model",
    "summary": "작업자, 역할, 자격, 숙련도, 교육 이력을 구조화하여 누가 어떤 작업을 수행할 수 있는지 판단합니다.",
    "flow": ["Person", "Role", "Qualification", "Shift", "Assignment"],
    "objects": [["Person", "작업자", "실제 작업 또는 승인을 수행하는 사람입니다."], ["Role", "역할", "Operator, Engineer, Quality Approver처럼 권한과 책임을 묶습니다."], ["Qualification", "자격", "제품, 공정, 설비별 수행 가능성을 나타냅니다."], ["Shift", "근무", "가용 시간과 근무 상태를 표현합니다."]],
    "db": [["person", "person_id, name, department, active_flag"], ["personnel_qualification", "person_id, qualification_code, level, effective_from, expires_at"], ["personnel_assignment", "assignment_id, person_id, operation_id, resource_id, role, start_time, end_time"]],
    "rules": ["작업 실행 전 필요한 qualification을 확인합니다.", "자격은 유효기간과 level을 함께 가져야 합니다.", "승인 권한과 작업 권한은 분리할 수 있어야 합니다."],
    "tests": ["자격 보유자 작업 시작", "자격 만료자 차단", "승인 권한 검증", "근무시간 외 배정 경고"]
  },
  {
    "file": "equipment-model.html",
    "titleKo": "설비 모델",
    "titleEn": "Equipment Model",
    "summary": "생산 또는 운영 활동에 쓰이는 장비의 capability, 상태, 위치, 제약 조건을 표현합니다.",
    "flow": ["Equipment Class", "Equipment", "Capability", "Status", "Assignment"],
    "objects": [["Equipment Class", "설비 유형", "같은 기능을 가진 설비 그룹입니다."], ["Equipment", "개별 설비", "작업이 배정되는 실제 자원입니다."], ["Capability", "수행 능력", "제품, 공정, recipe, capacity 수행 가능성을 나타냅니다."], ["Status", "상태", "Available, Busy, Down, PM 등입니다."]],
    "db": [["equipment", "equipment_id, equipment_class, hierarchy_node_id, name, active_flag"], ["equipment_status", "equipment_id, status, reason_code, updated_at"], ["equipment_capability", "equipment_id, operation_id, product_id, recipe_family, capacity"]],
    "rules": ["설비 상태와 capability를 모두 만족해야 작업을 배정할 수 있습니다.", "PM, 교정, qualification 상태는 production availability와 분리해 관리합니다.", "설비 상태 변경은 schedule, dispatch, KPI에 이벤트를 발행합니다."],
    "tests": ["capability matching", "Down 설비 배정 차단", "상태 이력 저장", "capacity 집계"]
  },
  {
    "file": "physical-asset-model.html",
    "titleKo": "물리 자산 모델",
    "titleEn": "Physical Asset Model",
    "summary": "설비와 별도로 실제 자산의 구매, 설치, 교정, 보전, 수명주기 정보를 관리합니다.",
    "flow": ["Asset Class", "Asset", "Installation", "Calibration/PM", "Retirement"],
    "objects": [["Physical Asset", "물리 자산", "설비, 계측기, 금형, 운반 장비 같은 추적 대상입니다."], ["Asset Class", "자산 유형", "동일한 관리 규칙을 공유하는 유형입니다."], ["Lifecycle", "수명주기", "구매, 설치, 운전, 이동, 폐기 단계를 표현합니다."], ["Maintenance Link", "보전 연결", "보전 활동과 자산 이력을 연결합니다."]],
    "db": [["physical_asset", "asset_id, asset_class, serial_no, vendor, purchase_date, lifecycle_status"], ["asset_installation", "asset_id, equipment_id, location_id, installed_at, removed_at"], ["asset_calibration", "asset_id, calibration_due_at, result, certificate_no"]],
    "rules": ["자산 ID와 운영 설비 ID는 다를 수 있으므로 매핑 이력을 유지합니다.", "교정 만료 자산은 품질 또는 생산 사용을 제한할 수 있습니다.", "자산 이동과 교체는 genealogy와 보전 이력에 영향을 줍니다."],
    "tests": ["자산 설치 이력", "교정 만료 경고", "자산-설비 매핑 변경", "폐기 자산 사용 차단"]
  },
  {
    "file": "material-model.html",
    "titleKo": "자재 모델",
    "titleEn": "Material Model",
    "summary": "원자재, 반제품, 완제품, 소모품의 lot, sublot, serial, quantity, 상태, 위치를 표현합니다.",
    "flow": ["Material Class", "Material Definition", "Material Lot", "Material Sublot", "Inventory/Consumption"],
    "objects": [["Material Class", "자재 분류", "제품군 또는 자재 유형을 나타냅니다."], ["Material Definition", "자재 정의", "품목 코드, 단위, spec, 보관 조건입니다."], ["Material Lot", "자재 lot", "동일 조건으로 식별되는 재고 단위입니다."], ["Sublot/Serial", "세부 단위", "추적이 필요한 하위 단위입니다."]],
    "db": [["material_definition", "material_def_id, item_code, revision, uom, status"], ["material_lot", "material_lot_id, material_def_id, lot_no, quantity, status, location_id"], ["material_movement", "movement_id, material_lot_id, from_location, to_location, quantity, event_time"]],
    "rules": ["자재 사용은 lot 상태, 유효기간, 보관 조건, 품질 release 여부를 확인합니다.", "소비와 생산은 genealogy link로 연결합니다.", "단위 변환과 수량 정밀도 정책을 명확히 둡니다."],
    "tests": ["자재 lot 입고", "Hold 자재 사용 차단", "소비 이력과 genealogy 생성", "수량 부족 차단"]
  },
  {
    "file": "process-segment-model.html",
    "titleKo": "공정 세그먼트 모델",
    "titleEn": "Process Segment Model",
    "summary": "제품을 만들기 위한 공정 단위를 정의하고 해당 공정에 필요한 자원, 조건, 능력을 연결합니다.",
    "flow": ["Process Segment", "Resource Requirement", "Parameter", "Capability", "Operation Segment"],
    "objects": [["Process Segment", "공정 단위", "작업이 수행되는 논리적 공정 단계입니다."], ["Resource Requirement", "자원 요구", "필요 설비, 인력, 자재, 자산 조건입니다."], ["Parameter", "공정 조건", "목표값, 허용 범위, recipe 조건입니다."], ["Capability", "수행 능력", "해당 segment를 수행할 수 있는 자원 능력입니다."]],
    "db": [["process_segment", "segment_id, name, product_family, revision, status"], ["segment_resource_requirement", "segment_id, resource_type, capability_code, quantity, required_flag"], ["segment_parameter", "segment_id, parameter_name, target_value, low_limit, high_limit, unit"]],
    "rules": ["Segment 요구 조건은 schedule과 dispatch에서 재사용되어야 합니다.", "공정 조건 변경은 revision과 approval을 거칩니다.", "Capability가 없는 자원에는 segment를 배정하지 않습니다."],
    "tests": ["segment 요구 자원 조회", "parameter 범위 검증", "capability 없는 설비 배정 차단", "revision별 segment 적용"]
  },
  {
    "file": "operations-definition-model.html",
    "titleKo": "운영 정의 모델",
    "titleEn": "Operations Definition Model",
    "summary": "생산, 품질, 보전, 재고 활동을 실행하기 위한 작업 정의, 절차, 세그먼트, 자원 요구사항을 묶습니다.",
    "flow": ["Operations Definition", "Operations Segment", "Material/Personnel/Equipment Requirement", "Work Master"],
    "objects": [["Operations Definition", "운영 정의", "실행할 업무의 표준 정의입니다."], ["Operations Segment", "운영 세그먼트", "정의 안의 세부 활동 단위입니다."], ["Resource Requirement", "자원 요구", "인력, 설비, 자재, 자산 조건입니다."], ["Work Master", "작업 표준", "현장 실행의 기준이 되는 master입니다."]],
    "db": [["operations_definition", "definition_id, domain, name, revision, status, effective_from"], ["operations_segment", "segment_id, definition_id, sequence_no, segment_name"], ["operations_requirement", "requirement_id, segment_id, resource_type, requirement_code, quantity"]],
    "rules": ["정의는 domain과 revision으로 관리합니다.", "실행 작업은 승인된 definition에서 생성되어야 합니다.", "정의 변경 시 진행 중 작업에 적용할지 별도 정책이 필요합니다."],
    "tests": ["정의 승인", "작업 생성 시 definition 연결", "revision 변경 영향 분석", "미승인 정의 사용 차단"]
  },
  {
    "file": "operations-capability-model.html",
    "titleKo": "운영 능력 모델",
    "titleEn": "Operations Capability Model",
    "summary": "특정 기간에 어떤 자원이 어떤 작업을 얼마나 수행할 수 있는지 표현하여 계획과 스케줄의 근거로 사용합니다.",
    "flow": ["Capability Request", "Resource Capability", "Available Capacity", "Committed Capacity", "Capability Response"],
    "objects": [["Capability", "수행 가능성", "자원이 특정 작업을 할 수 있는지 나타냅니다."], ["Capacity", "수행량", "기간별 가능 수량 또는 시간입니다."], ["Committed Capacity", "이미 배정된 능력", "확정 일정으로 사용된 capacity입니다."], ["Available Capacity", "남은 능력", "추가 작업 가능 범위입니다."]],
    "db": [["operations_capability", "capability_id, domain, resource_id, segment_id, start_time, end_time, capacity_value"], ["capacity_commitment", "commitment_id, capability_id, work_request_id, committed_value, status"]],
    "rules": ["Capability는 시간 구간과 자원 범위를 함께 가져야 합니다.", "Schedule은 available capacity를 초과하지 않아야 합니다.", "설비 Down, 작업자 결근, 자재 부족은 capability를 즉시 낮춥니다."],
    "tests": ["기간별 capability 조회", "capacity 초과 배정 차단", "자원 상태 변경 후 capability 갱신", "committed capacity 계산"]
  },
  {
    "file": "operations-schedule-model.html",
    "titleKo": "운영 스케줄 모델",
    "titleEn": "Operations Schedule Model",
    "summary": "계획된 작업 요청을 언제, 어디서, 어떤 순서로 실행할지 표현합니다.",
    "flow": ["Operations Request", "Operations Schedule", "Operations Segment Request", "Dispatchable Work", "Schedule Response"],
    "objects": [["Operations Request", "작업 요청", "상위 계획에서 내려온 실행 요청입니다."], ["Operations Schedule", "운영 일정", "시간과 순서를 포함한 실행 계획입니다."], ["Segment Request", "세그먼트 요청", "작업을 세부 operation 단위로 나눈 항목입니다."], ["Schedule Response", "스케줄 응답", "가능/불가능, 예정 시간, 제약 사유를 반환합니다."]],
    "db": [["operations_request", "request_id, domain, source_order_id, priority, due_date, status"], ["operations_schedule", "schedule_id, request_id, resource_id, planned_start, planned_end, status"], ["segment_request", "segment_request_id, schedule_id, segment_id, sequence_no, status"]],
    "rules": ["스케줄은 요청, 자원, 세그먼트, 시간 구간을 연결해야 합니다.", "계획 변경은 이전 schedule을 보존하고 새 revision으로 관리합니다.", "Dispatch 전에는 최신 shopfloor 상태로 재검증합니다."],
    "tests": ["요청에서 schedule 생성", "우선순위 반영", "스케줄 revision 생성", "dispatch 가능 항목 추출"]
  },
  {
    "file": "operations-performance-model.html",
    "titleKo": "운영 성과 모델",
    "titleEn": "Operations Performance Model",
    "summary": "실제 수행 결과, 사용 자원, 시간, 품질, 수량, 손실 정보를 계획과 비교할 수 있는 형태로 표현합니다.",
    "flow": ["Execution Event", "Operations Performance", "Segment Response", "Resource Actual", "KPI/ERP Feedback"],
    "objects": [["Operations Performance", "운영 성과", "작업 완료와 실적을 담는 결과 모델입니다."], ["Segment Response", "세그먼트 결과", "세부 operation별 실제 시작/종료, 수량, 상태입니다."], ["Resource Actual", "실제 사용 자원", "실제로 사용된 설비, 인력, 자재, 자산입니다."], ["Performance KPI", "성과 지표", "계획 대비 실적, 손실, 품질 결과입니다."]],
    "db": [["operations_performance", "performance_id, request_id, domain, result_status, started_at, ended_at"], ["segment_response", "segment_response_id, performance_id, segment_id, actual_start, actual_end, good_qty, bad_qty"], ["resource_actual", "actual_id, segment_response_id, resource_type, resource_id, usage_qty, usage_time_sec"]],
    "rules": ["성과는 계획 request와 연결되어야 계획 대비 차이를 계산할 수 있습니다.", "실제 사용 자원은 계획 자원과 다를 수 있으므로 별도로 저장합니다.", "부분 완료와 실패 상태를 표현할 수 있어야 합니다."],
    "tests": ["완료 실적 생성", "계획 대비 지연 계산", "대체 자원 사용 기록", "부분 완료 실적 ERP 전송"]
  },
  {
    "file": "integration-object-model.html",
    "titleKo": "통합 객체 모델",
    "titleEn": "Integration Object Model",
    "summary": "ISA-95 객체 모델을 ERP, MES, SCADA, 데이터 플랫폼 사이의 메시지 계약으로 옮기는 방법을 설명합니다.",
    "flow": ["Master Data", "Operations Request", "Operations Schedule", "Operations Performance", "Business Feedback"],
    "objects": [["Master Data", "기준정보", "품목, 자원, 공정 정의입니다."], ["Request", "요청", "ERP 또는 계획 시스템이 MES에 주는 실행 요구입니다."], ["Response", "응답", "MES가 가능 여부, 일정, 실적을 반환합니다."], ["Event", "이벤트", "상태 변화와 실행 결과를 비동기로 전달합니다."]],
    "db": [["integration_message", "message_id, message_type, source_system, target_system, object_key, status, created_at"], ["integration_mapping", "mapping_id, isa95_object, external_object, field_map_json, version"]],
    "rules": ["통합 메시지는 객체 ID, source system, version, correlation id를 가져야 합니다.", "동기 API와 비동기 이벤트의 책임을 구분합니다.", "실패 메시지는 재처리 queue와 운영 알림을 가져야 합니다."],
    "tests": ["ERP request 수신", "MES performance 송신", "매핑 version 변경", "실패 메시지 재처리"]
  }
]

def esc(value):
    return html.escape(str(value))

def rows(items):
    return "\n".join(f"<tr>{''.join(f'<td>{cell}</td>' for cell in cells)}</tr>" for cells in items)

def list_to_html(items):
    return f'<ul>{"".join(f"<li>{esc(item)}</li>" for item in items)}</ul>'

def flowSvg(flow):
    width = 185 * len(flow) + 80
    nodes = []
    for index, label in enumerate(flow):
        x = 36 + index * 185
        role = "Input" if index == 0 else "Output" if index == len(flow) - 1 else "Process"
        arrow = f'<path class="arrow" d="M{x + 148} 82 H{x + 180}"></path>' if index < len(flow) - 1 else ""
        nodes.append(f'<g class="node"><rect x="{x}" y="44" width="148" height="76"></rect><text x="{x + 74}" y="75" text-anchor="middle">{esc(label)}</text><text class="tiny" x="{x + 74}" y="100" text-anchor="middle">{role}</text></g>{arrow}')
    return f'<div class="diagram"><svg viewBox="0 0 {width} 164" aria-label="ISA-95 DFD"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2864a8"></path></marker></defs>{"".join(nodes)}</svg></div>'

def getIsa95ActivityPseudocode():
    return """// =================================================================
// [교육용 실무 가이드] ANSI/ISA-95 Level 3 MOM Activity 핵심 트랜잭션 처리 로직
// 본 로직은 설비, 자재, 인력 자원을 동적 제어하고, 실적을 ERP와 동기화하기 위한 
// 분산 트랜잭션과 비즈니스 규칙 엔진의 핵심 흐름을 의사코드로 구현한 것입니다.
// =================================================================
function handleIsa95Activity(command) {
    // [1단계: 요청의 무결성 및 멱등성 검증 (Idempotency Check)]
    // - 분산 환경이나 네트워크 재시도로 인한 동일 메시지 중복 처리 방지.
    // - 감사 추적(Audit Trail)을 위해 유일한 요청 식별자인 Correlation ID 유효성 검증.
    validateCorrelationId(command);

    // [2단계: 표준 기준정보 및 운영 규칙 정의 로드 (Operations Definition)]
    // - ISA-95 모델의 'Operations Definition'(작업 정의)에서 버전 관리(Revision)되는 
    //   작업 표준(Work Master), 소요 시간 제약, 공정 파라미터 규격을 DB에서 동적으로 조회.
    // - 승인되지 않거나 유효기간이 지난 정의는 사용을 사전에 원천 차단.
    const definition = loadOperationsDefinition(command.definitionId, command.revision);

    // [3단계: 실시간 자원 수행 능력 및 가용성 분석 (Operations Capability)]
    // - 작업이 배정될 구역(Area), 설비(Equipment), 작업 그룹의 실시간 능력 상태를 로드.
    // - 단순히 '가용 상태(Available)'인지뿐 아니라, 작업 대상 제품군을 생산할 수 있는 
    //   자격 요건(Qualification)과 정비 일정(PM Due)의 중첩 여부까지 종합 판단.
    const capability = loadOperationsCapability(command.resourceScope, command.timeWindow);

    // [4단계: 대상 물리 객체의 실시간 상태 및 위치 분석 (Physical Object State)]
    // - 추적 대상인 Material Lot, Container, Batch, 또는 특정 설비(Work Unit)의 최신 상태 획득.
    // - 이미 Hold 상태이거나 품질 검사 결과가 부적합인 자재가 투입되는 것을 방지하기 위함.
    const current = loadCurrentState(command.objectId);

    // [5단계: 비즈니스 규칙 엔진(Rules Engine) 기반의 실행 적격 여부 최종 평가]
    // - 로드된 command, definition, capability, current의 결합 조건 분석.
    // - 예: "자격증이 있는 작업자가 배정되었는가?", "자재의 유효일이 만료되지 않았는가?" 등
    // - 복합적인 Validation 규칙을 Rule Engine 또는 도메인 서비스를 통해 처리.
    const decision = evaluateRules(command, definition, capability, current);

    // [6단계: 트랜잭션 추적성 확보를 위한 원시 커맨드 로그 보존 (Command Logging)]
    // - 모든 실시간 요청 데이터는 시스템의 원자성 확보 및 사후 감사(Audit)를 위해 
    //   비휘발성 커맨드 로그 테이블에 즉시 영구 저장(Idempotency Key 매핑 포함).
    saveRawCommand(command);

    // [7단계: 평가 결과에 따른 상태 전이(State Transition) 및 결과 이벤트 발행]
    if (decision.allowed) {
        // ----------------- [정상 흐름 (Normal Flow)] -----------------
        // 7-1. 물리 객체의 상태를 다음 타겟 상태로 전이 (예: READY -> RUNNING)
        updateCurrentState(decision);
        
        // 7-2. 이력 테이블(Genealogy/History Table)에 작업 내용 기록 (작업자, 시각, 사유 포함)
        appendActivityHistory(decision);
        
        // 7-3. Level 4 ERP(실적 전송) 및 Level 2 SCADA/HMI(설비 기동 지시) 측에
        //      비동기 아웃바운드 통합 이벤트 발행 (Message Queue 또는 Webhook)
        publishOperationsEvent(decision);
    } else {
        // ----------------- [예외 흐름 (Exception Flow)] -----------------
        // 7-4. 업무 규칙 위반 시 예외 인스턴스(Exception Record) 생성 및 로깅
        createException(decision.reasonCode);
        
        // 7-5. 실시간 모니터링 경보(Alert) 발생 및 해당 교대조/보전 관리자에게 
        //      푸시 알림 또는 메시징 전송을 통해 조기 개입 유도 (MES 알림 센터 연동)
        notifyOwner(decision.ownerRole);
    }
}"""

def getIsa95ActivityApiExample(domain_key, activity_key):
    template = """// =================================================================
// [실무 연동 설계] ANSI/ISA-95 Level 3 MOM Activity 통합 API 규격
// 이 인터페이스 스펙은 상위 계획 시스템(Level 4 ERP) 및 하위 설비 제어망
// (Level 2 SCADA)과의 실시간 데이터 교환을 위한 RESTful API 구현 가이드라인입니다.
// =================================================================

// -----------------------------------------------------------------
// [API 1] 새로운 커맨드(작업 지시 기동, 상태 변경 제어, 긴급 중단 등) 수신
// -----------------------------------------------------------------
// - Method: POST (멱등성 보장을 위해 클라이언트가 발급한 commandId 필수 포함)
// - Endpoint: /api/isa95/__DOMAIN_KEY__/__ACTIVITY_KEY__/commands
// -----------------------------------------------------------------
POST /api/isa95/__DOMAIN_KEY__/__ACTIVITY_KEY__/commands
Content-Type: application/json
X-Transaction-Id: TX-ISA95-9982741  // 시스템 추적용 글로벌 트랜잭션 고유 ID

{
    // 멱등성 검증용 고유 키 (동일 ID 재전송 시 중복 처리 방지 및 직전 결과 즉시 반환)
    "commandId": "CMD-20260522-0001",
    
    // 대상이 되는 ISA-95 물리적 식별자 (Material Lot, Batch ID, 혹은 Equipment ID)
    "objectId": "LOT-2026-A95",
    
    // 적용할 기준정보 마스터 ID (Operations Definition 식별자)
    "definitionId": "DEF-OP-CELL-A",
    
    // 품질 및 엔지니어링 표준의 변경 여부를 통제하는 버전 마스터 정보
    "revision": "REV-2.1.0",
    
    // 실행 제어 범위 및 물리 공장 영역 (Equipment Hierarchy 상의 Area/Work Center)
    "resourceScope": "AREA-CLEAN-01",
    
    // 실행이 예정된 교대조 시간 프레임 (Shift A/B/C 등)
    "timeWindow": "SHIFT-A",
    
    // ISO 8601 표준을 준수한 메시지 발행 절대 시각
    "timestamp": "2026-05-22T20:10:00Z"
}

// Response: 201 Created (커맨드가 성공적으로 대기 큐에 적재되고 처리가 시작됨)
{
    "commandId": "CMD-20260522-0001",
    "status": "ACCEPTED",
    "queuedAt": "2026-05-22T20:10:02Z",
    "estimatedProcessingMs": 120
}

// -----------------------------------------------------------------
// [API 2] 특정 물리 객체(Lot, Batch 등)의 실시간 운영 상태 및 자격 가용성 조회
// -----------------------------------------------------------------
// - Method: GET
// - Endpoint: /api/isa95/__DOMAIN_KEY__/__ACTIVITY_KEY__/current-state
// -----------------------------------------------------------------
GET  /api/isa95/__DOMAIN_KEY__/__ACTIVITY_KEY__/current-state?objectId=LOT-2026-A95
Accept: application/json

// Response: 200 OK
{
    "objectId": "LOT-2026-A95",
    // 현재 공정 진행 상태 (ISA-95 표준 상태 기계 반영: WAITING, IN_PROGRESS, PAUSED, COMPLETED, HELD)
    "currentState": "IN_PROGRESS",
    // 마지막 상태 전이 변경 완료 절대 시간
    "lastUpdated": "2026-05-22T20:12:30Z",
    // 상태 변화를 지시한 실 사용자 및 관련 설비 ID 정보
    "context": {
        "operatorId": "OP-USER-092",
        "workCenterId": "WCTR-MACHINING-01"
    }
}

// -----------------------------------------------------------------
// [API 3] 사후 감사 및 품질 Genealogy 추적을 위한 상태 전이 이력(Audit Trail) 조회
// -----------------------------------------------------------------
// - Method: GET
// - Endpoint: /api/isa95/__DOMAIN_KEY__/__ACTIVITY_KEY__/history
// - Query Parameters: from (조회 시작 시간), to (조회 종료 시간)
// -----------------------------------------------------------------
GET  /api/isa95/__DOMAIN_KEY__/__ACTIVITY_KEY__/history?from=2026-05-22T00:00:00Z&to=2026-05-22T23:59:59Z"""
    return template.replace("__DOMAIN_KEY__", domain_key).replace("__ACTIVITY_KEY__", activity_key)

def getIsa95ModelPseudocode():
    return """// =================================================================
// [교육용 실무 가이드] ANSI/ISA-95 Level 3 MOM Model 계층구조 검증 로직
// 설비(Equipment), 자재(Material), 인력(Personnel) 모델의 트리형 계층구조
// 모델링 시 발생하기 쉬운 논리적 무결성 결함(순환 참조, 한계 깊이 초과, 
// 타입 매핑 오류)을 실시간으로 탐지하고 예방하는 핵심 밸리데이터 로직입니다.
// =================================================================
function validateModelHierarchy(nodeId, parentId) {
    // [1단계: 순환 참조(Circular Reference) 방지를 위한 깊이 우선(DFS) 그래프 무결성 검증]
    // - 계층구조에서 자식이 부모의 조상이 되는 치명적 논리 오류를 원천 방지하기 위함.
    // - 추가하려는 상위 노드(parentId)로부터 최상위 루트 노드까지 추적(Trace up).
    const path = [];
    let currentParent = parentId;
    
    while (currentParent) {
        // 만약 상위 경로를 거슬러 올라가다가 나 자신(nodeId)을 다시 만나면 순환 발생!
        if (currentParent === nodeId) {
            throw new Error("모델 구조 설계 위반 (Circular Reference): 상위 노드 계층 경로에 자기 자신(" + nodeId + ")이 포함될 수 없습니다.");
        }
        path.push(currentParent);
        // 데이터베이스에서 해당 노드의 부모 ID를 실시간 조회
        currentParent = getParentNodeId(currentParent);
    }
    
    // [2단계: 시스템 성능 저하 방지 및 관리 가독성을 위한 계층 깊이(Depth) 한계 검증]
    // - ISA-95 표준은 대규모 제조 시스템에서도 최대 7단계 이내의 깊이 유지를 권장함.
    // - 지나치게 깊은 계층 모델은 쿼리 조인(Join) 성능 및 현장 모니터링의 복잡성을 가중시킴.
    if (path.length > 7) {
        throw new Error("설계 한계 초과: ISA-95 표준 공장 모델의 추천 깊이는 최대 7단계입니다. 현재 요구 단계: " + path.length + "단계");
    }
    
    // [3단계: 설비 계층 간의 상하 관계 유효성 규칙(Type Mapping Matrix) 검증]
    // - 예: Enterprise 하위에 바로 Work Unit(개별 장비)이 오거나 Area 하위에 Site가 올 수 없음.
    // - 상위 노드 타입(Parent Type)과 하위 노드 타입(Node Type) 간 적합한 매핑 행렬 검사.
    const nodeType = getNodeType(nodeId);       // 예: WorkCenter, EquipmentClass, Area 등
    const parentType = getNodeType(parentId);   // 예: Site, Enterprise, Area 등
    const isValidMapping = checkHierarchyTypeMapping(parentType, nodeType);
    
    if (!isValidMapping) {
        throw new Error("계층 규칙 위반 (Hierarchy Type Mismatch): " + parentType + " 하위에 " + nodeType + "을(를) 물리적으로 배치할 수 없습니다. 관계 규칙 정의를 재검증하십시오.");
    }
    
    // [4단계: 안전한 DB 변경 반영 및 비동기 모델 변경 전파 이벤트 발행 (Event Sourcing)]
    // - 데이터 무결성이 최종 확인되면 물리 계층 구조 매핑 테이블 정보를 트랜잭셔널하게 저장.
    saveModelLink(nodeId, parentId);
    
    // - 타 외부 시스템(PLM, ERP, MES 스케줄러 등)과 동기화를 위해 모델 변경 이벤트 발행.
    publishModelEvent("HIERARCHY_CHANGED", { 
        nodeId: nodeId, 
        newParentId: parentId, 
        changePath: path,
        timestamp: new Date().toISOString()
    });
}"""

def getIsa95ModelApiExample():
    return """// =================================================================
// [실무 연동 설계] ANSI/ISA-95 Level 3 MOM Model 표준 통합 API 스펙
// 이 인터페이스는 ERP/PLM 기준정보와 MES 물리/조직 계층 구조를 동기화하고,
// 설비 자원 트리 정보를 다양한 클라이언트 화면에 고속 전송하기 위해 설계되었습니다.
// =================================================================

// -----------------------------------------------------------------
// [API 1] 외부 시스템(PLM/ERP) 또는 마스터 디자이너로부터 계층 링크 동적 수정/생성
// -----------------------------------------------------------------
// - Method: POST (리소스 생성 및 상위 계층 변경 매핑 처리)
// - Endpoint: /api/isa95/models/hierarchy/links
// -----------------------------------------------------------------
POST /api/isa95/models/hierarchy/links
Content-Type: application/json
Accept-Language: ko-KR

{
    // 변경할 대상 설비 또는 자원 노드 식별 코드 (예: CNC 선반 장비)
    "nodeId": "EQP-CNC-05",
    
    // 새롭게 부모로 배정할 상위 워크 센터 식별 코드 (가공 1조 가공센터)
    "parentNodeId": "WCTR-MACHINING-01",
    
    // 해당 계층 관계가 현장에 실제로 적용되어 발효되는 시작 절대 시각
    "effectiveFrom": "2026-05-22T20:00:00Z",
    
    // 설계 변경을 최종 지시한 시스템 모듈 또는 아키텍트 계정 식별자
    "updatedBy": "SYS-ARCH-99"
}

Response: 200 OK (변경 유효성 검증 성공 및 마스터 DB 반영 완료)
{
    // 새로 생성된 계층 매핑 링크의 고유 트랜잭션 식별자
    "linkId": "LNK-8392849182",
    "nodeId": "EQP-CNC-05",
    "parentNodeId": "WCTR-MACHINING-01",
    // 현재 연결 상태 (ACTIVE: 유효 작동 중, PENDING: 유효 시작 전, ARCHIVED: 폐기 이력)
    "status": "ACTIVE",
    "verifiedAt": "2026-05-22T20:01:15Z"
}

// -----------------------------------------------------------------
// [API 2] 특정 공장 영역(Area/Work Center) 하위의 전체 물리 설비 서브트리(Subtree) 조회
// -----------------------------------------------------------------
// - Method: GET
// - Endpoint: /api/isa95/models/hierarchy/tree
// - Query Parameters: rootNodeId (검색 기점이 될 부모 노드 ID)
// -----------------------------------------------------------------
GET  /api/isa95/models/hierarchy/tree?rootNodeId=WCTR-MACHINING-01"""

def pageShell(title, subtitle, chips, crumbs, cssHref, body):
    chips_html = "".join(f'<span class="chip">{esc(chip)}</span>' for chip in chips)
    return f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{esc(title)}</title>
  <link rel="stylesheet" href="{cssHref}">
</head>
<body>
  <main class="page">
    {crumbs}
    <section class="hero">
      <h1>{esc(title)}</h1>
      <p>{esc(subtitle)}</p>
      <div class="chips">{chips_html}</div>
    </section>
    {body}
  </main>
</body>
</html>
"""

def activityFilename(domain, activity):
    return f"{domain['key']}-{activity['key']}.html"

def renderActivity(domain, activity):
    title = f"{domain['ko']} - {activity['ko']}"
    flow = [f"{domain['ko']} 요청", "기준정보/자원 확인", activity["flowVerb"], "상태와 이력 저장", "성과/통합 피드백"]
    db = [
        [f"{domain['dbPrefix']}_{activity['key'].replace('-', '_')}_rule", "rule_id, revision, domain, rule_type, condition_json, action_json, active_flag"],
        [f"{domain['dbPrefix']}_{activity['key'].replace('-', '_')}_state", "object_id, object_type, current_state, reason_code, updated_at, owner_system"],
        [f"{domain['dbPrefix']}_{activity['key'].replace('-', '_')}_history", "history_id, object_id, event_type, before_state, after_state, event_time, payload_json"],
        [f"{domain['dbPrefix']}_{activity['key'].replace('-', '_')}_exception", "exception_id, object_id, severity, reason_code, disposition, created_at, closed_at"]
    ]
    scopeRows = [[
        f"<strong>{index + 1}. {esc(scope)}</strong>",
        f"{domain['object']}의 실행 조건을 표준화합니다." if index == 0 else f"{domain['mainResource']}와 연결하여 현장 판단을 자동화합니다.",
        "화면, API, 상태 테이블, 이력 테이블, 권한 정책으로 구현합니다."
    ] for index, scope in enumerate(activity["scope"])]

    flowRows = []
    for i, step in enumerate(flow):
        if i == 0:
            row_desc = "상위 계획, 현장 요청, 외부 시스템 이벤트가 들어오는 단계입니다."
            row_save = "source system, correlation id, 수신 시각을 저장합니다."
        elif i == len(flow) - 1:
            row_desc = "ERP, APS, KPI, 데이터 플랫폼 또는 다른 MOM activity로 결과를 넘깁니다."
            row_save = "상태, 이력, 오류 사유, 기준정보 revision을 남깁니다."
        else:
            row_desc = "ISA-95 Level 3에서 검증, 판단, 실행 상태 전이를 수행합니다."
            row_save = "상태, 이력, 오류 사유, 기준정보 revision을 남깁니다."
        flowRows.append([f"<strong>{i + 1}. {esc(step)}</strong>", row_desc, row_save])

    body = f"""
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
      <div class="callout">{esc(notice)}</div>
      <p><strong>핵심 질문:</strong> {esc(activity['ko'])} 활동은 {esc(domain['ko'])}에서 어떤 결정을 표준화하고, 어떤 객체의 상태를 바꾸며, 어떤 실적을 남기는가?</p>
    </section>

    <section id="concept" class="section">
      <h2>1. 활동 목적과 ISA-95 위치</h2>
      <p>{esc(activity['intent'])} {esc(domain['goal'])}</p>
      <div class="two-col">
        <div class="card"><strong>ISA-95 관점</strong><span>{esc(domain['en'])}의 activity 중 하나로, Level 4의 계획과 Level 2/1의 실제 제어 사이에서 실행 가능한 업무 판단을 담당합니다.</span></div>
        <div class="card"><strong>학생에게 설명하는 비유</strong><span>계획표가 있어도 지금 실행할 수 있는지, 필요한 조건이 맞는지, 실행 결과를 어떻게 기록할지 정하지 않으면 현장은 움직이지 않습니다. 이 activity는 그 판단 규칙을 담당합니다.</span></div>
      </div>
      <h3>현장 예시</h3>
      {list_to_html(domain['examples'])}
    </section>

    <section id="scope" class="section">
      <h2>2. 기능 범위</h2>
      <p>{esc(title)}는 아래 범위를 하나의 업무 서비스로 묶어 생각하면 이해가 쉽습니다. 각 범위는 요구사항, 화면, API, 테스트 케이스로 이어집니다.</p>
      <table>
        <thead><tr><th>범위</th><th>업무 의미</th><th>구현 산출물</th></tr></thead>
        <tbody>{rows(scopeRows)}</tbody>
      </table>
    </section>

    <section id="dfd" class="section">
      <h2>3. Activity DFD</h2>
      {flowSvg(flow)}
      <p style="margin-top:14px">이 DFD는 ISA-95 activity를 코드로 옮길 때의 기본 흐름입니다. 핵심은 입력을 바로 실행하지 않고 기준정보, 자원 상태, 권한, 품질 조건을 거쳐 상태와 이력을 남기는 것입니다.</p>
      <table>
        <thead><tr><th>단계</th><th>처리 의미</th><th>저장/검증 포인트</th></tr></thead>
        <tbody>{rows(flowRows)}</tbody>
      </table>
    </section>

    <section id="model" class="section">
      <h2>4. 권장 데이터 모델</h2>
      <p>ISA-95 activity는 object request, schedule, performance와 연결되어야 합니다. 현재 상태와 이력을 분리하고, 기준정보 revision을 반드시 보존합니다.</p>
      <table>
        <thead><tr><th>테이블</th><th>주요 컬럼</th><th>설계 이유</th></tr></thead>
        <tbody>{rows([[f"<strong>{esc(table)}</strong>", f"<code>{esc(cols)}</code>", "규칙, 현재 상태, 실행 이력, 예외 처리를 분리하여 재처리와 감사 추적을 가능하게 합니다."] for table, cols in db])}</tbody>
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
        <tbody>{rows([[f"BR-{str(i + 1).zfill(2)}", esc(rule), "Domain Service, Rule Engine, DB constraint, Workflow, Integration Contract로 구현"] for i, rule in enumerate(activity['rules'])])}</tbody>
      </table>
      <h3>의사코드</h3>
      <pre class="codebox"><code>{esc(getIsa95ActivityPseudocode())}</code></pre>
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
      <pre class="codebox"><code>{esc(getIsa95ActivityApiExample(domain['key'], activity['key']))}</code></pre>
    </section>

    <section id="test" class="section">
      <h2>7. 테스트 시나리오</h2>
      <table>
        <thead><tr><th>테스트 ID</th><th>시나리오</th><th>기대 결과</th></tr></thead>
        <tbody>{rows([[f"TC-{str(i + 1).zfill(2)}", esc(test), "상태, 이력, 예외, 통합 메시지, 권한 결과가 설계와 일치해야 합니다."] for i, test in enumerate(activity['tests'])])}</tbody>
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
      {list_to_html([
        "현재 상태와 마지막 정상 이벤트, 마지막 오류 이벤트를 한 화면에서 확인할 수 있다.",
        "모든 action은 실행자, 시각, 변경 전/후 상태, 사유, correlation id를 남긴다.",
        "외부 시스템 연동 실패 시 재처리 queue와 운영 알림이 있다.",
        "기준정보 변경 시 진행 중 작업과 미래 작업의 영향도를 조회할 수 있다.",
        "성과 분석과 추적 모델에서 이 activity의 이력을 재사용할 수 있다."
      ])}
    </section>"""
    return pageShell(
        title,
        f"{domain['en']} / {activity['en']}. {activity['intent']}",
        ["ANSI/ISA-95", domain["en"], activity["en"]],
        f'<div class="crumbs"><a href="../ISA95_MES_Overview.html">ISA-95 MES Model</a> / {esc(domain["ko"])} / {esc(activity["ko"])}</div>',
        "../isa95-page.css",
        body
    )

def renderModel(model):
    flowRows = [[
        f"<strong>{i + 1}. {esc(step)}</strong>",
        "상위 개념 또는 입력 객체입니다." if i == 0 else "하위 시스템이나 통합 메시지가 사용하는 결과입니다." if i == len(model["flow"]) - 1 else "관계, 계층, 상태 또는 능력을 해석하는 중간 모델입니다.",
        "ID, parent 관계, revision, owner system, effective date를 관리합니다."
    ] for i, step in enumerate(model["flow"])]

    body = f"""
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
      <div class="callout">{esc(notice)}</div>
    </section>

    <section id="concept" class="section">
      <h2>1. 모델 목적</h2>
      <p>{esc(model['summary'])}</p>
      <p>ISA-95 모델은 화면 이름을 정하는 용도가 아니라 시스템 사이의 데이터 계약을 정하는 기준입니다. 같은 설비, 자재, 작업 요청을 ERP, MES, SCADA가 서로 다르게 해석하면 통합 비용이 커지므로 객체의 경계와 관계를 먼저 맞춰야 합니다.</p>
    </section>

    <section id="structure" class="section">
      <h2>2. 핵심 구조</h2>
      <table>
        <thead><tr><th>객체</th><th>역할</th><th>수업식 해설</th></tr></thead>
        <tbody>{rows([[f"<strong>{esc(obj[0])}</strong>", esc(obj[1]), esc(obj[2])] for obj in model['objects']])}</tbody>
      </table>
    </section>

    <section id="dfd" class="section">
      <h2>3. 모델 객체 지향 DFD</h2>
      {flowSvg(model['flow'])}
      <p style="margin-top:14px">이 구조는 계획 단계부터 물리 실행까지 데이터가 흐르며 가공되는 순서입니다. 각 계층마다 데이터 식별자(ID)가 상위 객체와 연결되어 무결성을 검증합니다.</p>
      <table>
        <thead><tr><th>계층/단계</th><th>역할 범위</th><th>식별 설계</th></tr></thead>
        <tbody>{rows(flowRows)}</tbody>
      </table>
    </section>

    <section id="data" class="section">
      <h2>4. 핵심 데이터 테이블 및 컬럼</h2>
      <table>
        <thead><tr><th>테이블</th><th>주요 컬럼</th><th>설계 의미</th></tr></thead>
        <tbody>{rows([[f"<strong>{esc(t)}</strong>", f"<code>{esc(c)}</code>", "계층 구조와 수행 능력을 분리하여 유연한 자원 할당과 스케줄을 지원합니다."] for t, c in model['db']])}</tbody>
      </table>
    </section>

    <section id="logic" class="section">
      <h2>5. 설계 규칙</h2>
      <table>
        <thead><tr><th>규칙 ID</th><th>설계 표준 및 위반 조치</th><th>반영 방식</th></tr></thead>
        <tbody>{rows([[f"DR-{str(i + 1).zfill(2)}", esc(rule), "Entity/Aggregate Root 제약 및 Domain Service 밸리데이터 구현"] for i, rule in enumerate(model['rules'])])}</tbody>
      </table>
      <h3>의사코드</h3>
      <pre class="codebox"><code>{esc(getIsa95ModelPseudocode())}</code></pre>
    </section>

    <section id="integration" class="section">
      <h2>6. Level 4 (ERP) - Level 3 (MES) 통합 API 스펙</h2>
      <p>통합 객체 모델은 타 시스템과 데이터를 안전하게 전달받기 위한 JSON 계약 문서의 기반이 됩니다.</p>
      <h3>API 예시</h3>
      <pre class="codebox"><code>{esc(getIsa95ModelApiExample())}</code></pre>
    </section>

    <section id="test" class="section">
      <h2>7. 테스트 시나리오</h2>
      <table>
        <thead><tr><th>테스트 ID</th><th>시나리오</th><th>기대 결과</th></tr></thead>
        <tbody>{rows([[f"TC-{str(i + 1).zfill(2)}", esc(test), "계층 매핑, 상태 변경, 예외 전파, 권한 통제가 설계서와 완벽히 호환되어야 합니다."] for i, test in enumerate(model['tests'])])}</tbody>
      </table>
    </section>

    <section id="ops" class="section">
      <h2>8. 운영 체크리스트</h2>
      {list_to_html([
        "계층 트리 조회가 0.5초 이내에 완료되며, 실시간 캐싱 정책이 적용되어 있다.",
        "노드 추가, 이동, 비활성 시 관련 하위 노드와 스케줄링 자원에 미치는 영향이 즉시 경고로 표시된다.",
        "ERP, PLM 등 외부 시스템과의 ID 불일치가 발생할 경우 에러 큐에 저장되고 관리자에게 알림이 간다.",
        "모든 구조 변경은 감사 추적(Audit Trail)을 위해 변경자, 변경일자, 변경 전후의 JSON 스냅샷을 영구 보존한다."
      ])}
    </section>"""
    return pageShell(
        model["titleKo"],
        model["titleEn"],
        ["ANSI/ISA-95", "Data Model", model["titleEn"]],
        f'<div class="crumbs"><a href="../ISA95_MES_Overview.html">ISA-95 MES Model</a> / 모델 / {esc(model["titleKo"])}</div>',
        "../isa95-page.css",
        body
    )

# 1. Generate Domain & Activity HTML Files
for domain in domains:
    for activity in activities:
        filename = activityFilename(domain, activity)
        filepath = os.path.join(activities_dir, filename)
        with open(filepath, "w", encoding="utf8") as f:
            f.write(renderActivity(domain, activity))

# 2. Generate Model HTML Files
for model in models:
    filepath = os.path.join(models_dir, model["file"])
    with open(filepath, "w", encoding="utf8") as f:
        f.write(renderModel(model))

# 3. Generate Overview Page
overview_html = f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ISA-95 MOM 가이드</title>
  <link rel="stylesheet" href="isa95-page.css">
</head>
<body>
  <main class="page">
    <div class="crumbs">ISA-95 MES Model</div>
    <section class="hero">
      <h1>ISA-95 MOM/MES 표준 가이드</h1>
      <p>ANSI/ISA-95 표준에 따른 MOM(Manufacturing Operations Management) 4대 도메인, 8대 활동(Activity) 및 핵심 객체/관계 데이터 모델 해설 가이드입니다.</p>
      <div class="chips">
        <span class="chip">ANSI/ISA-95</span>
        <span class="chip">Level 3 / MOM</span>
        <span class="chip">MOM 4대 도메인</span>
      </div>
    </section>

    <section class="section">
      <h2>MOM 4대 기능 도메인</h2>
      <p>ISA-95는 Level 3 영역을 생산, 보전, 품질, 재고 4가지의 독립된 운영 관리 영역으로 분류합니다.</p>
      <div class="list">
        {"".join(f'<div class="card"><strong>{esc(d["ko"])}</strong><span>{esc(d["en"])}. {esc(d["goal"])}</span></div>' for d in domains)}
      </div>
    </section>

    <section class="section">
      <h2>MOM 8대 활동 모델 (Activity Model)</h2>
      <p>4대 도메인 각각은 8가지의 공통 실행 활동 흐름으로 채워집니다. 아래의 각 링크를 통해 상세한 업무 프로세스, 의사코드, API 설계를 확인할 수 있습니다.</p>
      
      <h3>생산 운영 관리 (Production)</h3>
      <div class="list">
        {"".join(f'<a href="activities/production-{a["key"]}.html"><strong>{esc(a["ko"])}</strong><span class="muted">{esc(a["en"])}</span></a>' for a in activities)}
      </div>

      <h3>보전 운영 관리 (Maintenance)</h3>
      <div class="list">
        {"".join(f'<a href="activities/maintenance-{a["key"]}.html"><strong>{esc(a["ko"])}</strong><span class="muted">{esc(a["en"])}</span></a>' for a in activities)}
      </div>

      <h3>품질 운영 관리 (Quality)</h3>
      <div class="list">
        {"".join(f'<a href="activities/quality-{a["key"]}.html"><strong>{esc(a["ko"])}</strong><span class="muted">{esc(a["en"])}</span></a>' for a in activities)}
      </div>

      <h3>재고 운영 관리 (Inventory)</h3>
      <div class="list">
        {"".join(f'<a href="activities/inventory-{a["key"]}.html"><strong>{esc(a["ko"])}</strong><span class="muted">{esc(a["en"])}</span></a>' for a in activities)}
      </div>
    </section>

    <section class="section">
      <h2>ISA-95 핵심 데이터/객체 모델</h2>
      <p>ERP와 MES가 같은 의미로 소통할 수 있도록 ISA-95가 정의한 공통 객체 모델 목록입니다.</p>
      <div class="list">
        {"".join(f'<a href="models/{m["file"]}"><strong>{esc(m["titleKo"])}</strong><span class="muted">{esc(m["titleEn"])}</span></a>' for m in models)}
      </div>
    </section>
  </main>
</body>
</html>"""

with open(os.path.join(root, "ISA95_MES_Overview.html"), "w", encoding="utf8") as f:
    f.write(overview_html)

print("[성공] 총 32개의 ISA-95 활동 문서, 12개의 모델 문서 및 종합 오버뷰 가이드를 빌드 완료했습니다.")
