import os
import re

root = os.path.dirname(os.path.abspath(__file__))
guideDir = os.path.join(root, "SEMI_Interactive_Guide")
developerDir = os.path.join(root, "SEMI_Interactive_Developer")
guideStandardsDir = os.path.join(guideDir, "standards")
developerAlgorithmsDir = os.path.join(developerDir, "algorithms")

for d in [guideDir, developerDir, guideStandardsDir, developerAlgorithmsDir]:
    os.makedirs(d, exist_ok=True)

standards_raw = [
  ["E4", "SEMI E4", "SECS-I", "SECS/GEM 기본", "RS-232 기반 저속 장비 통신 계층. SEMI E4는 오래된 장비에서 아직 많이 만나는 직렬 통신 기반의 SECS 물리/전송 계층입니다.", "오래된 장비에서 바이트가 어떻게 프레임으로 묶이고, 누가 언제 재전송하며, 연결 불안정 상황을 어떻게 복구하는지 제어합니다.", ["장비 RS-232 포트", "문자/블록 프레임", "ACK/NAK 및 타임아웃", "SECS-II 디코더", "Host Application"], [["secs_link_config", "equipment_id, port_name, baud_rate, parity, data_bits, stop_bits, t1_ms, t2_ms, retry_limit"], ["secs_frame_log", "log_id, equipment_id, direction, block_no, raw_hex, checksum_ok, created_at"]]],
  ["E5", "SEMI E5", "SECS-II Message Content", "SECS/GEM 기본", "Stream/Function, List, Binary, ASCII, U/I/F 타입 등 SECS 메시지의 구조와 의미를 정의합니다.", "장비 이벤트, 알람, 변수 조회, 레시피, Remote Command를 공통 메시지 언어로 표현합니다.", ["Equipment Controller", "SECS-II Encoder/Decoder", "Host Message Broker", "TC/EAP"], [["secs_message_log", "message_id, direction, stream, function, wait_bit, system_bytes, raw_payload, parsed_json, event_time"], ["secs_item_dictionary", "item_name, secs_type, length_rule, semantic_name, unit, owner_standard"]]],
  ["E37", "SEMI E37", "HSMS Generic Services", "SECS/GEM 기본", "TCP/IP 기반으로 SECS-II Payload를 운반하는 세션, Select, Linktest, Separate, Timeout 규칙을 정의합니다.", "Serial SECS-I 대신 Ethernet 기반 장비 통신 채널을 구성합니다.", ["Equipment HSMS Passive", "TCP Session", "HSMS State Manager", "Host HSMS Active"], [["hsms_session", "session_id, equipment_id, ip, port, active_passive, selected_state, last_linktest_at"], ["connection_health", "session_id, latency_ms, retry_count, disconnect_reason, measured_at"]]],
  ["E30", "SEMI E30", "GEM", "SECS/GEM 기본", "제조 장비와 Host 사이의 공통 제어 모델입니다. Collection Event, Report, Alarm, Variable, Remote Command, Process Program 관리의 기본 틀을 제공합니다.", "TC/EAP가 설비를 제어하고 상태를 수집하는 기본 계약입니다.", ["Equipment GEM Service", "Event/Alarm/Variable", "TC/EAP", "MES Context Adapter"], [["gem_collection_event", "equipment_id, ceid, event_name, enabled, linked_report_id, description"], ["gem_report_variable", "report_id, vid, variable_name, variable_type, unit, sample_rule"], ["gem_alarm_history", "equipment_id, alid, alarm_text, set_clear, severity, occurred_at"]]],
  ["GEM300", "GEM300", "300mm Automation Set", "GEM300 생산 실행", "E39, E40, E87, E90, E94, E116, E142, E148, E157 등으로 Carrier, Substrate, Process Job, Control Job, 성능/시간 동기화까지 확장합니다.", "Lot/Carrier/Wafer 단위의 자동화 생산 실행을 표준 객체와 상태 모델로 연결합니다.", ["Carrier Arrival", "Carrier Mgmt", "Control Job", "Process Job", "Substrate Tracking", "MES/MOS"], [["carrier_state", "carrier_id, load_port_id, carrier_state, access_mode, slot_map_id, updated_at"], ["control_job", "control_job_id, carrier_id, recipe_id, job_state, owner_system, created_at"], ["substrate_trace", "substrate_id, carrier_id, slot_no, module_id, process_state, event_time"]]],
  ["E39", "SEMI E39", "Object Services", "GEM300 생산 실행", "장비/생산 객체를 식별하고 상태, 속성, 서비스를 모델링하는 기반 개념을 제공합니다.", "Carrier, Job, Substrate 같은 객체를 일관되게 다루는 GEM300 객체 모델의 공통 기반입니다.", ["Object Registry", "Attribute Service", "State Model", "Host Object Client"], [["semi_object", "object_id, object_type, parent_object_id, lifecycle_state, created_at"], ["semi_object_attribute", "object_id, attr_name, attr_value, attr_type, updated_at"]]],
  ["E40", "SEMI E40", "Processing Management", "GEM300 생산 실행", "Process Job 생성, 시작, 취소, 완료와 같은 처리 작업 관리를 정의합니다.", "MES/MOS의 작업 지시를 설비 내부 처리 단위로 연결합니다.", ["MES Work Order", "Process Job Manager", "Recipe Manager", "Equipment Module"], [["process_job", "process_job_id, lot_id, recipe_id, substrate_selection, job_state, start_time, end_time"], ["process_job_event", "process_job_id, event_name, previous_state, next_state, event_time"]]],
  ["E87", "SEMI E87", "Carrier Management", "GEM300 생산 실행", "Carrier ID, Load Port, Slot Map, Carrier State와 관련된 관리를 정의합니다.", "AMHS, Load Port, 장비 사이의 Carrier 처리 상태를 표준화합니다.", ["AMHS", "Load Port", "Carrier Manager", "Slot Map", "MES"], [["carrier", "carrier_id, carrier_type, current_location, state, access_status"], ["slot_map", "slot_map_id, carrier_id, slot_no, substrate_id, verified_flag"]]],
  ["E90", "SEMI E90", "Substrate Tracking", "GEM300 생산 실행", "Wafer/Substrate의 위치, 이동, 처리 상태를 추적하는 모델입니다.", "Carrier보다 더 세밀한 Wafer 단위 이력과 공정 문맥을 만듭니다.", ["Carrier Slot", "Transfer Module", "Process Module", "Substrate History", "MES Trace"], [["substrate", "substrate_id, lot_id, carrier_id, slot_no, product_id, state"], ["substrate_location_history", "substrate_id, from_location, to_location, move_reason, event_time"]]],
  ["E94", "SEMI E94", "Control Job Management", "GEM300 생산 실행", "Control Job의 생성, 실행, 종료, 취소 상태 모델을 정의합니다.", "여러 Carrier와 Process Job을 하나의 생산 제어 단위로 묶습니다.", ["MOS Dispatch", "Control Job Manager", "Process Job Set", "Equipment Execution"], [["control_job", "control_job_id, job_name, carrier_set, process_job_set, state, priority"], ["control_job_transition", "control_job_id, from_state, to_state, reason, event_time"]]],
  ["E116", "SEMI E116", "Equipment Performance Tracking", "분석/성능", "장비 성능 추적에 필요한 이벤트와 상태 정보를 구조화합니다.", "EES/FDC/OEE 시스템이 설비 성능과 병목을 계산하는 기준 데이터가 됩니다.", ["Equipment State", "Performance Event", "EES Collector", "OEE/KPI"], [["equipment_performance_event", "equipment_id, state_code, reason_code, duration_sec, event_start, event_end"], ["equipment_performance_kpi", "equipment_id, metric_name, metric_value, window_start, window_end"]]],
  ["E120", "SEMI E120", "Common Equipment Model", "EDA / Interface A", "장비의 물리/논리 구성요소를 계층 모델로 표현하는 규칙입니다.", "EDA Client가 Load Port, Chamber, Sensor, Software Module의 관계를 이해하게 합니다.", ["Equipment Components", "CEM Builder", "EDA Metadata Model", "Data Client"], [["eda_component", "component_id, parent_component_id, component_type, name, path, active_flag"], ["eda_component_relation", "source_component_id, relation_type, target_component_id"]]],
  ["E125", "SEMI E125", "Equipment Self Description", "EDA / Interface A", "장비가 수집 가능한 Parameter, Event, Exception, Metadata를 스스로 설명하는 방법을 정의합니다.", "Collector가 장비별 데이터 사전을 자동으로 가져와 수집 설정과 검증에 사용합니다.", ["EDA Server", "Self Description Service", "Metadata Cache", "Collector Config"], [["eda_parameter_def", "parameter_id, component_id, name, data_type, unit, collection_capability"], ["eda_event_def", "event_id, component_id, event_name, description, related_parameters"]]],
  ["E132", "SEMI E132", "Client Authentication and Authorization", "EDA / Interface A", "EDA Client의 인증과 권한 부여를 표준화합니다.", "여러 데이터 소비자가 장비 데이터에 접근할 때 보안 통제를 제공합니다.", ["EDA Client", "Auth Service", "Authorization Policy", "EDA Server"], [["eda_client", "client_id, client_name, certificate_subject, status, last_seen_at"], ["eda_permission", "client_id, component_scope, data_scope, allow_collect, allow_manage_plan"]]],
  ["E134", "SEMI E134", "Data Collection Management", "EDA / Interface A", "Data Collection Plan 생성, 활성화, 비활성화, 구독, 수집 조건을 관리합니다.", "EES/FDC가 필요한 Signal을 고속으로 지속 수집하도록 계획을 표준화합니다.", ["FDC Requirement", "DCP Manager", "EDA Server", "Streaming Collector"], [["data_collection_plan", "plan_id, equipment_id, plan_name, trigger_rule, sample_period_ms, state"], ["data_collection_item", "plan_id, parameter_id, alias, aggregation_rule, quality_rule"], ["data_sample", "plan_id, parameter_id, value, quality_code, sample_time"]]],
  ["E164", "SEMI E164", "EDA Common Metadata", "EDA / Interface A", "EDA 구현 간 Metadata 표현과 명명 관례의 공통성을 높이는 기준입니다.", "장비 벤더별 Metadata 차이를 줄여 수집 시스템의 재사용성을 높입니다.", ["EqSD Metadata", "E164 Validator", "Canonical Model", "Analytics Consumer"], [["canonical_signal", "signal_id, equipment_id, canonical_path, source_parameter_id, unit, semantic_tag"], ["metadata_validation_result", "equipment_id, rule_id, severity, message, checked_at"]]],
  ["E172", "SEMI E172", "SECS Equipment Data Dictionary", "Data Dictionary", "SECS/GEM 장비 데이터 사전을 XML 기반으로 표현하는 규격입니다.", "TC/EAP, Simulator, Test Tool이 장비 메시지와 변수 정의를 자동 로딩하도록 돕습니다.", ["Equipment SEDD", "Dictionary Parser", "Message Validator", "TC/EAP"], [["sedd_variable", "equipment_id, vid, name, data_type, unit, description"], ["sedd_message", "equipment_id, stream, function, direction, schema_json"]]],
  ["E173", "SEMI E173", "XML SECS-II Message Notation", "Data Dictionary", "SECS-II 메시지를 XML 표기법으로 표현하는 규격입니다.", "테스트, 문서화, 메시지 검증, API Gateway 변환에 활용할 수 있습니다.", ["Raw SECS-II", "SMN Converter", "XML Message", "Validation/Test"], [["smn_template", "template_id, stream, function, xml_schema, description"], ["smn_conversion_log", "message_id, template_id, conversion_status, converted_at"]]],
  ["E187", "SEMI E187", "FAB Equipment Cybersecurity", "보안/운영", "FAB 장비의 사이버보안 요구사항과 보호 기준을 다룹니다.", "TC/EAP, EDA Client, 설비 네트워크 연결에서 계정, 포트, 원격 접속, 취약점 관리 기준을 세웁니다.", ["Equipment Network", "Security Policy", "Access Control", "Audit Log", "Risk Review"], [["equipment_security_profile", "equipment_id, network_zone, open_ports, remote_access, patch_level, risk_rating"], ["equipment_access_audit", "equipment_id, user_id, action, source_ip, result, event_time"]]],
  ["E10", "SEMI E10", "Equipment Reliability, Availability, Maintainability", "KPI / 신뢰성", "장비 신뢰성/가용성 측정과 상태 분류를 위한 기준입니다.", "OEE, Availability, MTBF, MTTR, Down Time Pareto의 표준화된 계산 기반입니다.", ["Equipment State Event", "E10 Classifier", "Availability KPI", "Dashboard"], [["equipment_state_interval", "equipment_id, e10_state, reason_code, start_time, end_time, duration_sec"], ["availability_metric", "equipment_id, metric_name, numerator_sec, denominator_sec, value, window_start, window_end"]]],
  ["E151", "SEMI E151", "Understanding Data Quality", "데이터 품질", "데이터 품질을 이해하고 평가하기 위한 가이드입니다.", "Message 누락, 시간 지연, 단위 불일치, 비정상 값이 KPI에 미치는 영향을 관리합니다.", ["Raw Data", "Quality Rule", "Quality Score", "Consumer"], [["data_quality_rule", "rule_id, signal_id, rule_type, threshold, severity"], ["data_quality_issue", "issue_id, signal_id, issue_type, detected_value, detected_at, status"]]],
  ["E160", "SEMI E160", "Communication of Data Quality", "데이터 품질", "데이터 품질 정보를 시스템 간 전달하는 방법을 다룹니다.", "KPI 계산 시 값뿐 아니라 품질 코드까지 함께 전달해 잘못된 의사결정을 줄입니다.", ["Collector", "Quality Annotator", "Data Stream", "KPI Engine"], [["quality_annotated_sample", "sample_id, signal_id, value, quality_code, quality_reason, sample_time"], ["quality_code_dictionary", "quality_code, meaning, calculation_policy"]]],
  ["E133", "SEMI E133", "Automated Process Control Systems Interface", "APC / EES", "APC 시스템 인터페이스를 위한 표준입니다.", "EES/APC가 공정 조건 조정, 모델 결과, 제어 액션을 생산 실행 흐름과 연결하는 데 참고됩니다.", ["Process Data", "APC Model", "Control Recommendation", "TC/EAP Command"], [["apc_model_result", "model_id, lot_id, equipment_id, recommendation, confidence, created_at"], ["apc_control_action", "action_id, target_equipment, recipe_param, old_value, new_value, approval_status"]]]
]

