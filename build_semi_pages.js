const fs = require("fs");
const path = require("path");

const root = __dirname;
const guideDir = path.join(root, "SEMI_Interactive_Guide");
const developerDir = path.join(root, "SEMI_Interactive_Developer");
const guideStandardsDir = path.join(guideDir, "standards");
const developerAlgorithmsDir = path.join(developerDir, "algorithms");

for (const dir of [guideDir, developerDir, guideStandardsDir, developerAlgorithmsDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const standards = [
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
].map(([id, code, name, group, summary, role, dfd, tables]) => ({ id, code, name, group, summary, role, dfd, tables }));

const algorithms = [
  {
    id: "Chan",
    code: "Chan",
    name: "Chan's Convex Hull 알고리즘",
    group: "Streaming Algorithm",
    summary: "평면 상의 n개 점으로부터 Graham Scan과 Jarvis March를 결합하여 O(n log h) 속도로 Convex Hull(볼록 껍질)을 구하는 기하학적 최적화 알고리즘입니다.",
    role: "설비 공정 파라미터(온도, 압력 등)의 다차원 분포를 분석하여 정상 가동 범위(Operating Envelope)를 산출하고 극단적인 이상치(Outlier)를 판별할 때 사용됩니다.",
    dfd: ["Raw Samples", "Group Partition (m)", "Graham Scan CH_i", "Jarvis Tangent Merge", "Convex Envelope"],
    formula: "\\(m = 2^{2^t}\\) 크기 그룹 분할 후, Graham Scan 적용 후 Jarvis March 접선 탐색 및 병합",
    tables: [
      ["process_parameter_envelope", "equipment_id, parameter_x, parameter_y, vertex_seq, vertex_x, vertex_y, updated_at"],
      ["parameter_sample_stream", "equipment_id, sample_time, val_x, val_y, is_inside_envelope"]
    ],
    introduction: `
      <h3>Convex Hull (볼록 껍질)의 개념</h3>
      <p>2차원 또는 다차원 공간에 흩어져 있는 여러 점들을 모두 감싸는 <strong>가장 작은 볼록한 다각형(또는 다면체)</strong>을 의미합니다. 전산 기하학(Computational Geometry)에서 가장 기본적이면서도 중요한 개념입니다.</p>
      <p>가장 직관적인 비유는 <strong>'고무줄 비유(Rubber Band Analogy)'</strong>입니다. 널빤지 위에 여러 개의 못(데이터 점)이 박혀 있다고 상상해 보세요. 커다란 고무줄을 팽팽하게 늘려서 모든 못을 바깥쪽에서 감싸도록 놓았을 때, 고무줄이 수축하면서 바깥쪽 못들에 걸쳐 만들어지는 형태가 바로 이 못들의 Convex Hull입니다.</p>
      
      <h4>기하학적 및 수학적 정의</h4>
      <ul>
        <li><strong>볼록(Convex)의 의미:</strong> 다각형 내부에 있는 임의의 두 점을 골라 선분으로 연결했을 때, 그 선분이 다각형의 경계선 밖으로 전혀 나가지 않는 형태를 말합니다.</li>
        <li><strong>최소성(Minimality):</strong> 점 집합 S를 포함하는 볼록 다각형은 무수히 많을 수 있지만, Convex Hull은 그 중에서 '가장 작은(면적이 최소인)' 다각형입니다.</li>
        <li><strong>정점(Vertex):</strong> Convex Hull의 꼭짓점을 이루는 점들을 '극단점(Extreme Points)'이라고 하며, 이들은 원래 점 집합 S에 속해 있는 데이터들 중 가장 외각에 위치한 데이터들입니다.</li>
      </ul>
      
      <h4>주요 탐색 알고리즘 비교</h4>
      <ul>
        <li><strong>Jarvis March (선물 포장 알고리즘, Gift Wrapping):</strong> 가장 왼쪽 점에서 시작해 반시계 방향으로 선물을 포장하듯 다음 점을 찾아나갑니다. 시간 복잡도: \\(O(nh)\\) (n: 전체 점, h: 껍질 정점 수)</li>
        <li><strong>Graham Scan (그레이엄 스캔):</strong> 각도 기준으로 전체 정렬(\\(O(n \\log n)\\)) 후 스택을 사용하여 오목점을 제거하며 껍질을 완성합니다.</li>
        <li><strong>Chan's Algorithm (찬의 알고리즘):</strong> 데이터를 크기 m인 그룹으로 나누어 Graham Scan을 수행한 후, Jarvis March 방식으로 병합하여 \\(O(n \\log h)\\)라는 이론적 최적 복잡도를 달성합니다.</li>
      </ul>
    `,
    steps: `
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
    `,
    scenarios: `
      <ul>
        <li><strong>설비 파라미터 경계면(Envelope) 분석:</strong> OEE 성능 효율 계산 시, 단순히 평균값만 분석하는 대신 Chan's Algorithm을 사용하여 <strong>'정상 가동 범위(Normal Operating Zone)'</strong>의 다차원 기하학적 경계를 확정할 수 있습니다. 경계 밖의 데이터는 이상 센서 드리프트 등으로 판별하여 가동 손실 원인 추적에 사용합니다.</li>
        <li><strong>분산 데이터 요약:</strong> 여러 대의 설비(r개)에서 각각 계산된 부분 Convex Hull(CH_i) 정보만 중앙 서버로 보내면, 서버는 전체 원시 데이터를 전송받을 필요 없이 접선 계산만으로 라인 전체의 공정 경계를 즉시 합성할 수 있습니다.</li>
      </ul>
    `
  },
  {
    id: "KLL",
    code: "KLL",
    name: "KLL Quantile Sketch",
    group: "Streaming Algorithm",
    summary: "대규모 스트리밍 데이터에서 전체 데이터를 보관하지 않고, 아주 적은 고정 메모리만을 사용하여 분위수(Quantiles, p50, p99 등)를 고정 오차 범위 내로 추정하는 압축 Sketch 알고리즘입니다.",
    role: "대량의 실시간 설비 데이터 스트림에서 Cycle Time, Queue Time의 백분위수(P99 극단값 필터링 및 P50 중앙값 검출)를 추정하여 성능가동율을 정밀하게 산출할 때 활용됩니다.",
    dfd: ["Raw Samples", "Level 0 Buffer", "Compactor Trigger", "Random Coin Selection", "Quantile Output"],
    formula: "용량 초과 시 Level i의 버퍼를 정렬하고, 동전 던지기 b \\in \\{0,1\\}에 따라 홀수/짝수 번째 값만 상위 Level i+1로 보내 가중치 2배 부여",
    tables: [
      ["kll_sketch_state", "sketch_id, equipment_id, k, total_n, error_bound, serialized_blob, updated_at"],
      ["kll_level_buffer", "sketch_id, level_no, weight, capacity, buffer_values_json"]
    ],
    introduction: `
      <h3>KLL (Karnin-Lang-Liberty) Sketch의 개념</h3>
      <p>KLL 알고리즘은 스트리밍 데이터에서 <strong>Quantiles(분위수)</strong>를 추정하기 위해 설계된 최신 알고리즘입니다. Apache DataSketches 라이브러리 등에 포함되어 실무에서 대용량 모니터링 분석에 널리 쓰입니다.</p>
      <p>수억 개의 데이터가 실시간으로 들어올 때, 모든 데이터를 정렬하여 "상위 1% 값"이나 "중간값(Median)"을 찾는 것은 메모리상 불가능합니다. KLL은 아주 적은 메모리만 사용하면서도 매우 높은 정확도로 이 값들을 추정합니다.</p>
      
      <h4>KLL 알고리즘의 구조: 계층적 버퍼 (Hierarchical Buffers)</h4>
      <p>KLL은 여러 개의 <strong>Level(H)</strong>로 구성된 버퍼 구조를 가집니다. 각 레벨 i는 용량 k_i를 가지며, 레벨이 올라갈수록 데이터의 '가중치'는 2배씩 증가합니다.</p>
      <ul>
        <li><strong>Level 0:</strong> 원래의 데이터(가중치 1)가 들어오는 곳입니다.</li>
        <li><strong>Level i:</strong> 가중치가 \\(2^i\\)인 데이터들이 저장됩니다.</li>
      </ul>
    `,
    steps: `
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
    `,
    scenarios: `
      <ul>
        <li><strong>실시간 OEE 모니터링:</strong> 설비에서 발생하는 수백만 건의 Cycle Time 데이터를 DB에 다 쌓지 않고도, 메모리 내에서 즉시 95% 신뢰 구간의 성능 지표를 산출할 수 있습니다.</li>
        <li><strong>이상치(Outlier) 필터링:</strong> 성능 효율을 계산할 때, 비정상적으로 길게 측정된 Cycle Time을 KLL의 분위수 기반 필터링(예: 상위 99% 제외)을 통해 자동 제거하여 데이터의 정밀도를 높일 수 있습니다.</li>
        <li><strong>분산 데이터 통합:</strong> 여러 대의 설비(Equipment)에서 각각 생성된 KLL Sketch를 중앙 서버로 보내기만 하면, 추가 연산 없이 '병합(Merge)'하여 라인 전체의 통합 통계 데이터를 얻을 수 있습니다.</li>
      </ul>
    `,
    mathematics: `
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
    `
  }
];

const css = `
:root{--ink:#17202a;--muted:#64748b;--line:#d7dde8;--panel:#fff;--paper:#f5f7fb;--accent:#137a7f;--blue:#2864a8;--orange:#b85c18;--green:#517d2f;--shadow:0 18px 42px rgba(25,35,58,.10)}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font-family:Arial,"Malgun Gothic",sans-serif;line-height:1.6}.page{max-width:1180px;margin:0 auto;padding:28px}.hero{background:#101826;color:#fff;border-radius:14px;padding:30px;box-shadow:var(--shadow);border-bottom:5px solid #e7b84a}.hero h1{margin:0 0 10px;font-size:clamp(26px,4vw,42px);letter-spacing:0}.hero p{margin:0;color:#dbe3ef;max-width:980px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.chip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}.section{background:var(--panel);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);padding:22px;margin-top:18px}.section h2{margin:0 0 12px;font-size:21px;border-bottom:2px solid var(--line);padding-bottom:8px;color:#182233}.section h3{margin:22px 0 10px;font-size:17px;color:var(--blue)}.section h4{margin:16px 0 6px;font-size:14px;color:var(--accent)}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}.card strong{display:block;color:#1d3557;margin-bottom:4px}.card span,.muted{color:var(--muted);font-size:13px}.diagram{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}svg{display:block;min-width:880px;width:100%;height:auto}.node rect{fill:#fff;stroke:#ccd6e2;stroke-width:1.4;rx:8}.node text{font-size:13px;fill:#182233;font-weight:700}.tiny{font-size:11px!important;fill:#667085!important;font-weight:400!important}.arrow{stroke:#2864a8;stroke-width:1.7;fill:none;marker-end:url(#arrow)}table{width:100%;border-collapse:collapse;background:#fff;font-size:13px;margin-top:12px}th,td{border:1px solid var(--line);padding:10px;vertical-align:top}th{background:#eef3f8;color:#24364b;text-align:left}.note{border-left:4px solid var(--orange);background:#fff8ef;border-radius:8px;padding:13px;color:#4c3a25}.crumbs{margin:16px 0;color:var(--muted);font-size:13px}.crumbs a{color:#1f68b3;text-decoration:none}.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.list a{display:block;border:1px solid var(--line);border-radius:9px;background:#fff;padding:12px;color:var(--ink);text-decoration:none}.list a:hover{border-color:var(--accent);background:#f0fbfa}.math-box{background:#f8fafc;border:1px solid var(--line);border-radius:6px;padding:4px 8px;font-family:"Courier New",Courier,monospace;font-weight:bold;color:var(--accent);display:inline-block;margin:2px 0}div.math-box{display:block;padding:12px;margin:10px 0;text-align:center;font-size:1.1em;background:#f8fafc}@media(max-width:820px){.page{padding:14px}.grid,.list{grid-template-columns:1fr}.hero{padding:22px}}
`;

fs.writeFileSync(path.join(guideDir, "semi-page.css"), css, "utf8");
fs.writeFileSync(path.join(developerDir, "semi-page.css"), css, "utf8");

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
}

function diagram(steps) {
  const gap = 190;
  const width = Math.max(900, 105 + steps.length * gap);
  const nodes = steps.map((step, i) => {
    const x = 40 + i * gap;
    return `<g class="node"><rect x="${x}" y="44" width="150" height="76"></rect><text x="${x + 75}" y="78" text-anchor="middle">${esc(step)}</text><text class="tiny" x="${x + 75}" y="101" text-anchor="middle">${i === 0 ? "Input" : i === steps.length - 1 ? "Output" : "Process"}</text></g>`;
  }).join("");
  const arrows = steps.slice(1).map((_, i) => `<path class="arrow" d="M${190 + i * gap} 82 H${230 + i * gap}"></path>`).join("");
  return `<svg viewBox="0 0 ${width} 164" aria-label="DFD"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#2864a8"></path></marker></defs>${nodes}${arrows}</svg>`;
}

function tableRows(rows) {
  return rows.map(([name, cols]) => `<tr><td><strong>${esc(name)}</strong></td><td>${esc(cols)}</td></tr>`).join("");
}

function shell(title, subtitle, body, cssPath = "../semi-page.css") {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><link rel="stylesheet" href="${cssPath}"></head><body><main class="page">${body}</main></body></html>`;
}

function standardUnifiedPage(s) {
  return shell(`${s.code} Standard`, s.name, `
    <div class="crumbs"><a href="../SEMI_Data_Flow_Main.html">SEMI Guide</a> / ${esc(s.code)}</div>
    <section class="hero"><h1>${esc(s.code)} - ${esc(s.name)}</h1><p>${esc(s.summary)}</p><div class="chips"><span class="chip">${esc(s.group)}</span><span class="chip">Guide & Developer</span></div></section>
    <section class="section"><h2>기능 요약</h2><p>${esc(s.role)}</p><div class="note">원문 표준 문서는 SEMI 공식 표준 문서 또는 SEMIViews에서 개정판을 확인해야 합니다. 개발 및 업무 적용 포인트를 함께 확인하세요.</div></section>
    <section class="section"><h2>데이터 흐름 (DFD)</h2><div class="diagram">${diagram(s.dfd)}</div></section>
    <section class="section"><h2>업무 적용 체크포인트</h2><div class="grid"><div class="card"><strong>적용 위치</strong><span>설비, TC/EAP, EES/APC/FDC, MOS/MES, KPI 시스템 중 관련 계층을 확인합니다.</span></div><div class="card"><strong>검토 대상</strong><span>표준 번호, 개정판, 고객 사양서, 벤더 구현 범위, 예외 승인 항목을 함께 봅니다.</span></div><div class="card"><strong>운영 영향</strong><span>장비 상태, 생산 문맥, 데이터 품질, 보안 요구사항이 상위 지표에 미치는 영향을 검토합니다.</span></div></div></section>
    <section class="section"><h2>권장 테이블 구성</h2><table><thead><tr><th>테이블</th><th>권장 컬럼</th></tr></thead><tbody>${tableRows(s.tables)}</tbody></table></section>
  `);
}

function algorithmPage(a) {
  const introSec = a.introduction ? `<section class="section"><h2>알고리즘 상세 개요</h2>${a.introduction}</section>` : "";
  const stepsSec = a.steps ? `<section class="section"><h2>상세 작동 단계</h2>${a.steps}</section>` : "";
  const mathSec = a.mathematics ? `<section class="section"><h2>수학적 오차 보장 및 분석</h2>${a.mathematics}</section>` : "";
  const scenarioSec = a.scenarios ? `<section class="section"><h2>실시간 설비 OEE 적용 시나리오</h2>${a.scenarios}</section>` : "";

  // MathJax 설정 추가
  const mathjaxConfig = `
    <script>
      MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
          displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
        }
      };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  `;

  // 결합 통합 섹션
  const integrationSec = `
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
  `;

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(a.code)} Developer</title><link rel="stylesheet" href="../semi-page.css">${mathjaxConfig}</head><body><main class="page">
    <div class="crumbs"><a href="../SEMI_Data_Flow_Developer.html">SEMI Developer</a> / ${esc(a.code)}</div>
    <section class="hero"><h1>${esc(a.name)}</h1><p>${esc(a.summary)}</p><div class="chips"><span class="chip">Streaming KPI</span><span class="chip">Developer</span></div></section>
    <section class="section"><h2>개발 기능 요약</h2><p>${esc(a.role)}</p><div class="note"><strong>핵심 로직:</strong> ${esc(a.formula)}</div></section>
    ${introSec}
    <section class="section"><h2>개발 DFD</h2><div class="diagram">${diagram(a.dfd)}</div></section>
    ${stepsSec}
    ${mathSec}
    ${scenarioSec}
    ${integrationSec}
    <section class="section"><h2>권장 테이블 구성</h2><table><thead><tr><th>테이블</th><th>권장 컬럼</th></tr></thead><tbody>${tableRows(a.tables)}</tbody></table></section>
  </main></body></html>`;
}

