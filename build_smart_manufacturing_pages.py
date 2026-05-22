# -*- coding: utf-8 -*-
import os
import html

esc = html.escape

root = os.path.dirname(os.path.abspath(__file__))
mesa_dir = os.path.join(root, "contents", "MES", "mesa")
lifecycle_dir = os.path.join(mesa_dir, "lifecycles")
thread_dir = os.path.join(mesa_dir, "threads")
technology_dir = os.path.join(mesa_dir, "technologies")

source_note = "이 문서는 MESA International의 최신 MESA Model: A Framework for Smarter Manufacturing 구조를 교육용으로 재구성한 자료입니다. MESA가 공개한 세 가지 주요 개념인 Lifecycle, Cross-Lifecycle Thread, Enabling Technology를 기준으로 MES/MOM 설계 관점의 액티비티, 데이터 모델, DFD, 구현 포인트를 정리했습니다."

concepts = [
  {
    "type": "lifecycle",
    "dir": lifecycle_dir,
    "title": "Lifecycles",
    "ko": "라이프사이클",
    "description": "제조 기업이 최적화해야 하는 업무 프로세스와 가치 흐름입니다. 스마트 제조는 각 라이프사이클을 더 연결되고 투명하며 실시간으로 만들려는 활동입니다.",
    "items": [
      {
        "slug": "production",
        "name": "Production",
        "ko": "생산 라이프사이클",
        "summary": "제품을 실제로 만들기 위한 계획, 준비, 실행, 품질 확인, 실적 피드백의 흐름입니다.",
        "student": "학교 실습으로 보면 과제 지시를 받고, 재료와 장비를 준비하고, 실습을 수행하고, 결과를 채점받는 전체 흐름입니다.",
        "flow": ["수요/작업 요청", "생산 기준정보", "자원/자재 준비", "작업 실행", "품질/실적 피드백"],
        "activities": [
          ["생산 요구 변환", "ERP/APS의 생산 계획을 MES 작업 오더, lot, batch, serial 단위로 변환합니다."],
          ["작업 준비 검증", "설비, recipe, 자재, 작업자, 문서, 품질 hold 여부를 확인합니다."],
          ["현장 실행 제어", "Start, pause, resume, complete, abort 상태 전이를 관리합니다."],
          ["실적 및 손실 분석", "수량, cycle time, scrap, rework, downtime, schedule adherence를 분석합니다."]
        ],
        "db": [
          ["sm_production_order", "order_id, product_id, route_id, quantity, due_date, priority, status"],
          ["sm_production_execution", "execution_id, order_id, lot_id, resource_id, start_time, end_time, result"],
          ["sm_production_loss", "loss_id, execution_id, loss_type, reason_code, duration_sec, quantity_loss"]
        ],
        "rules": ["작업 시작 전 자원, 자재, recipe, 문서, 품질 상태를 모두 검증합니다.", "실제 사용 자원은 계획 자원과 다를 수 있으므로 actual 이력으로 별도 저장합니다.", "작업 완료는 필수 수집 데이터와 품질 판정이 충족된 후 확정합니다."],
        "tests": ["작업 오더 생성과 lot 분해", "자재 부족 시 시작 차단", "작업 완료 실적 ERP 피드백", "scrap/rework 실적 분석"]
      },
      {
        "slug": "production-asset",
        "name": "Production Asset",
        "ko": "생산 자산 라이프사이클",
        "summary": "설비, 금형, 치공구, 계측기, 로봇, 자동화 장치 같은 생산 자산의 도입부터 운영, 보전, 개선, 폐기까지 관리합니다.",
        "student": "실습실의 장비를 구매하고, 설치하고, 점검하고, 고장 나면 수리하고, 오래되면 교체하는 전체 과정입니다.",
        "flow": ["자산 도입", "설치/검증", "운영 상태", "보전/개선", "교체/폐기"],
        "activities": [
          ["자산 기준정보 관리", "자산 ID, serial, vendor, 위치, capability, owner를 정의합니다."],
          ["설치 및 qualification", "설비가 생산에 투입되기 전 검증, 교정, 안전 확인을 수행합니다."],
          ["상태/성능 모니터링", "가동 상태, health, alarm, utilization, energy, condition data를 수집합니다."],
          ["보전 및 수명주기 최적화", "PM, CBM, spare part, MTBF/MTTR, 교체 판단을 관리합니다."]
        ],
        "db": [
          ["sm_asset_master", "asset_id, asset_type, serial_no, vendor, install_date, lifecycle_state"],
          ["sm_asset_status_history", "asset_id, status, reason_code, start_time, end_time, source"],
          ["sm_asset_maintenance", "maintenance_id, asset_id, work_type, action_code, technician_id, result"]
        ],
        "rules": ["교정 또는 qualification이 만료된 자산은 생산 사용을 제한합니다.", "자산 교체는 제품 genealogy와 품질 영향 분석에 연결합니다.", "상태 기반 보전은 센서 데이터 품질과 threshold revision을 함께 관리합니다."],
        "tests": ["자산 설치 이력 생성", "교정 만료 자산 사용 차단", "고장 후 보전 작업 오더 생성", "자산 교체 영향 lot 조회"]
      },
      {
        "slug": "product",
        "name": "Product",
        "ko": "제품 라이프사이클",
        "summary": "제품 아이디어, 설계, 공정 정의, 변경, 생산, 품질, 서비스/폐기까지 제품 정보를 디지털 스레드로 연결합니다.",
        "student": "한 제품이 설계 도면에서 출발해 실제 생산 방법, 검사 기준, 출하 이력까지 이어지는 성장 기록입니다.",
        "flow": ["제품 정의", "공정/품질 기준", "생산 적용", "변경 관리", "제품 이력/개선"],
        "activities": [
          ["제품 기준정보 연결", "PLM의 BOM, BOP, spec, drawing을 MES 실행 기준으로 연결합니다."],
          ["공정/검사 기준 관리", "routing, recipe, inspection plan, control plan을 제품 revision별로 관리합니다."],
          ["변경 영향 분석", "ECO/ECN 변경이 진행 중 lot, 재고, 고객 주문에 미치는 영향을 판단합니다."],
          ["제품 genealogy와 피드백", "생산/품질/고객 불만 데이터를 제품 개선으로 되돌립니다."]
        ],
        "db": [
          ["sm_product_definition", "product_id, revision, lifecycle_state, owner, effective_from"],
          ["sm_product_process_binding", "product_id, revision, route_id, recipe_id, inspection_plan_id"],
          ["sm_product_change_impact", "change_id, product_id, affected_lot_id, impact_type, disposition"]
        ],
        "rules": ["제품 revision과 공정 revision은 독립적이지만 작업 시작 시점에는 호환성이 검증되어야 합니다.", "변경 적용일 전후 생산품은 다른 기준으로 trace되어야 합니다.", "고객 품질 이슈는 제품 정의와 생산 조건까지 역추적 가능해야 합니다."],
        "tests": ["제품 revision별 routing 조회", "ECO 적용 대상 lot 산출", "구 revision 생산 차단", "고객 불량에서 생산 조건 역추적"]
      },
      {
        "slug": "supply-chain",
        "name": "Supply Chain",
        "ko": "공급망 라이프사이클",
        "summary": "공급업체, 입고, 자재 추적, 수요 변동, 물류, 재고, 출하를 연결하여 제조 흐름을 끊기지 않게 합니다.",
        "student": "실습 재료가 제때 오지 않으면 수업을 못 하듯, 공급망은 생산이 멈추지 않게 재료와 정보를 연결하는 활동입니다.",
        "flow": ["수요/공급 계획", "입고/검사", "재고/보관", "생산 투입", "출하/고객 피드백"],
        "activities": [
          ["공급망 가시성", "PO, ASN, 입고, 검사, 재고 위치, 생산 투입 상태를 연결합니다."],
          ["자재 신뢰성 관리", "공급업체, lot, CoA, 검사 결과, 보관 조건을 추적합니다."],
          ["재고 최적화", "FEFO/FIFO, safety stock, shortage risk, excess stock을 관리합니다."],
          ["공급망 이벤트 대응", "납기 지연, 품질 hold, 대체 자재 승인, 출하 차질을 처리합니다."]
        ],
        "db": [
          ["sm_supply_material_lot", "material_lot_id, supplier_id, po_no, item_code, quantity, status"],
          ["sm_supply_movement", "movement_id, material_lot_id, from_location, to_location, event_time, reason"],
          ["sm_supply_risk_event", "risk_id, supplier_id, material_id, risk_type, severity, mitigation"]
        ],
        "rules": ["입고 자재는 품질 release 전 생산 투입을 제한할 수 있어야 합니다.", "대체 자재는 제품/고객/공정별 승인 조건을 따라야 합니다.", "공급망 이벤트는 생산 스케줄 영향 분석과 연결합니다."],
        "tests": ["입고 lot 생성", "품질 hold 자재 투입 차단", "대체 자재 승인 workflow", "공급 지연으로 생산 영향 조회"]
      },
      {
        "slug": "workforce",
        "name": "Workforce",
        "ko": "인력 라이프사이클",
        "summary": "작업자, 엔지니어, 품질 담당자, 보전 담당자의 역량, 교육, 배치, 안전, 지식 전수를 관리합니다.",
        "student": "좋은 장비가 있어도 사용할 수 있는 사람이 없으면 생산할 수 없습니다. 인력 라이프사이클은 사람의 준비도와 역량을 관리합니다.",
        "flow": ["역할/역량 정의", "교육/자격", "근무/배치", "작업 지원", "성과/재교육"],
        "activities": [
          ["Skill matrix 관리", "제품, 공정, 설비, 품질 승인별 자격과 만료일을 관리합니다."],
          ["작업자 배치 최적화", "shift, 휴식, 안전, 숙련도, 업무 부하를 고려해 배치합니다."],
          ["디지털 작업 지원", "전자 작업지시, AR/모바일 가이드, 예외 대응 지식을 제공합니다."],
          ["역량 피드백", "품질 이슈, 작업 실적, near miss를 교육과 개선 활동으로 연결합니다."]
        ],
        "db": [
          ["sm_workforce_person", "person_id, department, role, active_flag"],
          ["sm_workforce_skill", "person_id, skill_code, level, certified_at, expires_at"],
          ["sm_workforce_assignment", "assignment_id, person_id, work_id, role, start_time, end_time"]
        ],
        "rules": ["자격 만료자는 해당 작업의 시작 또는 승인을 수행할 수 없습니다.", "작업자 변경은 genealogy와 품질 이력에 남겨야 합니다.", "안전/교육 필수 작업은 교육 확인 전 dispatch하지 않습니다."],
        "tests": ["자격 보유 작업자 배정", "교육 미이수 작업 차단", "작업자 변경 이력 저장", "품질 이슈 후 재교육 대상 생성"]
      },
      {
        "slug": "order-to-cash",
        "name": "Order-to-Cash",
        "ko": "주문-현금화 라이프사이클",
        "summary": "고객 주문에서 생산 가능성, 납기 약속, 제조, 출하, 청구, 고객 피드백까지 연결합니다.",
        "student": "주문을 받고 제품을 만들어 보내고 대금을 받는 전체 흐름입니다. 스마트 제조에서는 이 흐름이 생산 현장 데이터와 실시간으로 연결됩니다.",
        "flow": ["고객 주문", "가능 납기/원가", "생산/품질 실행", "출하/청구", "고객 피드백"],
        "activities": [
          ["주문 실행 가능성 확인", "capacity, 재고, 자재, 품질 제약을 고려해 약속 가능한 납기를 판단합니다."],
          ["주문-생산 연결", "주문, 작업 오더, lot, shipment를 end-to-end로 연결합니다."],
          ["출하 품질 보증", "release, CoC/CoA, trace report, 고객 요구사항을 확인합니다."],
          ["비즈니스 피드백", "납기 준수, 원가, 품질 비용, 고객 클레임을 분석합니다."]
        ],
        "db": [
          ["sm_otc_customer_order", "customer_order_id, customer_id, product_id, quantity, promised_date, status"],
          ["sm_otc_order_link", "customer_order_id, work_order_id, lot_id, shipment_id, link_type"],
          ["sm_otc_fulfillment_kpi", "customer_order_id, on_time_flag, cost_variance, quality_cost, closed_at"]
        ],
        "rules": ["납기 약속은 실제 capacity와 자재 availability를 기준으로 계산해야 합니다.", "고객 주문과 생산 lot 연결은 출하 후에도 추적 가능해야 합니다.", "고객별 품질/문서 요구사항은 출하 release 조건에 포함합니다."],
        "tests": ["주문별 가능 납기 산출", "주문-lot-shipment 연결", "출하 전 품질 문서 검증", "납기 지연 원인 분석"]
      }
    ]
  },
  {
    "type": "thread",
    "dir": thread_dir,
    "title": "Cross-Lifecycle Threads",
    "ko": "교차 라이프사이클 스레드",
    "description": "여러 라이프사이클을 관통해 특정 목표를 달성하게 만드는 공통 주제입니다. 품질, 규제, 지속가능성, 보안 같은 주제는 생산 하나의 기능으로 끝나지 않고 전사 프로세스를 연결합니다.",
    "items": [
      {
        "slug": "quality",
        "name": "Quality",
        "ko": "품질 스레드",
        "summary": "제품, 공정, 설비, 자재, 인력 데이터를 연결해 품질을 사후 검사에서 사전 예방과 실시간 제어로 확장합니다.",
        "student": "시험 끝난 뒤 채점만 하는 것이 아니라, 공부하는 중간에 틀린 방법을 바로 알려주는 피드백 체계입니다.",
        "flow": ["품질 기준", "공정/자재 데이터", "실시간 판정", "Hold/조치", "품질 개선 피드백"],
        "activities": [
          ["품질 기준 연결", "제품 spec, control plan, inspection plan, customer requirement를 실행 기준으로 연결합니다."],
          ["실시간 품질 신호", "SPC, FDC, anomaly, trend를 생산 실행과 연결합니다."],
          ["부적합 의사결정", "Hold, release, rework, scrap, concession, CAPA를 관리합니다."],
          ["품질 원인 분석", "자재, 설비, 작업자, recipe, 환경 조건과 불량을 연결합니다."]
        ],
        "db": [
          ["sm_thread_quality_signal", "signal_id, object_id, signal_type, severity, detected_at, action_status"],
          ["sm_thread_quality_context", "signal_id, lot_id, material_lot_id, resource_id, recipe_id, operator_id"],
          ["sm_thread_quality_action", "action_id, signal_id, disposition, owner, due_date, closed_at"]
        ],
        "rules": ["품질 신호는 생산 hold/release와 연결되어야 합니다.", "Spec revision과 판정 시점의 기준을 함께 저장합니다.", "CAPA는 원인, 조치, 효과 확인까지 추적합니다."],
        "tests": ["SPC signal로 lot hold", "Spec revision별 판정", "CAPA action 생성", "불량 원인 context 조회"]
      },
      {
        "slug": "compliance",
        "name": "Compliance",
        "ko": "컴플라이언스 스레드",
        "summary": "규제, 고객 요구사항, 감사, 전자기록, 승인, 변경 관리를 모든 라이프사이클에 일관되게 적용합니다.",
        "student": "실험 기록을 아무렇게나 쓰면 결과를 믿을 수 없습니다. 컴플라이언스는 누가, 언제, 무엇을, 왜 했는지 증명하는 체계입니다.",
        "flow": ["규정/요구사항", "업무 규칙", "전자기록/승인", "감사 추적", "보고/시정조치"],
        "activities": [
          ["규정 요구사항 매핑", "GxP, 고객 규격, 산업 표준, 내부 절차를 업무 규칙으로 변환합니다."],
          ["전자기록 통제", "전자서명, audit trail, 데이터 무결성, 변경 통제를 적용합니다."],
          ["감사 준비", "생산, 품질, 보전, 자재 이력을 감사 증거로 구성합니다."],
          ["위반 대응", "Deviation, investigation, CAPA, effectiveness check를 관리합니다."]
        ],
        "db": [
          ["sm_thread_compliance_requirement", "requirement_id, source, clause_ref, domain, control_object"],
          ["sm_thread_audit_trail", "audit_id, object_id, action, before_value, after_value, user_id, action_time"],
          ["sm_thread_deviation", "deviation_id, object_id, severity, investigation_status, capa_id"]
        ],
        "rules": ["중요 데이터 변경은 변경 전/후와 사유를 남깁니다.", "승인은 권한과 직무 분리 원칙을 확인합니다.", "전자기록은 삭제보다 correction event로 정정합니다."],
        "tests": ["전자서명 권한 검증", "audit trail 생성", "deviation CAPA 연결", "감사 보고서 추출"]
      },
      {
        "slug": "sustainability",
        "name": "Sustainability",
        "ko": "지속가능성 스레드",
        "summary": "에너지, 물, 폐기물, 탄소, 자원 효율을 생산/자산/공급망 데이터와 연결해 지속가능성 목표를 운영 지표로 만듭니다.",
        "student": "제품을 많이 만드는 것뿐 아니라 얼마나 적은 에너지와 자원으로 만들었는지도 함께 관리하는 관점입니다.",
        "flow": ["지속가능성 목표", "에너지/자원 데이터", "제품/공정 할당", "성과 분석", "개선 조치"],
        "activities": [
          ["환경 데이터 수집", "전력, 가스, 물, 배출, 폐기물 데이터를 설비/공정 단위로 수집합니다."],
          ["제품별 할당", "에너지와 배출량을 lot, 제품, 주문, 공정에 배부합니다."],
          ["손실과 개선 분석", "idle energy, peak demand, scrap-driven waste를 분석합니다."],
          ["ESG 보고 연결", "운영 데이터에서 감사 가능한 지속가능성 보고 지표를 생성합니다."]
        ],
        "db": [
          ["sm_thread_sustainability_meter", "meter_id, resource_id, energy_type, unit, calibration_status"],
          ["sm_thread_sustainability_sample", "sample_id, meter_id, value, sample_time, quality_code"],
          ["sm_thread_sustainability_allocation", "allocation_id, lot_id, product_id, kwh, water_l, co2e_kg"]
        ],
        "rules": ["환경 데이터도 품질 코드와 계측기 교정 상태를 가져야 합니다.", "제품별 배부 기준은 version으로 관리합니다.", "지속가능성 KPI는 생산량과 품질 손실을 함께 고려합니다."],
        "tests": ["설비별 에너지 수집", "lot별 탄소 배부", "idle energy 분석", "ESG 지표 생성"]
      },
      {
        "slug": "analytics",
        "name": "Analytics",
        "ko": "분석 스레드",
        "summary": "MES, 설비, 품질, 공급망 데이터를 신뢰 가능한 분석 데이터셋으로 만들고 의사결정과 자동화에 연결합니다.",
        "student": "시험 점수만 모아도 분석은 되지만, 어떤 단원을 공부했는지, 공부 시간은 어땠는지 문맥이 있어야 좋은 분석이 됩니다.",
        "flow": ["데이터 수집", "문맥화", "Feature/KPI", "모델/분석", "의사결정 반영"],
        "activities": [
          ["데이터 문맥화", "tag, event, lot, recipe, 설비, 작업자, 자재 문맥을 연결합니다."],
          ["Feature Store 구성", "분석과 AI가 재사용할 feature와 KPI를 관리합니다."],
          ["모델 운영", "예측, 이상탐지, 최적화 모델의 version, 성능, drift를 관리합니다."],
          ["Action Feedback", "분석 결과가 dispatch, 품질, 보전, 스케줄 변경으로 이어졌는지 추적합니다."]
        ],
        "db": [
          ["sm_thread_analytics_dataset", "dataset_id, purpose, grain, owner, version, quality_score"],
          ["sm_thread_feature", "feature_id, dataset_id, feature_name, lineage_json, freshness_sec"],
          ["sm_thread_model_decision", "decision_id, model_id, object_id, recommendation, accepted_flag, outcome"]
        ],
        "rules": ["분석 데이터는 lineage와 quality score를 가져야 합니다.", "AI 추천은 사람이 수락/거부한 결과와 실제 효과를 추적합니다.", "모델 version과 학습 데이터 범위를 운영 이력에 남깁니다."],
        "tests": ["lot 문맥 feature 생성", "모델 drift 알림", "추천 수락/거부 기록", "KPI drill-down"]
      },
      {
        "slug": "security",
        "name": "Security",
        "ko": "보안 스레드",
        "summary": "IT/OT 연결, 계정, 권한, 원격접속, 취약점, 로그를 전 라이프사이클에 걸쳐 통제합니다.",
        "student": "공장 문을 아무나 열고 들어오게 두면 안 되듯, 디지털 공장도 데이터와 장비 명령에 접근할 수 있는 사람과 시스템을 통제해야 합니다.",
        "flow": ["자산/계정 식별", "권한 정책", "접속/명령 통제", "로그/탐지", "위험 대응"],
        "activities": [
          ["자산 보안 기준선", "장비, 서버, 계정, 포트, 소프트웨어 구성 기준을 정의합니다."],
          ["접근 제어", "사용자/서비스 계정의 최소 권한과 승인 workflow를 적용합니다."],
          ["이상 행위 탐지", "비정상 로그인, 명령, 데이터 접근, 설정 변경을 탐지합니다."],
          ["취약점/패치 관리", "OT 제약을 고려해 보완 통제와 예외 만료를 관리합니다."]
        ],
        "db": [
          ["sm_thread_security_asset", "asset_id, asset_type, owner, criticality, baseline_version"],
          ["sm_thread_security_access", "access_id, subject_id, resource_id, action, result, event_time"],
          ["sm_thread_security_risk", "risk_id, asset_id, risk_type, severity, mitigation, expire_at"]
        ],
        "rules": ["생산 명령 API는 인증, 권한, 감사 로그를 필수로 적용합니다.", "보안 예외는 만료일과 보완 통제를 가져야 합니다.", "원격 접속은 세션 기록과 승인 이력을 남깁니다."],
        "tests": ["권한 없는 명령 차단", "원격접속 감사", "보안 기준선 drift 감지", "취약점 예외 만료 알림"]
      },
      {
        "slug": "digital-twin-thread",
        "name": "Digital Twin / Thread",
        "ko": "디지털 트윈/스레드",
        "summary": "제품, 공정, 설비, 자재, 품질 이력을 연결해 실제 세계와 디지털 모델 사이의 연속적인 추적과 시뮬레이션을 가능하게 합니다.",
        "student": "실제 공장과 똑같이 움직이는 디지털 지도와 일기장을 만드는 것입니다. 현재 상태뿐 아니라 왜 그렇게 되었는지도 추적합니다.",
        "flow": ["모델 기준정보", "실시간 상태 동기화", "이력/계보 연결", "시뮬레이션", "의사결정 반영"],
        "activities": [
          ["디지털 thread 구성", "제품-BOM-공정-설비-lot-품질-출하 이력을 연결합니다."],
          ["상태 동기화", "실제 설비와 WIP 상태를 디지털 모델에 반영합니다."],
          ["시뮬레이션 연결", "capacity, bottleneck, 품질 위험, 보전 영향을 사전에 실험합니다."],
          ["closed-loop 운영", "시뮬레이션 결과를 schedule, dispatch, process control에 반영합니다."]
        ],
        "db": [
          ["sm_thread_digital_object", "digital_object_id, object_type, physical_id, model_version, current_state"],
          ["sm_thread_relationship", "from_object_id, to_object_id, relation_type, valid_from, valid_to"],
          ["sm_thread_simulation_run", "run_id, scenario, input_snapshot_id, result_json, executed_at"]
        ],
        "rules": ["디지털 객체는 실제 객체 ID와 안정적으로 매핑되어야 합니다.", "시뮬레이션 input snapshot은 재현 가능해야 합니다.", "모델과 실제 상태 차이는 drift로 관리합니다."],
        "tests": ["lot digital thread 조회", "설비 상태 동기화", "시나리오 simulation 저장", "모델 drift 감지"]
      },
      {
        "slug": "modeling-simulation",
        "name": "Modeling / Simulation",
        "ko": "모델링/시뮬레이션 스레드",
        "summary": "공정, 생산 흐름, 공급망, 설비 상태를 모델로 표현하고 변경 전 결과를 예측합니다.",
        "student": "실제 공장을 멈추지 않고 가상 실험실에서 먼저 실험해보는 활동입니다.",
        "flow": ["모델 정의", "데이터 보정", "시나리오 실행", "결과 비교", "운영 적용"],
        "activities": [
          ["모델 구성", "공정 시간, setup, capacity, 품질 확률, 보전 제약을 모델링합니다."],
          ["현장 데이터 보정", "실제 MES/설비 데이터를 사용해 모델 parameter를 보정합니다."],
          ["What-if 분석", "수요 변화, 설비 고장, 인력 부족, recipe 변경을 시나리오로 평가합니다."],
          ["운영 의사결정", "시뮬레이션 결과를 schedule, inventory, maintenance plan에 반영합니다."]
        ],
        "db": [
          ["sm_thread_model_definition", "model_id, model_type, scope, version, owner"],
          ["sm_thread_model_parameter", "model_id, parameter_name, value, source_data, calibrated_at"],
          ["sm_thread_model_scenario", "scenario_id, model_id, input_json, result_json, decision_status"]
        ],
        "rules": ["모델 parameter는 출처 데이터와 보정 시각을 가져야 합니다.", "시나리오 결과를 실제 운영에 적용하면 적용 이력을 남깁니다.", "모델 정확도는 실제 결과와 지속적으로 비교합니다."],
        "tests": ["capacity simulation", "고장 시나리오", "모델 parameter 보정", "예측-실제 오차 분석"]
      }
    ]
  },
  {
    "type": "technology",
    "dir": technology_dir,
    "title": "Enabling Technologies",
    "ko": "활성화 기술",
    "description": "스마트 제조를 가능하게 하는 기술입니다. 기술 자체가 목적이 아니라 Lifecycle과 Cross-Lifecycle Thread의 목표를 달성하는 수단으로 설계되어야 합니다.",
    "items": [
      {
        "slug": "iiot",
        "name": "IIoT",
        "ko": "산업용 사물인터넷",
        "summary": "설비, 센서, edge 장치를 연결해 현장 데이터를 더 빠르고 넓게 수집하고 제어 문맥에 연결합니다.",
        "student": "공장 안의 장비와 센서가 계속 말을 걸어주는 통신망을 만드는 것입니다.",
        "flow": ["센서/장비 연결", "Edge 수집", "데이터 표준화", "MES/Cloud 전달", "운영 action"],
        "activities": [
          ["장치 연결", "PLC, 센서, gateway, 장비 인터페이스를 연결합니다."],
          ["Edge 전처리", "필터링, buffering, protocol 변환, 품질 코드를 부여합니다."],
          ["데이터 문맥화", "tag를 설비, 공정, lot, recipe 문맥과 연결합니다."],
          ["운영 적용", "이상 신호를 품질, 보전, 생산 action으로 연결합니다."]
        ],
        "db": [
          ["sm_tech_iiot_device", "device_id, device_type, resource_id, protocol, status"],
          ["sm_tech_iiot_tag", "tag_id, device_id, tag_name, unit, sample_rate_ms"],
          ["sm_tech_iiot_sample", "sample_id, tag_id, value, sample_time, quality_code"]
        ],
        "rules": ["장치 데이터에는 발생 시각과 수신 시각을 모두 저장합니다.", "Edge 단절 시 buffering과 재전송 정책을 정의합니다.", "tag mapping is version으로 관리합니다."],
        "tests": ["센서 sample 수집", "edge 단절 후 재전송", "tag-lot 문맥 연결", "Bad quality sample 표시"]
      },
      {
        "slug": "big-data",
        "name": "Big Data",
        "ko": "빅데이터",
        "summary": "고빈도 설비 데이터, MES 이벤트, 품질 결과, 공급망 데이터를 대규모로 저장하고 분석 가능한 구조로 만듭니다.",
        "student": "공장의 모든 기록을 큰 도서관에 넣되, 나중에 찾기 쉽도록 분류와 색인을 잘 만드는 활동입니다.",
        "flow": ["데이터 수집", "Lake/Lakehouse 저장", "정제/문맥화", "Feature/KPI", "분석 소비"],
        "activities": [
          ["수집 파이프라인", "MES, IIoT, ERP, 품질 시스템 데이터를 안정적으로 수집합니다."],
          ["데이터 품질 관리", "schema, freshness, completeness, duplicate, lineage를 관리합니다."],
          ["분석 mart 구성", "lot, 제품, 설비, 공정 grain별 재사용 dataset을 만듭니다."],
          ["거버넌스", "소유자, 접근권한, 보존기간, 민감정보 정책을 적용합니다."]
        ],
        "db": [
          ["sm_tech_data_pipeline", "pipeline_id, source_system, target_zone, schedule, owner"],
          ["sm_tech_dataset_catalog", "dataset_id, name, grain, owner, quality_score, retention_days"],
          ["sm_tech_data_quality_issue", "issue_id, dataset_id, issue_type, severity, detected_at, status"]
        ],
        "rules": ["분석 dataset은 grain과 lineage가 명확해야 합니다.", "운영 KPI는 원천 이벤트로 drill-down 가능해야 합니다.", "데이터 보존 기간과 접근 권한은 도메인별로 관리합니다."],
        "tests": ["pipeline 지연 감지", "dataset quality score", "KPI 원천 이벤트 연결", "권한 없는 dataset 접근 차단"]
      },
      {
        "slug": "ai-ml",
        "name": "AI / ML",
        "ko": "AI/ML",
        "summary": "예측, 이상 탐지, 최적화, 추천을 통해 생산, 품질, 보전, 공급망 의사결정을 보조하거나 자동화합니다.",
        "student": "경험 많은 선생님처럼 데이터를 보고 다음에 문제가 생길 가능성을 알려주는 조교를 만드는 일입니다.",
        "flow": ["학습 데이터", "모델 학습", "검증/배포", "추천/예측", "결과 피드백"],
        "activities": [
          ["Use case 정의", "품질 예측, 설비 고장 예측, 스케줄 최적화처럼 업무 목표를 명확히 합니다."],
          ["Feature 관리", "문맥화된 데이터와 feature version을 관리합니다."],
          ["MLOps", "모델 version, 배포, drift, 성능, rollback을 관리합니다."],
          ["Human-in-the-loop", "AI 추천 수락/거부와 실제 효과를 추적합니다."]
        ],
        "db": [
          ["sm_tech_ml_model", "model_id, use_case, version, status, trained_at, metric_json"],
          ["sm_tech_ml_prediction", "prediction_id, model_id, object_id, prediction, confidence, predicted_at"],
          ["sm_tech_ml_feedback", "feedback_id, prediction_id, accepted_flag, action_taken, outcome"]
        ],
        "rules": ["AI 모델은 학습 데이터 범위와 version을 운영 이력에 남깁니다.", "낮은 confidence 추천은 자동 실행하지 않고 승인 workflow로 보냅니다.", "모델 drift가 감지되면 재학습 또는 rollback 기준을 적용합니다."],
        "tests": ["품질 예측 생성", "모델 version rollback", "추천 수락 feedback", "drift 알림"]
      },
      {
        "slug": "vr-ar",
        "name": "VR / AR",
        "ko": "VR/AR",
        "summary": "작업자 교육, 원격 지원, 보전 절차, 복잡한 조립/검사 작업을 시각적으로 지원합니다.",
        "student": "눈앞에 작업 순서와 주의사항이 겹쳐 보이는 실습 안내서를 만드는 것입니다.",
        "flow": ["작업 절차 모델", "3D/AR 콘텐츠", "현장 안내", "작업 확인", "교육/개선 피드백"],
        "activities": [
          ["절차 디지털화", "SOP와 작업 표준을 단계별 디지털 콘텐츠로 전환합니다."],
          ["현장 문맥 연결", "설비, 부품, 작업자 skill, 현재 작업 상태에 맞는 안내를 제공합니다."],
          ["원격 협업", "전문가가 현장 화면을 보고 안내하거나 annotation을 제공합니다."],
          ["교육 효과 측정", "수행 시간, 오류, 재작업, 숙련도 개선을 분석합니다."]
        ],
        "db": [
          ["sm_tech_ar_work_instruction", "instruction_id, operation_id, revision, content_uri, status"],
          ["sm_tech_ar_session", "session_id, person_id, resource_id, instruction_id, started_at, ended_at"],
          ["sm_tech_ar_step_result", "session_id, step_no, result, evidence_uri, confirmed_at"]
        ],
        "rules": ["현장에 표시되는 절차는 승인된 revision이어야 합니다.", "중요 step은 작업자 확인 또는 evidence capture를 요구할 수 있습니다.", "AR 콘텐츠 변경은 문서 관리와 동기화합니다."],
        "tests": ["승인된 AR 절차 표시", "step 확인 evidence 저장", "원격 지원 세션 기록", "교육 전후 오류율 비교"]
      },
      {
        "slug": "edge-to-cloud",
        "name": "Edge to Cloud",
        "ko": "엣지-클라우드",
        "summary": "현장 edge에서 빠른 처리와 안정성을 확보하고, cloud에서 확장 분석과 전사 공유를 수행하는 구조입니다.",
        "student": "교실 안에서는 바로 반응해야 하는 일은 교실 컴퓨터가 처리하고, 전교 통계는 중앙 서버가 계산하는 구조입니다.",
        "flow": ["Edge 수집/제어", "Local buffering", "Cloud 동기화", "분석/AI", "운영 피드백"],
        "activities": [
          ["Edge runtime 관리", "현장 가까운 곳에서 수집, 전처리, 경량 판단을 수행합니다."],
          ["동기화 정책", "네트워크 단절, 재전송, 순서 보장, 중복 제거를 처리합니다."],
          ["Cloud 분석", "대규모 저장, cross-site 분석, AI 학습을 수행합니다."],
          ["운영 배포", "Cloud에서 만든 rule/model을 edge로 안전하게 배포합니다."]
        ],
        "db": [
          ["sm_tech_edge_node", "edge_id, site_id, version, status, last_seen_at"],
          ["sm_tech_sync_queue", "queue_id, edge_id, object_type, payload_hash, sync_status, retry_count"],
          ["sm_tech_deployment", "deployment_id, edge_id, package_type, version, status, deployed_at"]
        ],
        "rules": ["Edge 단절 중에도 안전 관련 제어와 필수 수집은 유지되어야 합니다.", "Cloud 동기화는 idempotent하게 처리합니다.", "Rule/model 배포는 canary와 rollback을 지원합니다."],
        "tests": ["네트워크 단절 후 재동기화", "중복 payload 제거", "edge package rollback", "cloud model edge 배포"]
      },
      {
        "slug": "blockchain",
        "name": "Blockchain",
        "ko": "블록체인",
        "summary": "공급망 신뢰, 이력 위변조 방지, 다자간 traceability가 중요한 경우 선택적으로 사용하는 분산 원장 기술입니다.",
        "student": "여러 회사가 함께 쓰는, 몰래 고치기 어려운 공용 거래 장부라고 볼 수 있습니다.",
        "flow": ["공유 이벤트 정의", "증거 hash 생성", "원장 기록", "검증/조회", "감사/분쟁 대응"],
        "activities": [
          ["공유 범위 정의", "어떤 이벤트를 누구와 공유할지 정합니다."],
          ["증거 데이터 hash", "원본 데이터는 내부에 두고 hash 또는 증명 정보를 원장에 남깁니다."],
          ["Smart contract", "승인, 인수, 품질 release 같은 다자간 규칙을 자동화합니다."],
          ["감사 조회", "공급망 참여자가 동일한 이력 증거를 검증합니다."]
        ],
        "db": [
          ["sm_tech_chain_event", "chain_event_id, business_event_id, event_type, hash_value, chain_tx_id"],
          ["sm_tech_chain_party", "party_id, role, public_key, status"],
          ["sm_tech_chain_contract", "contract_id, contract_type, version, status"]
        ],
        "rules": ["개인정보와 민감 제조조건은 원장에 직접 저장하지 않습니다.", "원장 기록과 내부 원본 이벤트의 매핑을 보존합니다.", "다자간 프로세스에 실제 이득이 있을 때만 적용합니다."],
        "tests": ["품질 release hash 기록", "원본-hash 검증", "권한 없는 party 조회 차단", "smart contract 상태 전이"]
      },
      {
        "slug": "additive",
        "name": "Additive",
        "ko": "적층 제조",
        "summary": "3D 프린팅 등 적층 제조의 설계 파일, 빌드 조건, 소재 lot, 장비 상태, 후처리, 품질 이력을 연결합니다.",
        "student": "제품을 깎아서 만드는 대신 층층이 쌓아 만들기 때문에, 설계 파일과 장비 조건의 trace가 더 중요합니다.",
        "flow": ["설계/빌드 파일", "소재/장비 준비", "빌드 실행", "후처리/검사", "제품 genealogy"],
        "activities": [
          ["디지털 빌드 정의", "CAD, build file, orientation, support, parameter set을 관리합니다."],
          ["소재 trace", "분말/소재 lot, 재사용 횟수, 보관 조건을 추적합니다."],
          ["빌드 모니터링", "온도, laser power, layer image, chamber condition을 수집합니다."],
          ["후처리/품질 연결", "열처리, 가공, 검사 결과를 build genealogy와 연결합니다."]
        ],
        "db": [
          ["sm_tech_additive_build", "build_id, design_id, machine_id, material_lot_id, parameter_set_id, status"],
          ["sm_tech_additive_layer_data", "build_id, layer_no, image_uri, sensor_summary_json, result"],
          ["sm_tech_additive_postprocess", "postprocess_id, build_id, process_type, result, completed_at"]
        ],
        "rules": ["Build file과 parameter set은 승인된 revision이어야 합니다.", "소재 재사용 정책과 품질 상태를 시작 전에 검증합니다.", "Layer data는 최종 제품 serial과 연결되어야 합니다."],
        "tests": ["승인 build file 적용", "소재 lot 사용 제한", "layer anomaly 기록", "후처리 결과 genealogy 연결"]
      },
      {
        "slug": "robotics",
        "name": "Robotics",
        "ko": "로보틱스",
        "summary": "로봇, AMR/AGV, 협동로봇, 자동 handling 장치를 생산 실행과 안전, 품질 문맥에 연결합니다.",
        "student": "사람 대신 이동하거나 조립하는 자동 작업자를 MES 흐름 안에 등록하고 관리하는 것입니다.",
        "flow": ["작업 명령", "로봇/경로 준비", "자동 수행", "상태/안전 모니터링", "실적 피드백"],
        "activities": [
          ["로봇 capability 관리", "로봇이 수행 가능한 작업, payload, tool, route를 정의합니다."],
          ["작업 지시 연동", "MES dispatch와 로봇 mission 또는 program을 연결합니다."],
          ["안전/상태 감시", "interlock, e-stop, zone, collision, battery, health를 모니터링합니다."],
          ["실적과 예외 처리", "자동 작업 완료, 실패, 재시도, 수동 개입을 기록합니다."]
        ],
        "db": [
          ["sm_tech_robot", "robot_id, robot_type, capability, zone, status"],
          ["sm_tech_robot_mission", "mission_id, robot_id, work_id, route_id, status, priority"],
          ["sm_tech_robot_event", "event_id, robot_id, mission_id, event_type, event_time, payload_json"]
        ],
        "rules": ["로봇 mission은 MES 작업 상태와 동기화되어야 합니다.", "안전 interlock 발생 시 관련 dispatch를 즉시 중지하거나 재계산합니다.", "수동 개입은 작업 이력에 남깁니다."],
        "tests": ["로봇 mission 생성", "경로 blocked 재배정", "e-stop 이벤트 처리", "수동 개입 이력 저장"]
      },
      {
        "slug": "wireless",
        "name": "Wireless",
        "ko": "무선 기술",
        "summary": "Wi-Fi, 5G, LPWAN, RFID, BLE 등을 사용해 이동 자산, 작업자, 센서, 물류 데이터를 유연하게 연결합니다.",
        "student": "공장 안에서 움직이는 사람과 물건도 계속 위치와 상태를 알려줄 수 있게 만드는 통신 기반입니다.",
        "flow": ["무선 장치 등록", "위치/상태 수집", "네트워크 품질 관리", "MES 문맥 연결", "운영 action"],
        "activities": [
          ["무선 자산 식별", "RFID, BLE tag, mobile terminal, wireless sensor를 등록합니다."],
          ["위치 추적", "자재, carrier, 작업자, 이동 설비의 위치를 수집합니다."],
          ["통신 품질 관리", "coverage, latency, packet loss, roaming 문제를 모니터링합니다."],
          ["현장 업무 적용", "이동식 검수, 전자 작업지시, 위치 기반 dispatch에 활용합니다."]
        ],
        "db": [
          ["sm_tech_wireless_device", "device_id, device_type, owner_object_id, protocol, battery_status"],
          ["sm_tech_wireless_location", "event_id, device_id, location_id, accuracy_m, event_time"],
          ["sm_tech_wireless_network_kpi", "kpi_id, zone_id, latency_ms, packet_loss_pct, measured_at"]
        ],
        "rules": ["위치 정확도와 freshness를 업무 판단에 함께 사용합니다.", "무선 단절은 작업자에게 명확한 offline 상태로 표시합니다.", "작업자 위치 데이터는 개인정보 접근 정책을 적용합니다."],
        "tests": ["RFID 위치 이벤트 수집", "저전압 tag 알림", "무선 단절 offline 표시", "위치 기반 dispatch"]
      }
    ]
  }
]