standards = []
for s in standards_raw:
    standards.append({
        "id": s[0],
        "code": s[1],
        "name": s[2],
        "group": s[3],
        "summary": s[4],
        "role": s[5],
        "dfd": s[6],
        "tables": s[7]
    })

algorithms = [
  {
    "id": "Chan",
    "code": "Chan",
    "name": "Chan's Convex Hull 알고리즘",
    "group": "Streaming Algorithm",
    "summary": "평면 상의 n개 점으로부터 Graham Scan과 Jarvis March를 결합하여 O(n log h) 속도로 Convex Hull(볼록 껍질)을 구하는 기하학적 최적화 알고리즘입니다.",
    "role": "설비 공정 파라미터(온도, 압력 등)의 다차원 분포를 분석하여 정상 가동 범위(Operating Envelope)를 산출하고 극단적인 이상치(Outlier)를 판별할 때 사용됩니다.",
    "dfd": ["Raw Samples", "Group Partition (m)", "Graham Scan CH_i", "Jarvis Tangent Merge", "Convex Envelope"],
    "formula": "\\(m = 2^{2^t}\\) 크기 그룹 분할 후, Graham Scan 적용 후 Jarvis March 접선 탐색 및 병합",
    "tables": [
      ["process_parameter_envelope", "equipment_id, parameter_x, parameter_y, vertex_seq, vertex_x, vertex_y, updated_at"],
      ["parameter_sample_stream", "equipment_id, sample_time, val_x, val_y, is_inside_envelope"]
    ],
    "introduction": """
      <h3>Convex Hull (볼록 껍질)의 개념</h3>
      <p>2차원 또는 다차원 공간에 흩어져 있는 여러 점들을 모두 감싸는 <strong>가장 작은 볼록한 다각형(또는 다면체)</strong>을 의미합니다. 전산 기하학(Computational Geometry)에서 가장 기본적이면서도 중요한 개념입니다.</p>
      <p>가장 직관적인 비유는 <strong>'고무줄 비유(Rubber Band Analogy)'</strong>입니다. 널빤지 위에 여러 개의 못(데이터 점)이 박혀 있다고 상상해 보세요. 커다란 고무줄을 팽팽하게 늘려서 모든 못을 바깥쪽에서 감싸도록 놓았을 때, 고무줄이 수축하면서 바깥쪽 못들에 걸쳐 만들어지는 형태가 바로 이 못들의 Convex Hull입니다.</p>
      
      <h4>기하학적 및 수학적 정의</h4>
      <ul>
        <li><strong>볼록(Convex)의 의미:</strong> 다각형 내부에 있는 임의의 두 점을 골라 선분으로 연결했을 때, 그 선분이 다각형의 경계선 밖으로 전혀 나가지 않는 형태를 말합니다.</li>
        <li><strong>최소성(Minimality):</strong> 점 집합 S를 포함하는 볼록 다각형은 무수히 많을 수 있지만, Convex Hull은 그 중에서 '가장 작은(면적이 최소인)' 다각형입니다.</li>
        <li><strong>정점(Vertex):</strong> Convex Hull의 꼭짓점을 이루는 점들을 '극단점(Extreme Points)'이라고 하며, 이들은 원래 점 집합 S에 속해 있는 데이터들 중 가장 외곽에 위치한 데이터들입니다.</li>
      </ul>
      
      <h4>주요 탐색 알고리즘 비교</h4>
      <ul>
        <li><strong>Jarvis March (선물 포장 알고리즘, Gift Wrapping):</strong> 가장 왼쪽 점에서 시작해 반시계 방향으로 선물을 포장하듯 다음 점을 찾아나갑니다. 시간 복잡도: \\(O(nh)\\) (n: 전체 점, h: 껍질 정점 수)</li>
        <li><strong>Graham Scan (그레이엄 스캔):</strong> 각도 기준으로 전체 정렬(\\(O(n \\log n)\\)) 후 스택을 사용하여 오목점을 제거하며 껍질을 완성합니다.</li>
        <li><strong>Chan's Algorithm (찬의 알고리즘):</strong> 데이터를 크기 m인 그룹으로 나누어 Graham Scan을 수행한 후, Jarvis March 방식으로 병합하여 \\(O(n \\log h)\\)라는 이론적 최적 복잡도를 달성합니다.</li>
      </ul>
    """,
    "steps": """
      <ol>
        <li><strong>그룹 분할 (Partitioning)</strong>
          <p>전체 점 집합 P를 크기가 m인 r개의 그룹으로 나눕니다.</p>
          <ul>
            <li>그룹의 수: \\(r = \\lceil n/m \\rceil\\)</li>
            <li>수식: \\(P = \\{P_1, P_2, ..., P_r\\}\\) 이며, 각 \\(|P_i| \\le m\\) 입니다.</li>
          </ul>
        </li>
        <li><strong>개별 Convex Hull 생성 (Graham Scan)</strong>
          <p>각 그룹 P_i에 대해 Graham Scan 알고리즘을 적용하여 각각의 작은 볼록 껍질 CH_i를 구합니다. 이 과정의 시간 복잡도는 그룹당 O(m log m)이 소요되므로 전체적으로 \\(O(n \\log m)\\)입니다.</p>
        </li>
        <li><strong>Jarvis March를 이용한 병합 (Gift Wrapping)</strong>
          <p>가장 왼쪽에 있는 점 P_i에서 시작하여, 전체 껍질의 다음 정점 P_{k+1}을 찾습니다. 이때 각 그룹의 껍질(CH_i)과 현재 점(P_k) 사이의 <strong>접선(Tangent)</strong>을 이진 탐색으로 찾습니다.</p>
          <ul>
            <li>접점 탐색: \\(P_k\\)에서 각 \\(CH_i\\)로의 접선을 찾는 시간은 \\(O(\\log m)\\)입니다.</li>
            <li>다음 정점 결정: r개의 그룹 중에서 가장 외곽에 있는 점을 고르는 과정은 \\(O(r \\log m)\\)입니다.</li>
            <li>이 과정을 h번 반복하므로 최종 병합 시간은 \\(O(h \\cdot (n/m) \\log m)\\)입니다.</li>
          </ul>
        </li>
        <li><strong>반복적 파라미터 최적화 (Iterative Strategy)</strong>
          <p>우리는 h를 미리 알 수 없으므로, m을 \\(2^{2^t}\\) (t=1,2,...) 순으로 기하급수적으로 키우며 위 과정을 반복합니다.</p>
          <div class="math-box">
            \\(\\sum_{t=1}^{\\log\\log h} n \\cdot \\log(2^{2^t}) = \\sum_{t=1}^{\\log\\log h} n \\cdot 2^t = O(n \\log h)\\)
          </div>
        </li>
      </ol>
    """,
    "scenarios": """
      <ul>
        <li><strong>설비 파라미터 경계면(Envelope) 분석:</strong> OEE 성능 효율 계산 시, 단순히 평균값만 분석하는 대신 Chan's Algorithm을 사용하여 <strong>'정상 가동 범위(Normal Operating Zone)'</strong>의 다차원 기하학적 경계를 확정할 수 있습니다. 경계 밖의 데이터는 이상 센서 드리프트 등으로 판별하여 가동 손실 원인 추적에 사용합니다.</li>
        <li><strong>분산 데이터 요약:</strong> 여러 대의 설비(r개)에서 각각 계산된 부분 Convex Hull(CH_i) 정보만 중앙 서버로 보내면, 서버는 전체 원시 데이터를 전송받을 필요 없이 접선 계산만으로 라인 전체의 공정 경계를 즉시 합성할 수 있습니다.</li>
      </ul>
    """
  },
  {
    "id": "KLL",
    "code": "KLL",
    "name": "KLL Quantile Sketch",
    "group": "Streaming Algorithm",
    "summary": "대규모 스트리밍 데이터에서 전체 데이터를 보관하지 않고, 아주 적은 고정 메모리만을 사용하여 분위수(Quantiles, p50, p99 등)를 고정 오차 범위 내로 추정하는 압축 Sketch 알고리즘입니다.",
    "role": "대량의 실시간 설비 데이터 스트림에서 Cycle Time, Queue Time의 백분위수(P99 극단값 필터링 및 P50 중앙값 검출)를 추정하여 성능가동율을 정밀하게 산출할 때 활용됩니다.",
    "dfd": ["Raw Samples", "Level 0 Buffer", "Compactor Trigger", "Random Coin Selection", "Quantile Output"],
    "formula": "용량 초과 시 Level i의 버퍼를 정렬하고, 동전 던지기 b \\in \\{0,1\\}에 따라 홀수/짝수 번째 값만 상위 Level i+1로 보내 가중치 2배 부여",
    "tables": [
      ["kll_sketch_state", "sketch_id, equipment_id, k, total_n, error_bound, serialized_blob, updated_at"],
      ["kll_level_buffer", "sketch_id, level_no, weight, capacity, buffer_values_json"]
    ],
    "introduction": """
      <h3>KLL (Karnin-Lang-Liberty) Sketch의 개념</h3>
      <p>KLL 알고리즘은 스트리밍 데이터에서 <strong>Quantiles(분위수)</strong>를 추정하기 위해 설계된 최신 알고리즘입니다. Apache DataSketches 라이브러리 등에 포함되어 실무에서 대용량 모니터링 분석에 널리 쓰입니다.</p>
      <p>수억 개의 데이터가 실시간으로 들어올 때, 모든 데이터를 정렬하여 "상위 1% 값"이나 "중간값(Median)"을 찾는 것은 메모리상 불가능합니다. KLL은 아주 적은 메모리만 사용하면서도 매우 높은 정확도로 이 값들을 추정합니다.</p>
      
      <h4>KLL 알고리즘의 구조: 계층적 버퍼 (Hierarchical Buffers)</h4>
      <p>KLL은 여러 개의 <strong>Level(H)</strong>로 구성된 버퍼 구조를 가집니다. 각 레벨 i는 용량 k_i를 가지며, 레벨이 올라갈수록 데이터의 '가중치'는 2배씩 증가합니다.</p>
      <ul>
        <li><strong>Level 0:</strong> 원래의 데이터(가중치 1)가 들어오는 곳입니다.</li>
        <li><strong>Level i:</strong> 가중치가 \\(2^i\\)인 데이터들이 저장됩니다.</li>
      </ul>
    """,
    "steps": """
      <p>Compaction은 특정 레벨의 버퍼가 가득 찼을 때, 데이터를 상위 레벨로 보내면서 크기를 줄이는 핵심 프로세스입니다.</p>
      <ol>
        <li><strong>트리거 (Trigger)</strong>
          <p>레벨 i의 데이터 개수가 미리 정의된 용량 \\(k_i\\)를 초과하면 압축이 시작됩니다.</p>
        </li>
        <li><strong>정렬 (Sorting)</strong>
          <p>해당 레벨의 버퍼에 있는 데이터들을 오름차순으로 정렬합니다.</p>
          <div class="math-box">
            \\(X = \\{x_1, x_2, ..., x_n\\} \\quad (x_1 \\le x_2 \\le ... \\le x_n)\\)
          </div>
        </li>
        <li><strong>선택 및 제거 (Selection &amp; Eviction)</strong>
          <p>정렬된 데이터 중 홀수 번째 또는 짝수 번째 데이터만 선택하여 상위 레벨(i+1)로 보냅니다. 이때 선택은 무작위(Random)로 결정하여 편향(Bias)을 방지합니다.</p>
          <ul>
            <li><strong>동전 던지기(\\(b \\in \\{0,1\\}\\))</strong>를 통해 결정:</li>
            <li>b=0이면: \\(\\{x_2, x_4, x_6, ...\\}\\) 를 상위 레벨로 전달</li>
            <li>b=1이면: \\(\\{x_1, x_3, x_5, ...\\}\\) 를 상위 레벨로 전달</li>
            <li>선택되지 않은 나머지 절반의 데이터는 메모리에서 완전히 삭제됩니다.</li>
          </ul>
        </li>
        <li><strong>가중치 갱신 (Weight Update)</strong>
          <p>상위 레벨로 올라간 데이터는 이제 이전보다 2배의 가중치를 갖게 됩니다.</p>
          <p>Level i의 데이터 2개가 Level i+1의 데이터 1개로 대체되지만, 가중치가 \\(2^i\\)에서 \\(2^{i+1}\\)로 변하므로 전체 통계적 분포(Sum of Weights)는 유지됩니다.</p>
        </li>
      </ol>
    """,
    "scenarios": """
      <ul>
        <li><strong>실시간 OEE 모니터링:</strong> 설비에서 발생하는 수백만 건의 Cycle Time 데이터를 DB에 다 쌓지 않고도, 메모리 내에서 즉시 95% 신뢰 구간의 성능 지표를 산출할 수 있습니다.</li>
        <li><strong>이상치(Outlier) 필터링:</strong> 성능 효율을 계산할 때, 비정상적으로 길게 측정된 Cycle Time을 KLL의 분위수 기반 필터링(예: 상위 99% 제외)을 통해 자동 제거하여 데이터의 정밀도를 높일 수 있습니다.</li>
        <li><strong>분산 데이터 통합:</strong> 여러 대의 설비(Equipment)에서 각각 생성된 KLL Sketch를 중앙 서버로 보내기만 하면, 추가 연산 없이 '병합(Merge)'하여 라인 전체의 통합 통계 데이터를 얻을 수 있습니다.</li>
      </ul>
    """,
    "mathematics": """
      <h4>수식적 이해와 오차 보장</h4>
      <p>KLL 알고리즘의 가장 큰 장점은 메모리 사용량과 오차 범위 사이의 관계를 수학적으로 증명했다는 점입니다.</p>
      <ul>
        <li><strong>레벨별 용량 설정 (\\(k_i\\))</strong>
          <p>메모리를 효율적으로 쓰기 위해 상위 레벨로 갈수록 버퍼 크기를 기하급수적으로 줄입니다.</p>
          <div class="math-box">
            \\(k_i \\approx k \\cdot c^{H-i}\\)
          </div>
          <p>(여기서 k는 전체 파라미터, c는 1보다 작은 상수(약 2/3)입니다.)</p>
        </li>
        <li><strong>오차 범위 (\\(\\epsilon\\))</strong>
          <p>사용자가 허용하는 오차 \\(\\epsilon\\)에 대해, KLL Sketch가 필요한 메모리 공간 M은 다음과 같습니다.</p>
          <div class="math-box">
            \\(M = O(1/\\epsilon \\cdot \\log(\\log 1/\\epsilon))\\)
          </div>
          <p>이는 기존의 다른 알고리즘(예: GK Array)보다 훨씬 적은 메모리로도 동일한 정확도를 낼 수 있음을 의미합니다.</p>
        </li>
      </ul>
    """
  }
]

