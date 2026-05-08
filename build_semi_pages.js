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
  { id: "Chan", code: "Chan", name: "Chan 평균/분산 병합 알고리즘", group: "Streaming Algorithm", summary: "분산된 Batch나 Stream Window의 count, mean, M2를 수치적으로 안정적으로 병합해 평균과 분산을 계산합니다.", role: "장비별, Chamber별, 시간창별 KPI를 병렬 집계한 뒤 상위 KPI 시스템에서 정확하게 합칠 때 유용합니다.", dfd: ["Raw Samples", "Local Aggregator", "n/mean/M2 State", "Merge Worker", "Variance KPI"], formula: "delta = meanB - meanA; n = nA + nB; mean = meanA + delta * nB / n; M2 = M2A + M2B + delta^2 * nA * nB / n", tables: [["stream_moment_state", "key, window_start, window_end, n, mean, m2, min_value, max_value"], ["moment_merge_log", "target_key, source_key_a, source_key_b, merged_n, merged_at"], ["variance_kpi", "key, window_start, window_end, mean, variance, stddev, sample_count"]] },
  { id: "KLL", code: "KLL", name: "KLL Quantile Sketch", group: "Streaming Algorithm", summary: "전체 원시 데이터를 모두 저장하지 않고도 p50, p90, p95, p99 같은 분위수를 근사 계산하는 압축 Sketch입니다.", role: "Cycle Time, Queue Time, Sensor Peak, Alarm Duration의 분위수 KPI를 대량 Stream에서 계산할 때 유용합니다.", dfd: ["Raw Samples", "Compactor Level 0", "Compacted Levels", "Merge Sketch", "Quantile KPI"], formula: "값을 Level별 buffer에 삽입하고 용량 초과 시 정렬 후 절반을 상위 Level로 승격합니다. Query 시 Level 가중치를 반영해 rank를 근사합니다.", tables: [["kll_sketch_state", "sketch_id, key, window_start, window_end, k, total_n, serialized_blob"], ["kll_level_buffer", "sketch_id, level_no, weight, buffer_values_json, capacity"], ["quantile_kpi", "key, window_start, window_end, quantile, approx_value, error_bound, sample_count"]] }
];

const css = `
:root{--ink:#17202a;--muted:#64748b;--line:#d7dde8;--panel:#fff;--paper:#f5f7fb;--accent:#137a7f;--blue:#2864a8;--orange:#b85c18;--green:#517d2f;--shadow:0 18px 42px rgba(25,35,58,.10)}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--paper);font-family:Arial,"Malgun Gothic",sans-serif;line-height:1.6}.page{max-width:1180px;margin:0 auto;padding:28px}.hero{background:#101826;color:#fff;border-radius:14px;padding:30px;box-shadow:var(--shadow);border-bottom:5px solid #e7b84a}.hero h1{margin:0 0 10px;font-size:clamp(26px,4vw,42px);letter-spacing:0}.hero p{margin:0;color:#dbe3ef;max-width:980px}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.chip{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}.section{background:var(--panel);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow);padding:22px;margin-top:18px}.section h2{margin:0 0 12px;font-size:21px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}.card strong{display:block;color:#1d3557;margin-bottom:4px}.card span,.muted{color:var(--muted);font-size:13px}.diagram{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:#fff;padding:14px}svg{display:block;min-width:880px;width:100%;height:auto}.node rect{fill:#fff;stroke:#ccd6e2;stroke-width:1.4;rx:8}.node text{font-size:13px;fill:#182233;font-weight:700}.tiny{font-size:11px!important;fill:#667085!important;font-weight:400!important}.arrow{stroke:#2864a8;stroke-width:1.7;fill:none;marker-end:url(#arrow)}table{width:100%;border-collapse:collapse;background:#fff;font-size:13px}th,td{border:1px solid var(--line);padding:10px;vertical-align:top}th{background:#eef3f8;color:#24364b;text-align:left}.note{border-left:4px solid var(--orange);background:#fff8ef;border-radius:8px;padding:13px;color:#4c3a25}.crumbs{margin:16px 0;color:var(--muted);font-size:13px}.crumbs a{color:#1f68b3;text-decoration:none}.list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.list a{display:block;border:1px solid var(--line);border-radius:9px;background:#fff;padding:12px;color:var(--ink);text-decoration:none}.list a:hover{border-color:var(--accent);background:#f0fbfa}@media(max-width:820px){.page{padding:14px}.grid,.list{grid-template-columns:1fr}.hero{padding:22px}}
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
  return shell(`${a.code} Developer`, a.name, `
    <div class="crumbs"><a href="../SEMI_Data_Flow_Developer.html">SEMI Developer</a> / ${esc(a.code)}</div>
    <section class="hero"><h1>${esc(a.name)}</h1><p>${esc(a.summary)}</p><div class="chips"><span class="chip">Streaming KPI</span><span class="chip">Developer</span></div></section>
    <section class="section"><h2>개발 기능 요약</h2><p>${esc(a.role)}</p><div class="note"><strong>핵심 로직:</strong> ${esc(a.formula)}</div></section>
    <section class="section"><h2>개발 DFD</h2><div class="diagram">${diagram(a.dfd)}</div></section>
    <section class="section"><h2>권장 테이블 구성</h2><table><thead><tr><th>테이블</th><th>권장 컬럼</th></tr></thead><tbody>${tableRows(a.tables)}</tbody></table></section>
  `);
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