def getSmartManufacturingPseudocode(concept_type, item_slug):
    codes = {
        # 1. Lifecycles
        "production": """// =================================================================
// [생산 라이프사이클 - Production Lifecycle]
// [목적] 작업지시 접수부터 원자재/자원/자격 검증, 실시간 현장 실행 통제 및 실적 ERP 피드백까지의 흐름 제어
// =================================================================

function executeProductionWorkflow(lotId) {

  // [1단계] 실시간 대기 오더 정보 및 라우팅 사양 로드
  // 수급 요건에 따라 MES 실행 큐에서 대상 Lot의 작업 지시와 제품 라우팅을 로드합니다.
  const lot = loadLotContext(lotId);
  const route = loadProductRoute(lot.productId, lot.currentOperationId);


  // [2단계] 실행 3대 핵심 요건(자재, 설비, 작업자) 실시간 교차 검증
  // - checkMaterialStaging: 원재료 또는 이전 공정 완료품이 해당 공정 워크스테이션에 Staging 되었는지 검사
  // - checkResourceAvailability: 대상 설비의 가동 상태가 '가용(AVAILABLE)'이고 인터락(Interlock)이 해제되었는지 검사
  // - checkWorkerQualification: 투입하려는 작업자 계정이 해당 특정 가공 장비와 공정 자격(Skill Level)을 보유했는지 검사
  const isMaterialReady = checkMaterialStaging(lotId, route.requiredMaterials);
  const isResourceAvailable = checkResourceAvailability(lot.resourceId);
  const isWorkerQualified = checkWorkerQualification(lot.operatorId, lot.currentOperationId);

  if (!isMaterialReady || !isResourceAvailable || !isWorkerQualified) {
    throw new Error("[생산 통제 실패] 생산 착수 요건이 불충족되었습니다. (자재/설비/작업자 확인 필요)");
  }


  // [3단계] 현장 설비 시작 신호 전송 및 Recipe 자동 매핑/다운로드
  // EAP(Equipment Automation Protocol) 통신 채널을 통해 설비 PLC에 해당 제품 가공용 검증 완료된 레시피 변수를 하달합니다.
  const downloadSuccess = downloadRecipeParameters(lot.resourceId, route.recipeId);
  if (!downloadSuccess) {
    throw new Error("[통신 오류] 설비 레시피 다운로드 트랜잭션이 실패했습니다.");
  }


  // [4단계] Lot 생산 상태 'STARTED' 전이 및 Digital Thread 계보 트래킹 시작
  // Lot 마스터의 현재 작업 상태를 '가동중(RUNNING)'으로 승격하고 디지털 스레드 레코드를 생성하여
  // 향후 4M (Man, Machine, Material, Method) 이력을 추적할 수 있도록 컨텍스트를 바인딩합니다.
  updateLotStatus(lotId, "STARTED");
  const threadId = startDigitalThread(lotId, {
    workOrderId: lot.workOrderId,
    resourceId: lot.resourceId,
    operatorId: lot.operatorId,
    timestamp: new Date().toISOString()
  });


  // [5단계] 실시간 ANDON 보드 및 타 도메인에 시작 완료 이벤트 전파
  // 이벤트 브로커에 PRODUCTION_STARTED 이벤트를 전송하여 물류(AGV) 및 원자재 모듈에 생산 소비 트랙을 동기화합니다.
  publishEvent("PRODUCTION_STARTED", { lotId, threadId });

}""",
        "production-asset": """// =================================================================
// [생산 자산 라이프사이클 - Production Asset Lifecycle]
// [목적] 설비, 치공구, 로봇 등 물리적 자산의 가동상태/교정기한 동적 모니터링 및 보전 연계
// =================================================================

function monitorAssetHealth(assetId) {

  // [1단계] 자산의 실시간 센서 계측 데이터 및 상태 로드
  // 설비 마스터 정보 및 IoT Gateway를 통해 계측된 가동 파라미터(누적 타수, 가동 시간 등)를 조회합니다.
  const asset = loadAssetMaster(assetId);
  const healthData = readAssetSensors(assetId);


  // [2단계] 치명적 예방 보전(PM) 주기 및 정밀 교정(Calibration) 만료 여부 확인
  // - checkCalibrationValidity: 계측기의 검교정 유효기간이 지났는지 실시간 대조
  // - pmThresholdShots: 설비 및 금형의 설계 수명 한계 타수(Shot Count)와 현재 누적치 비교
  const isCalibrationExpired = checkCalibrationValidity(assetId);
  const isPmDue = (asset.accumulatedShots >= asset.pmThresholdShots);

  if (isCalibrationExpired || isPmDue) {
    // 자산 가동 안전을 위해 즉시 설비 종합 효율 측정 대상에서 차단 및 물리 가동 락(Interlock) 실행
    triggerAssetLock(assetId, "MAINTENANCE_REQUIRED");
    
    
    // [3단계] CMMS/보전 모듈에 긴급 예방 보전 작업 지시(PM Work Order) 자동 발행
    // 작업 오더가 발행되면 정비팀 단말기에 즉각 푸시가 전송되며, 자산은 '정비대기(DOWN)' 상태로 전이됩니다.
    const mwId = createMaintenanceWorkOrder({
      assetId: assetId,
      triggerType: isCalibrationExpired ? "CALIBRATION_EXPIRED" : "PM_THRESHOLD_REACHED",
      priority: "HIGH"
    });
    
    publishEvent("ASSET_MAINTENANCE_TRIGGERED", { assetId, mwId });
    return;
  }


  // [4단계] 이상이 없으면, 센서 이상 트렌드 분석 수행 (예지 보전 연동)
  // 실시간 모터 동작 온도 또는 진동 가속도가 Warning 임계치를 이탈하는 추세가 탐지되면, AI 모듈에 심층 추론을 태웁니다.
  if (healthData.temperature > asset.tempWarningLimit) {
    publishEvent("ASSET_HEADING_ANOMALY", { assetId, currentTemp: healthData.temperature });
  }

}""",
        "product": """// =================================================================
// [제품 라이프사이클 - Product Lifecycle]
// [목적] 설계 변경(ECO/ECN) 정보의 실시간 생산 현장Lot 영향 분석 및 공정 적용 Interlock 수립
// =================================================================

function applyEngineeringChange(productDefinitionId, newRevision) {

  // [1단계] PLM 시스템으로부터 접수된 설계 변경(ECO) 세부 사항 파싱
  // 변경된 새로운 라우팅(Route), 신규 기계 가공 파라미터 레시피, 그리고 변경 유형(치명도 등급)을 로드합니다.
  const eco = getActiveEngineeringChange(productDefinitionId, newRevision);
  
  
  // [2단계] 현재 공장 라인에서 해당 품목으로 생산 중인 모든 활성 WIP(Lot 목록) 추출
  // 공정 중에 머물고 있어 설계 스펙 변경에 영향을 받는 모든 재공(WIP) 목록을 추출합니다.
  const affectedLots = getActiveWipLotsByProduct(productDefinitionId);


  // [3단계] 설계 변경 영향 평가 및 각 Lot에 대한 처분 결정(Disposition) 자동 부여
  for (const lot of affectedLots) {
    if (eco.changeType === "CRITICAL_SAFETY") {
      // 치명적 품질 변경의 경우, 공정 중간 Lot을 즉시 강제 보류(Auto-Hold) 조치
      // 안전성 등 위험이 포함된 중대 사안이므로 작업 중인 라인의 Lot을 'HOLD' 상태로 변경하여 물류 흐름을 잠금합니다.
      updateLotStatus(lot.lotId, "HOLD", `ECO_AUTO_HOLD: ${eco.ecoNo}`);
      
      // 변경된 새로운 라우팅 및 레시피 바인딩 처리
      rebindLotRouteAndRecipe(lot.lotId, eco.targetRouteId, eco.targetRecipeId);
      
      publishEvent("LOT_ECO_HOLD", { lotId: lot.lotId, ecoNo: eco.ecoNo });
    } else {
      // 경미한 변경의 경우, 현재 공정까지 진행 후 신규 revision 적용 (Phase-in)
      // 이전 공정이 끝나는 시점에 소프트 전환을 위해 타겟 변경 버전을 예약 마크해 둡니다.
      setLotChangeoverVersion(lot.lotId, newRevision);
    }
  }


  // [4단계] 기준정보 마스터의 품목 정의 정보 신버전으로 최종 활성화
  // 이후 새로 투입되는 원자재 투입 건(Release)부터는 100% 신버전 개정판(REV-C)이 자동 강제 바인딩됩니다.
  activateProductRevision(productDefinitionId, newRevision);

}""",
        "supply-chain": """// =================================================================
// [공급망 라이프사이클 - Supply Chain Lifecycle]
// [목적] 원자재 입고Lot 품질 검증, 보관 수명 관리 및 투입 시 실시간 백플러시 재고 동기화
// =================================================================

function processMaterialStaging(materialLotId, targetAreaId) {

  // [1단계] 자재 Lot의 수입 검사 성적(CoA) 및 격리 승인(Released) 상태 검증
  // ERP 및 WMS로부터 격리 구역에 대기 중이던 원부자재 Lot의 최종 바코드 마스터를 로드합니다.
  const matLot = loadMaterialLot(materialLotId);
  
  if (matLot.status !== "RELEASED" || matLot.isHold) {
    throw new Error("[자재 검증 실패] 해당 원자재 Lot은 수입검사 미통과 혹은 품질 보류 상태입니다.");
  }


  // [2단계] 자재의 유효수명(Shelf Life) 만료 여부 확인 (FEFO 룰 적용)
  // 유효기한 선입선출(First Expired First Out) 규칙에 따라 유효 기한 만료 상태를 체크합니다.
  const isExpired = (new Date(matLot.expirationDate) < new Date());
  if (isExpired) {
    updateMaterialLotStatus(materialLotId, "EXPIRED_HOLD");
    throw new Error("[자재 수명 만료] 유효기한이 경과한 원자재입니다. 즉시 폐기 구역으로 이동하십시오.");
  }


  // [3단계] 생산 현장 작업장(Staging Area)으로 물류 이동(Location Update) 기록
  // WMS(창고관리)와 실시간 MES 물류 이적 기록 시스템에 입고 및 이동 이벤트를 업데이트합니다.
  recordMaterialMovement(materialLotId, matLot.currentLocation, targetAreaId);


  // [4단계] Lot 생산 소비량 차감 및 ERP 재고 실시간 동기화(Backflush) 연동 정보 전송
  // 생산 현장에서 투입 및 소비 확정된 실데이터를 바탕으로 ERP의 자재 분개를 위한 차감 트랜잭션을 실행합니다.
  const consumptionId = createConsumptionLog({
    materialLotId: materialLotId,
    consumedQty: matLot.allocatedQty,
    timestamp: new Date().toISOString()
  });

  publishEvent("MATERIAL_CONSUMED", { materialLotId, consumptionId });

}""",
        "workforce": """// =================================================================
// [인력 라이프사이클 - Workforce Lifecycle]
// [목적] 작업자의 공정 자격 등급(Skill Matrix) 및 필수 안전 교육 통과 여부를 동적으로 판별해 투입 차단
// =================================================================

function verifyAndAssignOperator(operatorId, operationId, resourceId) {

  // [1단계] 인사 마스터에서 해당 작업자 상태 조회
  // 조작자가 인사 시스템 상에 정상 재직 중이며, 계정이 활성 상태(Active)인지 검증합니다.
  const operator = loadOperatorProfile(operatorId);
  if (!operator.activeFlag) {
    throw new Error("[인사 통제] 비활성화 또는 퇴사 처리된 작업자 계정입니다.");
  }


  // [2단계] 대상 공정에 해당하는 필수 기술 라이선스 및 유효기한 검증
  // - getOperatorSkill: 품목군 및 정밀 특수 장비의 Skill Level 매트릭스를 로드
  // - status === 'CERTIFIED': 자격을 정식 획득했는지 유무
  const skillMatrix = getOperatorSkill(operatorId, operationId);
  const isCertified = (skillMatrix && skillMatrix.status === "CERTIFIED");
  const isExpired = skillMatrix ? (new Date(skillMatrix.expireDate) < new Date()) : True;

  if (!isCertified || isExpired) {
    // 무자격 조작 사고를 방지하기 위해 설비 시작 인터락(Interlock) 작동
    triggerEquipmentInterlock(resourceId, "OPERATOR_UNAUTHORIZED");
    throw new Error("[자격 미달] 이 공정을 단독 운전할 수 있는 유효 자격증(Certification)이 없습니다.");
  }


  // [3단계] 유독/위험 환경 공정일 경우, 최근 1년 내 필수 안전(EHS) 교육 이수 여부 체크
  // 안전 관리를 위해 위험 장비의 조작 전, 법적으로 규제되는 연간 정기 안전보건 교육 수료 여부를 대조합니다.
  const isSafetyTrained = verifySafetyTraining(operatorId, "EHS-HAZARDOUS");
  if (!isSafetyTrained) {
    throw new Error("[안전 위반] 위험 공정 투입에 필요한 필수 안전 보건 교육을 이수하지 않았습니다.");
  }


  // [4단계] 자격 통과 완료 시, 직접 노무 투입 공수(Direct Labor) 측정 세션 개시
  // 정확한 제조 원가 산정 및 작업 효율 측정을 위해 실시간 노무 집계 타이머 트랜잭션을 구동합니다.
  startLaborDirectSession(operatorId, resourceId, operationId);

}""",
        "order-to-cash": """// =================================================================
// [주문-현금화 라이프사이클 - Order-to-Cash Lifecycle]
// [목적] 고객 주문 기준 실시간 약속가능납기(ATP) 연산 및 출하 전 최종 품질 문서 동적 일괄 확인
// =================================================================

function releaseOrderForShipment(customerOrderId) {

  // [1단계] 고객 주문 사양 및 포장 정보 수신
  // ERP와 직접 유기 연계된 수주(Sales Order) 사양과 요청 납기일, 배송 포장 사양을 로드합니다.
  const order = loadCustomerOrder(customerOrderId);
  
  
  // [2단계] 생산 매핑 Lot의 물리적 생산 완료 및 수율 충족 여부 확인
  // 생산 시작 시 SO와 엮였던(MTO 연동) Lot들의 공정이 100% 종결('COMPLETED')되었는지 확인합니다.
  const mappedLots = getProductionLotsForOrder(customerOrderId);
  const uncompletedLots = mappedLots.filter(lot => lot.status !== "COMPLETED");

  if (uncompletedLots.length > 0) {
    throw new Error("[출하 차단] 해당 주문에 할당된 생산 Lot 중 일부가 아직 공정 미완료 상태입니다.");
  }


  // [3단계] 출하 전 필수 품질 보증 문서(CoA, CoC) 생성 검증
  // - verifyCertificateOfAnalysis: 출하 품질 성적서(Certificate of Analysis) 최종 승인 체크
  // 고객사 표준에 규정된 문서 형식이 생성 및 최종 릴리스 되었는지 유무를 확인합니다.
  const coaStatus = verifyCertificateOfAnalysis(customerOrderId);
  if (!coaStatus.ready) {
    throw new Error("[출하 보류] 고객 제출용 성적서(CoA)가 품질 부서의 승인을 받지 못했습니다.");
  }


  // [4단계] 출하 확정 상태 전이 및 ERP 배송 오더 연동
  // WMS의 출고 릴리스 및 운송장 발행 모듈에 출고(RELEASED) 이벤트를 전파합니다.
  updateOrderStatus(customerOrderId, "SHIPPED_RELEASED");
  
  // 고객사 전용 EDI 시스템에 최종 생산 Traceability 리포트 자동 발송
  generateAndSendTraceReport(customerOrderId, order.customerEmail);

  publishEvent("ORDER_SHIPPED", { customerOrderId, timestamp: new Date().toISOString() });

}""",

        # 2. Threads
        "quality": """// =================================================================
// [품질 스레드 - Quality Thread]
// [목적] 실시간 공정 성적 수집, 통계적 제어 한계(SPC) 이탈 분석 및 실시간 물류 락(Auto-Hold) 연동
// =================================================================

function evaluateQualityMetrics(lotId, parameterName, measuredValue) {

  // [1단계] 공정 및 품목 전용 공식 엔지니어링 스펙(LSL, USL) 검증 정보 로드
  // 제품 스펙 마스터에서 측정된 항목의 스펙 규격 상한(USL), 하한(LSL) 및 목표값(Target)을 로드합니다.
  const spec = loadInspectionSpec(lotId, parameterName);
  
  
  // [2단계] 단순 규격 이탈(Out of Spec) 및 SPC 통계 규칙(예: Nelson Rules) 실시간 대조
  // 단순히 공차를 벗어난 것 외에도, 평균선 연속 편향이나 지그재그 패턴 등 통계적 가동 불량이 있는지 분석합니다.
  const isOos = (measuredValue < spec.lsl || measuredValue > spec.usl);
  const isSpcAnomaly = runSpcStatisticalRules(lotId, parameterName, measuredValue);


  // [3단계] 결함 감지 시 즉각적인 격리 조치 수행
  if (isOos || isSpcAnomaly) {
    const ncId = generateUniqueId("NC");
    
    // 3-1. Lot 마스터 상태를 즉각 'HOLD(품질보류)'로 강제 잠금하여 추가 가공 및 출고 원천 차단
    // 부적합품 오투입으로 인한 후공정 연쇄 불량 파급을 막기 위해 MES 물리적 바코드를 Auto-Hold 처리합니다.
    lockLotLogistics(lotId, "QUALITY_HOLD", `PARAMETER: ${parameterName}, VALUE: ${measuredValue}`);
    
    
    // 3-2. 부적합(Nonconformance) 보고서를 발행하고 시정 예방 조치(CAPA)에 자동 바인딩
    // 품질 경영 규격 준수를 위한 부적합 보고서(NCR)를 정식 등록하고 트래킹 프로세스를 시동합니다.
    createNonconformanceRecord({
      ncId: ncId,
      lotId: lotId,
      defectType: isOos ? "OUT_OF_SPEC" : "SPC_RULE_VIOLATION",
      measuredValue: measuredValue,
      severity: "CRITICAL"
    });
    
    publishEvent("LOT_AUTO_HOLD_EXECUTED", { lotId, ncId, reason: "QUALITY_VIOLATION" });
    return "HOLD_EXECUTED";
  }


  // [4단계] 정상인 경우, 검사 실적 성적서 테이블에 안전 저장
  // 이상이 없는 정상 성적은 실시간 추적(Traceability) DB에 저장되어 고객 성적 보증 기초 정보로 활용됩니다.
  saveInspectionResult(lotId, parameterName, measuredValue, "PASS");
  return "PASS";

}""",
        "compliance": """// =================================================================
// [컴플라이언스 스레드 - Compliance Thread]
// [목적] 전자서명, 데이터 무결성 보장 및 감사 추적(Audit Trail)용 규제 준수 이력 영구 기록
// =================================================================

function recordAuditTrail(objectId, action, beforeValue, afterValue, operatorId, reason) {

  // [1단계] ALCOA+ 데이터 무결성 표준에 기반한 입력 변수 유효성 검증
  // 감사 데이터에 주체가 누락되거나 위변조 위험을 원천 방지하기 위해 필수 추적 필드를 검사합니다.
  if (!objectId || !action || !operatorId) {
    throw new Error("[보안 실패] 감사 추적 필수 기록 요소가 유실되었습니다.");
  }


  // [2단계] 조작자가 중요 데이터 정정/승인 권한이 있는지 이중 보안 체크
  // FDA 21 CFR Part 11과 같은 국제 의료/식품 규제 준수를 위한 중요 프로세스 강제 승인 권한 여부 대조 단계입니다.
  const operator = loadOperatorProfile(operatorId);
  const isAuthorized = verifySecurityRole(operatorId, "AUDIT_EDITOR");

  if (!isAuthorized) {
    throw new Error("[권한 거부] 규제 관련 이력을 직접 변경할 수 있는 권한이 없습니다.");
  }


  // [3단계] 변경 사유(Justification Reason) 필수 입력 확인 (규제 산업 필수 준수사항)
  // 데이터의 수정 전/후뿐 아니라, '왜 이 시점에 보류 값을 수동으로 해제했는지' 변경 사유가 누락되면 수정을 거부합니다.
  if (!reason || reason.trim().length < 5) {
    throw new Error("[사유 누락] 데이터 수정 사유를 5자 이상 상세히 기록해야 정정이 가능합니다.");
  }


  // [4단계] 위변조가 불가능한 형태로 감사 추적 감사 이력(Audit Trail Log) 영구 적재
  // 보안 데이터베이스 및 시스템 보안 로그에 저장 시점 IP와 물리 시각, 이전값/이후값을 암호화 해시와 함께 영구 보존합니다.
  const auditEntry = {
    auditId: generateUniqueId("AUDT"),
    objectId: objectId,
    action: action,
    beforeValue: beforeValue,
    afterValue: afterValue,
    operatorId: operatorId,
    reason: reason,
    clientIp: getClientIpAddress(),
    timestamp: new Date().toISOString()
  };

  writeSecureAuditDb(auditEntry);

}""",
        "sustainability": """// =================================================================
// [지속가능성 스레드 - Sustainability Thread]
// [목적] 생산 가동 센서/계측기 전력/에너지 미터링 및 Lot별 탄소 배출량 실시간 배부 연산
// =================================================================

function calculateLotCarbonFootprint(lotId) {

  // [1단계] 대상 Lot이 머물렀던 설비(Resource)와 공정 시간 슬롯 조회
  // 제품 Lot의 생산 라우팅 계보를 훑어 어떤 설비에서 몇 분 동안 실시간 가열/가공 처리를 거쳤는지 기간을 도출합니다.
  const lotExecution = getLotExecutionHistory(lotId);
  let totalCarbonKg = 0.0;


  // [2단계] 설비에 매핑된 실시간 에너지 계측기(Power Meter) 데이터 로드
  for (const step of lotExecution) {
    // 해당 가공 시간 윈도우(Time Window) 동안 센서로부터 실시간 수집된 실제 전력 사용량(kWh)을 구합니다.
    const rawPowerKwh = getMeterEnergyConsumption(step.resourceId, step.startTime, step.endTime);
    
    
    // [3단계] 국가 표준 전력 탄소 배출 계수(Carbon Emission Factor)를 적용하여 배출량 계산
    // 에너지를 소비한 위치의 국가/지역 탄소 그리드 믹스를 곱해 이산화탄소 상당량(CO2e)을 환산합니다.
    const carbonFactor = getCarbonEmissionFactor("ELECTRICITY");
    const stepCarbon = rawPowerKwh * carbonFactor;
    
    
    // [4단계] 동시 혼재 가공(Multi-Lot Campaign)인 경우, Lot 생산 중량 비율별 지분 분할 배부
    // 용광로나 건조기 등 여러 Lot이 일괄 혼재되어 가공될 경우, 각 Lot의 투입 중량비를 계산하여 지분만큼 할당 배부합니다.
    const lotWeightRatio = getLotWeightRatioInCampaign(step.campaignId, lotId);
    const allocatedCarbon = stepCarbon * lotWeightRatio;
    
    totalCarbonKg += allocatedCarbon;
  }


  // [5단계] Lot 디지털 스레드 데이터에 최종 지속가능성 지표(Carbon Footprint) 바인딩
  // 제품 단위별로 배부된 탄소 배출량 정보를 ESG 보고 시스템과 매칭시켜 공정 개선에 피드백합니다.
  saveLotSustainabilityMetric(lotId, "CO2e_KG", totalCarbonKg);

  publishEvent("LOT_CARBON_FOOTPRINT_CALCULATED", { lotId, carbonKg: totalCarbonKg });

}""",
        "analytics": """// =================================================================
// [분석 스레드 - Analytics Thread]
// [목적] 이종 제조 데이터(설비, 공정, 품질) 실시간 취합, Feature 생성 및 이상 징후 머신러닝 분석
// =================================================================

function generateRealtimeFeatureVector(lotId) {

  // [1단계] 대상 Lot의 실시간 가공 중에 축적된 시계열 데이터(온도, 진동 등) 추출
  // 초당 수백 회씩 IIoT 단말에서 유입되는 센서 계측 시계열 원시 데이터셋(Raw Series)을 읽어옵니다.
  const sensorSeries = getLotTimeSeriesSensors(lotId);
  
  
  // [2단계] 분석 모델이 요구하는 기술 통계적 Feature(평균, 편차, Peak-to-Peak 등) 계산
  // - calculateStdDev: 노이즈 분석을 위한 편차 특징값
  // - durationSeconds: 순수 설비 가동 타임스팬
  const featureVector = {
    meanTemp: calculateAverage(sensorSeries.temperature),
    stdDevVibration: calculateStdDev(sensorSeries.vibration),
    maxPressure: calculateMax(sensorSeries.pressure),
    durationSeconds: getLotProcessingDuration(lotId)
  };


  // [3단계] Feature Store에 정규화된 형태의 Dataset 스냅샷 영구 저장
  // MLOps 파이프라인에서 즉각 재학습에 활용할 수 있게 특징 벡터 표준 포맷으로 피쳐 스토어에 보존합니다.
  saveFeatureDataset(lotId, featureVector);


  // [4단계] AI 분석 엔진에 Feature 분석 명령 전달 및 이상 가동 징후 실시간 예측
  // 배포된 추론 모듈에 특징 벡터를 하달하여 설비 치명적 고장 또는 공정 품질 이상 스코어를 도출합니다.
  const prediction = runMlInference("ANOMALY_MODEL", featureVector);
  
  if (prediction.anomalyScore > 0.85) {
    // 경고 이벤트 발행을 통해 디스패칭 스케줄에 즉시 알림 반영
    // 현장 관리자의 모바일 및 ANDON 화면에 이상 징후 조치를 지시하는 경보를 전송합니다.
    publishEvent("ANALYTICS_ANOMALY_DETECTED", {
      lotId: lotId,
      score: prediction.anomalyScore,
      actionRecommend: "INSPECT_EQUIPMENT"
    });
  }

}""",
        "security": """// =================================================================
// [보안 스레드 - Security Thread]
// [목적] IT/OT 통합 연동 시 JWT 검증, 접근 권한 체크 및 원격 설비 제어 명령 방어
// =================================================================

function authorizeOtControlCommand(authToken, resourceId, commandType) {

  // [1단계] 유입된 OAuth2/JWT 보안 토큰의 무결성 및 서명 만료 상태 검증
  // OT 영역과 IT 영역을 횡단하는 API 연동 게이트웨이 단계에서 서명 토큰 유효성을 판독합니다.
  const decodedToken = verifyJwtToken(authToken);
  if (!decodedToken || decodedToken.isExpired) {
    throw new Error("[보안 위반] 유효하지 않거나 만료된 보안 토큰입니다.");
  }


  // [2단계] 조작 대상 물리 설비에 부여된 중요 보안 임계치(Criticality Level) 확인
  // 해당 설비가 공장 라인 전체를 중단시킬 수 있는 핵심 보완 자산인지 정책 프로파일을 읽어옵니다.
  const resource = loadResourceSecurityPolicy(resourceId);
  
  
  // [3단계] 토큰 내 작업자 권한(Roles)과 공정 제어 매트릭스(Control Matrix) 대조
  // - checkUserRolePermission: 해당 사용자가 해당 명령(EMERGENCY_SHUTDOWN 등)을 내릴 자격이 있는지 대조
  const hasPermission = checkUserRolePermission(decodedToken.userId, resourceId, commandType);
  if (!hasPermission) {
    // 권한 없는 악의적 설비 중단/기동 방지를 위해 접근 로그를 남기고 즉시 차단
    // 산업 제어 시스템에 위해를 줄 수 있는 무인가 제어 동작에 대해 강제 예외 처리 및 SIEM 통보를 수행합니다.
    logSecurityBreach(decodedToken.userId, resourceId, commandType);
    throw new Error("[접근 거부] 해당 설비에 대한 직접 제어 권한이 허용되지 않았습니다.");
  }


  // [4단계] 승인 성공 시, 보안 감사 로그 생성 및 임시 일회성 토큰 발급
  // 최종 설비 통제 명령을 쏠 수 있는 원타임 티켓 암호 키와 상세 원격 트레이스 로그를 적재합니다.
  const traceId = writeSecurityAuditLog({
    userId: decodedToken.userId,
    resourceId: resourceId,
    command: commandType,
    clientIp: getClientIpAddress()
  });

  return { authorized: true, auditTraceId: traceId };

}""",
        "digital-twin-thread": """// =================================================================
// [디지털 트윈/스레드 - Digital Twin / Thread]
// [목적] 현장 설비/물류 물리적 이벤트 발생 시 실시간 가상 객체 상태 동기화 및 3D 지도 갱신
// =================================================================

function syncPhysicalToDigitalTwin(physicalResourceId, rawEventPayload) {

  // [1단계] 물리 설비 ID와 일대일 매핑된 가상의 디지털 트윈 객체(Digital Twin Object) 탐색
  // 디지털 트윈 모델의 노드 맵 데이터로부터 실제 물리 머신에 바인딩된 가상 트윈 객체를 도출합니다.
  const twinObject = findDigitalTwinObject("EQUIPMENT", physicalResourceId);
  if (!twinObject) {
    throw new Error("[트윈 오류] 가상 세계에 매핑된 디지털 자산 노드가 존재하지 않습니다.");
  }


  // [2단계] 설비의 물리 센서 값으로 가상 모델의 속성 상태 실시간 동기화
  // IIoT 에이전트로부터 유입된 텔레메트리 바디를 바탕으로 가상 설비의 기하학적 작동 모션 및 온도를 갱신합니다.
  const parsedMetrics = parseTelemetryData(rawEventPayload);
  twinObject.currentState = parsedMetrics.machineState; // RUNNING, STANDBY, DOWN 등
  twinObject.lastTemperature = parsedMetrics.temp;
  twinObject.lastSyncAt = new Date().toISOString();


  // [3단계] 3D 현장 통합 관제 시스템 및 WebGL 대시보드 시각화 정보 즉시 동적 갱신
  // WebGL 렌더러에 신호를 보내어 3D 스마트 공장 뷰어의 설비 애니메이션 속도를 실시간 연동 조정합니다.
  refreshWebGLViewport(twinObject.sceneNodeId, twinObject);


  // [4단계] 디지털 스레드(Genealogy & History Chain)에 가상 물리 상태 전이 스탬프 누적
  // 공정 이력 흐름 및 디지털 계보(Thread)에 이벤트를 적재하여 디지털 시공간 데이터를 완성합니다.
  appendDigitalThreadTrace({
    twinObjectId: twinObject.id,
    state: twinObject.currentState,
    eventTime: parsedMetrics.timestamp
  });

}""",
        "modeling-simulation": """// =================================================================
// [모델링/시뮬레이션 스레드 - Modeling / Simulation]
// [목적] 실제 가동 이력 기반 모델 파라미터 자동 보정 및 What-if 가상 스케줄 시나리오 시뮬레이션
// =================================================================

function runWhatIfSchedulingSimulation(areaId, newOrderVolume) {

  // [1단계] 실시간 MES 운영 DB로부터 현재 라인 내 잔여 WIP 현황 및 설비 가동 상태 스냅샷 추출
  // 현재 가공 대기 중인 실제 Lot 수량과 설비 고장 상태 등 라인 현실 가동 능력을 스냅샷으로 캡처합니다.
  const stateSnapshot = captureCurrentOperationalState(areaId);
  
  
  // [2단계] 최근 3개월의 실제 설비 종합효율(OEE) 및 라우팅 택트타임(Tact Time) 통계값으로 모델 모수 자동 보정
  // 정적 설계 사양이 아닌, 계절적 요인 및 고장 분포가 반영된 '실제 현장 가용률 통계'로 시뮬레이션 변수를 교정합니다.
  const calibratedParams = calibrateSimulationParameters(areaId);


  // [3단계] 추가 신규 오더 투입에 따른 가상 몬테카를로 시뮬레이션(Monte Carlo Simulation) 100회 실행
  // 가상 라인을 구동하여 다양한 병목 변수를 포함하는 가동 예측 흐름을 대량 시뮬레이션합니다.
  const simulationResult = executeSimulationEngine({
    snapshot: stateSnapshot,
    params: calibratedParams,
    testVolume: newOrderVolume,
    iterations: 100
  });


  // [4단계] 시뮬레이션 예측 병목 라인(Bottleneck) 및 최종 납기 준수율(On-Time Delivery) 지표 계산
  // - findPredictedBottlenecks: 투입 집중으로 인한 병목 장비 식별
  // - calculateOnTimeSuccessRate: 통계적 납기 달성 안정성 비율 산출
  const predictedBottleneck = findPredictedBottlenecks(simulationResult);
  const onTimePercentage = calculateOnTimeSuccessRate(simulationResult);


  // [5단계] 최선의 시나리오 결과안을 도출해 현장 스케줄 변경 가이드로 피드백
  // 시뮬레이션 리포트를 현업 관리팀에 릴리스하여, 납기 지연을 사전에 방재하기 위한 설비 임시 확충 대안을 제시합니다.
  saveSimulationReport(areaId, { predictedBottleneck, onTimePercentage });

}""",

        # 3. Enabling Technologies
        "iiot": """// =================================================================
// [산업용 사물인터넷 - IIoT]
// [목적] OPC-UA/MQTT를 통한 초고속 센서 텔레메트리 데이터 엣지 필터링 및 메시지 브로커 전송
// =================================================================

function processEdgeTelemetry(deviceId, rawDataPacket) {

  // [1단계] 통신 오류 및 유실 패킷에 대한 데이터 정합성 1차 하드웨어 체크
  // 센서 포트 접촉 불량이나 계측값 훼손이 감지될 경우 데이터 손실 로그를 남기고 필터링을 생략합니다.
  if (!rawDataPacket || rawDataPacket.payload === undefined) {
    logEdgeError("EMPTY_PACKET_RECEIVED", deviceId);
    return;
  }


  // [2단계] IIoT 단말 로컬의 시계열 노이즈(Spike Noise) 제거 필터 알고리즘 적용
  // 설비 전기 노이즈로 튀는 이상 스파이크 값을 Low-Pass Filter 등으로 로컬 전처리 평활화합니다.
  const filteredValue = runLowPassFilter(rawDataPacket.value);


  // [3단계] 현장 공장 네트워크 마비 등으로 일시적 IT 단절 시, Edge 단말 내 로컬 큐에 임시 버퍼링(Buffering) 작동
  // 로컬 Edge PC 내 임시 버퍼 디스크 영역에 데이터를 큐 형태로 누적 보관하여 통신 유실을 원천 예방합니다.
  const isNetworkConnected = checkServerHeartbeat();
  
  if (!isNetworkConnected) {
    bufferDataToLocalStorage(deviceId, rawDataPacket.tagId, filteredValue, rawDataPacket.timestamp);
    return;
  }


  // [4단계] 데이터 포맷 표준화(OPC-UA 규격 준수 JSON 패킷) 및 MES 데이터 수집 게이트웨이에 비동기 발행
  // 데이터 모델을 정규 통일 포맷으로 랩핑하여 MQTT 브로커(Domain Broker)의 특정 토픽으로 대기 없이 퍼블리싱합니다.
  const standardPayload = {
    tagId: rawDataPacket.tagId,
    value: filteredValue,
    qualityCode: "GOOD",
    sourceTimestamp: rawDataPacket.timestamp,
    serverTimestamp: new Date().toISOString()
  };

  publishToMqttBroker("factory/telemetry", standardPayload);

}""",
        "big-data": """// =================================================================
// [빅데이터 - Big Data]
// [목적] 실시간 유입되는 페타바이트급 텔레메트리 가공 데이터의 스트리밍 저장 및 파티셔닝 적재
// =================================================================

function ingestToDataLakehouse(streamingPayload) {

  // [1단계] 고빈도 스트리밍 유입 패킷의 데이터 스키마(Schema) 유효성 실시간 대조
  // 메시지 스키마 레지스트리를 대조해 깨지거나 칼럼 위치가 이탈된 비정상 JSON 레코드를 감지 후 DLQ로 배출합니다.
  const isValidSchema = validateIngestionSchema(streamingPayload);
  if (!isValidSchema) {
    sendToDeadLetterQueue(streamingPayload, "SCHEMA_MISMATCH");
    return;
  }


  // [2단계] 데이터 계보(Data Lineage) 추적을 위해 원천 발신 시스템 식별 정보 바인딩
  // 이 센서 데이터가 어떤 엣지 파이프라인과 랜딩 지점을 경유해 로드되었는지 계보 추적 메타데이터를 추가합니다.
  const contextualizedRow = appendLineageMetadata(streamingPayload, {
    pipelineId: "IIOT_TELEMETRY_INGESTION_PIPE",
    zone: "RAW_LANDING_ZONE"
  });


  // [3단계] 검색 속도 최적화를 위해 실시간 일자(YYYYMMDD) 및 설비 구역별로 물리 테이블 파티셔닝(Partitioning) 실행
  // 대용량 조회 및 롤백 성능 확보를 위해 로컬 디렉토리 경로 구조(year/month/day)로 물리적 분할 저장을 기획합니다.
  const targetPartition = calculatePartitionPath(contextualizedRow.eventTime);


  // [4단계] 데이터 레이크하우스(Lakehouse) 저장소에 영구 추가 및 대용량 분석 인덱스 재생성
  // 디스크 IO 및 압축률을 극대화하기 위해 Parquet 칼럼 지향 포맷 파일 구조로 스트림 벌크 라이팅을 진행합니다.
  writeToParquetStorage(targetPartition, contextualizedRow);

}""",
        "ai-ml": """// =================================================================
// [AI/ML]
// [목적] 공정 데이터 예측 분석(Predictive Model) 및 신뢰 점수(Confidence) 기반 예외 감지 통제
// =================================================================

function executePredictiveMaintenance(equipmentId) {

  // [1단계] 최근 24시간 동안 축적된 설비 상태 및 가동 시계열 Feature 로드
  // 실시간 피쳐 스토어에서 온전하게 보정 및 스케일링된 최신 설비 특징 벡터값을 가져옵니다.
  const features = loadEquipmentFeatures(equipmentId);
  
  
  // [2단계] 학습 완료된 예지보전 AI 분류 모델(RUL XGBoost Model)에 Feature 대조
  // 배포된 인공지능 추론 API를 작동시켜 예상 설비 잔여 유효 수명(RUL)과 정답 확신도(Confidence) 점수를 판독합니다.
  const inference = runAiModel("PREDICTIVE_MAINTENANCE_RUL", features);
  
  const predictedRulHours = inference.remainingUsefulLifeHours;
  const confidenceScore = inference.confidence;


  // [3단계] 예측 결과 신뢰성 검증 및 비즈니스 Rule 적용
  if (predictedRulHours < 48 && confidenceScore > 0.90) {
    // 3-1. 신뢰도 점수가 90% 이상인 경우, 사람 개입 없이 보전 계획 작업 지시서 자동 릴리스 및 통보
    // 정확도가 확보된 긴급 고장 알람이므로, 정비 시스템에 PM Work Order를 자율 에이전트 승인 하에 발행합니다.
    const autoMwoId = createAutoMaintenanceWorkOrder(equipmentId, "PREDICTED_FAILURE_48H");
    publishEvent("PREDICTIVE_ACTION_EXECUTED", { equipmentId, autoMwoId, score: confidenceScore });
  } else if (predictedRulHours < 48 && confidenceScore <= 0.90) {
    // 3-2. 신뢰도 점수가 낮으면 자동 발행하지 않고 품질 엔지니어 수동 승인 보드로 격리
    // AI 모델의 자신감이 떨어지는 애매한 구간은 수동 교차 검토를 유도하여 가짜 오류 경보(False Alarm)를 방어합니다.
    const reviewId = sendToHumanReviewBoard(equipmentId, inference);
    publishEvent("PREDICTIVE_REVIEW_REQUIRED", { equipmentId, reviewId });
  }

}""",
        "vr-ar": """// =================================================================
// [VR/AR]
// [목적] 스마트 글래스 기반 정밀 조립 가이드 렌더링 및 작업 완료 증거 캡처/품질 이력 적재
// =================================================================

function handleArGuidedStep(sessionId, currentStepNo, operatorAction) {

  // [1단계] 활성화된 AR 작업자 세션 정보 및 유효 SOP Revision 로드
  // 조립 조작자가 안경을 구동한 세션 상태 정보와 현재 단계별 표준 SOP 도면 정보를 가져옵니다.
  const session = loadArSession(sessionId);
  const sopStep = getSopStepDefinition(session.operationId, currentStepNo);


  // [2단계] 작업자가 조립을 완료한 순간, 스마트 글래스 카메라로부터 고해상도 이미지 실시간 캡처
  // 작업자가 안경 컨트롤의 '조립확인'을 누르거나 음성 조작 시, 글래스 정면 카메라 이미지를 프레임 데이터로 확보합니다.
  const capturedImageUri = captureArGlassCameraView(sessionId);


  // [3단계] 비전 AI 모델을 사용하여 3D 형상 정합성 분석 및 조립 오류(Poka-Yoke) 자동 판별
  // 조립된 부품들의 볼트 체결 개수나 체결 각도가 표준 형상 형상 견본과 완벽히 매칭하는지 비전 스캔을 돌립니다.
  const visionVerification = verifyAssemblyViaAi(capturedImageUri, sopStep.3dTemplateId);
  
  if (!visionVerification.success) {
    // 오류가 감지되면 작업자 글래스 화면에 빨간색 아웃라인 경고 및 시정 가이드 증강 표시
    // 안경 뷰포트 영역에 실시간 3D 오버레이 기법으로 조립 미스 구간을 빨갛게 증강(Overlay) 가이드합니다.
    renderArAlert(session.glassId, "ASSEMBLY_ERROR_DETECTED", visionVerification.errorCoordinates);
    return "VERIFICATION_FAILED";
  }


  // [4단계] 성공적인 조립에 대해, 캡처 사진을 증거물로 디지털 스레드(Evidence Storage)에 영구 저장
  // 비전 판독 통과된 검증 캡처 원본을 감사용 영구 저장소에 업로드하여 향후 조립 완벽성 입증용으로 사용합니다.
  saveStepVerificationEvidence(sessionId, currentStepNo, {
    imageUri: capturedImageUri,
    verifiedAt: new Date().toISOString()
  });

  return "STEP_COMPLETED";

}""",
        "edge-to-cloud": """// =================================================================
// [엣지-클라우드 - Edge to Cloud]
// [목적] 초 단위 실시간 판단(Edge)과 대규모 데이터 분석 및 전사 ML 학습(Cloud) 간의 동적 하이브리드 연동
// =================================================================

function syncEdgeTelemetryToCloud(edgeNodeId, eventBatch) {

  // [1단계] 엣지 로컬에서의 초실시간 연동 판단 동작 완료
  // 설비 현장 엣지 PC 내에서 초 단위 응답 속도로 긴급 세이프티 인터락 및 가동 상태 변경 통제를 선행합니다.
  executeEdgeCriticalInterlocks(eventBatch);


  // [2단계] 클라우드 대역폭 및 요금 절감을 위해 엣지 단에서 1차 실시간 압축 및 요약 데이터셋 생성
  // 로시계열 로데이터를 그대로 클라우드에 쏘지 않고, 시간대별 평균값 및 OEE 집계 정보로 가볍게 차원 압축합니다.
  const compressedPayload = compressAndSummarize(eventBatch);


  // [3단계] 멱등성(Idempotent)을 보장하는 REST/gRPC 채널을 통해 클라우드 동기화 큐에 발송
  // 중복 패킷 전송 시 데이터 오집계를 막기 위해 멱등성 유일 키(UUID)를 헤더에 엮어 클라우드 API에 안전 전파합니다.
  const syncResponse = postToCloudSyncGateway(edgeNodeId, compressedPayload, {
    idempotencyKey: generateUuid()
  });


  // [4단계] 동기화 성공 확인 시 로컬 디스크 내의 오래된 원시 데이터 안심 제거 (버퍼 정리)
  // 클라우드 적재 성공 응답(200 OK)이 확정된 안전 세그먼트 데이터 범위만 엣지 로컬 큐에서 삭제하여 디스크를 환산합니다.
  if (syncResponse.success) {
    purgeLocalEdgeBuffer(edgeNodeId, eventBatch.maxTimestamp);
  }

}""",
        "blockchain": """// =================================================================
// [블록체인 - Blockchain]
// [목적] 공급망 간의 위변조가 불가능한 완제품 성적서 및 원자재 계보 정보 스마트 컨트랙트 기록
// =================================================================

function notarizeLotQualityOnLedger(lotId, qualityResultId) {

  // [1단계] 로컬 MES 데이터베이스에서 최종 승인된 제품 성적 및 원자재 족보 데이터 로드
  // 품질 부서에서 최종 서명 완료된 CoA 성적 마스터 결과 및 하위 원소재들의 추적 Lot 관계 리스트를 수집합니다.
  const qualityReport = getLotInspectionSummary(lotId);
  const materialGenealogy = getLotGenealogyList(lotId);


  // [2단계] 데이터 프라이버시 보호를 위해 중요 가공 수치는 제외하고 핵심 정보들의 해시(SHA-256)값 생성
  // 경쟁사에 기밀 제조 레시피 수치 등이 노출되지 않도록, 대조용 위변조 확인 암호화 해시(Hash) 지문만 연산합니다.
  const originPayloadString = JSON.stringify({ qualityReport, materialGenealogy });
  const docHash = generateSha256Hash(originPayloadString);


  // [3단계] 분산 원장용 스마트 컨트랙트(Smart Contract) 함수 호출 준비
  // 다자간 검증을 지원하는 스마트 공증 컨트랙트 인스턴스를 로드합니다.
  const contract = loadSmartContract("LotQualityNotarization");
  
  
  // [4단계] 기업 프라이빗 키(Private Key)로 서명하여 블록체인에 영구 기록 (Transaction Sign)
  // 기업간 위변조 시비를 방재하기 위해 고유 전자서명(Cryptography Sign)을 입혀 트랜잭션을 체인 네트워크에 블록 보관합니다.
  const tx = contract.methods.notarize({
    lotId: lotId,
    notarizedHash: docHash,
    qualityResultId: qualityResultId,
    notarizedAt: new Date().toISOString()
  });

  const txReceipt = sendTransactionToBlockchain(tx);
  
  // 블록체인 트랜잭션 수신증(Tx Hash) 정보를 내부 Traceability DB에 매핑 저장
  saveLedgerTxMapping(lotId, txReceipt.transactionHash);

}""",
        "additive": """// =================================================================
// [적층 제조 - Additive Manufacturing]
// [목적] 3D 프린터의 층별(Layer) 적층 시 센서값 수집, 이상 징후 분석 및 후가공 이력 추적성 수립
// =================================================================

function monitorAdditiveBuild(buildId, currentLayerNo) {

  // [1단계] 3D 프린터 내부 챔버의 실시간 레이어 적층 센서 데이터 수집
  // 레이저 파워 강도, 챔버 산소 농도, 불활성 가스 압력, 리코터 베드 온도 등 미세 적층 환경값을 읽어옵니다.
  const chamberTelemetry = readChamberSensors(buildId);
  
  
  // [2단계] 파우더/분말 소재 Lot of 사양 정보 및 기 사용 횟수(Powder Recycle Count) 검증
  // 적층 강도 안정성을 충족하기 위해, 사용 소재 분말의 공급사CoA 및 허용 재사용(Recycle) 횟수 한도를 넘었는지 검증합니다.
  const buildConfig = loadBuildConfig(buildId);
  const powderLot = getPowderLotSpec(buildConfig.powderLotId);

  if (powderLot.recycleCount > powderLot.maxAllowedRecycles) {
    throw new Error("[소재 사용 초과] 사용 원료의 물리적 성질 유지를 위해 허용된 분말 재사용 한계를 초과했습니다.");
  }


  // [3단계] 비전 카메라로부터 적층 단면 레이어의 크랙/결함 여부 실시간 비전 판정
  // 적층 단면(Layer Surface) 비전 분석을 통해 홀(Void)이나 미세 균열이 발생하는 조짐이 포착되는지 감시합니다.
  const layerImage = captureLayerImage(buildId, currentLayerNo);
  const hasDefect = analyzeLayerDefect(layerImage);

  if (hasDefect) {
    // 적층 가압력을 일시 정지시키고 빌드 비정상 플래그를 올려 로스 적재
    // 소재 손실 및 가공 실패로 인한 설비 훼손을 방지하고자 3D 프린팅 스핀들 동작을 즉시 중단(Pause) 조치합니다.
    pauseBuildProgress(buildId, "LAYER_ANOMALY_DETECTED");
    
    saveLayerMetrics(buildId, currentLayerNo, {
      status: "DEFECT_DETECTED",
      sensors: chamberTelemetry
    });
    return "BUILD_PAUSED";
  }


  // [4단계] 빌드 단면 정보 이상 없을 시 Layer 이력 적재
  // 판독이 통과된 양호 층 데이터는 층별 디지털 계보(Genealogy) 묶음으로 최종 제품 바코드에 매핑 저장됩니다.
  saveLayerMetrics(buildId, currentLayerNo, {
    status: "SUCCESS",
    sensors: chamberTelemetry
  });
  return "SUCCESS";

}""",
        "robotics": """// =================================================================
// [로보틱스 - Robotics]
// [목적] MES 작업 착수(Dispatch)와 로봇 AGV/AMR 이송 미션 간의 인터락 제어 및 상태 모니터링
// =================================================================

function dispatchRoboticMission(missionId, robotId, targetLocation) {

  // [1단계] 지정 로봇의 물리 사양, 가동 상태 및 현재 배터리 잔량 실시간 확인
  // 해당 로봇 에이전트의 현재 주행 가능 여부, Tool 충돌 위험 수준 및 자동 급속 충전 잔량이 충분한지 진단합니다.
  const robot = loadRobotStatus(robotId);
  
  if (robot.status !== "STANDBY" || robot.batteryPercent < 20.0) {
    throw new Error("[미션 실패] 대상 로봇이 현재 가동 불능 상태이거나 배터리 잔량이 부족합니다.");
  }


  // [2단계] 로봇 이동 경로 상의 물리적 보안 구역 가동 상태(안전 셔터 개방 여부 등) 인터락 검증
  // AMR 이동 경로에 레이저 안전 펜스가 작동 중이거나, AGV 통과용 자동 안전 셔터의 통신이 먹통인지 실시간 감지합니다.
  const isRouteBlocked = checkPhysicalRouteInterlocks(robot.currentLocation, targetLocation);
  if (isRouteBlocked) {
    throw new Error("[이송 차단] 이동 경로 상에 안전 인터락(Safety Interlock)이 작동하여 물리적 주행이 불가능합니다.");
  }


  // [3단계] 로봇 제어 시스템(Fleet Management System)에 이송 미션 API 하달
  // 플릿 매니저 서비스에 TCP/REST 커맨드를 쏘아 AMR 장치가 지정된 자재 적치 장소로 기동하도록 호출합니다.
  const dispatchResponse = sendRobotCommand(robotId, "EXECUTE_MISSION", {
    missionId: missionId,
    destination: targetLocation,
    speedFactor: 1.0
  });


  // [4단계] 미션 수행 상태 실시간 추적 및 기록 개시
  // 이송 중 장애물 회피 횟수 및 실시간 위치 좌표가 MES 물류 맵과 Digital Thread 계보 체인에 동기 바인딩됩니다.
  if (dispatchResponse.success) {
    updateOrderStatus(missionId, "EXECUTING");
    
    publishEvent("ROBOT_MISSION_DISPATCHED", {
      robotId: robotId,
      missionId: missionId,
      dispatchedAt: new Date().toISOString()
    });
  }

}""",
        "wireless": """// =================================================================
// [무선 기술 - Wireless]
// [목적] RTLS/RFID를 활용한 반제품/자재 Carrier의 실시간 삼각측량 위치 식별 및 무선 단절 대응
// =================================================================

function processCarrierWirelessLocation(carrierId, rawRssiSignals) {

  // [1단계] 다중 무선 안테나로부터 유입된 RSSI 신호 강도 배열 검증
  // 삼각 측량 정밀도 확보를 위해, 주변 기지국 안테나로부터 수집된 무선 파형 세기(RSSI) 패킷 3개 이상 도출 여부를 확인합니다.
  if (!rawRssiSignals || rawRssiSignals.length < 3) {
    throw new Error("[위치 탐색 오류] 실시간 삼각 측량에 필요한 안테나 신호 갯수가 부족합니다.");
  }


  // [2단계] 다중 안테나 신호 강도를 분석하여 Carrier의 정확한 2D/3D 평면 좌표(X, Y, Z) 계산
  // 수신된 강도 노이즈를 칼만 필터(Kalman Filter) 등으로 처리 후 삼각 평면 측량 알고리즘 연산을 통해 실제 위치 좌표를 산출합니다.
  const calculatedLocation = calculateTriangulation(rawRssiSignals);
  
  
  // [3단계] 계산된 위치 좌표에 매핑된 공장 구역(Zone) 정보 식별
  // 좌표 값을 기반으로 공장의 어떤 야드 또는 공정 대기 구역(Staging Buffer Zone)에 적치되었는지 판독 매핑합니다.
  const mappedZone = mapCoordinatesToFactoryZone(calculatedLocation);


  // [4단계] 무선 신호 차폐 등으로 패킷 유실 시, 모바일 수집기 내 Offline 모드 감지 및 캐시 처리
  // - getWirelessNetworkKpi: 패킷 손실률(Packet Loss) 실시간 스캔
  // 차폐물이 많은 철강/밀폐 구조 라인에서 통신 두절 시 로컬 HMI 장치가 Offline 모드로 스위칭되어 데이터 유실을 방지합니다.
  const networkState = getWirelessNetworkKpi();
  
  if (networkState.packetLossPct > 15.0) {
    // 통신 상태 불안정을 작업자 HMI에 경고 알림 전송
    triggerHmiWarning(carrierId, "WIRELESS_LATENCY_WARNING");
  }


  // [5단계] 물류 Carrier 위치 정보 업데이트 및 실시간 물류 추적 DB 동기화
  // 정밀 산출된 Carrier 노드의 위치를 업데이트하여 AGV 배차 스케줄러 및 물류 관제 대시보드에 좌표를 실시간 리렌더링시킵니다.
  updateCarrierLocation(carrierId, mappedZone.zoneId, calculatedLocation);

  publishEvent("CARRIER_ZONE_CHANGED", { carrierId, zoneId: mappedZone.zoneId });

}"""
    }
    return codes.get(item_slug, "")

