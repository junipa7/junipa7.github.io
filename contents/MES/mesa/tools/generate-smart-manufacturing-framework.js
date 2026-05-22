const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const lifecycleDir = path.join(root, "lifecycles");
const threadDir = path.join(root, "threads");
const technologyDir = path.join(root, "technologies");

const sourceNote = "이 문서는 MESA International의 최신 MESA Model: A Framework for Smarter Manufacturing 구조를 교육용으로 재구성한 자료입니다. MESA가 공개한 세 가지 주요 개념인 Lifecycle, Cross-Lifecycle Thread, Enabling Technology를 기준으로 MES/MOM 설계 관점의 액티비티, 데이터 모델, DFD, 구현 포인트를 정리했습니다.";

const concepts = [
  {
    type: "lifecycle",
    dir: lifecycleDir,
    title: "Lifecycles",
    ko: "라이프사이클",
    description: "제조 기업이 최적화해야 하는 업무 프로세스와 가치 흐름입니다. 스마트 제조는 각 라이프사이클을 더 연결되고 투명하며 실시간으로 만들려는 활동입니다.",
    items: [
      {
        slug: "production",
        name: "Production",
        ko: "생산 라이프사이클",
        summary: "제품을 실제로 만들기 위한 계획, 준비, 실행, 품질 확인, 실적 피드백의 흐름입니다.",
        student: "학교 실습으로 보면 과제 지시를 받고, 재료와 장비를 준비하고, 실습을 수행하고, 결과를 채점받는 전체 흐름입니다.",
        flow: ["수요/작업 요청", "생산 기준정보", "자원/자재 준비", "작업 실행", "품질/실적 피드백"],
        activities: [
          ["생산 요구 변환", "ERP/APS의 생산 계획을 MES 작업 오더, lot, batch, serial 단위로 변환합니다."],
          ["작업 준비 검증", "설비, recipe, 자재, 작업자, 문서, 품질 hold 여부를 확인합니다."],
          ["현장 실행 제어", "Start, pause, resume, complete, abort 상태 전이를 관리합니다."],
          ["실적 및 손실 분석", "수량, cycle time, scrap, rework, downtime, schedule adherence를 분석합니다."]
        ],
        db: [
          ["sm_production_order", "order_id, product_id, route_id, quantity, due_date, priority, status"],
          ["sm_production_execution", "execution_id, order_id, lot_id, resource_id, start_time, end_time, result"],
          ["sm_production_loss", "loss_id, execution_id, loss_type, reason_code, duration_sec, quantity_loss"]
        ],
        rules: ["작업 시작 전 자원, 자재, recipe, 문서, 품질 상태를 모두 검증합니다.", "실제 사용 자원은 계획 자원과 다를 수 있으므로 actual 이력으로 별도 저장합니다.", "작업 완료는 필수 수집 데이터와 품질 판정이 충족된 후 확정합니다."],
        tests: ["작업 오더 생성과 lot 분해", "자재 부족 시 시작 차단", "작업 완료 실적 ERP 피드백", "scrap/rework 실적 분석"]
      },
      {
        slug: "production-asset",
        name: "Production Asset",
        ko: "생산 자산 라이프사이클",
        summary: "설비, 금형, 치공구, 계측기, 로봇, 자동화 장치 같은 생산 자산의 도입부터 운영, 보전, 개선, 폐기까지 관리합니다.",
        student: "실습실의 장비를 구매하고, 설치하고, 점검하고, 고장 나면 수리하고, 오래되면 교체하는 전체 과정입니다.",
        flow: ["자산 도입", "설치/검증", "운영 상태", "보전/개선", "교체/폐기"],
        activities: [
          ["자산 기준정보 관리", "자산 ID, serial, vendor, 위치, capability, owner를 정의합니다."],
          ["설치 및 qualification", "설비가 생산에 투입되기 전 검증, 교정, 안전 확인을 수행합니다."],
          ["상태/성능 모니터링", "가동 상태, health, alarm, utilization, energy, condition data를 수집합니다."],
          ["보전 및 수명주기 최적화", "PM, CBM, spare part, MTBF/MTTR, 교체 판단을 관리합니다."]
        ],
        db: [
          ["sm_asset_master", "asset_id, asset_type, serial_no, vendor, install_date, lifecycle_state"],
          ["sm_asset_status_history", "asset_id, status, reason_code, start_time, end_time, source"],
          ["sm_asset_maintenance", "maintenance_id, asset_id, work_type, action_code, technician_id, result"]
        ],
        rules: ["교정 또는 qualification이 만료된 자산은 생산 사용을 제한합니다.", "자산 교체는 제품 genealogy와 품질 영향 분석에 연결합니다.", "상태 기반 보전은 센서 데이터 품질과 threshold revision을 함께 관리합니다."],
        tests: ["자산 설치 이력 생성", "교정 만료 자산 사용 차단", "고장 후 보전 작업 오더 생성", "자산 교체 영향 lot 조회"]
      },
      {
        slug: "product",
        name: "Product",
        ko: "제품 라이프사이클",
        summary: "제품 아이디어, 설계, 공정 정의, 변경, 생산, 품질, 서비스/폐기까지 제품 정보를 디지털 스레드로 연결합니다.",
        student: "한 제품이 설계 도면에서 출발해 실제 생산 방법, 검사 기준, 출하 이력까지 이어지는 성장 기록입니다.",
        flow: ["제품 정의", "공정/품질 기준", "생산 적용", "변경 관리", "제품 이력/개선"],
        activities: [
          ["제품 기준정보 연결", "PLM의 BOM, BOP, spec, drawing을 MES 실행 기준으로 연결합니다."],
          ["공정/검사 기준 관리", "routing, recipe, inspection plan, control plan을 제품 revision별로 관리합니다."],
          ["변경 영향 분석", "ECO/ECN 변경이 진행 중 lot, 재고, 고객 주문에 미치는 영향을 판단합니다."],
          ["제품 genealogy와 피드백", "생산/품질/고객 불만 데이터를 제품 개선으로 되돌립니다."]
        ],
        db: [
          ["sm_product_definition", "product_id, revision, lifecycle_state, owner, effective_from"],
          ["sm_product_process_binding", "product_id, revision, route_id, recipe_id, inspection_plan_id"],
          ["sm_product_change_impact", "change_id, product_id, affected_lot_id, impact_type, disposition"]
        ],
        rules: ["제품 revision과 공정 revision은 독립적이지만 작업 시작 시점에는 호환성이 검증되어야 합니다.", "변경 적용일 전후 생산품은 다른 기준으로 trace되어야 합니다.", "고객 품질 이슈는 제품 정의와 생산 조건까지 역추적 가능해야 합니다."],
        tests: ["제품 revision별 routing 조회", "ECO 적용 대상 lot 산출", "구 revision 생산 차단", "고객 불량에서 생산 조건 역추적"]
      },
      {
        slug: "supply-chain",
        name: "Supply Chain",
        ko: "공급망 라이프사이클",
        summary: "공급업체, 입고, 자재 추적, 수요 변동, 물류, 재고, 출하를 연결하여 제조 흐름을 끊기지 않게 합니다.",
        student: "실습 재료가 제때 오지 않으면 수업을 못 하듯, 공급망은 생산이 멈추지 않게 재료와 정보를 연결하는 활동입니다.",
        flow: ["수요/공급 계획", "입고/검사", "재고/보관", "생산 투입", "출하/고객 피드백"],
        activities: [
          ["공급망 가시성", "PO, ASN, 입고, 검사, 재고 위치, 생산 투입 상태를 연결합니다."],
          ["자재 신뢰성 관리", "공급업체, lot, CoA, 검사 결과, 보관 조건을 추적합니다."],
          ["재고 최적화", "FEFO/FIFO, safety stock, shortage risk, excess stock을 관리합니다."],
          ["공급망 이벤트 대응", "납기 지연, 품질 hold, 대체 자재 승인, 출하 차질을 처리합니다."]
        ],
        db: [
          ["sm_supply_material_lot", "material_lot_id, supplier_id, po_no, item_code, quantity, status"],
          ["sm_supply_movement", "movement_id, material_lot_id, from_location, to_location, event_time, reason"],
          ["sm_supply_risk_event", "risk_id, supplier_id, material_id, risk_type, severity, mitigation"]
        ],
        rules: ["입고 자재는 품질 release 전 생산 투입을 제한할 수 있어야 합니다.", "대체 자재는 제품/고객/공정별 승인 조건을 따라야 합니다.", "공급망 이벤트는 생산 스케줄 영향 분석과 연결합니다."],
        tests: ["입고 lot 생성", "품질 hold 자재 투입 차단", "대체 자재 승인 workflow", "공급 지연으로 생산 영향 조회"]
      },
      {
        slug: "workforce",
        name: "Workforce",
        ko: "인력 라이프사이클",
        summary: "작업자, 엔지니어, 품질 담당자, 보전 담당자의 역량, 교육, 배치, 안전, 지식 전수를 관리합니다.",
        student: "좋은 장비가 있어도 사용할 수 있는 사람이 없으면 생산할 수 없습니다. 인력 라이프사이클은 사람의 준비도와 역량을 관리합니다.",
        flow: ["역할/역량 정의", "교육/자격", "근무/배치", "작업 지원", "성과/재교육"],
        activities: [
          ["Skill matrix 관리", "제품, 공정, 설비, 품질 승인별 자격과 만료일을 관리합니다."],
          ["작업자 배치 최적화", "shift, 휴식, 안전, 숙련도, 업무 부하를 고려해 배치합니다."],
          ["디지털 작업 지원", "전자 작업지시, AR/모바일 가이드, 예외 대응 지식을 제공합니다."],
          ["역량 피드백", "품질 이슈, 작업 실적, near miss를 교육과 개선 활동으로 연결합니다."]
        ],
        db: [
          ["sm_workforce_person", "person_id, department, role, active_flag"],
          ["sm_workforce_skill", "person_id, skill_code, level, certified_at, expires_at"],
          ["sm_workforce_assignment", "assignment_id, person_id, work_id, role, start_time, end_time"]
        ],
        rules: ["자격 만료자는 해당 작업의 시작 또는 승인을 수행할 수 없습니다.", "작업자 변경은 genealogy와 품질 이력에 남겨야 합니다.", "안전/교육 필수 작업은 교육 확인 전 dispatch하지 않습니다."],
        tests: ["자격 보유 작업자 배정", "교육 미이수 작업 차단", "작업자 변경 이력 저장", "품질 이슈 후 재교육 대상 생성"]
      },
      {
        slug: "order-to-cash",
        name: "Order-to-Cash",
        ko: "주문-현금화 라이프사이클",
        summary: "고객 주문에서 생산 가능성, 납기 약속, 제조, 출하, 청구, 고객 피드백까지 연결합니다.",
        student: "주문을 받고 제품을 만들어 보내고 대금을 받는 전체 흐름입니다. 스마트 제조에서는 이 흐름이 생산 현장 데이터와 실시간으로 연결됩니다.",
        flow: ["고객 주문", "가능 납기/원가", "생산/품질 실행", "출하/청구", "고객 피드백"],
        activities: [
          ["주문 실행 가능성 확인", "capacity, 재고, 자재, 품질 제약을 고려해 약속 가능한 납기를 판단합니다."],
          ["주문-생산 연결", "주문, 작업 오더, lot, shipment를 end-to-end로 연결합니다."],
          ["출하 품질 보증", "release, CoC/CoA, trace report, 고객 요구사항을 확인합니다."],
          ["비즈니스 피드백", "납기 준수, 원가, 품질 비용, 고객 클레임을 분석합니다."]
        ],
        db: [
          ["sm_otc_customer_order", "customer_order_id, customer_id, product_id, quantity, promised_date, status"],
          ["sm_otc_order_link", "customer_order_id, work_order_id, lot_id, shipment_id, link_type"],
          ["sm_otc_fulfillment_kpi", "customer_order_id, on_time_flag, cost_variance, quality_cost, closed_at"]
        ],
        rules: ["납기 약속은 실제 capacity와 자재 availability를 기준으로 계산해야 합니다.", "고객 주문과 생산 lot 연결은 출하 후에도 추적 가능해야 합니다.", "고객별 품질/문서 요구사항은 출하 release 조건에 포함합니다."],
        tests: ["주문별 가능 납기 산출", "주문-lot-shipment 연결", "출하 전 품질 문서 검증", "납기 지연 원인 분석"]
      }
    ]
  },
  {
    type: "thread",
    dir: threadDir,
    title: "Cross-Lifecycle Threads",
    ko: "교차 라이프사이클 스레드",
    description: "여러 라이프사이클을 관통해 특정 목표를 달성하게 만드는 공통 주제입니다. 품질, 규제, 지속가능성, 보안 같은 주제는 생산 하나의 기능으로 끝나지 않고 전사 프로세스를 연결합니다.",
    items: [
      {
        slug: "quality",
        name: "Quality",
        ko: "품질 스레드",
        summary: "제품, 공정, 설비, 자재, 인력 데이터를 연결해 품질을 사후 검사에서 사전 예방과 실시간 제어로 확장합니다.",
        student: "시험 끝난 뒤 채점만 하는 것이 아니라, 공부하는 중간에 틀린 방법을 바로 알려주는 피드백 체계입니다.",
        flow: ["품질 기준", "공정/자재 데이터", "실시간 판정", "Hold/조치", "품질 개선 피드백"],
        activities: [
          ["품질 기준 연결", "제품 spec, control plan, inspection plan, customer requirement를 실행 기준으로 연결합니다."],
          ["실시간 품질 신호", "SPC, FDC, anomaly, trend를 생산 실행과 연결합니다."],
          ["부적합 의사결정", "Hold, release, rework, scrap, concession, CAPA를 관리합니다."],
          ["품질 원인 분석", "자재, 설비, 작업자, recipe, 환경 조건과 불량을 연결합니다."]
        ],
        db: [["sm_thread_quality_signal", "signal_id, object_id, signal_type, severity, detected_at, action_status"], ["sm_thread_quality_context", "signal_id, lot_id, material_lot_id, resource_id, recipe_id, operator_id"], ["sm_thread_quality_action", "action_id, signal_id, disposition, owner, due_date, closed_at"]],
        rules: ["품질 신호는 생산 hold/release와 연결되어야 합니다.", "Spec revision과 판정 시점의 기준을 함께 저장합니다.", "CAPA는 원인, 조치, 효과 확인까지 추적합니다."],
        tests: ["SPC signal로 lot hold", "Spec revision별 판정", "CAPA action 생성", "불량 원인 context 조회"]
      },
      {
        slug: "compliance",
        name: "Compliance",
        ko: "컴플라이언스 스레드",
        summary: "규제, 고객 요구사항, 감사, 전자기록, 승인, 변경 관리를 모든 라이프사이클에 일관되게 적용합니다.",
        student: "실험 기록을 아무렇게나 쓰면 결과를 믿을 수 없습니다. 컴플라이언스는 누가, 언제, 무엇을, 왜 했는지 증명하는 체계입니다.",
        flow: ["규정/요구사항", "업무 규칙", "전자기록/승인", "감사 추적", "보고/시정조치"],
        activities: [
          ["규정 요구사항 매핑", "GxP, 고객 규격, 산업 표준, 내부 절차를 업무 규칙으로 변환합니다."],
          ["전자기록 통제", "전자서명, audit trail, 데이터 무결성, 변경 통제를 적용합니다."],
          ["감사 준비", "생산, 품질, 보전, 자재 이력을 감사 증거로 구성합니다."],
          ["위반 대응", "Deviation, investigation, CAPA, effectiveness check를 관리합니다."]
        ],
        db: [["sm_thread_compliance_requirement", "requirement_id, source, clause_ref, domain, control_object"], ["sm_thread_audit_trail", "audit_id, object_id, action, before_value, after_value, user_id, action_time"], ["sm_thread_deviation", "deviation_id, object_id, severity, investigation_status, capa_id"]],
        rules: ["중요 데이터 변경은 변경 전/후와 사유를 남깁니다.", "승인은 권한과 직무 분리 원칙을 확인합니다.", "전자기록은 삭제보다 correction event로 정정합니다."],
        tests: ["전자서명 권한 검증", "audit trail 생성", "deviation CAPA 연결", "감사 보고서 추출"]
      },
      {
        slug: "sustainability",
        name: "Sustainability",
        ko: "지속가능성 스레드",
        summary: "에너지, 물, 폐기물, 탄소, 자원 효율을 생산/자산/공급망 데이터와 연결해 지속가능성 목표를 운영 지표로 만듭니다.",
        student: "제품을 많이 만드는 것뿐 아니라 얼마나 적은 에너지와 자원으로 만들었는지도 함께 관리하는 관점입니다.",
        flow: ["지속가능성 목표", "에너지/자원 데이터", "제품/공정 할당", "성과 분석", "개선 조치"],
        activities: [
          ["환경 데이터 수집", "전력, 가스, 물, 배출, 폐기물 데이터를 설비/공정 단위로 수집합니다."],
          ["제품별 할당", "에너지와 배출량을 lot, 제품, 주문, 공정에 배부합니다."],
          ["손실과 개선 분석", "idle energy, peak demand, scrap-driven waste를 분석합니다."],
          ["ESG 보고 연결", "운영 데이터에서 감사 가능한 지속가능성 보고 지표를 생성합니다."]
        ],
        db: [["sm_thread_sustainability_meter", "meter_id, resource_id, energy_type, unit, calibration_status"], ["sm_thread_sustainability_sample", "sample_id, meter_id, value, sample_time, quality_code"], ["sm_thread_sustainability_allocation", "allocation_id, lot_id, product_id, kwh, water_l, co2e_kg"]],
        rules: ["환경 데이터도 품질 코드와 계측기 교정 상태를 가져야 합니다.", "제품별 배부 기준은 version으로 관리합니다.", "지속가능성 KPI는 생산량과 품질 손실을 함께 고려합니다."],
        tests: ["설비별 에너지 수집", "lot별 탄소 배부", "idle energy 분석", "ESG 지표 생성"]
      },
      {
        slug: "analytics",
        name: "Analytics",
        ko: "분석 스레드",
        summary: "MES, 설비, 품질, 공급망 데이터를 신뢰 가능한 분석 데이터셋으로 만들고 의사결정과 자동화에 연결합니다.",
        student: "시험 점수만 모아도 분석은 되지만, 어떤 단원을 공부했는지, 공부 시간은 어땠는지 문맥이 있어야 좋은 분석이 됩니다.",
        flow: ["데이터 수집", "문맥화", "Feature/KPI", "모델/분석", "의사결정 반영"],
        activities: [
          ["데이터 문맥화", "tag, event, lot, recipe, 설비, 작업자, 자재 문맥을 연결합니다."],
          ["Feature Store 구성", "분석과 AI가 재사용할 feature와 KPI를 관리합니다."],
          ["모델 운영", "예측, 이상탐지, 최적화 모델의 version, 성능, drift를 관리합니다."],
          ["Action Feedback", "분석 결과가 dispatch, 품질, 보전, 스케줄 변경으로 이어졌는지 추적합니다."]
        ],
        db: [["sm_thread_analytics_dataset", "dataset_id, purpose, grain, owner, version, quality_score"], ["sm_thread_feature", "feature_id, dataset_id, feature_name, lineage_json, freshness_sec"], ["sm_thread_model_decision", "decision_id, model_id, object_id, recommendation, accepted_flag, outcome"]],
        rules: ["분석 데이터는 lineage와 quality score를 가져야 합니다.", "AI 추천은 사람이 수락/거부한 결과와 실제 효과를 추적합니다.", "모델 version과 학습 데이터 범위를 운영 이력에 남깁니다."],
        tests: ["lot 문맥 feature 생성", "모델 drift 알림", "추천 수락/거부 기록", "KPI drill-down"]
      },
      {
        slug: "security",
        name: "Security",
        ko: "보안 스레드",
        summary: "IT/OT 연결, 계정, 권한, 원격접속, 취약점, 로그를 전 라이프사이클에 걸쳐 통제합니다.",
        student: "공장 문을 아무나 열고 들어오게 두면 안 되듯, 디지털 공장도 데이터와 장비 명령에 접근할 수 있는 사람과 시스템을 통제해야 합니다.",
        flow: ["자산/계정 식별", "권한 정책", "접속/명령 통제", "로그/탐지", "위험 대응"],
        activities: [
          ["자산 보안 기준선", "장비, 서버, 계정, 포트, 소프트웨어 구성 기준을 정의합니다."],
          ["접근 제어", "사용자/서비스 계정의 최소 권한과 승인 workflow를 적용합니다."],
          ["이상 행위 탐지", "비정상 로그인, 명령, 데이터 접근, 설정 변경을 탐지합니다."],
          ["취약점/패치 관리", "OT 제약을 고려해 보완 통제와 예외 만료를 관리합니다."]
        ],
        db: [["sm_thread_security_asset", "asset_id, asset_type, owner, criticality, baseline_version"], ["sm_thread_security_access", "access_id, subject_id, resource_id, action, result, event_time"], ["sm_thread_security_risk", "risk_id, asset_id, risk_type, severity, mitigation, expire_at"]],
        rules: ["생산 명령 API는 인증, 권한, 감사 로그를 필수로 적용합니다.", "보안 예외는 만료일과 보완 통제를 가져야 합니다.", "원격 접속은 세션 기록과 승인 이력을 남깁니다."],
        tests: ["권한 없는 명령 차단", "원격접속 감사", "보안 기준선 drift 감지", "취약점 예외 만료 알림"]
      },
      {
        slug: "digital-twin-thread",
        name: "Digital Twin / Thread",
        ko: "디지털 트윈/스레드",
        summary: "제품, 공정, 설비, 자재, 품질 이력을 연결해 실제 세계와 디지털 모델 사이의 연속적인 추적과 시뮬레이션을 가능하게 합니다.",
        student: "실제 공장과 똑같이 움직이는 디지털 지도와 일기장을 만드는 것입니다. 현재 상태뿐 아니라 왜 그렇게 되었는지도 추적합니다.",
        flow: ["모델 기준정보", "실시간 상태 동기화", "이력/계보 연결", "시뮬레이션", "의사결정 반영"],
        activities: [
          ["디지털 thread 구성", "제품-BOM-공정-설비-lot-품질-출하 이력을 연결합니다."],
          ["상태 동기화", "실제 설비와 WIP 상태를 디지털 모델에 반영합니다."],
          ["시뮬레이션 연결", "capacity, bottleneck, 품질 위험, 보전 영향을 사전에 실험합니다."],
          ["closed-loop 운영", "시뮬레이션 결과를 schedule, dispatch, process control에 반영합니다."]
        ],
        db: [["sm_thread_digital_object", "digital_object_id, object_type, physical_id, model_version, current_state"], ["sm_thread_relationship", "from_object_id, to_object_id, relation_type, valid_from, valid_to"], ["sm_thread_simulation_run", "run_id, scenario, input_snapshot_id, result_json, executed_at"]],
        rules: ["디지털 객체는 실제 객체 ID와 안정적으로 매핑되어야 합니다.", "시뮬레이션 input snapshot은 재현 가능해야 합니다.", "모델과 실제 상태 차이는 drift로 관리합니다."],
        tests: ["lot digital thread 조회", "설비 상태 동기화", "시나리오 simulation 저장", "모델 drift 감지"]
      },
      {
        slug: "modeling-simulation",
        name: "Modeling / Simulation",
        ko: "모델링/시뮬레이션 스레드",
        summary: "공정, 생산 흐름, 공급망, 설비 상태를 모델로 표현하고 변경 전 결과를 예측합니다.",
        student: "실제 공장을 멈추지 않고 가상 실험실에서 먼저 실험해보는 활동입니다.",
        flow: ["모델 정의", "데이터 보정", "시나리오 실행", "결과 비교", "운영 적용"],
        activities: [
          ["모델 구성", "공정 시간, setup, capacity, 품질 확률, 보전 제약을 모델링합니다."],
          ["현장 데이터 보정", "실제 MES/설비 데이터를 사용해 모델 parameter를 보정합니다."],
          ["What-if 분석", "수요 변화, 설비 고장, 인력 부족, recipe 변경을 시나리오로 평가합니다."],
          ["운영 의사결정", "시뮬레이션 결과를 schedule, inventory, maintenance plan에 반영합니다."]
        ],
        db: [["sm_thread_model_definition", "model_id, model_type, scope, version, owner"], ["sm_thread_model_parameter", "model_id, parameter_name, value, source_data, calibrated_at"], ["sm_thread_model_scenario", "scenario_id, model_id, input_json, result_json, decision_status"]],
        rules: ["모델 parameter는 출처 데이터와 보정 시각을 가져야 합니다.", "시나리오 결과를 실제 운영에 적용하면 적용 이력을 남깁니다.", "모델 정확도는 실제 결과와 지속적으로 비교합니다."],
        tests: ["capacity simulation", "고장 시나리오", "모델 parameter 보정", "예측-실제 오차 분석"]
      }
    ]
  },
  {
    type: "technology",
    dir: technologyDir,
    title: "Enabling Technologies",
    ko: "활성화 기술",
    description: "스마트 제조를 가능하게 하는 기술입니다. 기술 자체가 목적이 아니라 Lifecycle과 Cross-Lifecycle Thread의 목표를 달성하는 수단으로 설계되어야 합니다.",
    items: [
      {
        slug: "iiot",
        name: "IIoT",
        ko: "산업용 사물인터넷",
        summary: "설비, 센서, edge 장치를 연결해 현장 데이터를 더 빠르고 넓게 수집하고 제어 문맥에 연결합니다.",
        student: "공장 안의 장비와 센서가 계속 말을 걸어주는 통신망을 만드는 것입니다.",
        flow: ["센서/장비 연결", "Edge 수집", "데이터 표준화", "MES/Cloud 전달", "운영 action"],
        activities: [
          ["장치 연결", "PLC, 센서, gateway, 장비 인터페이스를 연결합니다."],
          ["Edge 전처리", "필터링, buffering, protocol 변환, 품질 코드를 부여합니다."],
          ["데이터 문맥화", "tag를 설비, 공정, lot, recipe 문맥과 연결합니다."],
          ["운영 적용", "이상 신호를 품질, 보전, 생산 action으로 연결합니다."]
        ],
        db: [["sm_tech_iiot_device", "device_id, device_type, resource_id, protocol, status"], ["sm_tech_iiot_tag", "tag_id, device_id, tag_name, unit, sample_rate_ms"], ["sm_tech_iiot_sample", "sample_id, tag_id, value, sample_time, quality_code"]],
        rules: ["장치 데이터에는 발생 시각과 수신 시각을 모두 저장합니다.", "Edge 단절 시 buffering과 재전송 정책을 정의합니다.", "tag mapping은 version으로 관리합니다."],
        tests: ["센서 sample 수집", "edge 단절 후 재전송", "tag-lot 문맥 연결", "Bad quality sample 표시"]
      },
      {
        slug: "big-data",
        name: "Big Data",
        ko: "빅데이터",
        summary: "고빈도 설비 데이터, MES 이벤트, 품질 결과, 공급망 데이터를 대규모로 저장하고 분석 가능한 구조로 만듭니다.",
        student: "공장의 모든 기록을 큰 도서관에 넣되, 나중에 찾기 쉽도록 분류와 색인을 잘 만드는 활동입니다.",
        flow: ["데이터 수집", "Lake/Lakehouse 저장", "정제/문맥화", "Feature/KPI", "분석 소비"],
        activities: [
          ["수집 파이프라인", "MES, IIoT, ERP, 품질 시스템 데이터를 안정적으로 수집합니다."],
          ["데이터 품질 관리", "schema, freshness, completeness, duplicate, lineage를 관리합니다."],
          ["분석 mart 구성", "lot, 제품, 설비, 공정 grain별 재사용 dataset을 만듭니다."],
          ["거버넌스", "소유자, 접근권한, 보존기간, 민감정보 정책을 적용합니다."]
        ],
        db: [["sm_tech_data_pipeline", "pipeline_id, source_system, target_zone, schedule, owner"], ["sm_tech_dataset_catalog", "dataset_id, name, grain, owner, quality_score, retention_days"], ["sm_tech_data_quality_issue", "issue_id, dataset_id, issue_type, severity, detected_at, status"]],
        rules: ["분석 dataset은 grain과 lineage가 명확해야 합니다.", "운영 KPI는 원천 이벤트로 drill-down 가능해야 합니다.", "데이터 보존 기간과 접근 권한은 도메인별로 관리합니다."],
        tests: ["pipeline 지연 감지", "dataset quality score", "KPI 원천 이벤트 연결", "권한 없는 dataset 접근 차단"]
      },
      {
        slug: "ai-ml",
        name: "AI / ML",
        ko: "AI/ML",
        summary: "예측, 이상 탐지, 최적화, 추천을 통해 생산, 품질, 보전, 공급망 의사결정을 보조하거나 자동화합니다.",
        student: "경험 많은 선생님처럼 데이터를 보고 다음에 문제가 생길 가능성을 알려주는 조교를 만드는 일입니다.",
        flow: ["학습 데이터", "모델 학습", "검증/배포", "추천/예측", "결과 피드백"],
        activities: [
          ["Use case 정의", "품질 예측, 설비 고장 예측, 스케줄 최적화처럼 업무 목표를 명확히 합니다."],
          ["Feature 관리", "문맥화된 데이터와 feature version을 관리합니다."],
          ["MLOps", "모델 version, 배포, drift, 성능, rollback을 관리합니다."],
          ["Human-in-the-loop", "AI 추천 수락/거부와 실제 효과를 추적합니다."]
        ],
        db: [["sm_tech_ml_model", "model_id, use_case, version, status, trained_at, metric_json"], ["sm_tech_ml_prediction", "prediction_id, model_id, object_id, prediction, confidence, predicted_at"], ["sm_tech_ml_feedback", "feedback_id, prediction_id, accepted_flag, action_taken, outcome"]],
        rules: ["AI 모델은 학습 데이터 범위와 version을 운영 이력에 남깁니다.", "낮은 confidence 추천은 자동 실행하지 않고 승인 workflow로 보냅니다.", "모델 drift가 감지되면 재학습 또는 rollback 기준을 적용합니다."],
        tests: ["품질 예측 생성", "모델 version rollback", "추천 수락 feedback", "drift 알림"]
      },
      {
        slug: "vr-ar",
        name: "VR / AR",
        ko: "VR/AR",
        summary: "작업자 교육, 원격 지원, 보전 절차, 복잡한 조립/검사 작업을 시각적으로 지원합니다.",
        student: "눈앞에 작업 순서와 주의사항이 겹쳐 보이는 실습 안내서를 만드는 것입니다.",
        flow: ["작업 절차 모델", "3D/AR 콘텐츠", "현장 안내", "작업 확인", "교육/개선 피드백"],
        activities: [
          ["절차 디지털화", "SOP와 작업 표준을 단계별 디지털 콘텐츠로 전환합니다."],
          ["현장 문맥 연결", "설비, 부품, 작업자 skill, 현재 작업 상태에 맞는 안내를 제공합니다."],
          ["원격 협업", "전문가가 현장 화면을 보고 안내하거나 annotation을 제공합니다."],
          ["교육 효과 측정", "수행 시간, 오류, 재작업, 숙련도 개선을 분석합니다."]
        ],
        db: [["sm_tech_ar_work_instruction", "instruction_id, operation_id, revision, content_uri, status"], ["sm_tech_ar_session", "session_id, person_id, resource_id, instruction_id, started_at, ended_at"], ["sm_tech_ar_step_result", "session_id, step_no, result, evidence_uri, confirmed_at"]],
        rules: ["현장에 표시되는 절차는 승인된 revision이어야 합니다.", "중요 step은 작업자 확인 또는 evidence capture를 요구할 수 있습니다.", "AR 콘텐츠 변경은 문서 관리와 동기화합니다."],
        tests: ["승인된 AR 절차 표시", "step 확인 evidence 저장", "원격 지원 세션 기록", "교육 전후 오류율 비교"]
      },
      {
        slug: "edge-to-cloud",
        name: "Edge to Cloud",
        ko: "엣지-클라우드",
        summary: "현장 edge에서 빠른 처리와 안정성을 확보하고, cloud에서 확장 분석과 전사 공유를 수행하는 구조입니다.",
        student: "교실 안에서는 바로 반응해야 하는 일은 교실 컴퓨터가 처리하고, 전교 통계는 중앙 서버가 계산하는 구조입니다.",
        flow: ["Edge 수집/제어", "Local buffering", "Cloud 동기화", "분석/AI", "운영 피드백"],
        activities: [
          ["Edge runtime 관리", "현장 가까운 곳에서 수집, 전처리, 경량 판단을 수행합니다."],
          ["동기화 정책", "네트워크 단절, 재전송, 순서 보장, 중복 제거를 처리합니다."],
          ["Cloud 분석", "대규모 저장, cross-site 분석, AI 학습을 수행합니다."],
          ["운영 배포", "Cloud에서 만든 rule/model을 edge로 안전하게 배포합니다."]
        ],
        db: [["sm_tech_edge_node", "edge_id, site_id, version, status, last_seen_at"], ["sm_tech_sync_queue", "queue_id, edge_id, object_type, payload_hash, sync_status, retry_count"], ["sm_tech_deployment", "deployment_id, edge_id, package_type, version, status, deployed_at"]],
        rules: ["Edge 단절 중에도 안전 관련 제어와 필수 수집은 유지되어야 합니다.", "Cloud 동기화는 idempotent하게 처리합니다.", "Rule/model 배포는 canary와 rollback을 지원합니다."],
        tests: ["네트워크 단절 후 재동기화", "중복 payload 제거", "edge package rollback", "cloud model edge 배포"]
      },
      {
        slug: "blockchain",
        name: "Blockchain",
        ko: "블록체인",
        summary: "공급망 신뢰, 이력 위변조 방지, 다자간 traceability가 중요한 경우 선택적으로 사용하는 분산 원장 기술입니다.",
        student: "여러 회사가 함께 쓰는, 몰래 고치기 어려운 공용 거래 장부라고 볼 수 있습니다.",
        flow: ["공유 이벤트 정의", "증거 hash 생성", "원장 기록", "검증/조회", "감사/분쟁 대응"],
        activities: [
          ["공유 범위 정의", "어떤 이벤트를 누구와 공유할지 정합니다."],
          ["증거 데이터 hash", "원본 데이터는 내부에 두고 hash 또는 증명 정보를 원장에 남깁니다."],
          ["Smart contract", "승인, 인수, 품질 release 같은 다자간 규칙을 자동화합니다."],
          ["감사 조회", "공급망 참여자가 동일한 이력 증거를 검증합니다."]
        ],
        db: [["sm_tech_chain_event", "chain_event_id, business_event_id, event_type, hash_value, chain_tx_id"], ["sm_tech_chain_party", "party_id, role, public_key, status"], ["sm_tech_chain_contract", "contract_id, contract_type, version, status"]],
        rules: ["개인정보와 민감 제조조건은 원장에 직접 저장하지 않습니다.", "원장 기록과 내부 원본 이벤트의 매핑을 보존합니다.", "다자간 프로세스에 실제 이득이 있을 때만 적용합니다."],
        tests: ["품질 release hash 기록", "원본-hash 검증", "권한 없는 party 조회 차단", "smart contract 상태 전이"]
      },
      {
        slug: "additive",
        name: "Additive",
        ko: "적층 제조",
        summary: "3D 프린팅 등 적층 제조의 설계 파일, 빌드 조건, 소재 lot, 장비 상태, 후처리, 품질 이력을 연결합니다.",
        student: "제품을 깎아서 만드는 대신 층층이 쌓아 만들기 때문에, 설계 파일과 장비 조건의 trace가 더 중요합니다.",
        flow: ["설계/빌드 파일", "소재/장비 준비", "빌드 실행", "후처리/검사", "제품 genealogy"],
        activities: [
          ["디지털 빌드 정의", "CAD, build file, orientation, support, parameter set을 관리합니다."],
          ["소재 trace", "분말/소재 lot, 재사용 횟수, 보관 조건을 추적합니다."],
          ["빌드 모니터링", "온도, laser power, layer image, chamber condition을 수집합니다."],
          ["후처리/품질 연결", "열처리, 가공, 검사 결과를 build genealogy와 연결합니다."]
        ],
        db: [["sm_tech_additive_build", "build_id, design_id, machine_id, material_lot_id, parameter_set_id, status"], ["sm_tech_additive_layer_data", "build_id, layer_no, image_uri, sensor_summary_json, result"], ["sm_tech_additive_postprocess", "postprocess_id, build_id, process_type, result, completed_at"]],
        rules: ["Build file과 parameter set은 승인된 revision이어야 합니다.", "소재 재사용 정책과 품질 상태를 시작 전에 검증합니다.", "Layer data는 최종 제품 serial과 연결되어야 합니다."],
        tests: ["승인 build file 적용", "소재 lot 사용 제한", "layer anomaly 기록", "후처리 결과 genealogy 연결"]
      },
      {
        slug: "robotics",
        name: "Robotics",
        ko: "로보틱스",
        summary: "로봇, AMR/AGV, 협동로봇, 자동 handling 장치를 생산 실행과 안전, 품질 문맥에 연결합니다.",
        student: "사람 대신 이동하거나 조립하는 자동 작업자를 MES 흐름 안에 등록하고 관리하는 것입니다.",
        flow: ["작업 명령", "로봇/경로 준비", "자동 수행", "상태/안전 모니터링", "실적 피드백"],
        activities: [
          ["로봇 capability 관리", "로봇이 수행 가능한 작업, payload, tool, route를 정의합니다."],
          ["작업 지시 연동", "MES dispatch와 로봇 mission 또는 program을 연결합니다."],
          ["안전/상태 감시", "interlock, e-stop, zone, collision, battery, health를 모니터링합니다."],
          ["실적과 예외 처리", "자동 작업 완료, 실패, 재시도, 수동 개입을 기록합니다."]
        ],
        db: [["sm_tech_robot", "robot_id, robot_type, capability, zone, status"], ["sm_tech_robot_mission", "mission_id, robot_id, work_id, route_id, status, priority"], ["sm_tech_robot_event", "event_id, robot_id, mission_id, event_type, event_time, payload_json"]],
        rules: ["로봇 mission은 MES 작업 상태와 동기화되어야 합니다.", "안전 interlock 발생 시 관련 dispatch를 즉시 중지하거나 재계산합니다.", "수동 개입은 작업 이력에 남깁니다."],
        tests: ["로봇 mission 생성", "경로 blocked 재배정", "e-stop 이벤트 처리", "수동 개입 이력 저장"]
      },
      {
        slug: "wireless",
        name: "Wireless",
        ko: "무선 기술",
        summary: "Wi-Fi, 5G, LPWAN, RFID, BLE 등을 사용해 이동 자산, 작업자, 센서, 물류 데이터를 유연하게 연결합니다.",
        student: "공장 안에서 움직이는 사람과 물건도 계속 위치와 상태를 알려줄 수 있게 만드는 통신 기반입니다.",
        flow: ["무선 장치 등록", "위치/상태 수집", "네트워크 품질 관리", "MES 문맥 연결", "운영 action"],
        activities: [
          ["무선 자산 식별", "RFID, BLE tag, mobile terminal, wireless sensor를 등록합니다."],
          ["위치 추적", "자재, carrier, 작업자, 이동 설비의 위치를 수집합니다."],
          ["통신 품질 관리", "coverage, latency, packet loss, roaming 문제를 모니터링합니다."],
          ["현장 업무 적용", "이동식 검수, 전자 작업지시, 위치 기반 dispatch에 활용합니다."]
        ],
        db: [["sm_tech_wireless_device", "device_id, device_type, owner_object_id, protocol, battery_status"], ["sm_tech_wireless_location", "event_id, device_id, location_id, accuracy_m, event_time"], ["sm_tech_wireless_network_kpi", "kpi_id, zone_id, latency_ms, packet_loss_pct, measured_at"]],
        rules: ["위치 정확도와 freshness를 업무 판단에 함께 사용합니다.", "무선 단절은 작업자에게 명확한 offline 상태로 표시합니다.", "작업자 위치 데이터는 개인정보 접근 정책을 적용합니다."],
        tests: ["RFID 위치 이벤트 수집", "저전압 tag 알림", "무선 단절 offline 표시", "위치 기반 dispatch"]
      }
    ]
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
  return `<div class="diagram"><svg viewBox="0 0 ${width} 164" aria-label="MESA Smart Manufacturing DFD"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2864a8"></path></marker></defs>${nodes}</svg></div>`;
}

function pageShell({ title, subtitle, chips, crumbs, cssHref, body }) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <link rel="stylesheet" href="${cssHref}">
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

function renderItem(concept, item) {
  const flowRows = item.flow.map((step, i) => [
    `<strong>${i + 1}. ${esc(step)}</strong>`,
    i === 0 ? "업무 또는 기술 흐름을 시작시키는 입력입니다." : i === item.flow.length - 1 ? "다른 시스템, 사람, KPI, 개선 활동으로 전달되는 결과입니다." : "검증, 판단, 상태 전이, 데이터 문맥화를 수행하는 처리 단계입니다.",
    i === 0 ? "source, 수신 시각, 기준정보 version을 저장합니다." : "상태, 이력, 품질 코드, 담당자, correlation id를 남깁니다."
  ]);
  const body = `
    <section class="section">
      <h2>학습 목표</h2>
      <div class="lesson-index">
        <a href="#concept">1. 개념 목적</a>
        <a href="#activities">2. 핵심 액티비티</a>
        <a href="#dfd">3. DFD</a>
        <a href="#model">4. 데이터 모델</a>
        <a href="#logic">5. 업무 규칙</a>
        <a href="#ui">6. 화면/API</a>
        <a href="#test">7. 테스트</a>
        <a href="#ops">8. 운영 체크</a>
      </div>
      <div class="callout">${esc(sourceNote)}</div>
    </section>

    <section id="concept" class="section">
      <h2>1. 개념 목적</h2>
      <p>${esc(item.summary)}</p>
      <div class="two-col">
        <div class="card"><strong>학생에게 설명하는 비유</strong><span>${esc(item.student)}</span></div>
        <div class="card"><strong>스마트 제조 관점</strong><span>${esc(concept.ko)} 항목은 단독 기능이 아니라 여러 시스템, 데이터, 사람, 기준정보를 연결해 더 빠른 의사결정과 투명한 실행을 가능하게 합니다.</span></div>
      </div>
    </section>

    <section id="activities" class="section">
      <h2>2. 핵심 액티비티</h2>
      <p>아래 액티비티는 ${esc(item.ko)}를 MES/MOM 또는 스마트 제조 플랫폼으로 구현할 때 요구사항을 나누는 단위입니다.</p>
      <table>
        <thead><tr><th>액티비티</th><th>설명</th><th>구현 산출물</th></tr></thead>
        <tbody>${rows(item.activities.map(([name, desc]) => [`<strong>${esc(name)}</strong>`, esc(desc), "화면, API, 상태 테이블, 이력 테이블, 통합 이벤트, 운영 KPI"]))}</tbody>
      </table>
    </section>

    <section id="dfd" class="section">
      <h2>3. DFD: 스마트 제조 데이터 흐름</h2>
      ${flowSvg(item.flow)}
      <p style="margin-top:14px">이 흐름은 기술 도입 자체가 아니라 업무 성과로 이어지는 과정을 보여줍니다. 입력 데이터는 문맥화와 검증을 거쳐 실행, 분석, 개선 활동으로 연결되어야 합니다.</p>
      <table>
        <thead><tr><th>단계</th><th>처리 의미</th><th>저장/검증 포인트</th></tr></thead>
        <tbody>${rows(flowRows)}</tbody>
      </table>
    </section>

    <section id="model" class="section">
      <h2>4. 권장 데이터 모델</h2>
      <p>스마트 제조 모델은 현재 상태만 저장해서는 부족합니다. 기준정보, 현재 상태, 이력, 문맥, 분석 결과, action feedback을 연결해야 반복 가능한 개선이 가능합니다.</p>
      <table>
        <thead><tr><th>테이블</th><th>주요 컬럼</th><th>설계 이유</th></tr></thead>
        <tbody>${rows(item.db.map(([table, cols]) => [`<strong>${esc(table)}</strong>`, `<code>${esc(cols)}</code>`, "실행 데이터와 스마트 제조 문맥을 연결하고, 분석과 재처리를 가능하게 하기 위한 기본 구조입니다."]))}</tbody>
      </table>
    </section>

    <section id="logic" class="section">
      <h2>5. 처리 로직과 업무 규칙</h2>
      <table>
        <thead><tr><th>규칙 ID</th><th>업무 규칙</th><th>시스템 반영 방식</th></tr></thead>
        <tbody>${rows(item.rules.map((rule, i) => [`BR-${String(i + 1).padStart(2, "0")}`, esc(rule), "Domain Service, Rule Engine, Workflow, Data Quality Rule, Integration Contract로 구현"]))}</tbody>
      </table>
      <h3>의사코드</h3>
      <div class="codebox">function runSmartManufacturingActivity(command):
  validateBusinessContext(command)
  master = loadApprovedMasterData(command.context)
  current = loadCurrentOperationalState(command.objectId)
  dataQuality = evaluateDataQuality(command.payload)
  decision = applySmartManufacturingRules(master, current, dataQuality)
  saveRawEvent(command)
  if decision.allowed:
      updateCurrentState(decision)
      appendDigitalThread(decision)
      publishActionOrInsight(decision)
  else:
      createException(decision.reasonCode)
      notifyOwner(decision.ownerRole)</div>
    </section>

    <section id="ui" class="section">
      <h2>6. 화면과 API 설계</h2>
      <div class="grid">
        <div class="card"><strong>운영 화면</strong><span>현재 상태, 차단 사유, 추천 action, 관련 기준정보와 이력을 보여줍니다.</span></div>
        <div class="card"><strong>분석 화면</strong><span>KPI, 품질, 손실, 위험, 예측 결과를 원천 데이터까지 drill-down합니다.</span></div>
        <div class="card"><strong>통합 API</strong><span>ERP, MES, PLM, IIoT, 품질, 보전, 데이터 플랫폼과 이벤트 기반으로 연결합니다.</span></div>
      </div>
      <h3>API 예시</h3>
      <div class="codebox">POST /api/mesa-smart/${esc(concept.type)}/${esc(item.slug)}/events
GET  /api/mesa-smart/${esc(concept.type)}/${esc(item.slug)}/current-state?objectId={id}
GET  /api/mesa-smart/${esc(concept.type)}/${esc(item.slug)}/digital-thread?objectId={id}</div>
    </section>

    <section id="test" class="section">
      <h2>7. 테스트 시나리오</h2>
      <table>
        <thead><tr><th>테스트 ID</th><th>시나리오</th><th>기대 결과</th></tr></thead>
        <tbody>${rows(item.tests.map((test, i) => [`TC-${String(i + 1).padStart(2, "0")}`, esc(test), "상태, 이력, 데이터 품질, 통합 이벤트, 운영 action이 설계와 일치해야 합니다."]))}</tbody>
      </table>
      <h3>공통 리스크</h3>
      <div>
        <span class="badge">데이터 문맥 누락</span>
        <span class="badge">기준정보 revision 불일치</span>
        <span class="badge">IT/OT 소유권 불명확</span>
        <span class="badge">분석 결과 action 미연결</span>
        <span class="badge">보안/권한 누락</span>
      </div>
    </section>

    <section id="ops" class="section">
      <h2>8. 운영 체크리스트</h2>
      ${list([
        "업무 목표와 KPI가 명확하며 기술 도입 목적과 연결되어 있다.",
        "원천 데이터, 문맥 데이터, 기준정보 revision, 품질 코드가 함께 저장된다.",
        "운영자가 action을 취할 수 있는 화면과 알림이 있다.",
        "외부 시스템 연동 실패 시 재처리 queue와 감사 로그가 있다.",
        "개선 효과가 KPI 또는 action outcome으로 다시 측정된다."
      ])}
    </section>`;
  return pageShell({
    title: `MESA Smart Manufacturing - ${item.ko}`,
    subtitle: `${concept.title} / ${item.name}. ${item.summary}`,
    chips: ["MESA Smart Manufacturing Model", concept.title, item.name],
    crumbs: `<div class="crumbs"><a href="../MESA_MES_Overview.html">MESA Smart Manufacturing</a> / ${esc(concept.ko)} / ${esc(item.ko)}</div>`,
    cssHref: "../mesa-page.css",
    body
  });
}

function renderIndex() {
  const sections = concepts.map((concept) => {
    const links = concept.items.map((item) => `<a href="${concept.type === "lifecycle" ? "lifecycles" : concept.type === "thread" ? "threads" : "technologies"}/${item.slug}.html"><strong>${esc(item.ko)}</strong><span class="muted">${esc(item.name)}</span></a>`).join("");
    return `<h3>${esc(concept.ko)} (${esc(concept.title)})</h3><p class="muted">${esc(concept.description)}</p><div class="list">${links}</div>`;
  }).join("");
  const body = `
    <section class="section">
      <h2>최신 MESA Model 구조</h2>
      ${flowSvg(["Lifecycle", "Cross-Lifecycle Thread", "Enabling Technology", "Smart Manufacturing Outcome"])}
      <p style="margin-top:14px">MESA의 최신 스마트 제조 모델은 기존 MESA-11 기능 목록을 넘어, 제조 기업의 가치 흐름을 나타내는 <strong>Lifecycle</strong>, 여러 가치 흐름을 관통하는 <strong>Cross-Lifecycle Thread</strong>, 그리고 스마트 제조를 가능하게 하는 <strong>Enabling Technology</strong>의 세 축을 함께 봅니다.</p>
      <div class="callout">${esc(sourceNote)}</div>
    </section>

    <section class="section">
      <h2>세 가지 주요 개념별 문서</h2>
      ${sections}
    </section>

    <section class="section">
      <h2>기존 MESA-11과의 차이</h2>
      <table>
        <thead><tr><th>관점</th><th>기존 MESA-11</th><th>최신 Smart Manufacturing Model</th></tr></thead>
        <tbody>
          <tr><td><strong>분류 기준</strong></td><td>MES 기능 목록 중심</td><td>라이프사이클, 교차 스레드, 활성화 기술의 동적 조합</td></tr>
          <tr><td><strong>핵심 질문</strong></td><td>MES가 어떤 기능을 제공하는가?</td><td>어떤 가치 흐름을 어떤 목표와 기술로 더 스마트하게 만들 것인가?</td></tr>
          <tr><td><strong>설계 방식</strong></td><td>기능 모듈별 화면과 DB 설계</td><td>디지털 스레드, 데이터 문맥화, 통합 action, 성과 피드백 중심 설계</td></tr>
        </tbody>
      </table>
    </section>

    <section class="section">
      <h2>학습 순서 추천</h2>
      <div class="grid">
        <div class="card"><strong>1. Lifecycle</strong><span>생산, 자산, 제품, 공급망, 인력, 주문 흐름을 먼저 이해합니다.</span></div>
        <div class="card"><strong>2. Cross-Lifecycle Thread</strong><span>품질, 규제, 지속가능성, 분석, 보안, 디지털 스레드가 여러 흐름을 어떻게 연결하는지 봅니다.</span></div>
        <div class="card"><strong>3. Enabling Technology</strong><span>IIoT, AI, Edge, AR, Robotics 같은 기술을 목적 중심으로 배치합니다.</span></div>
      </div>
    </section>`;
  return pageShell({
    title: "MESA Smart Manufacturing Model Guide",
    subtitle: "최신 MESA Model: A Framework for Smarter Manufacturing 기준으로 Lifecycle, Cross-Lifecycle Thread, Enabling Technology를 교육용 HTML 문서로 정리한 가이드입니다.",
    chips: ["MESA Model", "Smart Manufacturing", "Lifecycle / Thread / Technology"],
    crumbs: "",
    cssHref: "mesa-page.css",
    body
  });
}

for (const concept of concepts) {
  fs.mkdirSync(concept.dir, { recursive: true });
  for (const item of concept.items) {
    fs.writeFileSync(path.join(concept.dir, `${item.slug}.html`), renderItem(concept, item), "utf8");
  }
}

fs.writeFileSync(path.join(root, "MESA_MES_Overview.html"), renderIndex(), "utf8");

console.log(`Generated ${concepts.reduce((sum, c) => sum + c.items.length, 0)} smart manufacturing pages and overview in ${root}`);
