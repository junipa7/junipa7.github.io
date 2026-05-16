const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "standards");

const commonNotice = "이 문서는 수업과 시스템 설계를 돕기 위한 교육용 해설입니다. 실제 프로젝트 적용 시에는 고객 사양서, 장비 벤더 매뉴얼, 최신 SEMI 공식 문서를 함께 확인해야 합니다.";

const standards = [
  {
    id: "E4",
    title: "SECS-I",
    subtitle: "RS-232 기반 저속 장비 통신 계층",
    family: "Basic SECS/GEM",
    summary: "SEMI E4는 오래된 장비에서 아직 많이 만나는 직렬 통신 기반의 SECS 물리/전송 계층입니다. 학생 관점에서는 '메시지 내용'보다 먼저 바이트가 어떻게 프레임으로 묶이고, 누가 언제 재전송하며, 연결 불안정 상황을 어떻게 복구하는지 배우는 표준입니다.",
    useCase: "구형 계측기, 오래된 세정/검사 장비, RS-232 컨버터를 사용하는 레거시 설비를 EAP 또는 TC와 연결할 때 필요합니다.",
    flow: ["장비 RS-232 포트", "문자/블록 프레임", "ACK/NAK 및 타임아웃", "SECS-II 디코더", "Host Application"],
    coreObjects: [
      ["Block", "전송 단위", "긴 SECS-II 메시지를 작은 블록으로 나누어 전송합니다."],
      ["Device ID", "상대 식별", "한 물리 회선에 연결된 장비 또는 호스트 논리 주소를 구분합니다."],
      ["T1/T2/T3/T4", "타이머", "문자 간 지연, 블록 응답, Reply 대기, 세션 유지 판단에 사용합니다."],
      ["ACK/NAK", "흐름 제어", "정상 수신 또는 오류 수신을 상대에게 알립니다."]
    ],
    messages: [
      ["수신", "STX 이후 길이와 체크섬을 검증", "프레임이 깨지면 NAK를 보내고 상위 메시지로 올리지 않습니다."],
      ["송신", "블록 번호와 마지막 블록 표시 설정", "긴 메시지는 순서가 보존되어야 합니다."],
      ["오류", "타이머 만료 또는 체크섬 오류", "재전송 횟수 초과 시 통신 장애 알람을 올립니다."]
    ],
    db: [
      ["secs_link_config", "equipment_id, port_name, baud_rate, parity, data_bits, stop_bits, t1_ms, t2_ms, retry_limit"],
      ["secs_frame_log", "log_id, equipment_id, direction, block_no, raw_hex, checksum_ok, created_at"]
    ],
    implementation: [
      "포트 설정은 벤더 매뉴얼과 현장 케이블 배선을 함께 확인합니다. 같은 RS-232라도 null modem 여부가 다르면 통신이 전혀 되지 않습니다.",
      "프레임 파서는 문자 단위 state machine으로 작성합니다. STX, length, header, body, checksum, ETX를 한 번에 문자열 split으로 처리하면 깨진 바이트에 취약합니다.",
      "재전송 정책과 알람 정책을 분리합니다. 전송 계층은 재시도만 담당하고, 운영 알람은 EAP/통신 관리자 모듈에서 판단하게 만드는 편이 좋습니다.",
      "수신 로그에는 원본 HEX를 보존합니다. 장애 분석에서 사람이 해석한 값보다 원본 바이트가 더 중요할 때가 많습니다."
    ],
    pitfalls: ["USB-to-Serial 컨버터의 드라이버 지연을 타이머 오류로 오판", "체크섬 계산 범위 불일치", "장비 전원 재기동 후 첫 프레임 쓰레기 바이트 미처리"],
    tests: ["정상 S1F1 프레임 송수신", "체크섬 오류 프레임 NAK", "T2 만료 후 재전송", "중간 블록 유실 시 메시지 폐기"]
  },
  {
    id: "E5",
    title: "SECS-II",
    subtitle: "장비와 Host가 주고받는 메시지 구조와 데이터 타입",
    family: "Basic SECS/GEM",
    summary: "SEMI E5는 Stream/Function 번호, W-bit, List 구조, 데이터 타입을 정의하여 장비와 Host가 같은 문법으로 대화하게 해 줍니다. 통신 개발자는 E5를 통해 'S1F1은 무엇을 뜻하는가'뿐 아니라 메시지 트리가 어떻게 직렬화되고 검증되는지를 이해해야 합니다.",
    useCase: "GEM, GEM300, 레시피 관리, 이벤트 보고, 원격 명령 등 대부분의 SECS 기반 자동화 기능의 메시지 문법으로 쓰입니다.",
    flow: ["Host 명령", "Stream/Function 선택", "SECS-II Body 구성", "E4 또는 HSMS 전송", "장비 응답"],
    coreObjects: [
      ["Stream", "업무 영역", "S1은 온라인/상태, S2는 제어, S5는 알람, S6은 이벤트 보고처럼 큰 범주를 구분합니다."],
      ["Function", "세부 명령", "Stream 안에서 구체적인 요청/응답 기능을 나타냅니다."],
      ["W-bit", "Reply 필요 여부", "응답이 필요한 primary 메시지인지 표시합니다."],
      ["List", "계층형 자료", "여러 값을 중첩하여 장비별 데이터 구조를 표현합니다."],
      ["Format Code", "데이터 타입", "ASCII, Boolean, Binary, Integer, Float 등 값의 해석 방식을 지정합니다."]
    ],
    messages: [
      ["S1F1/S1F2", "Are You There / Online Data", "연결 후 기본 생존 확인과 장비 식별에 사용합니다."],
      ["S2F41/S2F42", "Host Command Send/Ack", "START, STOP, PP-SELECT 같은 원격 명령을 실행합니다."],
      ["S5F1/S5F2", "Alarm Report/Ack", "알람 발생과 해제를 Host에 보고합니다."],
      ["S6F11/S6F12", "Collection Event Report/Ack", "CEID 기반 이벤트와 Report 데이터를 전달합니다."]
    ],
    db: [
      ["secs_message_definition", "stream, function, direction, wait_bit, name, body_schema_json"],
      ["secs_variable_dictionary", "vid, name, format_code, unit, description, source_standard"],
      ["secs_transaction_log", "transaction_id, equipment_id, stream, function, system_bytes, direction, ack_code, created_at"]
    ],
    implementation: [
      "메시지 파서는 바이트 배열을 SECS item tree로 변환하고, 다시 item tree를 바이트로 직렬화하는 두 방향을 모두 테스트해야 합니다.",
      "장비별 사양 차이를 코드 if문으로 흩뿌리지 말고 message_definition과 variable_dictionary 같은 사전 테이블로 관리합니다.",
      "ACK 코드는 화면에 숫자만 보여주지 말고 의미, 조치 방법, 원본 메시지 링크를 함께 보여줍니다.",
      "S6F11 이벤트는 반드시 CEID, RPTID, V 값의 매핑 버전을 남깁니다. 나중에 장비 SW가 바뀌면 같은 CEID라도 의미가 달라질 수 있습니다."
    ],
    pitfalls: ["Unsigned/Signed 타입 혼동", "List 길이와 실제 항목 수 불일치", "ASCII 공백 padding 제거로 레시피명이 달라지는 문제", "ACK만 받고 실제 상태 전환을 확인하지 않는 구현"],
    tests: ["S1F1 왕복", "복합 List 직렬화/역직렬화", "지원하지 않는 Function에 대한 적절한 reject", "S6F11 report schema 검증"]
  },
  {
    id: "E37",
    title: "HSMS",
    subtitle: "TCP/IP 기반 고속 SECS Message Services",
    family: "Basic SECS/GEM",
    summary: "SEMI E37은 SECS-II 메시지를 TCP/IP 위에서 안정적으로 전달하기 위한 세션 계층입니다. 학생에게는 TCP 소켓만 열면 끝나는 것이 아니라 Select/Separate, Linktest, system bytes, 타이머가 왜 필요한지 설명하는 표준입니다.",
    useCase: "현대 장비의 EAP/TC 연결은 대부분 HSMS-SS를 사용합니다. 방화벽, IP 변경, 네트워크 단절, 이중화 설계까지 함께 고려해야 합니다.",
    flow: ["TCP Connect", "Select.req/rsp", "SECS-II Data Message", "Linktest 관리", "Separate 또는 장애 복구"],
    coreObjects: [
      ["Active/Passive", "연결 역할", "누가 TCP 연결을 먼저 시도하는지 정합니다."],
      ["Select Procedure", "세션 활성화", "TCP 연결 후 실제 SECS 메시지를 주고받아도 되는 상태로 전환합니다."],
      ["System Bytes", "거래 추적", "Primary와 Secondary 메시지를 매칭하는 식별자입니다."],
      ["Linktest", "생존 확인", "데이터가 없을 때도 연결이 살아 있는지 확인합니다."],
      ["Separate", "정상 분리", "상대에게 통신 종료 의도를 알려 불필요한 재시도를 줄입니다."]
    ],
    messages: [
      ["Select.req", "통신 세션 시작 요청", "상대가 Select.rsp success를 보내야 데이터 메시지를 보냅니다."],
      ["Data Message", "SECS-II payload 전달", "Header와 body를 포함하며 system bytes로 응답을 추적합니다."],
      ["Linktest.req", "세션 생존 확인", "무응답이면 연결 장애로 판단하고 재접속합니다."]
    ],
    db: [
      ["hsms_endpoint", "equipment_id, role, local_ip, local_port, remote_ip, remote_port, t3_ms, t5_ms, t6_ms, t7_ms, t8_ms"],
      ["hsms_session_log", "session_id, equipment_id, state, connected_at, selected_at, disconnected_at, close_reason"]
    ],
    implementation: [
      "HSMS 상태를 NOT_CONNECTED, CONNECTED, SELECTED, RETRY_WAIT처럼 명시적인 상태 머신으로 둡니다.",
      "소켓 재접속 루프는 지수 backoff와 최대 대기 시간을 둡니다. 무제한 빠른 재시도는 장비 또는 네트워크 장비에 부담을 줍니다.",
      "System bytes는 프로세스 재기동 후에도 충돌 가능성을 낮추도록 범위를 관리합니다.",
      "방화벽 정책, NAT, 이중 NIC 환경에서는 연결 방향과 source IP를 운영 문서에 명확히 남깁니다."
    ],
    pitfalls: ["TCP 연결 성공을 GEM online으로 착각", "Select 실패 후 Data Message 전송", "Linktest 주기가 너무 짧아 불필요한 트래픽 발생", "system bytes 재사용으로 응답 오매칭"],
    tests: ["Passive 장비 Select 성공", "Select timeout", "Linktest 무응답 후 재접속", "동시 primary 메시지 응답 매칭"]
  },
  {
    id: "E30",
    title: "GEM",
    subtitle: "Generic Equipment Model",
    family: "Basic SECS/GEM",
    summary: "SEMI E30은 장비가 Host에 제공해야 하는 공통 동작 모델입니다. 단순 통신 규약이 아니라 온라인/오프라인 상태, 이벤트 보고, 알람, 원격 제어, 레시피, 변수 조회 같은 자동화의 기본 골격을 제공합니다.",
    useCase: "장비 반입 테스트, EAP 개발, MES 연동, 레시피 다운로드, 장비 상태 모니터링, 알람 대시보드 구축의 기준이 됩니다.",
    flow: ["HSMS/E4 연결", "COMM 및 Control State", "Event/Alarm/Variable", "Remote Command", "MES/EAP 업무"],
    coreObjects: [
      ["Communication State", "통신 가능 여부", "Host와 장비가 메시지를 주고받을 수 있는지 나타냅니다."],
      ["Control State", "제어 권한", "Offline, Online Local, Online Remote 같은 운전 권한 상태를 구분합니다."],
      ["CEID", "이벤트 식별자", "상태 변화나 작업 완료 같은 의미 있는 순간을 나타냅니다."],
      ["SVID/DVID/ECID", "변수", "상태값, 데이터값, 장비 상수를 구분해 조회와 변경에 사용합니다."],
      ["Alarm", "장애/주의 상태", "발생, 해제, 승인 흐름을 통해 운영자가 조치합니다."]
    ],
    messages: [
      ["S1F13/S1F14", "Establish Communication", "GEM 통신 가능 상태로 진입합니다."],
      ["S1F17/S1F18", "Request Online", "장비를 Online 제어 상태로 전환합니다."],
      ["S2F33/S2F35/S2F37", "Report/Event 설정", "어떤 CEID에 어떤 변수를 실어 보낼지 설정합니다."],
      ["S2F41/S2F42", "Remote Command", "Host가 장비 작업을 요청합니다."],
      ["S6F11/S6F12", "Event Report", "장비 이벤트와 수집 데이터를 Host에 보고합니다."]
    ],
    db: [
      ["gem_state_snapshot", "equipment_id, comm_state, control_state, process_state, last_event_time"],
      ["gem_report_config", "equipment_id, ceid, rptid, vid_list, enabled, version"],
      ["gem_alarm_history", "alarm_id, equipment_id, alid, alarm_text, alarm_state, event_time, ack_time"]
    ],
    implementation: [
      "GEM 초기화는 통신 연결, Establish Communication, Online 전환, report enable 순서로 단계화합니다.",
      "Control State가 Online Remote가 아닐 때 Remote Command를 막는 정책을 둡니다. 화면 버튼도 상태에 따라 비활성화해야 합니다.",
      "이벤트 보고 설정은 장비 재기동 후 사라질 수 있으므로 EAP가 bootstrap 시 재배포할 수 있어야 합니다.",
      "알람은 현재 상태와 이력 테이블을 분리합니다. 현재 알람만 보면 반복 발생과 해제 패턴을 분석할 수 없습니다."
    ],
    pitfalls: ["GEM online과 공정 ready를 혼동", "S2F41 ACK만 보고 실제 작업 시작을 확정", "CEID/RPTID 설정 누락", "장비 재기동 후 report disable 상태 방치"],
    tests: ["GEM bootstrap 시나리오", "Online Local에서 원격 명령 거부", "알람 발생/해제 이벤트 저장", "장비 재기동 후 report 재설정"]
  },
  {
    id: "E39",
    title: "OSS",
    subtitle: "Object Services Standard",
    family: "GEM300",
    summary: "SEMI E39는 GEM300 표준들이 공유하는 객체 지향 모델의 기초입니다. Carrier, Process Job, Control Job 같은 엔티티를 객체로 보고, 각 객체의 속성, 상태, 서비스 호출 방식을 일관되게 표현합니다.",
    useCase: "300mm 자동화에서 여러 표준의 객체 ID, 상태 변경, attribute 조회/변경을 같은 방식으로 다루고 싶을 때 사용합니다.",
    flow: ["객체 생성", "속성 조회/설정", "상태 전이", "이벤트 보고", "객체 종료"],
    coreObjects: [
      ["Object", "관리 대상", "Carrier, PJ, CJ처럼 ID와 속성, 상태를 가진 단위입니다."],
      ["Attribute", "객체 속성", "위치, 소유자, recipe, 슬롯 맵 등 객체 설명값입니다."],
      ["Service", "객체 조작", "Create, Delete, GetAttr, SetAttr 같은 표준화된 행위입니다."],
      ["State Model", "생명주기", "객체가 어떤 상태를 지나며 어떤 이벤트를 발생시키는지 정의합니다."]
    ],
    messages: [
      ["Create Service", "객체 생성", "Host 또는 장비가 새로운 논리 객체를 만듭니다."],
      ["Get Attribute", "속성 조회", "객체의 현재 정보를 읽습니다."],
      ["State Change Event", "상태 전이 보고", "객체 생명주기 변경을 Host에 알립니다."]
    ],
    db: [
      ["oss_object", "object_id, object_type, equipment_id, current_state, created_at, ended_at"],
      ["oss_object_attribute", "object_id, attr_name, attr_value, value_type, updated_at"]
    ],
    implementation: [
      "객체 타입별로 별도 테이블을 만들더라도 공통 object registry를 두면 추적과 디버깅이 쉬워집니다.",
      "상태 전이는 유효한 이전 상태를 검증해야 합니다. 예를 들어 종료된 객체가 다시 active가 되면 데이터가 꼬입니다.",
      "속성 변경 이벤트는 변경 전/후 값을 모두 남깁니다. GEM300 장애 분석은 '언제 무엇이 바뀌었나'가 핵심입니다.",
      "E39를 단독 기능으로 보지 말고 E40, E87, E90, E94의 공통 언어로 가르치는 것이 이해에 좋습니다."
    ],
    pitfalls: ["객체 ID 재사용", "상태 이력 미저장", "속성 타입을 모두 문자열로만 저장해 비교/검색이 어려워짐"],
    tests: ["객체 생성 후 속성 조회", "잘못된 상태 전이 거부", "객체 종료 후 변경 차단", "속성 변경 이력 저장"]
  },
  {
    id: "E40",
    title: "PJM",
    subtitle: "Processing Job Management",
    family: "GEM300",
    summary: "SEMI E40은 장비가 실제로 어떤 공정 작업을 수행할지 정의하는 Process Job을 관리합니다. Process Job은 특정 wafer 또는 substrate 묶음, recipe, 공정 조건을 하나의 실행 단위로 묶습니다.",
    useCase: "MES가 lot/wafer별 공정 recipe를 지정하고 장비가 해당 작업을 준비, 실행, 완료하도록 제어할 때 필요합니다.",
    flow: ["Process Job 생성", "Recipe/Material 매핑", "검증", "실행 가능 상태", "완료/중단 보고"],
    coreObjects: [
      ["Process Job ID", "공정 작업 식별자", "작업 단위를 추적하는 고유 ID입니다."],
      ["Recipe", "공정 조건", "장비가 수행할 프로그램 또는 조건 세트입니다."],
      ["Material List", "처리 대상", "wafer, substrate, slot 목록을 작업에 연결합니다."],
      ["PJob State", "작업 상태", "생성, queued, executing, completed, aborted 같은 생명주기입니다."]
    ],
    messages: [
      ["Create PJ", "작업 정의", "처리 대상과 recipe를 장비에 등록합니다."],
      ["Select/Start", "작업 실행 준비", "Control Job과 연결되어 실제 시작됩니다."],
      ["PJ Complete Event", "결과 보고", "성공, 실패, abort 원인을 Host에 전달합니다."]
    ],
    db: [
      ["process_job", "pjob_id, equipment_id, recipe_id, state, created_by, created_at, completed_at"],
      ["process_job_material", "pjob_id, carrier_id, slot_no, substrate_id, expected_result, actual_result"]
    ],
    implementation: [
      "Process Job 생성 전 recipe 존재 여부, carrier/slot mapping, 장비 online 상태를 검증합니다.",
      "MES lot ID와 장비 Process Job ID를 분리하되 추적 테이블에서 연결합니다. 현장에서는 하나의 lot이 여러 PJ로 나뉘는 경우가 많습니다.",
      "작업 취소와 장비 abort를 구분합니다. 전자는 Host 의도이고 후자는 장비/공정 문제일 수 있습니다.",
      "PJob 상태 변경은 E90 substrate 상태와 함께 저장하면 wafer 단위 분석이 쉬워집니다."
    ],
    pitfalls: ["lot 단위와 wafer 단위를 혼동", "recipe validation 없이 PJ 생성", "PJ 완료 전에 carrier unload 허용"],
    tests: ["정상 PJ 생성/완료", "없는 recipe로 생성 실패", "실행 중 abort", "slot mapping 불일치 검출"]
  },
  {
    id: "E87",
    title: "CMS",
    subtitle: "Carrier Management",
    family: "GEM300",
    summary: "SEMI E87은 FOUP 같은 Carrier의 ID 확인, load port 상태, clamp/dock, slot map, carrier access 상태를 관리합니다. 물류 자동화와 공정 자동화가 만나는 지점이라 실수하면 wafer mix나 lot 처리 오류로 이어집니다.",
    useCase: "OHT/AGV가 carrier를 장비에 올리고, 장비가 carrier ID와 slot 정보를 확인한 뒤 공정 가능 여부를 판단할 때 사용합니다.",
    flow: ["Carrier 도착", "Load Port 감지", "Carrier ID 읽기", "Slot Map 확인", "Access 상태 관리", "Carrier 반출"],
    coreObjects: [
      ["Carrier ID", "FOUP 식별자", "RFID 또는 barcode로 읽은 물류 단위 ID입니다."],
      ["Load Port", "장비 접점", "Carrier가 장비에 물리적으로 놓이는 포트입니다."],
      ["Slot Map", "wafer 위치", "각 slot에 wafer가 있는지, 예상과 일치하는지 확인합니다."],
      ["Carrier Access State", "접근 가능 상태", "공정 모듈이 carrier 내부 substrate에 접근 가능한지 나타냅니다."]
    ],
    messages: [
      ["Carrier Arrived Event", "도착 보고", "load port에 carrier가 감지됩니다."],
      ["Carrier ID Read", "ID 확인", "Carrier ID를 Host와 대조합니다."],
      ["Slot Map Report", "slot 상태 보고", "물류 계획과 실제 wafer 위치를 비교합니다."]
    ],
    db: [
      ["carrier_visit", "visit_id, equipment_id, port_id, carrier_id, arrival_time, depart_time, state"],
      ["carrier_slot_map", "visit_id, slot_no, expected_substrate_id, actual_present, actual_substrate_id, verified_at"]
    ],
    implementation: [
      "Carrier ID 읽기 실패와 ID 불일치는 다른 오류로 처리합니다. 실패는 장비/센서 문제, 불일치는 물류/MES 문제일 수 있습니다.",
      "Slot map은 expected와 actual을 나란히 저장합니다. 단순 present 여부만 저장하면 mix 사고 분석이 어렵습니다.",
      "Load port 상태는 물리 센서, E87 상태, MES 예약 상태를 함께 화면에 표시합니다.",
      "Carrier가 떠난 뒤에도 visit_id 단위 이력을 보존하여 공정 결과와 연결합니다."
    ],
    pitfalls: ["Carrier ID 임시 입력값을 확정 ID로 저장", "slot map 미검증 상태에서 공정 시작", "load port별 상태를 전역 상태로 처리"],
    tests: ["정상 carrier 도착/반출", "ID read fail", "slot map mismatch", "carrier access 중 unload 요청 차단"]
  },
  {
    id: "E90",
    title: "STS",
    subtitle: "Substrate Tracking",
    family: "GEM300",
    summary: "SEMI E90은 wafer 또는 substrate가 carrier, load port, chamber, aligner, buffer 등 장비 내부 어디에 있는지 추적합니다. 학생에게는 'lot이 처리됐다'가 아니라 각 wafer의 이동 경로와 상태를 기록해야 하는 이유를 보여주는 표준입니다.",
    useCase: "wafer mix 방지, chamber별 이력 추적, recipe 결과를 개별 substrate와 연결, 공정 중 분실/중복 감지에 사용합니다.",
    flow: ["Slot Map", "Substrate ID/위치 등록", "장비 내부 이동", "Process 상태 변경", "반출 검증"],
    coreObjects: [
      ["Substrate ID", "개별 wafer 식별", "물리 wafer 또는 기판을 추적하는 ID입니다."],
      ["Location", "현재 위치", "Carrier slot, chamber, buffer 등 논리/물리 위치입니다."],
      ["Substrate State", "처리 상태", "Waiting, InProcess, Processed, Rejected 등으로 추적합니다."],
      ["History", "이동 이력", "어디서 어디로 언제 이동했는지 저장합니다."]
    ],
    messages: [
      ["Substrate Location Event", "위치 변화", "장비 내부 이동을 Host에 보고합니다."],
      ["Substrate Process State", "공정 상태", "개별 wafer의 처리 시작/완료를 알립니다."],
      ["Mismatch Event", "불일치", "예상 위치와 실제 위치가 다를 때 보고합니다."]
    ],
    db: [
      ["substrate_current", "substrate_id, equipment_id, current_location, state, carrier_id, slot_no, updated_at"],
      ["substrate_move_history", "move_id, substrate_id, from_location, to_location, move_time, reason_code"]
    ],
    implementation: [
      "current 테이블과 history 테이블을 분리합니다. 화면은 current를 빠르게 보고, 추적/감사는 history를 봅니다.",
      "위치 변경은 트랜잭션으로 처리합니다. 이전 위치 제거와 새 위치 등록이 둘 중 하나만 성공하면 중복 wafer처럼 보입니다.",
      "장비가 substrate ID를 직접 읽지 못하는 경우 carrier slot 기반의 inferred ID 정책을 명확히 둡니다.",
      "E40 Process Job과 연결하여 '어떤 wafer가 어떤 recipe로 어떤 chamber에서 처리됐는가'를 한 번에 조회할 수 있게 합니다."
    ],
    pitfalls: ["slot 번호를 0-base와 1-base로 혼용", "wafer 이동 중 중간 위치를 누락", "공정 실패 wafer를 processed로 처리"],
    tests: ["carrier slot에서 chamber 이동", "중복 위치 등록 방지", "unknown substrate 처리", "반출 전 원위치 검증"]
  },
  {
    id: "E94",
    title: "CJM",
    subtitle: "Control Job Management",
    family: "GEM300",
    summary: "SEMI E94는 Carrier 관리(E87)와 Process Job(E40)을 묶어 실제 장비 실행 단위인 Control Job을 관리합니다. Control Job은 '이 carrier의 이 wafer들을 이 공정 작업으로 실행하라'는 오케스트레이션 객체입니다.",
    useCase: "MES가 load port에 올라온 carrier와 여러 Process Job을 연결하여 자동으로 공정을 시작, 일시정지, 재개, 완료시키는 데 사용합니다.",
    flow: ["Carrier 준비", "PJob 준비", "Control Job 생성", "Start/Execute", "Complete/Abort", "Result 보고"],
    coreObjects: [
      ["Control Job ID", "실행 단위", "공정 실행 전체를 대표하는 ID입니다."],
      ["Carrier Binding", "물류 연결", "어떤 carrier와 load port를 사용하는지 정의합니다."],
      ["PJob Binding", "공정 연결", "Control Job 안에 포함되는 Process Job 목록입니다."],
      ["CJ State", "실행 상태", "Queued, Selected, Executing, Completed, Aborted 등으로 관리합니다."]
    ],
    messages: [
      ["Create CJ", "Control Job 생성", "carrier와 process job을 묶습니다."],
      ["Start CJ", "실행 지시", "장비가 실제 공정을 시작합니다."],
      ["CJ State Event", "상태 변화", "진행/완료/중단 상황을 Host에 보고합니다."]
    ],
    db: [
      ["control_job", "cjob_id, equipment_id, state, priority, created_at, started_at, ended_at"],
      ["control_job_binding", "cjob_id, carrier_id, port_id, pjob_id, binding_order"]
    ],
    implementation: [
      "CJ 생성 전 E87 carrier 상태와 E40 PJob 상태를 모두 확인합니다.",
      "CJ 상태가 executing일 때 recipe나 slot map이 바뀌지 않도록 변경 잠금을 둡니다.",
      "여러 PJob을 포함하는 CJ에서는 완료 기준을 명확히 합니다. 일부 wafer 실패를 전체 실패로 볼지 부분 완료로 볼지 고객 룰이 필요합니다.",
      "CJ 완료 후 결과는 MES lot history, E90 substrate history, E10 time state와 연결합니다."
    ],
    pitfalls: ["CJ와 PJ를 같은 객체로 모델링", "carrier unload 후 CJ 상태가 active로 남음", "partial complete 정책 누락"],
    tests: ["정상 CJ 생성/실행/완료", "PJob 미준비 상태 CJ 생성 거부", "실행 중 carrier 제거 알람", "부분 실패 결과 저장"]
  },
  {
    id: "GEM300",
    title: "GEM300",
    subtitle: "300mm 자동화 표준 통합 가이드",
    family: "GEM300",
    summary: "GEM300은 하나의 단일 표준이라기보다 E30 GEM 위에 E39, E40, E87, E90, E94 등의 표준을 조합하여 300mm fab 자동화를 구현하는 표준 묶음입니다. 핵심은 carrier, substrate, process job, control job을 한 흐름으로 연결하는 것입니다.",
    useCase: "300mm 장비 반입, EAP 개발, MES 자동 recipe dispatch, OHT 물류 연동, wafer 단위 추적 시스템 구현에 사용합니다.",
    flow: ["E30 GEM 연결", "E87 Carrier 확인", "E90 Substrate 추적", "E40 PJob 생성", "E94 CJ 실행", "MES 결과 반영"],
    coreObjects: [
      ["Carrier", "물류 단위", "FOUP과 load port 상태를 관리합니다."],
      ["Substrate", "제품 단위", "개별 wafer의 위치와 공정 상태를 추적합니다."],
      ["Process Job", "공정 정의", "recipe와 대상 substrate를 묶습니다."],
      ["Control Job", "실행 오케스트레이션", "carrier와 PJob을 묶어 실제 실행합니다."],
      ["Event Report", "상태 보고", "각 표준 객체의 변화를 Host에 전달합니다."]
    ],
    messages: [
      ["Carrier Arrived", "물류 시작", "FOUP이 load port에 도착합니다."],
      ["PJob Created", "공정 준비", "wafer와 recipe가 지정됩니다."],
      ["CJ Started", "실행 시작", "장비가 공정을 수행합니다."],
      ["Substrate Processed", "wafer별 결과", "개별 substrate 결과를 보고합니다."],
      ["CJ Completed", "작업 종료", "MES가 lot history를 확정합니다."]
    ],
    db: [
      ["gem300_lot_context", "lot_id, carrier_id, cjob_id, equipment_id, route_step, state"],
      ["gem300_event_timeline", "event_id, lot_id, object_type, object_id, event_name, event_time, payload_json"]
    ],
    implementation: [
      "GEM300 구현은 표준별 기능을 따로 만드는 것보다 전체 시나리오를 먼저 그려야 합니다.",
      "Carrier ID, substrate ID, PJob ID, CJ ID의 관계를 ERD로 고정합니다. 이 관계가 흔들리면 모든 이력이 흔들립니다.",
      "장비별로 지원 범위가 다르므로 capability matrix를 만들어 필수/선택 기능을 표시합니다.",
      "반입 테스트는 메시지 단위가 아니라 carrier 도착부터 CJ 완료까지 end-to-end로 진행합니다."
    ],
    pitfalls: ["표준별 객체 관계를 문서화하지 않음", "E90 wafer 이력 없이 lot 완료 처리", "장비 지원 기능을 모든 GEM300 기능으로 가정"],
    tests: ["FOUP 도착부터 CJ 완료까지 정상 플로우", "slot mismatch로 시작 차단", "작업 중 abort 후 MES 결과 반영", "장비 재기동 후 객체 상태 복원"]
  },
  {
    id: "E10",
    title: "RAM",
    subtitle: "Reliability, Availability, Maintainability",
    family: "Productivity",
    summary: "SEMI E10은 장비 시간을 Productive, Standby, Engineering, Scheduled Downtime, Unscheduled Downtime, Non-Scheduled Time 등으로 나누고 MTBF, MTTR, Availability 같은 지표를 계산하는 방법을 설명합니다.",
    useCase: "장비 성능 대시보드, 설비 벤더 평가, PM 효과 분석, 다운타임 Pareto, OEE 계산의 시간 기반 입력으로 사용합니다.",
    flow: ["상태 이벤트 수집", "E10 상태 분류", "시간 구간 보정", "RAM 지표 계산", "Dashboard/Report"],
    coreObjects: [
      ["PRD", "생산 시간", "가치 있는 정상 공정 수행 시간입니다."],
      ["SBY", "대기 시간", "장비는 가능하지만 제품, 작업자, Host 지시 등 외부 사유로 기다리는 시간입니다."],
      ["ENG", "엔지니어링 시간", "시험, 개선, 조건 조정 등 생산 외 기술 활동 시간입니다."],
      ["SDT", "계획 정지", "PM, 계획된 setup, 정기 점검처럼 사전에 계획된 정지입니다."],
      ["UDT", "비계획 정지", "고장, unexpected failure, 수리 대기 등 신뢰성 손실을 나타냅니다."],
      ["NST", "비가동 계획 제외", "공장 휴무, 설치, 장기 보관처럼 분석 모수에서 제외할 수 있는 시간입니다."]
    ],
    messages: [
      ["State Change", "상태 전이 이벤트", "시작 시간과 종료 시간을 계산하는 원천입니다."],
      ["Reason Code", "원인 분류", "다운타임 Pareto와 책임 구분에 사용합니다."],
      ["Failure Count", "고장 횟수", "MTBF/MTTR 계산의 분모가 됩니다."]
    ],
    db: [
      ["equipment_state_interval", "equipment_id, e10_state, reason_code, start_time, end_time, duration_sec, source_event_id"],
      ["availability_metric", "equipment_id, metric_name, numerator_sec, denominator_sec, value, window_start, window_end"],
      ["downtime_reason_pareto", "equipment_id, reason_code, downtime_sec, occurrence_count, window_start, window_end"]
    ],
    implementation: [
      "상태 이벤트를 바로 KPI로 계산하지 말고 먼저 time interval로 정규화합니다. 지연 도착 이벤트와 중복 이벤트를 보정하기 쉽습니다.",
      "한 순간에는 하나의 E10 상태만 존재하도록 우선순위 룰을 둡니다. 예를 들어 UDT가 SBY보다 우선인지 고객과 합의합니다.",
      "MTBF의 failure count 기준은 assist와 failure를 구분해야 합니다. 짧은 operator assist를 모두 failure로 세면 신뢰성이 과소평가됩니다.",
      "대시보드에는 지표값뿐 아니라 분자/분모 시간도 같이 표시합니다. Availability 95%가 어떤 모수에서 나온 값인지 알 수 있어야 합니다."
    ],
    pitfalls: ["상태 겹침 구간을 중복 합산", "NST를 denominator에 넣어 설비 효율을 낮게 계산", "failure와 assist 미구분", "장비 시간대와 MES 시간대 불일치"],
    tests: ["24시간 상태 구간 합계 검증", "겹친 이벤트 우선순위 적용", "MTBF/MTTR 수식 검증", "다운타임 Pareto reason code 집계"]
  },
  {
    id: "E116",
    title: "EPT",
    subtitle: "Equipment Performance Tracking",
    family: "Productivity",
    summary: "SEMI E116은 장비 전체가 아니라 장비 내부 모듈, chamber, load port, transfer robot 등 세부 구성 요소의 성능과 상태 변화를 추적하는 관점을 제공합니다.",
    useCase: "multi-chamber 장비에서 특정 chamber만 느리거나 robot transfer가 병목인 경우, 장비 전체 지표로는 보이지 않는 성능 손실을 찾을 때 사용합니다.",
    flow: ["모듈 구성 정의", "모듈별 상태/이벤트 수집", "성능 구간 생성", "병목 분석", "개선 조치"],
    coreObjects: [
      ["Performance Unit", "성능 추적 단위", "chamber, robot, port처럼 별도로 성능을 볼 구성 요소입니다."],
      ["Module State", "모듈 상태", "Idle, Busy, Down, Maintenance 등 모듈 수준 상태입니다."],
      ["Cycle Time", "반복 작업 시간", "load, process, unload 같은 단계별 시간입니다."],
      ["Bottleneck", "병목", "전체 throughput을 제한하는 구성 요소입니다."]
    ],
    messages: [
      ["Module State Event", "모듈 상태 변화", "각 구성 요소의 이용률을 계산합니다."],
      ["Cycle Complete", "단계 완료", "cycle time과 편차를 계산합니다."],
      ["Performance Alert", "성능 저하", "기준 대비 지연 또는 반복 실패를 알립니다."]
    ],
    db: [
      ["equipment_module", "module_id, equipment_id, module_type, module_name, parent_module_id"],
      ["module_performance_interval", "module_id, state, start_time, end_time, duration_sec, lot_id, substrate_id"],
      ["module_cycle_metric", "module_id, cycle_name, avg_sec, p95_sec, sample_count, window_start, window_end"]
    ],
    implementation: [
      "장비 구조를 tree로 모델링합니다. tool 아래 module, module 아래 chamber처럼 parent-child 관계가 필요합니다.",
      "모듈 상태와 장비 E10 상태를 연결합니다. 장비는 PRD인데 특정 chamber는 Down일 수 있습니다.",
      "Cycle time은 평균만 보지 말고 p95, max, 분산을 함께 봅니다. 병목은 꼬리 지연에서 자주 드러납니다.",
      "모듈 교체나 chamber disable 같은 구성 변경은 version을 남겨 전후 비교가 가능하게 합니다."
    ],
    pitfalls: ["장비 상태를 모든 모듈에 그대로 복사", "module_id 변경 이력 미관리", "평균 cycle time만 보고 산포를 놓침"],
    tests: ["모듈 tree 로딩", "chamber별 utilization 계산", "robot transfer p95 지연 탐지", "구성 변경 전후 metric 분리"]
  },
  {
    id: "E120",
    title: "CEM",
    subtitle: "Common Equipment Model",
    family: "EDA / Interface A",
    summary: "SEMI E120은 EDA에서 장비를 객체 모델로 표현하는 공통 장비 모델입니다. 센서, 파라미터, 이벤트, 모듈 구조가 어디에 붙어 있는지를 계층적으로 설명하여 EDA Client가 장비를 자동 탐색할 수 있게 합니다.",
    useCase: "FDC, APC, 데이터 레이크, 디지털 트윈이 장비 모델을 읽고 필요한 데이터 수집 계획을 자동으로 만들 때 사용합니다.",
    flow: ["장비 모델 노출", "Client 모델 탐색", "노드/속성 해석", "수집 대상 선택", "DCP 구성"],
    coreObjects: [
      ["Equipment", "최상위 모델", "장비 전체를 대표하는 root 객체입니다."],
      ["Module", "구성 요소", "chamber, robot, load port 같은 하위 구성입니다."],
      ["Parameter", "측정/상태 값", "온도, 압력, RF power, valve state 같은 데이터 항목입니다."],
      ["Event", "의미 있는 시점", "process start, step end, alarm change 같은 수집 트리거입니다."],
      ["Metadata", "설명 정보", "단위, 범위, 데이터 타입, 의미를 포함합니다."]
    ],
    messages: [
      ["Get Model", "모델 조회", "EDA Client가 장비의 구조와 데이터 항목을 읽습니다."],
      ["Browse Node", "계층 탐색", "필요한 parameter/event를 찾습니다."],
      ["Model Version Check", "변경 감지", "장비 SW 변경 후 모델 변화 여부를 확인합니다."]
    ],
    db: [
      ["eda_model_node", "node_id, equipment_id, parent_node_id, node_type, name, path, model_version"],
      ["eda_parameter_meta", "parameter_id, node_id, data_type, unit, min_value, max_value, description"]
    ],
    implementation: [
      "모델 path를 안정적으로 저장합니다. 화면 표시명은 바뀌어도 path 또는 persistent ID가 같으면 같은 데이터로 볼 수 있어야 합니다.",
      "모델 버전을 저장하고 변경 시 DCP 영향 분석을 수행합니다.",
      "단위와 스케일을 metadata에서 가져와 표준화합니다. 같은 압력값이라도 Torr, Pa, mTorr가 섞일 수 있습니다.",
      "Client는 모델 전체를 매번 새로 받지 말고 cache와 변경 감지를 사용합니다."
    ],
    pitfalls: ["parameter 이름만으로 매핑", "모델 변경 후 DCP 미갱신", "단위 변환 누락", "하위 모듈 path 중복"],
    tests: ["모델 tree 파싱", "parameter metadata 검증", "모델 버전 변경 감지", "DCP 영향 parameter 찾기"]
  },
  {
    id: "E125",
    title: "EqDA",
    subtitle: "Equipment Data Acquisition",
    family: "EDA / Interface A",
    summary: "SEMI E125는 EDA Client가 장비에서 데이터와 모델 정보를 얻기 위해 사용하는 기본 서비스와 통신 방식을 설명합니다. SECS/GEM의 이벤트 보고보다 더 구조화되고 대용량 데이터 수집에 적합한 접근입니다.",
    useCase: "FDC/APC/AI 분석 시스템이 장비 데이터를 고속으로 수집하고, 장비 모델을 조회하며, 세션 기반으로 안정적으로 데이터를 받는 데 사용합니다.",
    flow: ["Client 접속", "Session 생성", "Model/Metadata 조회", "DCP 요청", "Data Stream 수신", "Session 종료"],
    coreObjects: [
      ["EDA Client", "데이터 소비자", "FDC, APC, Data Lake 같은 시스템입니다."],
      ["Equipment Server", "데이터 제공자", "장비 또는 장비 gateway가 EDA 서비스를 제공합니다."],
      ["Session", "연결 문맥", "인증, 구독, 데이터 수신 상태를 묶습니다."],
      ["Data Collection", "수집 행위", "이벤트 또는 주기 기반으로 값을 전달합니다."]
    ],
    messages: [
      ["Connect/Create Session", "접속 시작", "Client가 장비 EDA 서비스와 세션을 만듭니다."],
      ["Get Metadata", "모델/변수 정보 조회", "수집 가능한 데이터와 의미를 확인합니다."],
      ["Subscribe/Receive Data", "데이터 수신", "DCP에 따라 sample 또는 event data를 받습니다."]
    ],
    db: [
      ["eda_session", "session_id, equipment_id, client_id, state, created_at, ended_at, close_reason"],
      ["eda_data_sample", "sample_id, session_id, parameter_id, value_text, quality_code, sample_time, received_at"]
    ],
    implementation: [
      "Session 상태와 DCP 상태를 분리합니다. 접속은 살아 있어도 특정 DCP만 실패할 수 있습니다.",
      "수신 데이터에는 sample_time과 received_at을 모두 저장합니다. 네트워크 지연 분석에 필요합니다.",
      "대용량 수집은 batch insert, queue, backpressure를 설계해야 합니다.",
      "Client별 권한과 수집 범위를 제한합니다. 모든 Client가 모든 고주파 데이터를 가져가면 장비에 부담이 됩니다."
    ],
    pitfalls: ["수신 시각만 저장하고 발생 시각 누락", "Client 재접속 시 중복 구독", "고주파 데이터 DB 단건 insert로 병목", "세션 장애를 장비 장애로 오판"],
    tests: ["세션 생성/종료", "metadata 조회", "대량 sample 수신", "재접속 후 중복 sample 제거"]
  },
  {
    id: "E132",
    title: "ECA",
    subtitle: "Equipment Client Authentication and Authorization",
    family: "EDA / Interface A",
    summary: "SEMI E132는 EDA 환경에서 Client가 누구인지 확인하고 어떤 데이터와 서비스에 접근할 수 있는지 통제하는 인증/권한 부여 관점을 다룹니다.",
    useCase: "FDC, APC, 분석 서버, 개발자 도구 등 여러 Client가 장비 EDA 서비스에 접속할 때 보안과 책임 추적을 보장합니다.",
    flow: ["Client Identity", "Authentication", "Authorization Policy", "Service Access", "Audit Log"],
    coreObjects: [
      ["Client Identity", "접속 주체", "시스템, 애플리케이션, 사용자 또는 인증서 기반 ID입니다."],
      ["Credential", "인증 정보", "인증서, 토큰, 계정 정보 등 신원을 증명하는 값입니다."],
      ["Role/Permission", "권한", "모델 조회, DCP 생성, 데이터 수신 같은 작업 권한입니다."],
      ["Audit", "감사", "누가 언제 어떤 서비스에 접근했는지 기록합니다."]
    ],
    messages: [
      ["Authenticate", "신원 확인", "접속 전에 Client 신뢰성을 검증합니다."],
      ["Authorize Request", "권한 판단", "요청 서비스가 허용되는지 검사합니다."],
      ["Audit Event", "감사 기록", "성공/실패를 모두 남깁니다."]
    ],
    db: [
      ["eda_client_identity", "client_id, client_name, auth_type, certificate_thumbprint, status, owner_team"],
      ["eda_permission", "permission_id, client_id, resource_pattern, action, allow_deny"],
      ["eda_access_audit", "audit_id, client_id, equipment_id, action, result, reason, event_time"]
    ],
    implementation: [
      "권한은 Client ID, 장비, resource path, action 단위로 설계합니다. 단순 read/write만으로는 운영 제어가 어렵습니다.",
      "인증 실패와 권한 실패를 구분해 로그에 남깁니다. 보안 분석과 사용자 지원 모두에 필요합니다.",
      "인증서 만료, rotation, 폐기 절차를 운영 기능으로 제공합니다.",
      "개발/검증 Client에는 production 장비의 고위험 권한을 기본 부여하지 않습니다."
    ],
    pitfalls: ["공용 계정 사용", "권한 변경 이력 미저장", "인증 성공 후 모든 데이터 허용", "실패 로그를 남기지 않음"],
    tests: ["유효 인증서 접속 성공", "만료 인증서 거부", "권한 없는 DCP 생성 거부", "감사 로그 생성"]
  },
  {
    id: "E133",
    title: "Automated EDA Interface",
    subtitle: "EDA 자동 설정과 상호운용성 가이드",
    family: "EDA / Interface A",
    summary: "SEMI E133은 EDA 환경에서 Client와 장비가 서로 필요한 정보를 자동으로 발견하고 설정하는 방향의 가이드로 이해할 수 있습니다. 핵심은 사람의 수작업 매핑을 줄이고 장비 모델과 데이터 수집 설정을 반복 가능하게 만드는 것입니다.",
    useCase: "새 장비 반입 시 EDA Client가 모델, endpoint, 지원 기능을 빠르게 파악하고 검증 도구가 자동 테스트를 수행할 때 유용합니다.",
    flow: ["장비 endpoint 등록", "지원 기능 발견", "모델/메타데이터 수집", "자동 검증", "운영 등록"],
    coreObjects: [
      ["Endpoint Profile", "접속 정보", "서비스 주소, 포트, 보안 방식, 지원 버전을 포함합니다."],
      ["Capability", "지원 기능", "어떤 EDA 서비스와 옵션을 지원하는지 나타냅니다."],
      ["Commissioning Record", "반입 검증 기록", "자동 테스트 결과와 승인 상태를 저장합니다."],
      ["Mapping Rule", "자동 매핑 규칙", "장비 모델 항목을 표준 태그나 분석 변수로 연결합니다."]
    ],
    messages: [
      ["Discover", "서비스 발견", "Client가 장비 EDA endpoint와 기능을 확인합니다."],
      ["Validate", "상호운용성 검증", "모델, DCP, sample 수신을 시험합니다."],
      ["Register", "운영 등록", "검증된 장비 정보를 운영 시스템에 반영합니다."]
    ],
    db: [
      ["eda_endpoint_profile", "equipment_id, service_url, protocol_version, security_profile, status"],
      ["eda_commissioning_test", "test_id, equipment_id, test_name, result, evidence_uri, executed_at"]
    ],
    implementation: [
      "장비 반입 절차를 체크리스트가 아니라 자동 테스트 suite로 만듭니다.",
      "endpoint, 인증, 모델 버전, sample 품질을 한 번에 검증하는 commissioning dashboard를 제공합니다.",
      "자동 매핑은 confidence score를 두고 낮은 항목은 사람이 승인하게 합니다.",
      "검증 결과는 장비 SW 버전과 함께 저장합니다. 업그레이드 후 같은 테스트를 다시 돌릴 수 있어야 합니다."
    ],
    pitfalls: ["반입 테스트 결과를 문서 파일로만 보관", "자동 발견 실패 시 수동 값을 코드에 하드코딩", "장비 SW 버전과 검증 결과 미연결"],
    tests: ["endpoint discovery", "모델 다운로드", "표준 DCP 배포", "sample 수신 및 quality 검증"]
  },
  {
    id: "E134",
    title: "DCA",
    subtitle: "Data Collection Management",
    family: "EDA / Interface A",
    summary: "SEMI E134는 EDA에서 Data Collection Plan(DCP)을 만들고 활성화하며 관리하는 기능을 설명합니다. 어떤 이벤트에서 어떤 데이터를 어떤 속도로 받을지 정의하는 핵심 표준입니다.",
    useCase: "FDC trace, APC feedback, recipe step별 데이터 수집, 고주파 센서 모니터링, 분석용 dataset 구성을 자동화할 때 사용합니다.",
    flow: ["수집 요구 정의", "DCP 생성", "Validation", "Activate", "Data 수신", "Deactivate/변경"],
    coreObjects: [
      ["DCP", "수집 계획", "수집 대상, trigger, rate, 보고 방식의 묶음입니다."],
      ["Trigger", "수집 시작 조건", "이벤트 기반 또는 시간/상태 기반 조건입니다."],
      ["Parameter Set", "수집 항목", "E120 모델에서 선택한 parameter 목록입니다."],
      ["Activation", "운영 적용", "DCP를 장비에 적용하여 실제 데이터가 나오게 합니다."]
    ],
    messages: [
      ["Create DCP", "계획 생성", "Client가 원하는 수집 조건을 장비에 등록합니다."],
      ["Activate DCP", "활성화", "등록된 계획을 실행합니다."],
      ["DCP Event/Data", "데이터 전달", "계획에 따라 sample 또는 report가 수신됩니다."]
    ],
    db: [
      ["eda_dcp", "dcp_id, equipment_id, client_id, name, state, version, created_at"],
      ["eda_dcp_parameter", "dcp_id, parameter_id, sample_rate_ms, trigger_name, required_quality"],
      ["eda_dcp_activation", "activation_id, dcp_id, activated_at, deactivated_at, result"]
    ],
    implementation: [
      "DCP는 버전 관리합니다. 같은 이름의 DCP라도 parameter나 rate가 바뀌면 분석 결과가 달라집니다.",
      "고주파 수집은 장비 성능에 영향을 줄 수 있으므로 parameter 수, sample rate, client 수 제한을 둡니다.",
      "DCP validation 단계에서 존재하지 않는 parameter, 권한 부족, 장비 부하 초과를 미리 잡습니다.",
      "운영 화면에는 active DCP와 owner를 보여줘야 합니다. 누가 만든 고주파 수집인지 모르면 장애 대응이 늦어집니다."
    ],
    pitfalls: ["DCP 이름만으로 동일성 판단", "비활성화 실패 방치", "sample rate 과다로 장비 부하", "권한 검증 누락"],
    tests: ["DCP 생성/활성화", "없는 parameter 포함 시 실패", "중복 활성화 방지", "비활성화 후 데이터 중지 확인"]
  },
  {
    id: "E151",
    title: "EDA Client Guide",
    subtitle: "EDA Client 설계와 운영 모범 사례",
    family: "EDA / Interface A",
    summary: "SEMI E151은 EDA Client를 어떻게 설계하고 운영하면 좋은지에 대한 가이드 성격의 표준입니다. 장비가 데이터를 제공하는 방법만큼이나 Client가 세션, 모델 cache, DCP, 장애 복구를 잘 다루는 것이 중요합니다.",
    useCase: "FDC/APC/분석 플랫폼의 EDA 수집 Agent를 설계하거나 여러 장비에 동일한 Client를 배포할 때 참고합니다.",
    flow: ["Client 시작", "인증/세션", "모델 cache", "DCP 관리", "데이터 수신", "장애 복구"],
    coreObjects: [
      ["Client Runtime", "수집 실행기", "세션과 구독을 유지하는 프로세스입니다."],
      ["Model Cache", "메타데이터 cache", "장비 모델을 저장하여 재접속 부하를 줄입니다."],
      ["Subscription Manager", "구독 관리", "여러 DCP와 데이터 스트림을 관리합니다."],
      ["Recovery Policy", "복구 정책", "재접속, 재구독, gap 보정 방법입니다."]
    ],
    messages: [
      ["Startup Probe", "시작 점검", "endpoint, 인증, 모델 버전을 확인합니다."],
      ["DCP Deploy", "수집 계획 배포", "필요한 DCP를 장비에 적용합니다."],
      ["Health Report", "Client 상태 보고", "수신 지연, drop, 재접속 횟수를 운영 시스템에 알립니다."]
    ],
    db: [
      ["eda_client_runtime", "client_id, host_name, version, state, last_heartbeat_at"],
      ["eda_client_metric", "client_id, equipment_id, metric_name, metric_value, measured_at"]
    ],
    implementation: [
      "Client는 장비별 worker를 분리하여 한 장비 장애가 전체 수집을 멈추지 않게 합니다.",
      "모델 cache는 TTL보다 model version 기반으로 무효화합니다.",
      "재접속 후에는 세션만 복구하지 말고 DCP 활성 상태와 데이터 수신 여부를 검증합니다.",
      "수집 지연, queue depth, drop count를 자체 metric으로 노출해야 운영자가 Client 문제와 장비 문제를 구분할 수 있습니다."
    ],
    pitfalls: ["재접속 후 DCP 재활성화 누락", "모델 cache가 오래되어 parameter mapping 오류", "Client 장애를 장비 무응답으로 오판"],
    tests: ["Client 재기동 후 자동 복구", "모델 버전 변경 감지", "네트워크 단절 후 재구독", "queue overflow 알람"]
  },
  {
    id: "E160",
    title: "Data Quality",
    subtitle: "장비 데이터 품질 표현과 전달",
    family: "EDA / Interface A",
    summary: "SEMI E160은 장비 데이터가 정상인지, 의심스러운지, 결측인지, 시간적으로 지연됐는지 같은 품질 정보를 함께 전달하는 관점을 다룹니다. 값 자체뿐 아니라 그 값을 믿어도 되는지 알려주는 표준입니다.",
    useCase: "FDC, APC, AI 모델, KPI 계산에서 잘못된 센서값이나 결측 데이터를 그대로 사용하지 않도록 품질 코드를 함께 관리할 때 필요합니다.",
    flow: ["Raw Sample", "품질 규칙 적용", "Quality Code 부여", "Annotated Data 저장", "소비 시스템 판단"],
    coreObjects: [
      ["Quality Code", "품질 상태", "Good, Suspect, Bad, Missing, OutOfRange 같은 판단입니다."],
      ["Reason", "품질 사유", "센서 오류, 통신 지연, calibration 만료 등 원인입니다."],
      ["Validity Window", "유효 시간", "값이 어느 기간 동안 유효한지 나타냅니다."],
      ["Consumer Policy", "사용 정책", "품질별로 사용, 보간, 제외, 알람을 결정합니다."]
    ],
    messages: [
      ["Sample With Quality", "품질 포함 sample", "값과 quality code를 함께 전달합니다."],
      ["Quality Rule Update", "규칙 변경", "품질 판단 기준이 바뀌면 version을 남깁니다."],
      ["Quality Issue Event", "품질 문제 보고", "결측이나 이상값이 지속될 때 알립니다."]
    ],
    db: [
      ["quality_annotated_sample", "sample_id, parameter_id, value_text, quality_code, quality_reason, sample_time"],
      ["data_quality_rule", "rule_id, parameter_id, rule_type, threshold_json, severity, version"]
    ],
    implementation: [
      "품질 코드는 원본값을 삭제하지 않습니다. 원본값, 품질 판단, 판단 시각을 모두 보존합니다.",
      "AI/통계 계산에서는 품질 코드별 처리 정책을 명시합니다. Bad는 제외, Suspect는 가중치 축소처럼 정합니다.",
      "시간 지연 품질은 sample_time과 received_at 차이로 계산합니다.",
      "품질 규칙 변경은 모델 재학습과 KPI 재계산에 영향을 주므로 version을 반드시 남깁니다."
    ],
    pitfalls: ["Bad 값을 null로 덮어써 원인 분석 불가", "품질 코드 없이 평균 계산", "시간 지연을 결측으로 오판"],
    tests: ["범위 초과 sample Bad 처리", "결측 구간 Missing 생성", "지연 sample Suspect 처리", "품질별 KPI 제외 정책 검증"]
  },
  {
    id: "E164",
    title: "EDA Common Metadata",
    subtitle: "EDA와 GEM300을 연결하는 공통 메타데이터",
    family: "EDA / Interface A",
    summary: "SEMI E164는 EDA 장비 모델의 메타데이터를 GEM300 객체와 연결하여 데이터가 어떤 carrier, substrate, chamber, job과 관련되는지 더 잘 해석하게 돕는 관점입니다.",
    useCase: "EDA sensor data를 wafer 단위 이력, chamber 이력, Process Job/Control Job 문맥과 연결하여 분석 데이터셋을 만들 때 필요합니다.",
    flow: ["E120 모델", "GEM300 객체 문맥", "Common Metadata 매핑", "수집 데이터 주석", "분석 데이터셋"],
    coreObjects: [
      ["Context Metadata", "문맥 정보", "lot, carrier, substrate, recipe, chamber 등을 데이터에 붙입니다."],
      ["Object Reference", "객체 참조", "E87/E90/E40/E94 객체와 EDA node를 연결합니다."],
      ["Semantic Tag", "의미 태그", "같은 의미의 데이터를 장비별 이름 차이와 무관하게 묶습니다."],
      ["Lineage", "데이터 계보", "값이 어떤 장비 모델/객체/시간 문맥에서 나왔는지 설명합니다."]
    ],
    messages: [
      ["Metadata Query", "공통 메타데이터 조회", "데이터 항목의 의미와 연결 객체를 확인합니다."],
      ["Context Attach", "문맥 부착", "sample에 carrier/substrate/job 정보를 연결합니다."],
      ["Model Mapping Update", "매핑 변경", "장비 모델 변경 시 문맥 매핑을 갱신합니다."]
    ],
    db: [
      ["common_metadata_map", "map_id, equipment_id, eda_node_path, semantic_tag, gem300_object_type, confidence"],
      ["sample_context", "sample_id, lot_id, carrier_id, substrate_id, pjob_id, cjob_id, chamber_id"]
    ],
    implementation: [
      "EDA sample 저장 시점에 가능한 문맥을 붙이되, 늦게 도착한 GEM300 이벤트로 후처리 보강할 수 있게 설계합니다.",
      "semantic tag는 중앙 사전으로 관리합니다. 장비별 Pressure, ChamberPressure, CH_PRS를 같은 의미로 묶어야 분석이 됩니다.",
      "매핑 confidence와 승인 상태를 둡니다. 자동 매핑 결과를 무조건 production에 적용하면 위험합니다.",
      "Lineage 조회 API를 만들어 분석자가 특정 값의 출처를 추적할 수 있게 합니다."
    ],
    pitfalls: ["sample과 job 문맥 시간 join 기준 불명확", "장비별 이름을 그대로 분석 feature로 사용", "매핑 변경 이력 미저장"],
    tests: ["sample에 cjob/pjob context 연결", "semantic tag 매핑", "모델 변경 후 mapping 영향 분석", "늦은 이벤트 후 context 보정"]
  },
  {
    id: "E172",
    title: "SEDD",
    subtitle: "SECS Equipment Data Dictionary",
    family: "Data Dictionary",
    summary: "SEMI E172는 SECS/GEM 장비가 제공하는 변수, 이벤트, 알람, 메시지 구조를 기계가 읽을 수 있는 데이터 사전 형태로 표현하는 접근입니다. 수동 mapping을 줄이고 장비 반입 시간을 단축하는 데 목적이 있습니다.",
    useCase: "EAP, 시뮬레이터, 자동 테스트 도구가 장비별 CEID/SVID/ALID와 메시지 구조를 자동 로딩할 때 사용합니다.",
    flow: ["SEDD 파일 제공", "XML/Dictionary Parser", "변수/이벤트 사전 등록", "메시지 검증", "EAP 자동 설정"],
    coreObjects: [
      ["Variable Definition", "SVID/DVID/ECID 정의", "이름, 타입, 단위, 설명을 포함합니다."],
      ["Event Definition", "CEID 정의", "이벤트 의미와 연결 report를 설명합니다."],
      ["Alarm Definition", "ALID 정의", "알람명, 심각도, 발생/해제 의미를 포함합니다."],
      ["Message Definition", "Stream/Function 구조", "지원 메시지와 body schema를 설명합니다."]
    ],
    messages: [
      ["Dictionary Import", "사전 로딩", "파일을 읽어 EAP metadata DB에 반영합니다."],
      ["Schema Validate", "메시지 검증", "실제 수신 메시지가 정의와 맞는지 확인합니다."],
      ["Diff Report", "사전 변경 비교", "장비 SW 변경 전후 차이를 표시합니다."]
    ],
    db: [
      ["sedd_variable", "equipment_id, vid, variable_type, name, data_type, unit, description, version"],
      ["sedd_event", "equipment_id, ceid, name, report_ids, description, version"],
      ["sedd_message", "equipment_id, stream, function, direction, schema_json, version"]
    ],
    implementation: [
      "Dictionary import는 idempotent하게 만듭니다. 같은 파일을 여러 번 넣어도 중복이 생기지 않아야 합니다.",
      "기존 mapping과 새 dictionary를 diff하여 삭제/변경/추가 항목을 리뷰 화면에 보여줍니다.",
      "사전 파일을 신뢰하더라도 실제 장비 응답으로 샘플 검증을 수행합니다.",
      "버전별 사전을 보관하여 과거 로그를 당시 의미로 해석할 수 있게 합니다."
    ],
    pitfalls: ["새 사전 import로 과거 의미 덮어쓰기", "dictionary와 실제 장비 응답 불일치 미검출", "단위/타입 누락"],
    tests: ["SEDD import", "변수 중복 방지", "CEID report mapping 검증", "사전 버전 diff"]
  },
  {
    id: "E173",
    title: "XML SECS-II Message Notation",
    subtitle: "SECS-II 메시지의 XML 표현",
    family: "Data Dictionary",
    summary: "SEMI E173은 SECS-II 메시지의 계층형 구조를 사람이 읽고 도구가 검증하기 쉬운 XML 형태로 표현하는 방법을 설명합니다. 테스트 케이스, 문서화, 게이트웨이 변환에서 특히 유용합니다.",
    useCase: "SECS message simulator, API gateway, 자동 테스트, 장비 메시지 문서화를 XML 기반으로 만들 때 사용합니다.",
    flow: ["Raw SECS-II Tree", "XML Notation 변환", "Schema 검증", "Test Case 생성", "Message 송수신"],
    coreObjects: [
      ["XML Element", "SECS item 표현", "List, ASCII, Binary, Integer 같은 item을 XML element로 나타냅니다."],
      ["Attribute", "타입/길이 정보", "format, count, name 같은 부가 정보를 붙입니다."],
      ["Template", "메시지 템플릿", "SxFy별 기대 구조를 정의합니다."],
      ["Converter", "변환기", "binary SECS와 XML 표현을 상호 변환합니다."]
    ],
    messages: [
      ["Convert To XML", "수신 메시지 문서화", "디버깅과 로그 분석에 사용합니다."],
      ["Generate SECS", "XML에서 메시지 생성", "시뮬레이터와 테스트 자동화에 사용합니다."],
      ["Validate Template", "구조 검증", "필수 항목, 타입, 길이가 맞는지 확인합니다."]
    ],
    db: [
      ["smn_template", "template_id, stream, function, direction, xml_schema, description, version"],
      ["smn_conversion_log", "message_id, template_id, conversion_status, error_message, converted_at"]
    ],
    implementation: [
      "XML은 로그 표시용과 검증용을 구분합니다. 표시용은 보기 좋게, 검증용은 타입과 길이가 엄격해야 합니다.",
      "Converter는 round-trip 테스트를 통과해야 합니다. SECS -> XML -> SECS 후 바이트 의미가 유지되어야 합니다.",
      "템플릿에는 장비별 optional field를 표현할 수 있어야 합니다.",
      "대용량 binary payload는 XML에 그대로 넣기보다 base64 또는 별도 artifact로 관리합니다."
    ],
    pitfalls: ["숫자 타입 폭 손실", "List 순서 변경", "binary 값을 문자열로 변환하며 데이터 손상", "optional field 미지원"],
    tests: ["S1F2 XML 변환", "XML에서 SECS 생성", "round-trip 검증", "schema 위반 메시지 reject"]
  },
  {
    id: "E187",
    title: "FAB Equipment Cybersecurity",
    subtitle: "반도체 장비 사이버보안 요구사항",
    family: "Cybersecurity",
    summary: "SEMI E187은 fab 장비가 네트워크에 연결될 때 필요한 보안 요구사항을 장비 설계와 운영 관점에서 다룹니다. 생산성만 보던 장비 자동화에 보안 기준선을 더하는 표준입니다.",
    useCase: "장비 반입 보안 심사, remote access 정책, 패치/취약점 관리, 계정/포트 통제, 감사 로그 설계에 사용합니다.",
    flow: ["장비 자산 식별", "네트워크/계정 정책", "취약점/패치 관리", "감사 로그", "위험 평가/개선"],
    coreObjects: [
      ["Asset Inventory", "보호 대상", "장비 PC, OS, application, network interface, service 목록입니다."],
      ["Network Control", "통신 통제", "필요한 포트와 프로토콜만 허용합니다."],
      ["Access Control", "계정/권한", "사용자와 서비스 계정의 권한을 최소화합니다."],
      ["Vulnerability Management", "취약점 관리", "패치 수준, 예외 승인, 완화 조치를 추적합니다."],
      ["Audit Log", "감사 기록", "로그인, 설정 변경, remote access, 보안 이벤트를 남깁니다."]
    ],
    messages: [
      ["Security Baseline", "기준선 등록", "장비 반입 시 보안 상태를 기록합니다."],
      ["Access Event", "접속 기록", "성공/실패, source, 계정, 작업을 저장합니다."],
      ["Risk Review", "위험 평가", "취약점과 예외를 주기적으로 검토합니다."]
    ],
    db: [
      ["equipment_security_profile", "equipment_id, os_name, os_version, open_ports, remote_access_policy, patch_level, risk_rating"],
      ["equipment_access_audit", "audit_id, equipment_id, user_id, source_ip, action, result, event_time"],
      ["vulnerability_exception", "exception_id, equipment_id, cve_id, mitigation, approved_by, expire_at"]
    ],
    implementation: [
      "장비 반입 시 보안 baseline을 만들고, 이후 변경을 drift로 감지합니다.",
      "remote access는 임시 승인, 시간 제한, 세션 기록을 기본으로 설계합니다.",
      "생산 영향 때문에 즉시 패치할 수 없는 경우 보완 통제와 만료일이 있는 예외 승인 프로세스를 둡니다.",
      "보안 로그는 장비 내부에만 두지 말고 중앙 로그 시스템으로 전송합니다."
    ],
    pitfalls: ["벤더 기본 계정 방치", "불필요한 open port 허용", "패치 예외 만료일 없음", "보안 로그 시간 동기화 누락"],
    tests: ["허용 포트 스캔 결과 비교", "권한 없는 remote access 차단", "계정 변경 감사 로그", "취약점 예외 만료 알람"]
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
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("\n")}</ul>`;
}

function renderFlow(flow) {
  return `<div class="flow-diagram">
${flow.map((node, index) => `        <div class="flow-node"><strong>${esc(node)}</strong><span class="tiny">${index === 0 ? "Input" : index === flow.length - 1 ? "Output" : "Process"}</span></div>${index < flow.length - 1 ? '\n        <div class="flow-arrow">→</div>' : ""}`).join("\n")}
      </div>`;
}

function renderDataFlowTable(s) {
  const data = s.flow.map((node, index) => [
    `<strong>${index + 1}. ${esc(node)}</strong>`,
    index === 0 ? "입력 데이터 또는 시작 조건" : index === s.flow.length - 1 ? "업무 시스템이 사용하는 결과" : "검증, 변환, 상태 판단을 수행하는 처리 단계",
    index === 0 ? "장비, Host, 운영자, 물류 시스템에서 발생" : index === s.flow.length - 1 ? "MES/EAP/대시보드/분석 시스템으로 전달" : "중간 결과를 로그와 상태 테이블에 남김"
  ]);
  return rows(data);
}

function renderPage(s) {
  const canonical = s.coreObjects.slice(0, 4).map((row) => row[0]).join(", ");
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SEMI ${esc(s.id)} Guide - ${esc(s.title)}</title>
  <link rel="stylesheet" href="../semi-page.css">
  <style>
    .lesson-index{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    .lesson-index a{display:block;border:1px solid var(--line);border-radius:8px;padding:10px;text-decoration:none;color:var(--blue);background:#fff;font-weight:700;font-size:13px}
    .callout{border-left:5px solid var(--accent);background:#eefafa;padding:14px 16px;border-radius:8px;margin:14px 0}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .codebox{background:#0f172a;color:#e2e8f0;border-radius:10px;padding:14px;overflow:auto;font-family:Consolas,monospace;font-size:13px;line-height:1.55}
    .badge{display:inline-block;border:1px solid #cbd5e1;border-radius:999px;padding:2px 8px;margin:2px;background:#f8fafc;font-size:12px}
    @media(max-width:900px){.lesson-index,.two-col{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main class="page">
    <div class="crumbs"><a href="../SEMI_Data_Flow_Main.html">SEMI Guide</a> / SEMI ${esc(s.id)}</div>

    <section class="hero">
      <h1>SEMI ${esc(s.id)} - ${esc(s.title)}</h1>
      <p>${esc(s.subtitle)}. ${esc(s.summary)}</p>
      <div class="chips">
        <span class="chip">${esc(s.family)}</span>
        <span class="chip">교육용 상세 가이드</span>
        <span class="chip">개발 설계 관점</span>
      </div>
    </section>

    <section class="section">
      <h2>학습 목표</h2>
      <div class="lesson-index">
        <a href="#concept">1. 표준의 역할</a>
        <a href="#dfd">2. DFD와 데이터 흐름</a>
        <a href="#model">3. 객체/상태 모델</a>
        <a href="#implementation">4. 구현 설계</a>
        <a href="#database">5. 데이터베이스</a>
        <a href="#logic">6. 처리 로직</a>
        <a href="#test">7. 테스트</a>
        <a href="#ops">8. 운영 체크</a>
      </div>
      <div class="callout">${esc(commonNotice)}</div>
      <p><strong>수업에서 기억할 핵심:</strong> ${esc(s.id)}는 ${esc(s.useCase)} 이 문서를 읽을 때는 표준 번호를 외우는 것보다, 입력 데이터가 어디서 오고 어떤 상태 판단을 거쳐 어떤 업무 시스템으로 전달되는지 따라가야 합니다.</p>
    </section>

    <section id="concept" class="section">
      <h2>1. 표준의 역할과 현장 배경</h2>
      <p>${esc(s.summary)}</p>
      <p>반도체 fab의 자동화 시스템은 장비, EAP, MES, FDC, APC, 물류 시스템이 동시에 움직입니다. 이때 ${esc(s.id)} 영역의 데이터가 애매하면 운영자는 같은 현상을 서로 다른 용어로 부르게 되고, 개발자는 예외 처리를 코드 곳곳에 흩뿌리게 됩니다. 따라서 먼저 표준이 다루는 경계를 정하고, 그 안에서 공통 객체와 상태를 모델링해야 합니다.</p>
      <div class="two-col">
        <div class="card">
          <strong>학생에게 설명하는 비유</strong>
          <span>${esc(s.id)}를 하나의 교실 규칙이라고 보면 됩니다. 교사가 출석, 과제, 시험을 같은 양식으로 관리해야 학생별 이력을 비교할 수 있듯이, 장비 자동화도 ${esc(canonical)} 같은 핵심 요소를 같은 언어로 관리해야 합니다.</span>
        </div>
        <div class="card">
          <strong>개발자에게 중요한 이유</strong>
          <span>표준을 데이터 모델로 옮기면 화면, API, 이벤트 처리, 장애 분석이 같은 기준을 공유합니다. 반대로 표준을 문서로만 두면 프로젝트마다 다른 용어와 상태값이 생겨 유지보수가 어려워집니다.</span>
        </div>
      </div>
    </section>

    <section id="dfd" class="section">
      <h2>2. DFD: 데이터가 흘러가는 방식</h2>
      ${renderFlow(s.flow)}
      <p style="margin-top:14px">위 흐름은 ${esc(s.id)}를 프로그램으로 구현할 때의 기본 DFD입니다. 단순히 화면에 값을 보여주는 흐름이 아니라, 입력, 검증, 상태 판단, 저장, 업무 시스템 전달까지 포함합니다.</p>
      <table>
        <thead><tr><th>단계</th><th>처리 의미</th><th>개발 시 저장/검증 포인트</th></tr></thead>
        <tbody>${renderDataFlowTable(s)}</tbody>
      </table>
    </section>

    <section id="model" class="section">
      <h2>3. 핵심 객체와 상태 모델</h2>
      <p>${esc(s.id)} 구현은 아래 객체들을 중심으로 설계하면 이해가 쉽습니다. 학생들은 각 객체가 "무엇을 식별하고", "어떤 상태를 가지며", "어떤 이벤트로 변하는지"를 먼저 그려보면 됩니다.</p>
      <table>
        <thead><tr><th>객체/개념</th><th>역할</th><th>수업식 해설</th></tr></thead>
        <tbody>${rows(s.coreObjects.map(([a,b,c]) => [`<strong>${esc(a)}</strong>`, esc(b), esc(c)]))}</tbody>
      </table>
      <h3>상태 전이 관점</h3>
      <p>상태 모델은 "현재 상태를 저장하는 테이블"과 "상태가 바뀐 이력 테이블"을 분리해서 생각해야 합니다. 현재 상태는 화면과 제어 판단에 빠르게 쓰이고, 이력은 감사, 추적, KPI 계산, 장애 분석에 쓰입니다.</p>
      <div class="codebox">state_event_received
  -> validate_event_order
  -> close_previous_interval_if_needed
  -> update_current_state
  -> append_history
  -> publish_business_event</div>
    </section>

    <section class="section">
      <h2>4. 메시지와 이벤트 설계</h2>
      <p>표준을 실제 시스템에 연결할 때는 메시지 이름보다 메시지가 만드는 업무 효과를 더 중요하게 봐야 합니다. 예를 들어 ACK가 성공이어도 실제 상태가 바뀌지 않았으면 업무적으로는 아직 완료가 아닙니다.</p>
      <table>
        <thead><tr><th>메시지/이벤트</th><th>의도</th><th>구현 시 확인할 점</th></tr></thead>
        <tbody>${rows(s.messages.map(([a,b,c]) => [`<strong>${esc(a)}</strong>`, esc(b), esc(c)]))}</tbody>
      </table>
    </section>

    <section id="database" class="section">
      <h2>5. 권장 데이터베이스 구조</h2>
      <p>아래 테이블은 교육용 설계 예시입니다. 실제 프로젝트에서는 장비 수, 이벤트량, 보존 기간, 고객 naming rule에 맞춰 column을 조정해야 합니다. 그래도 핵심은 원본 이벤트, 현재 상태, 이력, 설정 버전을 분리하는 것입니다.</p>
      <table>
        <thead><tr><th>테이블</th><th>권장 컬럼</th><th>설계 이유</th></tr></thead>
        <tbody>${rows(s.db.map(([name, cols]) => [`<strong>${esc(name)}</strong>`, `<code>${esc(cols)}</code>`, "운영 화면, 이력 추적, 장애 분석, 재처리를 분리하기 위한 기본 저장소입니다."]))}</tbody>
      </table>
      <h3>ERD를 그릴 때의 원칙</h3>
      ${list([
        "장비 ID, 표준 객체 ID, 발생 시각은 대부분의 테이블에 들어가는 기본 축입니다.",
        "현재 상태 테이블은 업데이트가 많고, 이력 테이블은 append 중심으로 설계합니다.",
        "설정값과 사전 정보는 version을 둡니다. 장비 SW 변경 후 같은 ID의 의미가 바뀌는 경우가 있습니다.",
        "원본 payload 또는 raw message 참조를 남기면 장애 분석과 재처리가 쉬워집니다."
      ])}
    </section>

    <section id="implementation" class="section">
      <h2>6. 구현 절차</h2>
      <p>처음부터 전체 자동화를 만들려고 하면 복잡합니다. 수업 프로젝트나 PoC에서는 다음 순서로 구현하면 기능이 자연스럽게 쌓입니다.</p>
      <table>
        <thead><tr><th>순서</th><th>구현 항목</th><th>완료 기준</th></tr></thead>
        <tbody>${rows(s.implementation.map((item, index) => [`<strong>${index + 1}</strong>`, esc(item), index === 0 ? "입력 조건과 설정값이 화면/DB에 남는다." : index === s.implementation.length - 1 ? "장애 상황에서도 로그와 상태가 일관된다." : "정상/오류 케이스가 테스트로 재현된다."]))}</tbody>
      </table>
      <h3>서비스 분리 예시</h3>
      <div class="codebox">Controller/API
  -> Command Validator
  -> Standard Domain Service (${esc(s.id)})
  -> State Repository
  -> Event Publisher
  -> Audit/Metric Writer</div>
      <p>Domain Service 안에는 ${esc(s.id)}의 상태 전이, 권한 판단, 데이터 품질 판단 같은 표준별 규칙을 넣고, Controller에는 HTTP나 화면 요청 처리만 남기는 구조가 유지보수에 좋습니다.</p>
    </section>

    <section id="logic" class="section">
      <h2>7. 처리 로직 상세</h2>
      <p>아래 의사코드는 ${esc(s.id)} 이벤트를 받았을 때 공통적으로 적용할 수 있는 처리 흐름입니다. 실제 코드는 Java, C#, Python, Node.js 어느 언어로 작성해도 되지만 순서는 유지하는 편이 안전합니다.</p>
      <div class="codebox">function handle${esc(s.id)}Event(event):
  assert event.equipmentId is not empty
  assert event.eventTime is not in the future beyond allowedSkew
  dictionary = loadDictionary(event.equipmentId, event.standardVersion)
  normalized = normalize(event, dictionary)
  validationResult = validateBusinessRule(normalized)
  saveRawEvent(event)
  if validationResult.ok:
      updateCurrentState(normalized)
      appendHistory(normalized)
      publishToConsumers(normalized)
  else:
      createExceptionRecord(normalized, validationResult.reason)
      notifyOperatorIfNeeded()</div>
      <h3>예외 처리 원칙</h3>
      ${list([
        "오류 이벤트도 버리지 않습니다. raw event와 실패 이유를 저장해야 재처리와 벤더 문의가 가능합니다.",
        "장비 시간과 서버 시간이 다를 수 있으므로 허용 가능한 clock skew를 설정합니다.",
        "중복 이벤트는 idempotency key로 걸러냅니다. 보통 equipment_id, event_name, event_time, sequence를 조합합니다.",
        "업무 시스템으로 내보내기 전에 표준 상태값을 사내 공통 코드로 매핑합니다."
      ])}
    </section>

    <section id="test" class="section">
      <h2>8. 테스트 시나리오</h2>
      <p>표준 구현의 품질은 정상 케이스보다 예외 케이스에서 드러납니다. 아래 테스트를 자동화하면 장비 반입과 SW 변경 검증 시간이 크게 줄어듭니다.</p>
      <table>
        <thead><tr><th>테스트</th><th>입력 조건</th><th>기대 결과</th></tr></thead>
        <tbody>${rows(s.tests.map((t, i) => [`TC-${String(i + 1).padStart(2, "0")}`, esc(t), "상태, 이력, 알람 또는 ACK가 설계 문서와 일치해야 합니다."]))}</tbody>
      </table>
      <h3>자주 발생하는 실수</h3>
      <div>${s.pitfalls.map((p) => `<span class="badge">${esc(p)}</span>`).join(" ")}</div>
    </section>

    <section id="ops" class="section">
      <h2>9. 운영 화면과 모니터링 설계</h2>
      <p>${esc(s.id)}를 운영 시스템에 넣을 때는 개발자 로그만으로 부족합니다. 운영자가 즉시 판단할 수 있도록 현재 상태, 마지막 이벤트 시각, 실패 원인, 관련 객체 링크를 한 화면에 보여줘야 합니다.</p>
      <div class="grid">
        <div class="card"><strong>상태 패널</strong><span>현재 상태, 마지막 정상 이벤트, 마지막 오류 이벤트, 장비/Client 연결 상태를 표시합니다.</span></div>
        <div class="card"><strong>이력 타임라인</strong><span>이벤트가 어떤 순서로 발생했는지 시간축으로 보여주고 raw payload까지 drill-down할 수 있게 합니다.</span></div>
        <div class="card"><strong>품질/예외 큐</strong><span>미처리 오류, 재처리 대상, 승인 대기 예외를 운영자가 확인하고 조치합니다.</span></div>
      </div>
      <h3>완료 체크리스트</h3>
      ${list([
        "표준 객체와 사내 공통 코드의 매핑표가 있다.",
        "정상/오류/재처리/중복 이벤트 테스트가 자동화되어 있다.",
        "운영자가 볼 수 있는 현재 상태 화면과 이력 화면이 있다.",
        "장비 SW 또는 표준 사전 변경 시 영향 분석 절차가 있다.",
        "공식 SEMI 문서와 고객 사양서 기준으로 최종 검토했다."
      ])}
    </section>
  </main>
</body>
</html>
`;
}

fs.mkdirSync(outDir, { recursive: true });
for (const standard of standards) {
  fs.writeFileSync(path.join(outDir, `${standard.id}.html`), renderPage(standard), "utf8");
}

console.log(`Generated ${standards.length} standard pages in ${outDir}`);