def getSmartManufacturingApiExample(concept_type, item_slug):
    apis = {
        # 1. Lifecycles
        "production": """// =================================================================
// [생산 라이프사이클 - Production Lifecycle]
// 생산 작업 착수 지시 및 Digital Thread 추적 시작 API
// =================================================================
POST /api/mesa-smart/lifecycles/production/orders/WO-2026-X01/start
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
{
  "lotId": "LOT-20260522-001",           // 생산 시작할 대상 반제품/제품 Lot ID
  "resourceId": "EQP-CNC-05",            // 투입하는 장비의 고유 식별 번호
  "operatorId": "OPR-USER-2394",         // 작업을 착수시키는 조작자 ID
  "recipeId": "REC-CNC-T5-REV1"          // 다운로드할 검증 완료된 레시피 ID
}

Response: 201 Created
{
  "success": true,
  "digitalThreadId": "DTH-982938491",    // 이 Lot의 평생 이력을 추적할 디지털 스레드 ID
  "startedState": "RUNNING",             // 전이 완료된 실행 상태 코드
  "recipeDownloadStatus": "SUCCESS",     // 설비 레시피 전송 성공 여부
  "timestamp": "2026-05-22T20:15:00Z"
}""",
        "production-asset": """// =================================================================
// [생산 자산 라이프사이클 - Production Asset Lifecycle]
// 자산 센서 계측 데이터 수집 및 상태 업데이트 API
// =================================================================
POST /api/mesa-smart/lifecycles/production-asset/assets/EQP-CNC-05/status-update
Content-Type: application/json
{
  "accumulatedShots": 100050,            // 설비의 누적 타수 실시간 누적치
  "temperature": 85.6,                   // 실시간 계측 모터 온도 (Celsius)
  "vibration": 0.045,                    // 실시간 진동 가속도 (G)
  "runState": "PRODUCING"                // 설비의 기계적 작동 상태
}

Response: 200 OK
{
  "assetId": "EQP-CNC-05",
  "pmRequired": false,                   // PM 임계치(100,000타수) 기준 도달 여부
  "calibrationValid": true,              // 교정 만료일 유효성 여부
  "anomalyDetected": false,              // 센서 위험 임계치 분석 결과
  "systemState": "ACTIVE"
}""",
        "product": """// =================================================================
// [제품 라이프사이클 - Product Lifecycle]
// 설계 변경 정보 전송 및 생산 진행 Lot 자동 영향도 분석 API
// =================================================================
POST /api/mesa-smart/lifecycles/product/products/PROD-CHIP-A/eco-apply
Content-Type: application/json
{
  "ecoNo": "ECO-2026-9812",             // PLM으로부터 릴리스된 설계 변경 번호
  "newRevision": "REV-C",                // 변경 적용할 신규 개정 번호
  "changeType": "CRITICAL_SAFETY",       // 변경 등급 (CRITICAL_SAFETY: 강제 Hold 후 경로 변경)
  "targetRouteId": "RTE-CHIP-A-C",       // 신규 공정 라우팅 ID
  "targetRecipeId": "REC-CHIP-A-C"       // 신규 레시피 사양 ID
}

Response: 200 OK
{
  "ecoNo": "ECO-2026-9812",
  "affectedLotsCount": 3,                // 이번 설계 변경에 영향을 받은 활성 Lot 수
  "modifiedLots": [
    {
      "lotId": "LOT-CHIP-001",
      "actionTaken": "FORCE_HOLD_FOR_REROUTE" // 처리 결과 (HOLD 및 경로 변경 완료)
    },
    {
      "lotId": "LOT-CHIP-002",
      "actionTaken": "FORCE_HOLD_FOR_REROUTE"
    },
    {
      "lotId": "LOT-CHIP-003",
      "actionTaken": "FORCE_HOLD_FOR_REROUTE"
    }
  ],
  "appliedTime": "2026-05-22T20:16:00Z"
}""",
        "supply-chain": """// =================================================================
// [공급망 라이프사이클 - Supply Chain Lifecycle]
// 원자재 Lot 품질 검증 및 투입 스테이징 확인 API
// =================================================================
POST /api/mesa-smart/lifecycles/supply-chain/materials/LOT-MAT-STEEL-99/inspect-release
Content-Type: application/json
{
  "inspectResult": "PASS",               // 수입 검사 판정 결과
  "coaDocumentUrl": "http://dms.factory/coa/steel-99.pdf", // CoA 문서 저장 경로
  "destinationAreaId": "AREA-STAGING-01" // 자재를 이동 적치시킬 생산 작업장 ID
}

Response: 200 OK
{
  "materialLotId": "LOT-MAT-STEEL-99",
  "releasedStatus": "RELEASED",          // 품질 검사를 거쳐 사용가능(Released) 상태로 마크
  "isHold": false,                       // 보류 여부
  "currentLocation": "AREA-STAGING-01",  // 물리 이동 완료된 장소
  "synchronizedToErp": true             // ERP 백플러시 연동 성공 여부
}""",
        "workforce": """// =================================================================
// [인력 라이프사이클 - Workforce Lifecycle]
// 작업자 자격 및 안전 교육 이수증 실시간 검증 API
// =================================================================
POST /api/mesa-smart/lifecycles/workforce/operators/OPR-USER-2394/verify-skill
Content-Type: application/json
{
  "operationId": "OP-20-MILLING",        // 투입하려는 세부 공정 정의 ID
  "resourceId": "EQP-CNC-05"             // 조작하려는 설비 고유 식별 번호
}

Response: 200 OK
{
  "operatorId": "OPR-USER-2394",
  "skillGrade": "GRADE-A",               // 작업자의 자격 등급
  "certified": true,                     // 자격 인증 상태 여부
  "certificationExpiresAt": "2027-12-31T23:59:59Z", // 자격 유효 만료 기한
  "safetyTrainingVerified": true,        // 위험 안전 보건 교육 이수 완료 여부
  "laborDirectAllowed": true             // 생산 직접 투입 허용 여부
}""",
        "order-to-cash": """// =================================================================
// [주문-현금화 라이프사이클 - Order-to-Cash Lifecycle]
// 주문별 완제품 생산 완료 확인 및 최종 출하 품질 릴리스 API
// =================================================================
POST /api/mesa-smart/lifecycles/order-to-cash/orders/SO-2026-5591/atp-check
Content-Type: application/json
{
  "productId": "PROD-CHIP-A",
  "requiredQuantity": 5000,              // 주문 요청 수량
  "dueDate": "2026-06-15T00:00:00Z"      // 희망 납기 일자
}

Response: 200 OK
{
  "success": true,
  "atpCheck": "AVAILABLE",               // 약속 가능 납기 판단 상태 (생산 능력 및 자재 충분)
  "promisedDate": "2026-06-12T00:00:00Z", // 생산 시뮬레이션을 거쳐 확정된 가능 납기
  "currentWipProgressPercent": 100.0,    // 주문 Lot 생산 진척률
  "finalQualityReleased": true          // 출하 전 CoA/CoC 등 품질 합격 릴리스 완료 여부
}""",

        # 2. Threads
        "quality": """// =================================================================
// [품질 스레드 - Quality Thread]
// 공정 계측값 수집 및 SPC 규칙 위반 자동 홀드 처리 API
// =================================================================
POST /api/mesa-smart/threads/quality/inspections/measured
Content-Type: application/json
{
  "lotId": "LOT-20260522-001",
  "operationId": "OP-10-PRESS",
  "parameterName": "Thickness_mm",        // 계측 항목 코드 (두께)
  "measuredValue": 1.285                 // 실제 물리 측정값
}

Response: 200 OK
{
  "lotId": "LOT-20260522-001",
  "inspectionResult": "NG",              // 규격 이탈(LSL 1.300)로 인한 NG 판정
  "specLimits": { "lsl": 1.300, "usl": 1.400 },
  "autoHoldExecuted": true,              // 물류 이동 자동 Lock 처리 여부
  "nonconformanceId": "NC-8293849182",   // 발행된 부적합 보고서 ID
  "notifiedTeams": ["QUALITY-ASSURANCE", "PRODUCTION-LINE-A"]
}""",
        "compliance": """// =================================================================
// [컴플라이언스 스레드 - Compliance Thread]
// 감사 추적(Audit Trail)용 위변조 불가 데이터 수정 기록 등록 API
// =================================================================
POST /api/mesa-smart/threads/compliance/audit-trails/log
Content-Type: application/json
{
  "objectId": "LOT-20260522-001",
  "action": "MANUAL_LOT_STATUS_FORCE_RELEASE", // 조작 행위 구분 코드
  "beforeValue": "HOLD",
  "afterValue": "RELEASED",
  "operatorId": "OPR-USER-2394",
  "reason": "부적합 위원회(MRB)의 Concession 특채 승인에 의거해 수동 해제함."
}

Response: 201 Created
{
  "success": true,
  "auditId": "AUDT-9382948293",          // 생성된 보안 감사 로그 고유 식별 번호
  "dataIntegrityStatus": "SECURE",       // 해시 위변조 방지 확인 여부
  "loggedAt": "2026-05-22T20:16:30Z"
}""",
        "sustainability": """// =================================================================
// [지속가능성 스레드 - Sustainability Thread]
// 실시간 설비 전력 센서 텔레메트리 및 Lot 탄소 배출 배부 수신 API
// =================================================================
POST /api/mesa-smart/threads/sustainability/meters/reading
Content-Type: application/json
{
  "meterId": "MTR-POWER-PRESS-03",
  "resourceId": "EQP-PRESS-03",
  "kwhDelta": 45.8,                      // 이번 측정 주기 동안 소모된 순수 전력량(kWh)
  "durationSeconds": 300                 // 측정 시간 윈도우 (5분)
}

Response: 200 OK
{
  "meterId": "MTR-POWER-PRESS-03",
  "allocatedLotsCount": 1,               // 전력 배부를 완료한 진행 Lot 수
  "allocations": [
    {
      "lotId": "LOT-20260522-001",
      "allocatedCarbonKg": 21.984        // 탄소 배출 계수 곱연산 완료된 Lot 지분 탄소 배출량
    }
  ],
  "timestamp": "2026-05-22T20:17:00Z"
}""",
        "analytics": """// =================================================================
// [분석 스레드 - Analytics Thread]
// 공정 특징 데이터셋 생성 및 ML Anomaly 예측 수행 API
// =================================================================
POST /api/mesa-smart/threads/analytics/features/generate
Content-Type: application/json
{
  "lotId": "LOT-20260522-001",
  "features": {
    "meanTemp": 245.8,                   // 가공 중 온도 평균 특징
    "stdDevVibration": 0.012,            // 가공 중 진동 가속도 특징
    "maxPressure": 420.5                 // 가공 중 최고 압력 특징
  }
}

Response: 200 OK
{
  "lotId": "LOT-20260522-001",
  "mlModelVersion": "ANOMALY-DETECT-V1.2",
  "anomalyScore": 0.92,                  // 모델이 감지한 이상 가동 확률 지표
  "systemAction": "FLAG_FOR_REVIEW",     // 이상 확률이 높아 품질/보전 엔지니어에 자동 알림
  "timestamp": "2026-05-22T20:17:30Z"
}""",
        "security": """// =================================================================
// [보안 스레드 - Security Thread]
// OT 기기 제어 명령 승인 및 JWT 토큰 검증 API
// =================================================================
POST /api/mesa-smart/threads/security/access-control/authorize
Content-Type: application/json
Authorization: Bearer <TOKEN_JWT_OT>
{
  "resourceId": "EQP-CNC-05",
  "commandType": "EMERGENCY_SHUTDOWN",   // 내리는 기계 제어 명령 유형
  "operatorId": "OPR-USER-2394"
}

Response: 200 OK
{
  "authorized": true,
  "operatorId": "OPR-USER-2394",
  "commandTraceId": "SEC-CMD-9382948",   // 보안 감사를 위한 암호화 trace ID
  "securityAuditStatus": "COMPLIANT",    // 보안 프로파일 준수 여부
  "timestamp": "2026-05-22T20:18:00Z"
}""",
        "digital-twin-thread": """// =================================================================
// [디지털 트윈/스레드 - Digital Twin / Thread]
// 물리 설비 텔레메트리 수신 및 디지털 트윈 실시간 상태 동기화 API
// =================================================================
POST /api/mesa-smart/threads/digital-twin-thread/objects/sync
Content-Type: application/json
{
  "physicalResourceId": "EQP-PRESS-03",
  "machineState": "PRODUCING",           // 물리 설비 실시간 상태
  "sensorMetrics": {
    "temperature": 75.3,
    "oilPressure": 12.4
  },
  "timestamp": "2026-05-22T20:18:30Z"
}

Response: 200 OK
{
  "twinObjectId": "TWN-EQP-PRESS-03",    // 매핑된 디지털 트윈 내 노드 ID
  "stateSyncSuccess": true,              // 상태 가상 월드 매핑 성공 여부
  "activeWipLotId": "LOT-20260522-001",  // 동적으로 연계된 가공 Lot 식별 정보
  "webglRenderTriggered": true           // UI 3D 뷰포트 갱신 트리거 성공 여부
}""",
        "modeling-simulation": """// =================================================================
// [모델링/시뮬레이션 스레드 - Modeling / Simulation]
// 실시간 설비 모수 보정 및 가상 스케줄링 시뮬레이션 시나리오 실행 API
// =================================================================
POST /api/mesa-smart/threads/modeling-simulation/scenarios/run
Content-Type: application/json
{
  "areaId": "AREA-ASSEMBLY-02",
  "targetOrderVolume": 25000,            // 투입 가상 테스트 주문량
  "simulationTimeHours": 24              // 시뮬레이션 예측 타임스탬프 범위
}

Response: 200 OK
{
  "scenarioId": "SIM-RUN-9384918",
  "onTimeSuccessRatePercent": 94.2,      // 시뮬레이션 결과 납기 준수율 추정치
  "predictedBottleneckResource": "EQP-ROBOT-02", // 예상되는 최대 병목 설비 코드
  "averageLeadTimeMinutes": 32.5,        // Lot별 평균 리드타임 예측치
  "status": "COMPLETED"
}""",

        # 3. Enabling Technologies
        "iiot": """// =================================================================
// [산업용 사물인터넷 - IIoT]
// OPC-UA/MQTT IIoT 엣지 노드 수집 센서 데이터 전송 API
// =================================================================
POST /api/mesa-smart/technologies/iiot/telemetry/publish
Content-Type: application/json
{
  "deviceId": "IIOT-NODE-EDGE-09",
  "tagId": "OPCUA-TAG-TEMP-PRESS-03",
  "value": 145.8,                        // 수집 필터링 가공된 센서 수치
  "timestamp": "2026-05-22T20:19:00.123Z"
}

Response: 202 Accepted
{
  "success": true,
  "sampleId": "SMPL-93829482938",
  "edgeBufferedQueueSize": 0,            // 엣지 단말 큐의 미전송 잔량 (0: 단절 없음)
  "telemetryQuality": "GOOD"
}""",
        "big-data": """// =================================================================
// [빅데이터 - Big Data]
// 고빈도 텔레메트리 원천 데이터 Lakehouse 수신 및 파티셔닝 적재 API
// =================================================================
POST /api/mesa-smart/technologies/big-data/pipelines/ingest
Content-Type: application/json
{
  "sourceSystem": "IIOT_MQTT_BROKER",
  "dataCount": 1000,                     // 배치 또는 스트리밍 데이터 레코드 벌크 수
  "payloadBatchUrl": "s3://factory-raw/landing/20260522/batch-9932.json" // 원천 파일 경로
}

Response: 202 Accepted
{
  "ingestJobId": "INGEST-JOB-938294",
  "targetPartitionPath": "year=2026/month=05/day=22", // 자동 파티셔닝된 물리적 저장 구역
  "dataLineageVerified": true,           // 데이터 계보 연동 확인 여부
  "pipelineStatus": "RUNNING"
}""",
        "ai-ml": """// =================================================================
// [AI/ML]
// AI 설비 예지보전 RUL 추론 및 추천 액션 실시간 획득 API
// =================================================================
POST /api/mesa-smart/technologies/ai-ml/predictions/infer
Content-Type: application/json
{
  "equipmentId": "EQP-CNC-05",
  "modelType": "PREDICTIVE_MAINTENANCE_RUL",
  "features": {
    "runTimeHours": 2450.0,
    "meanTemperature": 85.6,
    "maxVibrationLevel": 0.045
  }
}

Response: 200 OK
{
  "predictionId": "PRD-9382948",
  "modelName": "XGBoost-RUL-CNC-05",
  "predictedRemainingUsefulLifeHours": 32.5, // AI 예측 설비 잔여 수명
  "confidenceScore": 0.94,               // 추론 신뢰도
  "recommendedAction": "PM_WORK_ORDER",  // AI 추천 액션 조치 코드
  "autoActionExecuted": true             // 신뢰도 기준 90% 이상으로 자동 예방 정비 오더 발행 여부
}""",
        "vr-ar": """// =================================================================
// [VR/AR]
// 스마트 글래스 기반 조립 완료 사진 비전 AI 매칭 및 품질 증거 적재 API
// =================================================================
POST /api/mesa-smart/technologies/vr-ar/sessions/verify-step
Content-Type: application/json
{
  "sessionId": "AR-SES-938294829",
  "stepNo": 4,                           // 조립 단계 번호
  "operatorAction": "COMPLETED",
  "capturedFrameBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..." // 스마트글라스 촬영 캡처 프레임
}

Response: 200 OK
{
  "sessionId": "AR-SES-938294829",
  "stepNo": 4,
  "visionMatchSuccess": true,            // 비전 AI 패턴 매칭 통과 여부
  "deviationPercentage": 1.25,           // 조립 오차율
  "evidenceStoredUrl": "https://storage.factory/ar-evidence/ses-938294829-step4.jpg", // 영구 증거 저장 URL
  "nextStepAllowed": true                // HMI 글래스상 다음 단계 조립 해제 여부
}""",
        "edge-to-cloud": """// =================================================================
// [엣지-클라우드 - Edge to Cloud]
// 엣지 단말 실시간 압축 요약 데이터 클라우드 비동기 동기화 API
// =================================================================
POST /api/mesa-smart/technologies/edge-to-cloud/sync/flush
Content-Type: application/json
X-Idempotency-Key: 82938192-3849-11ed-a261-0242ac120002
{
  "edgeNodeId": "EDGE-NODE-ASSEMBLY-02",
  "batchSequenceNo": 993829,
  "summaryData": {
    "producingTimeSeconds": 28800,
    "goodPartsCount": 4200,
    "rejectPartsCount": 12,
    "oeePercent": 92.4
  }
}

Response: 200 OK
{
  "syncSuccess": true,
  "edgeNodeId": "EDGE-NODE-ASSEMBLY-02",
  "purgedBufferMaxTimestamp": "2026-05-22T20:19:30Z", // 동기화 확인 완료되어 엣지 로컬에서 안심 비우기 처리할 기준 시각
  "cloudModelVersionUpdateAvailable": false
}""",
        "blockchain": """// =================================================================
// [블록체인 - Blockchain]
// 완제품 및 원자재 성적 해시값 분산 원장 기록 및 스마트 컨트랙트 서명 API
// =================================================================
POST /api/mesa-smart/technologies/blockchain/ledger/transact
Content-Type: application/json
{
  "lotId": "LOT-20260522-001",
  "qualityResultId": "QRES-938294829",
  "hashValue": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" // 품질 성적 위변조 대조용 해시값
}

Response: 201 Created
{
  "lotId": "LOT-20260522-001",
  "blockchainTxHash": "0x98b3c434918239e248b12fcfcf9e8a7d7f98e98348918249", // 발행된 블록체인 트랜잭션 수신 해시
  "blockNumber": 18293849,               // 원장 원본 적재 블록 고유 번호
  "notarizedStatus": "CONFIRMED"         // 공증 상태 확정 여부
}""",
        "additive": """// =================================================================
// [적층 제조 - Additive Manufacturing]
// 3D 프린팅 층별 센서 수치 및 Layer 비전 판정 이력 등록 API
// =================================================================
POST /api/mesa-smart/technologies/additive/builds/start
Content-Type: application/json
{
  "buildId": "BLD-3D-2026-X491",
  "layerNo": 450,                        // 현재 적층 층 번호
  "laserPowerWatts": 245.8,              // 레이저 파워 센서 실시간 계측값
  "chamberTempCelsius": 75.3,            // 챔버 내부 온도
  "layerVisionResult": "SUCCESS"         // 적층 표면 크랙 비전 검사 판정 결과
}

Response: 200 OK
{
  "buildId": "BLD-3D-2026-X491",
  "layerNo": 450,
  "interlockTriggered": false,           // 비정상 표면 크랙 없음으로 빌드 지속 허용
  "estimatedRemainingTimeMinutes": 185.0,
  "status": "BUILDING"
}""",
        "robotics": """// =================================================================
// [로보틱스 - Robotics]
// 로봇 AGV/AMR 이송 미션 발행 및 안전 인터락 검증 API
// =================================================================
POST /api/mesa-smart/technologies/robotics/missions/dispatch
Content-Type: application/json
{
  "missionId": "MSN-AMR-992384",
  "robotId": "AMR-ROBOT-02",
  "sourceLocation": "AREA-STAGING-01",
  "targetLocation": "AREA-PRESS-03",    // 목적지 작업장 ID
  "payloadWeightKg": 120.5               // 이송 적치할 자재 무게 사양
}

Response: 201 Created
{
  "missionId": "MSN-AMR-992384",
  "robotId": "AMR-ROBOT-02",
  "routeStatus": "PATH_CLEAR",           // 물리적 안전 셔터/센서 인터락 통과 완료 여부
  "batteryPercent": 85.5,                // 로봇 현재 배터리
  "estimatedTravelTimeSeconds": 45,
  "status": "DISPATCHED"
}""",
        "wireless": """// =================================================================
// [무선 기술 - Wireless]
// Carrier RTLS 삼각측량 신호 RSSI 수집 및 위치 식별 API
// =================================================================
POST /api/mesa-smart/technologies/wireless/assets/locate
Content-Type: application/json
{
  "carrierId": "CARRIER-WIP-STEEL-09",
  "rssiSignals": [
    { "antennaId": "ANT-ZONE2-01", "rssi": -65.2 }, // 안테나 수신 감도 신호 세기
    { "antennaId": "ANT-ZONE2-02", "rssi": -72.4 },
    { "antennaId": "ANT-ZONE2-03", "rssi": -58.9 }
  ]
}

Response: 200 OK
{
  "carrierId": "CARRIER-WIP-STEEL-09",
  "triangulationCoordinates": { "x": 12.4, "y": 45.8, "z": 1.2 }, // 삼각 측량 연산 완료 좌표
  "mappedFactoryZoneId": "ZONE-ASSEMBLY-B", // 매핑된 최종 물리 가용 적치장 ID
  "networkSignalStatus": "STABLE",       // 무선 네트워크 전송 패킷 안정성 상태
  "timestamp": "2026-05-22T20:20:00Z"
}"""
    }
    return apis.get(item_slug, "")