css = """
:root{--ink:#17202a;--muted:#64748b;--line:#d7dde8;--panel:#fff;--paper:#f5f7fb;--accent:#137a7f;--blue:#2864a8;--orange:#b85c18;--green:#517d2f;--shadow:0 18px 42px rgba(25,35,58,.10)}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font-family:Arial,"Malgun Gothic",sans-serif;line-height:1.6}.page{max-width:1180px;margin:0 auto;padding:28px}.hero{background:#101826;color:#fff;border-radius:14px;padding:30px;box-shadow:var(--shadow);border-bottom:5px solid #e7b84a}.hero h1{margin:0 0 10px;font-size:clamp(26px,4vw,42px);letter-spacing:0}.hero p{margin:0;color:#dbe3ef;max-width:980px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.chip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}.section{background:var(--panel);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);padding:22px;margin-top:18px}.section h2{margin:0 0 12px;font-size:21px;border-bottom:2px solid var(--line);padding-bottom:8px;color:#182233}.section h3{margin:22px 0 10px;font-size:17px;color:var(--blue)}.section h4{margin:16px 0 6px;font-size:14px;color:var(--accent)}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}.card strong{display:block;color:#1d3557;margin-bottom:4px}.card span,.muted{color:var(--muted);font-size:13px}.diagram{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}svg{display:block;min-width:880px;width:100%;height:auto}.node rect{fill:#fff;stroke:#ccd6e2;stroke-width:1.4;rx:8}.node text{font-size:13px;fill:#182233;font-weight:700}.tiny{font-size:11px!important;fill:#667085!important;font-weight:400!important}.arrow{stroke:#2864a8;stroke-width:1.7;fill:none;marker-end:url(#arrow)}table{width:100%;border-collapse:collapse;background:#fff;font-size:13px;margin-top:12px}th,td{border:1px solid var(--line);padding:10px;vertical-align:top}th{background:#eef3f8;color:#24364b;text-align:left}.note{border-left:4px solid var(--orange);background:#fff8ef;border-radius:8px;padding:13px;color:#4c3a25}.crumbs{margin:16px 0;color:var(--muted);font-size:13px}.crumbs a{color:#1f68b3;text-decoration:none}.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.list a{display:block;border:1px solid var(--line);border-radius:9px;background:#fff;padding:12px;color:var(--ink);text-decoration:none}.list a:hover{border-color:var(--accent);background:#f0fbfa}.math-box{background:#f8fafc;border:1px solid var(--line);border-radius:6px;padding:4px 8px;font-family:"Courier New",Courier,monospace;font-weight:bold;color:var(--accent);display:inline-block;margin:2px 0}div.math-box{display:block;padding:12px;margin:10px 0;text-align:center;font-size:1.1em;background:#f8fafc}@media(max-width:820px){.page{padding:14px}.grid,.list{grid-template-columns:1fr}.hero{padding:22px}}
"""

