import os
import re

root = os.path.dirname(os.path.abspath(__file__))
guideDir = os.path.join(root, "SEMI_Interactive_Guide")
developerDir = os.path.join(root, "SEMI_Interactive_Developer")
guideStandardsDir = os.path.join(guideDir, "standards")
guideAlgorithmsDir = os.path.join(guideDir, "algorithms")
developerAlgorithmsDir = os.path.join(developerDir, "algorithms")

for d in [guideDir, developerDir, guideStandardsDir, developerAlgorithmsDir, guideAlgorithmsDir]:
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
      <h3>1. Convex Hull (볼록 껍질)의 전산기하학적 정의</h3>
      <p>수학적으로 2차원 공간 또는 다차원 유클리드 공간 $\\mathbb{R}^d$에 존재하는 유한한 점 집합 $S = \\{p_1, p_2, \\dots, p_n\\}$가 주어졌을 때, <strong>Convex Hull $\\text{CH}(S)$</strong>는 이 모든 점들을 포함하는 가장 작은 볼록 다각형(Convex Polygon)으로 정의됩니다. 볼록함의 기하학적 의미는 다각형 경계 내부 또는 경계선 상의 어떤 임의의 두 점 $A, B$를 선분 $\\overline{AB}$로 연결하더라도 선분의 모든 좌표가 다각형 내부 영역에 완벽히 포함되는 성질을 의미합니다.</p>
      
      <div class="box box-primary">
        <span class="box-title">💡 볼록성(Convexity)의 수학적 조건</span>
        <p class="mb-0">$$\\text{CH}(S) = \\left\\{ \\sum_{i=1}^{n} \\alpha_i p_i \\ \\middle|\\ \\sum_{i=1}^{n} \\alpha_i = 1, \\ \\alpha_i \\ge 0 \\right\\}$$</p>
        <p class="mb-0 mt-1">즉, 집합 $S$의 모든 볼록 결합(Convex Combination)을 모은 부분 공간이 바로 Convex Hull이 되며, 경계를 구성하는 최외각 극단점(Extreme Points)들만이 다각형의 정점(Vertices)으로 결정됩니다.</p>
      </div>

      <h3>2. 대표적인 Convex Hull 알고리즘 비교 분석</h3>
      <p>대용량 스트리밍 설비 로그를 기하학적으로 프로파일링하기 위해서는 시간 및 메모리 복잡도, 그리고 최종 볼록 껍질을 구성하는 정점의 수 $h$에 따른 최적화 수준을 고려해야 합니다.</p>
      
      <table class="common-table">
        <thead>
          <tr>
            <th>알고리즘 명칭</th>
            <th>시간 복잡도</th>
            <th>공간 복잡도</th>
            <th>출력 민감성 (Output-Sensitive)</th>
            <th>기하학적 연산 특성 및 장단점</th>
          </tr>
        </thead>
        <tbody>
          <tr class="hover:bg-slate-50">
            <td><strong>Jarvis March (선물 포장)</strong></td>
            <td>$O(nh)$</td>
            <td>$O(1)$ 추가공간</td>
            <td>예 (정점 수 $h$에 정비례)</td>
            <td>가장 왼쪽 점에서 시작하여 반시계 방향으로 다음 정점을 탐색. $h$가 매우 작을 때는(예: 3~4개) 극대로 빠르나, 모든 점이 원주 상에 존재해 $h \\approx n$이 될 경우 $O(n^2)$으로 대폭 성능이 하락함.</td>
          </tr>
          <tr class="hover:bg-slate-50">
            <td><strong>Graham Scan (스캔 방식)</strong></td>
            <td>$O(n \\log n)$</td>
            <td>$O(n)$ 스택공간</td>
            <td>아니오 (항상 정렬 비용 포함)</td>
            <td>y좌표가 가장 낮은 극단점을 기준점으로 두고 나머지 모든 점을 극좌표 기준 각도로 정렬한 뒤, 스택 구조와 좌회전/우회전 기하 연산(CCW)을 통해 오목점(Concave Point)을 제거. $h$ 크기에 무관하게 정렬 복잡도가 병목이 됨.</td>
          </tr>
          <tr class="hover:bg-slate-50">
            <td><strong>Chan's Algorithm (찬의 최적화)</strong></td>
            <td>$O(n \\log h)$</td>
            <td>$O(n)$</td>
            <td><strong>예 (이론적 최적 달성)</strong></td>
            <td>Graham Scan의 빠른 서브그룹 계산 능력과 Jarvis March의 외곽 접선 병합 메커니즘을 결합. $h$를 모르는 상태에서 이중 로그 스케일로 그룹 크기 $m$을 기하급수적으로 키우며 탐색하여 $O(n \\log h)$의 상한선을 최초로 증명함.</td>
          </tr>
        </tbody>
      </table>
    """,
    "steps": """
      <p>Chan의 알고리즘은 전체 점의 개수 $n$과 껍질의 최종 정점 개수 $h$의 차이를 이용하며, 사전에 정점 개수 $h$를 알 수 없는 한계를 극복하기 위해 <strong>매개변수 $m$ (그룹의 크기)을 점진적으로 키우는(Iterative) 전략</strong>을 취합니다. 작동 로직은 다음과 같이 크게 4가지 단계로 전개됩니다.</p>
      
      <ol>
        <li><strong>서브그룹 파티셔닝 및 경계값 설정 (Partitioning)</strong>
          <p>전체 점 집합 $P$를 크기가 정확히 $m$인 $r = \\lceil n/m \\rceil$개의 독립적인 서브그룹 $P_1, P_2, \\dots, P_r$로 등분합니다. 각 서브그룹 내부에서는 데이터의 부분 집합만을 다루며 독립적으로 연산을 수행할 수 있어 병렬화 처리에 매우 용이한 구조를 지닙니다.</p>
        </li>
        
        <li><strong>서브그룹별 로컬 Convex Hull 생성 (Local Graham Scan)</strong>
          <p>각각의 독립된 서브그룹 $P_i$ ($|P_i| \\le m$)에 대해 개별적으로 Graham Scan 알고리즘을 적용하여 로컬 볼록 껍질 $CH_i$를 도출합니다.</p>
          <ul>
            <li><strong>시간 복잡도:</strong> 한 그룹당 $O(m \\log m)$이 소요되므로, 전체 $r$개 그룹의 계산 총합은 $O(r \\cdot m \\log m) = O( \\frac{n}{m} \\cdot m \\log m ) = O(n \\log m)$입니다.</li>
            <li><strong>기하 판별식 (CCW - Counter Clockwise):</strong> 연속된 세 점 $A(x_1, y_1), B(x_2, y_2), C(x_3, y_3)$에 대해 외적(Cross Product) 부호를 확인하여 반시계 방향 회전(우회전 배제)을 판별합니다.
              <div class="math-box">$$CCW(A, B, C) = (x_2 - x_1)(y_3 - y_1) - (y_2 - y_1)(x_3 - x_1)$$</div>
              $CCW(A, B, C) > 0$ 이면 좌회전(정상 껍질 유지), $\\le 0$ 이면 우회전 또는 일직선이므로 중간점 $B$를 스택에서 배제(Eviction)합니다.
            </li>
          </ul>
        </li>
        
        <li><strong>Jarvis March 접선 병합 및 외곽 질의 (Sub-hull Wrapping)</strong>
          <p>전체 평면에서 $y$좌표가 가장 낮아 무조건 볼록 껍질의 정점임이 보장되는 초기 전역 기준점 $p_0$에서 병합 처리를 개시합니다. 현재 껍질 정점이 $p_k$일 때, 반시계 방향 기준 다음 정점 $p_{k+1}$을 찾기 위해 각 서브그룹 껍질 $CH_i$에서 $p_k$를 지나는 <strong>외곽 접선(Exterior Tangent Line)</strong>을 구합니다.</p>
          <ul>
            <li><strong>이진 탐색(Binary Search)의 활용:</strong> 정렬된 정점 구조를 가진 각 로컬 $CH_i$에 대해 $p_k$와의 각도가 최대인 접점을 찾는 과정은 선형 탐색($O(m)$)이 아닌 <strong>이진 탐색 $O(\\log m)$</strong>으로 극도로 빠르게 연산할 수 있습니다.</li>
            <li><strong>전역 최적 정점 선택:</strong> 전체 $r$개의 서브그룹에서 도출된 접점 후보군 중 각도가 최대인 접점을 선택하여 전역 껍질의 다음 정점 $p_{k+1}$로 정의합니다. 이 전역 결합 비용은 $O(r \\log m) = O(\\frac{n}{m} \\log m)$입니다.</li>
            <li><strong>제한적 루프 탈출 조건:</strong> 이 래핑 루프를 최대 $m$번 반복합니다. 만약 $m$번 이하의 반복 내에 최초 출발 정점인 $p_0$로 귀환하면 전체 볼록 껍질의 완성을 선언하고 종료합니다. 만약 $m$번을 초과해도 $p_0$에 도달하지 못했다면 현재 추정한 그룹 크기 $m$이 최종 정점 개수 $h$보다 작음을 뜻하므로 중단하고 다음 반복으로 이행합니다.</li>
          </ul>
        </li>
        
        <li><strong>이중 로그 스케일 반복 매개변수 최적화 (Double-Logarithmic Search)</strong>
          <p>알고리즘의 동작 중 $h$값을 모르기 때문에 매개변수 $m$의 크기를 기하급수적으로 키우는 스케줄링을 수행합니다. 매 단계 $t$ ($t = 1, 2, \\dots$)에 대해 그룹 크기를 $m_t = 2^{2^t}$로 급격하게 증폭시킵니다.</p>
          <ul>
            <li>매개변수 이행 추이: $m_1 = 2^2 = 4 \\rightarrow m_2 = 2^4 = 16 \\rightarrow m_3 = 2^8 = 256 \\rightarrow m_4 = 2^{16} = 65,536 \\dots$</li>
            <li>이 방식은 $m_t$가 최초로 최종 껍질 정점 개수 $h$ 이상이 될 때까지 진행되며, 총 반복 횟수는 최대 $\\log \\log h$번입니다.</li>
            <li><strong>이론적 총 시간 복잡도 유도:</strong>
              <div class="math-box">$$\\sum_{t=1}^{\\lceil \\log\\log h \\rceil} O\\left(n \\log(2^{2^t})\\right) = \\sum_{t=1}^{\\lceil \\log\\log h \\rceil} O(n \\cdot 2^t) = O(n \\cdot 2^{\\lceil \\log\\log h \\rceil + 1}) = O(n \\log h)$$</div>
              이처럼 기하급수적 성장 덕분에 이전 반복 단계들의 모든 연산량 합이 마지막 최적화 루프 한 번의 비용보다 작아져, 전산기하학적 하한선인 **$O(n \\log h)$**를 완벽하게 달성하게 됩니다.
            </li>
          </ul>
        </li>
      </ol>
    """,
    "scenarios": """
      <p>Chan의 Convex Hull 알고리즘은 반도체 제조 FAB 공정의 대량의 실시간 데이터 수집 환경에서 다음과 같이 혁신적인 스마트 팩토리 지표 분석에 활용될 수 있습니다.</p>
      
      <ul>
        <li><strong>반도체 플라즈마 식각 설비의 FDC (실시간 정상 작동 경계면 산출)</strong>
          <p>에칭(Etching) 공정 중 수집되는 <strong>Chamber 내부 압력(Pressure)</strong>과 **Source RF 파워(Power)**는 상호 연관되어 설비 내부 환경의 건전성을 대변합니다. SEMI E134 (Interface A) 고속 데이터 수집 계획(DCP)을 통해 50ms 주기로 수집되는 정상 가동 데이터에서 Chan's Algorithm을 사용하여 2D 기하 경계면(Operating Envelope)을 산출합니다.</p>
          <p>이후 유입되는 새로운 원시 데이터 스트림 $z = (P_z, W_z)$에 대해 경계선 면적 내부 포함 여부를 판단(Wedge-based Binary Search 또는 Ray Casting 기법)하여, 영역 이탈 감지 시 실시간으로 GEM Alarm (SEMI E30)을 트리거해 불량 웨이퍼(Wafer Scrap) 발생을 원천 차단합니다.</p>
        </li>
        
        <li><strong>다변량 설비 OEE 성능 병목 상관관계 기하적 요약</strong>
          <p>장비의 **온도 분포(Temperature)**와 **정상 웨이퍼 이송 속도(Robot Arm Speed)**를 다차원으로 결합하여 설비 성능이 최상으로 발휘되는 핵심 영역을 도출합니다. 데이터가 실시간으로 입력됨에 따라 오래된 경계를 버리고 최신 데이터로 동적 갱신(Sliding Window Convex Hull)하여 설비 부품의 노화에 따른 최적 가동 영역의 이동 추이(Centroid Drift)를 머신러닝 피처로 주입할 수 있습니다.</p>
        </li>
        
        <li><strong>분산 에지(Edge-Gateway) 컴퓨터 부하 분산 및 네트워크 전송 제약 극복</strong>
          <p>FAB 내 수천 대의 Chamber에서 100Hz 급으로 쏟아지는 원시 데이터를 DB 서버로 전량 전송할 경우 네트워크 대역폭 폭증과 대규모 IO 지연을 야기합니다. Chan의 1단계 파티셔닝 개념을 대입하여, 각 설비 단의 Edge Gateway PC가 자체 1차 로컬 Graham Scan을 수행하여 극단점(Extreme Vertices) 수십 개만을 추출합니다.</p>
          <p>중앙 MES 분석 서버는 원시 데이터 대신 각 에지 단에서 보내온 가볍게 압축된 서브 정점(Sub-hull Vertices) 데이터만 전송받아 2단계 접선 병합(Wrapping) 연산만을 수행해 전체 FAB의 공정 기하 경계를 0.1ms 이내로 즉각 합성(Synthesize)해냅니다.</p>
        </li>
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
      <h3>1. 실시간 스트림 환경에서의 Quantile 추정 문제</h3>
      <p>반도체 FAB 공정이나 대형 IT 분산 환경에서 발생하는 대용량 센서 로그 및 이벤트 스트림에서 특정 시간 윈도우의 <strong>백분위수(Quantiles, p50 중위값, p95/p99 극단값 등)</strong>를 추정하는 것은 매우 중요합니다. 예를 들어, 설비 가동 효율을 높이기 위해 Cycle Time의 99% 선에 달하는 이상치를 필터링하거나 데이터의 중앙값을 참 속도로 대입해야 합니다.</p>
      
      <div class="box box-danger">
        <span class="box-title">⚠️ 기존 방식의 치명적인 한계</span>
        <p class="mb-0"><strong>정렬 기반 나이브 방식(Naive Sorting):</strong> 들어오는 원시 데이터를 메모리에 모두 보관하고 매번 정렬할 경우, 데이터 수 $N$에 대해 메모리 공간 복잡도 $O(N)$ 및 시간 복잡도 $O(N \\log N)$이 요구됩니다. 수천만 건에 달하는 실시간 스트림 환경에서는 메모리 오버플로우가 즉각적으로 발생합니다.</p>
      </div>

      <h3>2. KLL (Karnin-Lang-Liberty) 알고리즘 개요</h3>
      <p>KLL은 2016년에 발표된 스트리밍 분위수 추정 알고리즘으로, 이론상 최적에 수렴하는 공간 복잡도 하한선을 달성했습니다. 전체 데이터를 보관하는 대신, <strong>용량이 각기 다른 여러 단계의 계층형 버퍼(Hierarchical Buffers, Levels)</strong>를 두고 데이터를 선별적으로 거르면서(Eviction) 상위 레벨로 밀어 올리는 확률적 축소 메커니즘을 사용합니다.</p>

      <h3>3. 분위수 추정 알고리즘 스펙 비교</h3>
      <table class="common-table">
        <thead>
          <tr>
            <th>알고리즘 명칭</th>
            <th>공간 복잡도 (메모리)</th>
            <th>오차 범위 보장</th>
            <th>병합 가능성 (Mergeable)</th>
            <th>수학적 특징 및 실무 한계</th>
          </tr>
        </thead>
        <tbody>
          <tr class="hover:bg-slate-50">
            <td><strong>나이브 정렬 (Naive)</strong></td>
            <td>$O(N)$ (무제한)</td>
            <td>완벽함 (오차 0%)</td>
            <td>아니오</td>
            <td>스트림이 커질수록 메모리 고갈. 실시간 대용량 모니터링 시스템에는 적용 불가.</td>
          </tr>
          <tr class="hover:bg-slate-50">
            <td><strong>Greenwald-Khanna (GK)</strong></td>
            <td>$O(\\frac{1}{\\epsilon} \\log(\\epsilon N))$</td>
            <td>결정론적 오차 $\\epsilon$ 보장</td>
            <td>매우 어려움</td>
            <td>결정론적으로 정확한 경계 오차를 제공하지만, 두 개의 Sketch를 중앙 서버에서 병합(Merge)하는 성능이 매우 낮아 분산 노드 분석에 불리함.</td>
          </tr>
          <tr class="hover:bg-slate-50">
            <td><strong>T-Digest</strong></td>
            <td>$O(\\text{고정 센트로이드 수})$</td>
            <td>경계면(p01, p99) 오차 극소화</td>
            <td>예</td>
            <td>양 끝단의 분위수를 매우 정교하게 짚어내어 금융/성능 로그에서 인기가 높으나, 수학적/최악의 시나리오 하에서 엄밀한 에러 바운드 가이드라인 증명이 약함.</td>
          </tr>
          <tr class="hover:bg-slate-50">
            <td><strong>KLL Sketch (본 알고리즘)</strong></td>
            <td>$O(\\frac{1}{\\epsilon} \\log \\log \\frac{1}{\\epsilon})$</td>
            <td>확률론적 오차 $\\epsilon$ 보장</td>
            <td><strong>예 (완벽한 병합 지원)</strong></td>
            <td>이론상 공간 복잡도의 최적 하한선을 달성. 여러 에지 장비에서 수집된 KLL Sketch들을 추가 오차 왜곡 없이 중앙 서버에서 즉각 병합 가능. Apache DataSketches 표준 내장.</td>
          </tr>
        </tbody>
      </table>

      <h3>4. KLL 계층형 버퍼 및 레벨 스케줄링 구조</h3>
      <p>KLL은 내부적으로 $0$부터 $H$까지의 <strong>계층화된 레벨(Levels)</strong>을 관리합니다. 각 레벨 $i$는 동일한 데이터 $k_i$개를 담는 임시 메모리 버퍼를 유지하며, 레벨이 깊어질수록 포함된 데이터들의 **통계적 가중치(Weight)**는 $2^i$배로 정확히 기하급수적으로 증가합니다.</p>
      <ul>
        <li><strong>Level 0 (원시 유입 버퍼):</strong> 원시 스트림 데이터가 가중치 $1$ ($2^0$)을 가진 상태로 최초 수집 및 기록되는 공간입니다.</li>
        <li><strong>Level i (압축 전이 버퍼):</strong> 하위 레벨로부터 무작위 압축(Compaction) 처리를 받아 올라온 값들이며, 데이터 1개당 가중치 $2^i$를 지닙니다.</li>
        <li><strong>레벨별 한계 용량 설정 ($k_i$):</strong> 메모리 낭비를 줄이기 위해 상위 레벨로 이동할수록 각 레벨의 버퍼 한계 크기를 약 $2/3$ 비율로 점진적으로 감소시킵니다.
          <div class="math-box">$$k_i = \\lfloor k \\cdot c^{H-i} \\rfloor \\quad (c \\approx 2/3, \\ H \\text{는 최대 레벨 수})$$</div>
        </li>
      </ul>
    """,
    "steps": """
      <p>KLL 알고리즘의 무결성(Unbiased Estimation)을 유지하며 메모리를 일정량 이하로 고정시키는 핵심 동력은 **확률적 압축(Compaction) 루프**에 있습니다.</p>
      
      <ol>
        <li><strong>압축 트리거 조건 감지 (Triggering)</strong>
          <p>새로운 데이터가 주입되어 특정 레벨 $i$의 현재 데이터 개수가 미리 계산된 허용 임계 용량 $k_i$를 초과하는 즉시 압축 프로세스가 백그라운드에서 실행됩니다.</p>
        </li>
        
        <li><strong>버퍼 정렬 및 공간 배치 (Sorting)</strong>
          <p>해당 레벨 $i$ 버퍼 안에 저장되어 있는 모든 숫자 데이터들을 오름차순으로 완벽히 정렬하여 가상 수직선 상에 배치합니다.
            <div class="math-box">$$X_{\\text{level } i} = \\{x_1, x_2, \\dots, x_{2n}\\} \\quad (x_1 \\le x_2 \\le \\dots \\le x_{2n})$$</div>
          </p>
        </li>
        
        <li><strong>무작위 동전 던지기 기반 편향 방지 제거 (Randomized Selection & Eviction)</strong>
          <p>정렬된 $2n$개의 데이터 쌍에 대해 확률적 편향(Unbiased Estimate)을 방지하기 위해 물리 공정한 동전 던지기 결과인 임의의 비트 $b \\in \\{0, 1\\}$를 하나 생성합니다.</p>
          <ul>
            <li><strong>$b = 0$ 인 경우 (짝수 인덱스 승격):</strong> 홀수 번째 위치한 데이터들을 메모리에서 완전히 소거하고, 짝수 번째 데이터 $\\{x_2, x_4, x_6, \\dots\\}$만을 선택하여 상위 레벨 $i+1$ 버퍼로 이송합니다.</li>
            <li><strong>$b = 1$ 인 경우 (홀수 인덱스 승격):</strong> 짝수 번째 위치한 데이터들을 메모리에서 완전히 소거하고, 홀수 번째 데이터 $\\{x_1, x_3, x_5, \\dots\\}$만을 선택하여 상위 레벨 $i+1$ 버퍼로 이송합니다.</li>
            <li>이 과정을 거치면 레벨 $i$의 데이터 개수는 즉시 절반으로 경감되어 새로운 유입 버퍼 공간을 확보하게 됩니다.</li>
          </ul>
        </li>
        
        <li><strong>보존성 가중치 갱신 (Weight Update)</strong>
          <p>상위 레벨 $i+1$로 승격되어 올라간 데이터들은 이제 이전보다 2배에 해당하는 가중치 $2^{i+1}$를 새로이 부여받습니다. 비록 원시 데이터의 절반이 탈락하여 정보 손실이 발생했으나, 살아남은 인자가 2배의 가중치 역할을 대리하므로 <strong>수학적 기댓값(Expected Cumulative Distribution Function)은 왜곡 없이(Unbiased) 유지</strong>됩니다.</p>
        </li>

        <li><strong>분위수 근사 계산 및 랭크 질의 (Rank &amp; Quantile Query)</strong>
          <p>사용자가 특정 분위수 $p$ (예: $0.99$ 분위값)를 질의하면, KLL 스케치 내부의 모든 레벨에 흩어져 있는 잔여 인자들을 가중치 정보와 함께 단일 배열로 결합 및 정렬합니다. 이후 누적 가중치의 누적합(CDF)을 계산하여 목표 랭크에 도달하는 값을 반환합니다.</p>
          <div class="math-box">
            $$\\text{추정 랭크 } \\hat{r}(v) = \\sum_{x \\in \\text{Sketch}, x < v} w(x) \\qquad \\hat{q}(p) = v \\text{ such that } \\hat{r}(v) \\approx p \\cdot N$$
          </div>
        </li>
      </ol>
    """,
    "scenarios": """
      <p>KLL Sketch는 반도체 제조 현장의 초고속 데이터 스트리밍 파이프라인에서 메모리와 속도 제약을 완벽하게 조율하며 활용됩니다.</p>
      
      <ul>
        <li><strong>SEMI E116 / E10 표준 기반 실시간 설비 Cycle Time의 극단값 필터링 및 대표 성능 산출</strong>
          <p>웨이퍼 1장당 공정 진행에 소요되는 시간인 Cycle Time(CT)이나 설비 로봇 팔의 이송 대기 시간인 Queue Time(QT)은 정규 분포를 따르지 않고 극단적인 우측 롱테일(Long-tail) 형태를 띱니다. 레시피 체인지나 기계적 마찰, 알람 상황(SEMI E10 Down)으로 인해 수시간 동안 멈춘 스파이크 데이터가 혼입되면 산술 평균값은 즉각적으로 오염됩니다.</p>
          <p>KLL Sketch를 각 설비별 Edge 수집 모듈에 1KB 크기의 저메모리로 상주시켜 CT의 실시간 $p50$ (중앙값)과 $p99$ (99% 임계값)를 동적으로 추정합니다. p99를 초과하는 비정상 데이터는 장비 병목 및 에러 지연으로 자동 필터링 처리하고, 오염되지 않은 p50 중앙값만을 설비 OEE(종합효율, SEMI E79)의 실시간 가동 효율 속도인 실제 가공율의 대리 지표로 활용하여 정밀도를 비약적으로 높입니다.</p>
        </li>
        
        <li><strong>고대역폭 장비 데이터 수집(Interface A) 센서 주파수 요약 및 RDBMS 보관비 절감</strong>
          <p>SEMI E134 수집 계획에 따라 온도, 유량, RF Reflectance 등 수백 개의 아날로그 센서 데이터가 매초 1,000건씩 쏟아질 때 이를 전부 DB에 인서트하면 스토리지 유지비용이 기하급수적으로 폭증합니다.</p>
          <p>KLL Sketch를 이용해 인메모리에서 초단위 요약 데이터 스트림을 형성합니다. 하루 종일 들어오는 원시 데이터 86,400,000개의 상태 스케치를 직렬화(Serialization)하면 불과 수십 KB의 직렬화 바이너리 블록(`kll_sketch_state` 테이블의 `serialized_blob` 컬럼) 하나로 축소되어 관계형 DB에 저장이 가능하므로, 99.9% 이상의 스토리지 용량을 절감하면서도 임의 시점의 통계 분포를 마이크로초 이내로 정확히 복원해 냅니다.</p>
        </li>
        
        <li><strong>다중 챔버(Chambers) 개별 상태의 실시간 전역 병합 (FAB-wide Mergeability)</strong>
          <p>KLL Sketch는 수학적으로 <strong>가산성(Additivity/Mergeability)</strong>을 지닙니다. 즉, FAB 내에 분산되어 있는 100대의 CVD Chamber가 각각 수집 및 빌드한 KLL Sketch 상태 파일들을 중앙 클라우드 분석 서버로 보내오면, 분석 서버는 어떠한 원시 데이터 로그도 가져올 필요 없이 100개의 Sketch 객체를 1ms 만에 상호 합산(Merge) 연산 처리합니다.</p>
          <p>병합된 결과는 전체 100대 설비 라인의 전체 데이터 1억 개를 한 번에 넣고 정렬한 것과 동일한 확률적 오차 범위 $\\epsilon$ 내에서 동일한 전체 분위수 분포 곡선(FAB-wide Cumulative Profile)을 완벽하게 재구성하므로 분산 빅데이터 처리에 극도로 강력합니다.</p>
        </li>
      </ul>
    """,
    "mathematics": """
      <h4>1. 메모리 절약과 오차율($\\epsilon$) 보장에 대한 이론적 증명</h4>
      <p>KLL Sketch가 널리 쓰이는 이유는 사용자가 요구하는 최대 분위수 오차 범위 $\\epsilon$에 대해 **필요한 메모리 공간의 상한선이 하드웨어 수준에서 사전에 예측 및 고정 가능함**을 수학적으로 완전 증명했기 때문입니다.</p>
      
      <ul>
        <li><strong>오차율의 수학적 정의:</strong>
          <p>전체 데이터 수 $N$에 대해 임의의 백분율 $p \\in [0, 1]$을 질의했을 때, KLL Sketch가 반환하는 추정 값 $\\hat{q}(p)$의 실제 누적 순위(Rank)는 다음과 같은 오차 경계를 절대로 벗어나지 않습니다.</p>
          <div class="math-box">$$\\text{Pr}\\left( \\left| \\text{Rank}( \\hat{q}(p) ) - p \\cdot N \\right| \\le \\epsilon \\cdot N \\right) \\ge 1 - \\delta$$</div>
          <p>여기서 $\\epsilon$은 오차 한계(예: $\\epsilon = 0.01$ 이면 실제 백분위수 대비 $\\pm 1\\%$ 오차 보장)이며, $\\delta$는 무작위 압축 실패 확률(통상 $10^{-6}$ 이하의 극소값 설정)입니다.</p>
        </li>
        
        <li><strong>KLL의 엄밀한 공간 복잡도 상한선:</strong>
          <p>허용 오차율 $\\epsilon$과 신뢰 상수 $\\delta$가 주어졌을 때, KLL Sketch를 유지하기 위해 예약해야 하는 최대 활성 데이터 정점의 개수 $M$은 다음과 같습니다.</p>
          <div class="math-box">$$M = O\\left(\\frac{1}{\\epsilon} \\log \\log \\frac{1}{\\epsilon}\\right)$$</div>
          <p>이는 기존 GK 알고리즘의 $O(\\frac{1}{\\epsilon} \\log \\epsilon N)$과 비교하여 **유입 데이터 수 $N$에 완전히 독립적(N-independent)**이라는 파격적인 이점을 지닙니다. 즉, 데이터가 무한대로 유입되는 반영구적 대용량 설비 스트림 분석에서도 메모리가 단 1바이트도 추가로 증가하지 않고 항상 고정적인 초경량 크기(예: 1% 오차 보장 시 약 1.2KB)를 안전하게 유지합니다.</p>
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
    
    # 5개의 그룹으로 분류
    secs_gem = []
    g300_exec = []
    eda_interface = []
    data_prod_sec = []
    
    for s in standards:
        link = f'<a href="{base}/{s["id"]}.html"><strong>{esc(s["code"])}</strong><span class="muted">{esc(s["name"])} · {esc(s["group"])}</span></a>'
        g = s["group"]
        if g == "SECS/GEM 기본":
            secs_gem.append(link)
        elif g in ["GEM300 생산 실행", "G300 생산 실행"]:
            g300_exec.append(link)
        elif g == "EDA / Interface A":
            eda_interface.append(link)
        else:
            data_prod_sec.append(link)
            
    algo = []
    for a in algorithms:
        name = "Chan Algorithm" if a["id"] == "Chan" else "KLL Sketch"
        algo.append(f'<a href="algorithms/{a["id"]}.html"><strong>{name}</strong><span class="muted">{esc(a["name"])}</span></a>')
        
    title = "SEMI Developer" if isDev else "SEMI Guide"
    subtitle = "SEMI 표준별 개발 DFD, 인터페이스 설계 포인트, 권장 테이블 구조를 분리해 정리했습니다." if isDev else "설비 Message 수집부터 TC/EAP, EES/APC/FDC, MOS/MES, KPI 관리까지 이어지는 SEMI 표준 관계를 업무 관점으로 정리했습니다."
    
    body_content = f"""
    <section class="hero"><h1>{"SEMI Interactive Developer" if isDev else "SEMI Interactive Guide"}</h1><p>{subtitle}</p><div class="chips"><span class="chip">SECS/GEM</span><span class="chip">GEM300</span><span class="chip">EDA / Interface A</span><span class="chip">KPI</span></div></section>
    <section class="section"><h2>전체 흐름</h2><div class="diagram">{diagram(["Equipment", "SECS/GEM", "GEM300/EDA", "TC/EAP", "EES/APC/FDC", "MOS/MES", "KPI System"])}</div></section>
    
    <section class="section">
        <h2>{"표준별 개발 문서" if isDev else "표준별 가이드 문서"}</h2>
        
        <h3 style="margin-top: 24px; margin-bottom: 12px; color: var(--blue); border-left: 4px solid var(--blue); padding-left: 8px;">SECS/GEM 기본</h3>
        <div class="list">{"".join(secs_gem)}</div>
        
        <h3 style="margin-top: 24px; margin-bottom: 12px; color: var(--blue); border-left: 4px solid var(--blue); padding-left: 8px;">G300 생산 실행</h3>
        <div class="list">{"".join(g300_exec)}</div>
        
        <h3 style="margin-top: 24px; margin-bottom: 12px; color: var(--blue); border-left: 4px solid var(--blue); padding-left: 8px;">EDA / Inrerface A</h3>
        <div class="list">{"".join(eda_interface)}</div>
        
        <h3 style="margin-top: 24px; margin-bottom: 12px; color: var(--blue); border-left: 4px solid var(--blue); padding-left: 8px;">Data Dictionary / Productivity / Security</h3>
        <div class="list">{"".join(data_prod_sec)}</div>
        
        <h3 style="margin-top: 24px; margin-bottom: 12px; color: var(--blue); border-left: 4px solid var(--blue); padding-left: 8px;">Streaming Algorithm</h3>
        <div class="list">{"".join(algo)}</div>
    </section>
    """
    
    return shell(title, "", body_content, "semi-page.css")

for s in standards:
    if s["id"] in ["E4", "E5", "E37"]:
        continue
    with open(os.path.join(guideStandardsDir, f'{s["id"]}.html'), "w", encoding="utf8") as f:
        f.write(standardUnifiedPage(s))

for a in algorithms:
    html_content = algorithmPage(a)
    with open(os.path.join(developerAlgorithmsDir, f'{a["id"]}.html'), "w", encoding="utf8") as f:
        f.write(html_content)
    with open(os.path.join(guideAlgorithmsDir, f'{a["id"]}.html'), "w", encoding="utf8") as f:
        f.write(html_content)

with open(os.path.join(guideDir, "SEMI_Data_Flow_Main.html"), "w", encoding="utf8") as f:
    f.write(overviewPage("guide"))

with open(os.path.join(developerDir, "SEMI_Data_Flow_Developer.html"), "w", encoding="utf8") as f:
    f.write(overviewPage("developer"))

print(f"Generated {len(standards)} unified standard pages, and {len(algorithms)} algorithm pages.")