function overviewPage(type) {
  const isDev = type === "developer";
  const base = isDev ? "standards" : "standards";
  const links = standards.map(s => `<a href="${base}/${s.id}.html"><strong>${esc(s.code)}</strong><span class="muted">${esc(s.name)} · ${esc(s.group)}</span></a>`).join("");
  const algo = algorithms.map(a => `<a href="algorithms/${a.id}.html"><strong>${esc(a.code)}</strong><span class="muted">${esc(a.name)}</span></a>`).join("");
  return shell(isDev ? "SEMI Developer" : "SEMI Guide", "", `
    <section class="hero"><h1>${isDev ? "SEMI Interactive Developer" : "SEMI Interactive Guide"}</h1><p>${isDev ? "SEMI 표준별 개발 DFD, 인터페이스 설계 포인트, 권장 테이블 구조를 분리해 정리했습니다." : "설비 Message 수집부터 TC/EAP, EES/APC/FDC, MOS/MES, KPI 관리까지 이어지는 SEMI 표준 관계를 업무 관점으로 정리했습니다."}</p><div class="chips"><span class="chip">SECS/GEM</span><span class="chip">GEM300</span><span class="chip">EDA / Interface A</span><span class="chip">KPI</span></div></section>
    <section class="section"><h2>전체 흐름</h2><div class="diagram">${diagram(["Equipment", "SECS/GEM", "GEM300/EDA", "TC/EAP", "EES/APC/FDC", "MOS/MES", "KPI System"])}</div></section>
    <section class="section"><h2>${isDev ? "표준별 개발 문서" : "표준별 가이드 문서"}</h2><div class="list">${links}</div></section>
    ${isDev ? `<section class="section"><h2>Streaming Algorithm</h2><div class="list">${algo}</div></section>` : ""}
  `, "semi-page.css");
}

for (const s of standards) {
  fs.writeFileSync(path.join(guideStandardsDir, `${s.id}.html`), standardUnifiedPage(s), "utf8");
}
for (const a of algorithms) {
  fs.writeFileSync(path.join(developerAlgorithmsDir, `${a.id}.html`), algorithmPage(a), "utf8");
}
fs.writeFileSync(path.join(guideDir, "SEMI_Data_Flow_Main.html"), overviewPage("guide"), "utf8");
fs.writeFileSync(path.join(developerDir, "SEMI_Data_Flow_Developer.html"), overviewPage("developer"), "utf8");

console.log(`Generated ${standards.length} unified standard pages, and ${algorithms.length} algorithm pages.`);