with open(os.path.join(guideDir, "semi-page.css"), "w", encoding="utf8") as f:
    f.write(css)
with open(os.path.join(developerDir, "semi-page.css"), "w", encoding="utf8") as f:
    f.write(css)

def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&#039;")

def diagram(steps):
    gap = 190
    width = max(900, 105 + len(steps) * gap)
    nodes = []
    for i, step in enumerate(steps):
        x = 40 + i * gap
        role = "Input" if i == 0 else ("Output" if i == len(steps) - 1 else "Process")
        nodes.append(f'<g class="node"><rect x="{x}" y="44" width="150" height="76"></rect><text x="{x + 75}" y="78" text-anchor="middle">{esc(step)}</text><text class="tiny" x="{x + 75}" y="101" text-anchor="middle">{role}</text></g>')
    arrows = []
    for i in range(len(steps) - 1):
        arrows.append(f'<path class="arrow" d="M{190 + i * gap} 82 H{230 + i * gap}"></path>')
    
    return f'<svg viewBox="0 0 {width} 164" aria-label="DFD"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2864a8"></path></marker></defs>{"".join(nodes)}{"".join(arrows)}</svg>'

def tableRows(rows):
    res = []
    for r in rows:
        res.append(f'<tr><td><strong>{esc(r[0])}</strong></td><td>{esc(r[1])}</td></tr>')
    return "".join(res)