def rows(items):
    return "\n".join(f"<tr>{''.join(f'<td>{cell}</td>' for cell in row_item)}</tr>" for row_item in items)

def list_html(items):
    return f"<ul>{chr(10).join(f'<li>{esc(item)}</li>' for item in items)}</ul>"

def flowSvg(flow):
    width = 185 * len(flow) + 80
    nodes = []
    for index, label in enumerate(flow):
        x = 36 + index * 185
        role = "Input" if index == 0 else "Output" if index == len(flow) - 1 else "Process"
        arrow = f'<path class="arrow" d="M{x + 148} 82 H{x + 180}"></path>' if index < len(flow) - 1 else ""
        nodes.append(f'<g class="node"><rect x="{x}" y="44" width="148" height="76"></rect><text x="{x + 74}" y="75" text-anchor="middle">{esc(label)}</text><text class="tiny" x="{x + 74}" y="100" text-anchor="middle">{role}</text></g>{arrow}')
    nodes_str = "".join(nodes)
    return f'<div class="diagram"><svg viewBox="0 0 {width} 164" aria-label="MESA Smart Manufacturing DFD"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2864a8"></path></marker></defs>{nodes_str}</svg></div>'

def pageShell(title, subtitle, chips, crumbs, cssHref, body):
    chips_html = "".join(f'<span class="chip">{esc(chip)}</span>' for chip in chips)
    return f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{esc(title)}</title>
  <link rel="stylesheet" href="{cssHref}">
  <style>
    .lesson-index{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}}
    .lesson-index a{{display:block;border:1px solid var(--line);border-radius:8px;padding:10px;text-decoration:none;color:var(--blue);background:#fff;font-weight:700;font-size:13px}}
    .callout{{border-left:5px solid var(--accent);background:#eefafa;padding:14px 16px;border-radius:8px;margin:14px 0}}
    .two-col{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
    .codebox{{background:#0f172a;color:#e2e8f0;border-radius:10px;padding:14px;overflow:auto;font-family:Consolas,monospace;font-size:13px;line-height:1.55}}
    .badge{{display:inline-block;border:1px solid #cbd5e1;border-radius:999px;padding:2px 8px;margin:2px;background:#f8fafc;font-size:12px}}
    .section h3{{margin:20px 0 8px;font-size:16px;color:#1d3557}}
    @media(max-width:900px){{.lesson-index,.two-col{{grid-template-columns:1fr}}}}
  </style>
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

def renderItem(concept, item):
    flowRows = []
    for i, step in enumerate(item["flow"]):
        desc = "업무 또는 기술 흐름을 시작시키는 입력입니다." if i == 0 else "다른 시스템, 사람, KPI, 개선 활동으로 전달되는 결과입니다." if i == len(item["flow"]) - 1 else "검증, 판단, 상태 전이, 데이터 문맥화를 수행하는 처리 단계입니다."
        save_pt = "source, 수신 시각, 기준정보 version을 저장합니다." if i == 0 else "상태, 이력, 품질 코드, 담당자, correlation id를 남깁니다."
        flowRows.append([f"<strong>{i + 1}. {esc(step)}</strong>", desc, save_pt])
        
    activities_rows = [[f"<strong>{esc(act[0])}</strong>", esc(act[1]), "화면, API, 상태 테이블, 이력 테이블, 통합 이벤트, 운영 KPI"] for act in item["activities"]]
    db_rows = [[f"<strong>{esc(db[0])}</strong>", f"<code>{esc(db[1])}</code>", "실행 데이터와 스마트 제조 문맥을 연결하고, 분석과 재처리를 가능하게 하기 위한 기본 구조입니다."] for db in item["db"]]
    rules_rows = [[f"BR-{str(i+1).zfill(2)}", esc(rule), "Domain Service, Rule Engine, Workflow, Data Quality Rule, Integration Contract로 구현"] for i, rule in enumerate(item["rules"])]
    tests_rows = [[f"TC-{str(i+1).zfill(2)}", esc(test), "상태, 이력, 데이터 품질, 통합 이벤트, 운영 action이 설계와 일치해야 합니다."] for i, test in enumerate(item["tests"])]
    
    body = f"""
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
      <div class="callout">{esc(source_note)}</div>
    </section>

    <section id="concept" class="section">
      <h2>1. 개념 목적</h2>
      <p>{esc(item["summary"])}</p>
      <div class="two-col">
        <div class="card"><strong>학생에게 설명하는 비유</strong><span>{esc(item["student"])}</span></div>
        <div class="card"><strong>스마트 제조 관점</strong><span>{esc(concept["ko"])} 항목은 단독 기능이 아니라 여러 시스템, 데이터, 사람, 기준정보를 연결해 더 빠른 의사결정과 투명한 실행을 가능하게 합니다.</span></div>
      </div>
    </section>

    <section id="activities" class="section">
      <h2>2. 핵심 액티비티</h2>
      <p>아래 액티비티는 {esc(item["ko"])}를 MES/MOM 또는 스마트 제조 플랫폼으로 구현할 때 요구사항을 나누는 단위입니다.</p>
      <table>
        <thead><tr><th>액티비티</th><th>설명</th><th>구현 산출물</th></tr></thead>
        <tbody>{rows(activities_rows)}</tbody>
      </table>
    </section>

    <section id="dfd" class="section">
      <h2>3. DFD: 스마트 제조 데이터 흐름</h2>
      {flowSvg(item["flow"])}
      <p style="margin-top:14px">이 흐름은 기술 도입 자체가 아니라 업무 성과로 이어지는 과정을 보여줍니다. 입력 데이터는 문맥화와 검증을 거쳐 실행, 분석, 개선 활동으로 연결되어야 합니다.</p>
      <table>
        <thead><tr><th>단계</th><th>처리 의미</th><th>저장/검증 포인트</th></tr></thead>
        <tbody>{rows(flowRows)}</tbody>
      </table>
    </section>

    <section id="model" class="section">
      <h2>4. 권장 데이터 모델</h2>
      <p>스마트 제조 모델은 현재 상태만 저장해서는 부족합니다. 기준정보, 현재 상태, 이력, 문맥, 분석 결과, action feedback을 연결해야 반복 가능한 개선이 가능합니다.</p>
      <table>
        <thead><tr><th>테이블</th><th>주요 컬럼</th><th>설계 이유</th></tr></thead>
        <tbody>{rows(db_rows)}</tbody>
      </table>
    </section>

    <section id="logic" class="section">
      <h2>5. 처리 로직과 업무 규칙</h2>
      <table>
        <thead><tr><th>규칙 ID</th><th>업무 규칙</th><th>시스템 반영 방식</th></tr></thead>
        <tbody>{rows(rules_rows)}</tbody>
      </table>
      <h3>의사코드</h3>
      <div class="codebox"><pre>{esc(getSmartManufacturingPseudocode(concept["type"], item["slug"]))}</pre></div>
    </section>

    <section id="ui" class="section">
      <h2>6. 화면과 API 설계</h2>
      <div class="grid">
        <div class="card"><strong>운영 화면</strong><span>현재 상태, 차단 사유, 추천 action, 관련 기준정보와 이력을 보여줍니다.</span></div>
        <div class="card"><strong>분석 화면</strong><span>KPI, 품질, 손실, 위험, 예측 결과를 원천 데이터까지 drill-down합니다.</span></div>
        <div class="card"><strong>통합 API</strong><span>ERP, MES, PLM, IIoT, 품질, 보전, 데이터 플랫폼과 이벤트 기반으로 연결합니다.</span></div>
      </div>
      <h3>API 예시</h3>
      <div class="codebox"><pre>{esc(getSmartManufacturingApiExample(concept["type"], item["slug"]))}</pre></div>
    </section>

    <section id="test" class="section">
      <h2>7. 테스트 시나리오</h2>
      <table>
        <thead><tr><th>테스트 ID</th><th>시나리오</th><th>기대 결과</th></tr></thead>
        <tbody>{rows(tests_rows)}</tbody>
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
      {list_html([
        "업무 목표와 KPI가 명확하며 기술 도입 목적과 연결되어 있다.",
        "원천 데이터, 문맥 데이터, 기준정보 revision, 품질 코드가 함께 저장된다.",
        "운영자가 action을 취할 수 있는 화면과 알림이 있다.",
        "외부 시스템 연동 실패 시 재처리 queue와 감사 로그가 있다.",
        "개선 효과가 KPI 또는 action outcome으로 다시 측정된다."
      ])}
    </section>"""
    return pageShell(
        title=f"MESA Smart Manufacturing - {item['ko']}",
        subtitle=f"{concept['title']} / {item['name']}. {item['summary']}",
        chips=["MESA Smart Manufacturing Model", concept["title"], item["name"]],
        crumbs=f'<div class="crumbs"><a href="../MESA_MES_Overview.html">MESA Smart Manufacturing</a> / {esc(concept["ko"])} / {esc(item["ko"])}</div>',
        cssHref="../mesa-page.css",
        body=body
    )

def renderIndex():
    sections = []
    for concept in concepts:
        subdir = "lifecycles" if concept["type"] == "lifecycle" else "threads" if concept["type"] == "thread" else "technologies"
        links = "".join(f'<a href="{subdir}/{item["slug"]}.html"><strong>{esc(item["ko"])}</strong><span class="muted">{esc(item["name"])}</span></a>' for item in concept["items"])
        sections.append(f'<h3>{esc(concept["ko"])} ({esc(concept["title"])})</h3><p class="muted">{esc(concept["description"])}</p><div class="list">{links}</div>')
    
    sections_html = "".join(sections)
    body = f"""
    <section class="section">
      <h2>최신 MESA Model 구조</h2>
      {flowSvg(["Lifecycle", "Cross-Lifecycle Thread", "Enabling Technology", "Smart Manufacturing Outcome"])}
      <p style="margin-top:14px">MESA의 최신 스마트 제조 모델은 기존 MESA-11 기능 목록을 넘어, 제조 기업의 가치 흐름을 나타내는 <strong>Lifecycle</strong>, 여러 가치 흐름을 관통하는 <strong>Cross-Lifecycle Thread</strong>, 그리고 스마트 제조를 가능하게 하는 <strong>Enabling Technology</strong>의 세 축을 함께 봅니다.</p>
      <div class="callout">{esc(source_note)}</div>
    </section>

    <section class="section">
      <h2>세 가지 주요 개념별 문서</h2>
      {sections_html}
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
    </section>"""
    return pageShell(
        title="MESA Smart Manufacturing Model Guide",
        subtitle="최신 MESA Model: A Framework for Smarter Manufacturing 기준으로 Lifecycle, Cross-Lifecycle Thread, Enabling Technology를 교육용 HTML 문서로 정리한 가이드입니다.",
        chips=["MESA Model", "Smart Manufacturing", "Lifecycle / Thread / Technology"],
        crumbs="",
        cssHref="mesa-page.css",
        body=body
    )

def build():
    print("[진행상황] 스마트 제조 프레임워크 페이지 생성 및 업데이트를 시작합니다...")
    total_pages = 0
    for concept in concepts:
        os.makedirs(concept["dir"], exist_ok=True)
        for item in concept["items"]:
            file_path = os.path.join(concept["dir"], f"{item['slug']}.html")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(renderItem(concept, item))
            total_pages += 1
            print(f"  - [성공] 생성 완료: {concept['ko']} > {item['ko']} ({item['slug']}.html)")
            
    overview_path = os.path.join(mesa_dir, "MESA_MES_Overview.html")
    with open(overview_path, "w", encoding="utf-8") as f:
        f.write(renderIndex())
        
    print(f"\n[완료] 총 {total_pages}개의 스마트 제조 상세 가이드 페이지와 인덱스 개요 문서 생성이 성공적으로 완료되었습니다!")
    print(f"  - 생성 디렉토리: {mesa_dir}")

if __name__ == "__main__":
    build()