def shell(title, subtitle, body, cssPath = "../semi-page.css"):
    return f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)}</title><link rel="stylesheet" href="{cssPath}"></head><body><main class="page">{body}</main></body></html>'

def standardUnifiedPage(s):
    # DFD 단계별 둥글고 예쁜 박스를 생성하는 HTML
    dfd_steps = s["dfd"]
    gap = 190
    width = max(900, 105 + len(dfd_steps) * gap)
    
    nodes = []
    for i, step in enumerate(dfd_steps):
        x = 40 + i * gap
        role = "Input" if i == 0 else ("Output" if i == len(dfd_steps) - 1 else "Process")
        bg_color = "#f1f5f9"
        border_color = "#cbd5e1"
        text_color = "#1e293b"
        if role == "Input":
            bg_color = "#f0fdfa"
            border_color = "#99f6e4"
            text_color = "#0f766e"
        elif role == "Output":
            bg_color = "#eff6ff"
            border_color = "#bfdbfe"
            text_color = "#1d4ed8"
            
        nodes.append(f"""
        <g class="node cursor-pointer transition-transform hover:scale-105 duration-200" onclick="showDfdDetail({i}, '{esc(step)}')">
            <rect x="{x}" y="34" width="160" height="76" rx="12" fill="{bg_color}" stroke="{border_color}" stroke-width="2"></rect>
            <text x="{x + 80}" y="68" text-anchor="middle" font-size="13" font-weight="bold" fill="{text_color}">{esc(step)}</text>
            <text class="tiny" x="{x + 80}" y="90" text-anchor="middle" font-size="10" fill="#64748b" font-weight="normal">{role}</text>
        </g>
        """)
    
    arrows = []
    for i in range(len(dfd_steps) - 1):
        arrows.append(f'<path class="arrow" d="M{200 + i * gap} 72 H{230 + i * gap}" stroke="#0284c7" stroke-width="2" fill="none" marker-end="url(#arrow)"></path>')
        
    svg_diagram = f"""
    <div class="overflow-x-auto bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <svg viewBox="0 0 {width} 144" class="w-full min-w-[880px] h-auto block">
            <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L6,3 z" fill="#0284c7"></path>
                </marker>
            </defs>
            {"".join(nodes)}
            {"".join(arrows)}
        </svg>
        <div id="dfd-detail-panel" class="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 hidden fade-in">
            <strong class="text-slate-800">선택된 단계:</strong> <span id="dfd-step-name"></span>
            <p class="mt-1">해당 단계는 {esc(s["code"])} 프로세스의 주요 데이터 흐름 계층 중 하나입니다. 설비 이벤트 및 상태 파이프라인에서 상위 시스템으로 연동되는 실시간 메커니즘을 정의합니다.</p>
        </div>
    </div>
    """

    # 테이블 행 생성
    table_rows = []
    for r in s["tables"]:
        columns = [c.strip() for c in r[1].split(",")]
        colored_cols = " ".join([f'<span class="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-md border border-slate-200 m-0.5">{col}</span>' for col in columns])
        table_rows.append(f"""
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="p-4 border-b border-stone-100 font-bold text-slate-800 text-left w-1/3">
                <div class="flex items-center">
                    <span class="w-2.5 h-2.5 rounded-full bg-teal-500 mr-2.5"></span>
                    {esc(r[0])}
                </div>
            </td>
            <td class="p-4 border-b border-stone-100 text-left">
                <div class="flex flex-wrap gap-1">
                    {colored_cols}
                </div>
            </td>
        </tr>
        """)

    body = f"""
    <body class="antialiased bg-stone-50">
        <header class="bg-slate-900 text-stone-50 py-12 shadow-md">
            <div class="container mx-auto px-4 max-w-6xl">
                <div class="crumbs text-xs text-stone-400 mb-3">
                    <a href="../SEMI_Data_Flow_Main.html" class="hover:text-stone-200 transition">SEMI Guide</a> / <span class="text-stone-300">{esc(s["code"])}</span>
                </div>
                <div class="inline-block bg-teal-900 text-teal-100 text-xs font-bold px-3 py-1 rounded mb-3 tracking-widest uppercase">
                    Interactive Standard Guide
                </div>
                <h1 class="text-4xl md:text-5xl font-bold mb-4">{esc(s["code"])} - {esc(s["name"])}</h1>
                <p class="text-stone-300 text-lg md:text-xl max-w-3xl leading-relaxed">
                    {esc(s["summary"])}
                </p>
            </div>
        </header>

        <main class="container mx-auto px-4 max-w-6xl mt-12 space-y-16 pb-20">
            <!-- Section 1. 기능 및 역할 요약 -->
            <section class="fade-in">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-stone-800 flex items-center">
                        <span class="bg-teal-700 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg mr-3">1</span>
                        표준 역할 & 개발 기능 요약
                    </h2>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="md:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 p-8 flex flex-col justify-between">
                        <div>
                            <h3 class="text-xl font-bold text-slate-800 mb-3">개발 관점의 표준 정의</h3>
                            <p class="text-stone-600 leading-relaxed text-lg">
                                {esc(s["role"])}
                            </p>
                        </div>
                        <div class="mt-6 border-t border-stone-100 pt-6">
                            <span class="inline-block bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-100 uppercase tracking-wider">
                                분류: {esc(s["group"])}
                            </span>
                        </div>
                    </div>

                    <div class="bg-teal-900 text-stone-100 rounded-2xl shadow-sm p-8 flex flex-col justify-between border-b-8 border-teal-950">
                        <div>
                            <h3 class="text-xl font-bold mb-3">💡 업무 적용 포인트</h3>
                            <p class="text-teal-200 text-sm leading-relaxed">
                                설비 이벤트 및 상태 파이프라인에서 상위 시스템으로 연동되는 실시간 메커니즘을 정의합니다. 원문 표준 문서 개정판을 공식 채널에서 반드시 크로스체크 하세요.
                            </p>
                        </div>
                        <div class="mt-6 text-xs text-teal-300/80 border-t border-teal-800 pt-4">
                            SECS/GEM & GEM300 공통 개발 설계
                        </div>
                    </div>
                </div>
            </section>

            <!-- Section 2. DFD -->
            <section class="fade-in">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-stone-800 flex items-center">
                        <span class="bg-teal-700 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg mr-3">2</span>
                        데이터 흐름도 (Data Flow Diagram)
                    </h2>
                    <p class="text-stone-600 mt-2 text-lg">
                        설비 원시 데이터 수집부터 최종 데이터 처리 레이어까지 전달되는 데이터 흐름 단계를 추적합니다. 각 단계를 클릭하여 세부 사항을 확인해 보세요.
                    </p>
                </div>
                {svg_diagram}
            </section>

            <!-- Section 3. 업무 적용 체크포인트 -->
            <section class="fade-in">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-stone-800 flex items-center">
                        <span class="bg-teal-700 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg mr-3">3</span>
                        핵심 3대 업무 체크포인트
                    </h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="kpi-card bg-white rounded-2xl border-l-4 border-l-teal-600 border border-stone-200 p-6 shadow-sm">
                        <h4 class="text-lg font-bold text-stone-800 mb-2">적용 범위 & 위치</h4>
                        <p class="text-stone-600 text-sm leading-relaxed">
                            설비 제어기 내부, TC/EAP 서버, EES/APC/FDC 분석 계층 및 KPI 연동 시스템 중 해당 표준이 주로 작동하는 논리 레이어의 물리적 한계를 점검합니다.
                        </p>
                    </div>

                    <div class="kpi-card bg-white rounded-2xl border-l-4 border-l-sky-600 border border-stone-200 p-6 shadow-sm">
                        <h4 class="text-lg font-bold text-stone-800 mb-2">사양서 검토 대상</h4>
                        <p class="text-stone-600 text-sm leading-relaxed">
                            표준 사양 번호(SEMI E-시리즈), 고객사 요구 사양서, 장비 제작사별 실제 구현 범위 및 커스텀 구현(예외 승인) 필요 여부를 초기 프로젝트 킥오프 시 선제 파악합니다.
                        </p>
                    </div>

                    <div class="kpi-card bg-white rounded-2xl border-l-4 border-l-indigo-600 border border-stone-200 p-6 shadow-sm">
                        <h4 class="text-lg font-bold text-stone-800 mb-2">운영 및 지표 영향도</h4>
                        <p class="text-stone-600 text-sm leading-relaxed">
                            데이터 전송 가용성, 설비 병목 시간 추적 무결성, 보안 무단 접근 차단율 등 해당 표준의 고장 또는 지연 상황이 상위 공정 분석 지표에 미치는 영향을 사전에 검토합니다.
                        </p>
                    </div>
                </div>
            </section>

            <!-- Section 4. 권장 테이블 구성 -->
            <section class="fade-in">
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-stone-800 flex items-center">
                        <span class="bg-teal-700 text-white w-8 h-8 flex items-center justify-center rounded-full text-lg mr-3">4</span>
                        데이터베이스 권장 테이블 스키마 설계안
                    </h2>
                    <p class="text-stone-600 mt-2 text-lg">
                        현장 표준을 수용하고 확장 가능한 형태의 모범적 관계형 DB 테이블 컬럼 설계 제안서입니다.
                    </p>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="bg-slate-900 text-white">
                                    <th class="p-4 font-semibold text-left w-1/3">권장 테이블명</th>
                                    <th class="p-4 font-semibold text-left">핵심 권장 컬럼군 (Schema)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {"".join(table_rows)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
        <footer class="container mx-auto px-4 max-w-6xl pb-12 text-center text-stone-400 text-sm">
            © 2024 SEMI Standard Development Guide. All rights reserved.
        </footer>
        <script>
            function showDfdDetail(index, stepName) {{
                const panel = document.getElementById('dfd-detail-panel');
                const stepSpan = document.getElementById('dfd-step-name');
                stepSpan.innerText = stepName;
                panel.classList.remove('hidden');
                
                panel.style.animation = 'none';
                panel.offsetHeight;
                panel.style.animation = null;
            }}
        </script>
    </body>
    """
    
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc(s["code"])} - {esc(s["name"])}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {{
            background-color: #fafaf9;
            color: #292524;
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }}
        .fade-in {{ animation: fadeIn 0.4s ease-out forwards; }}
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(10px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        .kpi-card {{
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }}
        .kpi-card:hover {{
            transform: translateY(-3px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }}
    </style>
</head>
{body}
</html>"""

def algorithmPage(a):
    introSec = f'<section class="section"><h2>알고리즘 상세 개요</h2>{a["introduction"]}</section>' if "introduction" in a else ""
    stepsSec = f'<section class="section"><h2>상세 작동 단계</h2>{a["steps"]}</section>' if "steps" in a else ""
    mathSec = f'<section class="section"><h2>수학적 오차 보장 및 분석</h2>{a["mathematics"]}</section>' if "mathematics" in a else ""
    scenarioSec = f'<section class="section"><h2>실시간 설비 OEE 적용 시나리오</h2>{a["scenarios"]}</section>' if "scenarios" in a else ""

    mathjaxConfig = """
    <script>
      MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
          displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
        }
      };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    """

    integrationSec = """
    <section class="section">
      <h2>KLL & Chan 기반 설비 효율 분석 통합 로직 및 아키텍처</h2>
      <p>설비 상태 및 효율에 기반하여 대규모 설비 데이터 스트림을 처리하기 위해, <strong>Chan's Algorithm(기하학적 경계 산출)</strong>과 <strong>KLL Sketch(통계적 분포 추정)</strong>를 결합한 통합 이상치 제거 및 성능 지표 산출 로직을 설계합니다. 이 통합 로직은 다차원 데이터의 경계(Hull)와 단일 변수의 분포(Quantile)를 모두 고려하여 정교하게 이상치를 필터링하고, 최종적으로 정확한 성능 효율(Performance Efficiency)을 계산하는 데 초점을 맞춥니다.</p>

      <h3>1. 통합 분석 로직 개요</h3>
      <ul>
        <li><strong>E10 RUN Filter:</strong> 설비 상태가 'PRD(Production)'인 유효 가동 시간 데이터만 추출합니다.</li>
        <li><strong>Chan Engine:</strong> 다차원 공정 파라미터(예: 온도 vs 압력)의 기하학적 정상 가동 범위(Operating Envelope)를 계산하여 외곽점(Outlier)을 감지합니다.</li>
        <li><strong>KLL Engine:</strong> 성능 효율의 핵심 지표인 Cycle Time(CT)에 대한 실시간 백분위수(P99, Median)를 추정합니다.</li>
        <li><strong>이중 이상치 제거:</strong> 신규 데이터 x에 대해 기하학적 정상 가동 범위 내부에 있고, Cycle Time이 P99 임계값보다 작은 경우에만 <strong>'정상 데이터 D_clean'</strong>으로 판별합니다.
          <div class="math-box">$$D_{clean} = \\{x \\in D \\mid (isInside(H, x.v)) \\land (x.CT < \\hat{q}_{0.99})\\}$$</div>
        </li>
        <li><strong>E79 성능 효율 산출:</strong> 정상 데이터 D_clean의 KLL 추정 중위수(Median CT, $\\hat{q}_{0.50}$)를 실제 속도로 사용하여 성능가동율을 산출합니다.
          <div class="math-box">$$\\text{성능가동율} = \\frac{\\text{Theoretical Cycle Time (TCT)}}{\\hat{q}_{0.50}} \\times 100(\\%)$$</div>
        </li>
      </ul>

      <h3>2. 설비 효율 분석 시스템 아키텍처</h3>
      <ul>
        <li><strong>Edge Network (데이터 수집):</strong> 설비(PLC/GEM)로부터 SECS/GEM 프로토콜을 통해 실시간 상태(E10), 공정 변수, Cycle Time을 Edge Gateway가 수집하여 전송합니다.</li>
        <li><strong>Stream Processor (실시간 분석 계층):</strong> 스트림 처리 엔진 내에서 Chan Engine과 KLL Engine이 각각 기하학적 경계와 통계적 분포를 모델링하고, 통합 필터를 통해 스파이크성 에러와 가짜 데이터를 차단합니다.</li>
        <li><strong>MES DB / RDBMS:</strong> 정제된 성능 지표, E10 상태 로그, 최신 요약본(Convex Hull 정점 및 KLL Sketch 요약본)을 안정적으로 저장합니다.</li>
        <li><strong>OEE Calculator & Dashboard (시각화 계층):</strong> 정제된 실제 속도와 SEMI Product Time 기반의 표준시간(Standard Time)을 비교하여 종합설비효율(OEE)을 산출하고 운영자에게 실시간으로 공유합니다. (양품율은 배제하고 시간가동율과 성능가동율의 곱으로만 OEE 계산)</li>
      </ul>

      <h3>3. DFD [Level 1] - 결합형 설비 효율 분석 시스템</h3>
      <div class="diagram">
        <svg viewBox="0 0 1000 164" aria-label="DFD"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2864a8"></path></marker></defs>
          <g class="node"><rect x="10" y="44" width="130" height="76"></rect><text x="75" y="78" text-anchor="middle">Equipment</text><text class="tiny" x="75" y="101" text-anchor="middle">Entity</text></g>
          <path class="arrow" d="M140 82 H170"></path>
          <g class="node"><rect x="170" y="44" width="130" height="76"></rect><text x="235" y="78" text-anchor="middle">1.0 E10 Filter</text><text class="tiny" x="235" y="101" text-anchor="middle">Process</text></g>
          <path class="arrow" d="M300 82 H330"></path>
          <g class="node"><rect x="330" y="44" width="130" height="76"></rect><text x="395" y="78" text-anchor="middle">2.0 Feature Eng.</text><text class="tiny" x="395" y="101" text-anchor="middle">Process</text></g>
          <path class="arrow" d="M460 82 H490"></path>
          <g class="node"><rect x="490" y="44" width="130" height="76"></rect><text x="555" y="78" text-anchor="middle">3.0 Outlier Filter</text><text class="tiny" x="555" y="101" text-anchor="middle">Process</text></g>
          <path class="arrow" d="M620 82 H650"></path>
          <g class="node"><rect x="650" y="44" width="130" height="76"></rect><text x="715" y="78" text-anchor="middle">4.0 E79 Calc</text><text class="tiny" x="715" y="101" text-anchor="middle">Process</text></g>
          <path class="arrow" d="M780 82 H810"></path>
          <g class="node"><rect x="810" y="44" width="130" height="76"></rect><text x="875" y="78" text-anchor="middle">OEE Dashboard</text><text class="tiny" x="875" y="101" text-anchor="middle">Output</text></g>
        </svg>
      </div>
    </section>
    """

    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(a["code"])} Developer</title><link rel="stylesheet" href="../semi-page.css">{mathjaxConfig}</head><body><main class="page">
    <div class="crumbs"><a href="../SEMI_Data_Flow_Developer.html">SEMI Developer</a> / {esc(a["code"])}</div>
    <section class="hero"><h1>{esc(a["name"])}</h1><p>{esc(a["summary"])}</p><div class="chips"><span class="chip">Streaming KPI</span><span class="chip">Developer</span></div></section>
    <section class="section"><h2>개발 기능 요약</h2><p>{esc(a["role"])}</p><div class="note"><strong>핵심 로직:</strong> {esc(a["formula"])}</div></section>
    {introSec}
    <section class="section"><h2>개발 DFD</h2><div class="diagram">{diagram(a["dfd"])}</div></section>
    {stepsSec}
    {mathSec}
    {scenarioSec}
    {integrationSec}
    <section class="section"><h2>권장 테이블 구성</h2><table><thead><tr><th>테이블</th><th>권장 컬럼</th></tr></thead><tbody>{tableRows(a["tables"])}</tbody></table></section>
  </main></body></html>"""

def overviewPage(type):
    isDev = type == "developer"
    base = "../SEMI_Interactive_Guide/standards" if isDev else "standards"
    links = []
    for s in standards:
        links.append(f'<a href="{base}/{s["id"]}.html"><strong>{esc(s["code"])}</strong><span class="muted">{esc(s["name"])} · {esc(s["group"])}</span></a>')
    
    algo = []
    for a in algorithms:
        algo.append(f'<a href="algorithms/{a["id"]}.html"><strong>{esc(a["code"])}</strong><span class="muted">{esc(a["name"])}</span></a>')
    
    algo_sec = f'<section class="section"><h2>Streaming Algorithm</h2><div class="list">{"".join(algo)}</div></section>' if isDev else ""
    title = "SEMI Developer" if isDev else "SEMI Guide"
    subtitle = "SEMI 표준별 개발 DFD, 인터페이스 설계 포인트, 권장 테이블 구조를 분리해 정리했습니다." if isDev else "설비 Message 수집부터 TC/EAP, EES/APC/FDC, MOS/MES, KPI 관리까지 이어지는 SEMI 표준 관계를 업무 관점으로 정리했습니다."
    
    return shell(title, "", f"""
    <section class="hero"><h1>{"SEMI Interactive Developer" if isDev else "SEMI Interactive Guide"}</h1><p>{subtitle}</p><div class="chips"><span class="chip">SECS/GEM</span><span class="chip">GEM300</span><span class="chip">EDA / Interface A</span><span class="chip">KPI</span></div></section>
    <section class="section"><h2>전체 흐름</h2><div class="diagram">{diagram(["Equipment", "SECS/GEM", "GEM300/EDA", "TC/EAP", "EES/APC/FDC", "MOS/MES", "KPI System"])}</div></section>
    <section class="section"><h2>{"표준별 개발 문서" if isDev else "표준별 가이드 문서"}</h2><div class="list">{"".join(links)}</div></section>
    {algo_sec}
    """, "semi-page.css")

for s in standards:
    if s["id"] in ["E4", "E5", "E37"]:
        continue
    with open(os.path.join(guideStandardsDir, f'{s["id"]}.html'), "w", encoding="utf8") as f:
        f.write(standardUnifiedPage(s))

for a in algorithms:
    with open(os.path.join(developerAlgorithmsDir, f'{a["id"]}.html'), "w", encoding="utf8") as f:
        f.write(algorithmPage(a))

with open(os.path.join(guideDir, "SEMI_Data_Flow_Main.html"), "w", encoding="utf8") as f:
    f.write(overviewPage("guide"))

with open(os.path.join(developerDir, "SEMI_Data_Flow_Developer.html"), "w", encoding="utf8") as f:
    f.write(overviewPage("developer"))

print(f"Generated {len(standards)} unified standard pages, and {len(algorithms)} algorithm pages.")
