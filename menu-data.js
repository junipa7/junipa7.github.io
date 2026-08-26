const SITE_MENU_CONFIG = [
    {
        title: "소개",
        items: [
            { title: "About Me", path: "contents/about.html", active: true },
            { title: "교육 이력", path: "contents/education.html" },
            { title: "기타 활동", path: "contents/other.html" },
            { title: "워런 버핏의 조언", path: "contents/Life_Advice/lessons_from_warren_buffett.html", mode: "iframe" }
        ]
    },
    {
        title: "MES / Analytics",
        items: [
            { title: "SEMI · MESA · ISA-95 관계", path: "contents/MES/semi-mesa-isa95-relationship.html", mode: "iframe" },
            { title: "AI 포함 4-Tier MES 개발 가이드", path: "contents/MES/ai-4tier-mes.html" },
            {
                title: "SEMI Standards",
                children: [
                    { title: "SEMI Guide Overview", path: "SEMI_Interactive_Guide/SEMI_Data_Flow_Main.html", mode: "iframe" },
                    {
                        title: "SECS/GEM 기본",
                        children: [
                            { title: "SECS/GEM Guide Overview", path: "SEMI_Interactive_Guide/standards/SECS_GEM_Guide_Overview.html", mode: "iframe" },
                            { title: "SEMI E4 - SECS-I", path: "SEMI_Interactive_Guide/standards/E4.html", mode: "iframe" },
                            { title: "SEMI E5 - SECS-II", path: "SEMI_Interactive_Guide/standards/E5.html", mode: "iframe" },
                            { title: "SEMI E37 - HSMS", path: "SEMI_Interactive_Guide/standards/E37.html", mode: "iframe" },
                            { title: "SEMI E30 - GEM", path: "SEMI_Interactive_Guide/standards/E30.html", mode: "iframe" }
                        ]
                    },
                    {
                        title: "GEM300 생산 실행",
                        children: [
                            { title: "GEM300 Production Overview", path: "SEMI_Interactive_Guide/standards/GEM300_Production_Overview.html", mode: "iframe" },
                            { title: "GEM300", path: "SEMI_Interactive_Guide/standards/GEM300.html", mode: "iframe" },
                            { title: "SEMI E39 - Object Services", path: "SEMI_Interactive_Guide/standards/E39.html", mode: "iframe" },
                            { title: "SEMI E40 - Processing Job", path: "SEMI_Interactive_Guide/standards/E40.html", mode: "iframe" },
                            { title: "SEMI E87 - Carrier Management", path: "SEMI_Interactive_Guide/standards/E87.html", mode: "iframe" },
                            { title: "SEMI E90 - Substrate Tracking", path: "SEMI_Interactive_Guide/standards/E90.html", mode: "iframe" },
                            { title: "SEMI E94 - Control Job", path: "SEMI_Interactive_Guide/standards/E94.html", mode: "iframe" }
                        ]
                    },
                    {
                        title: "EDA / Interface A",
                        children: [
                            { title: "EDA / Interface A Overview", path: "SEMI_Interactive_Guide/standards/EDA_Interface_A_Overview.html", mode: "iframe" },
                            { title: "SEMI E120 - Common Equipment Model", path: "SEMI_Interactive_Guide/standards/E120.html", mode: "iframe" },
                            { title: "SEMI E125 - Equipment Data Acquisition", path: "SEMI_Interactive_Guide/standards/E125.html", mode: "iframe" },
                            { title: "SEMI E132 - Client Authentication", path: "SEMI_Interactive_Guide/standards/E132.html", mode: "iframe" },
                            { title: "SEMI E133 - Automated EDA Interface", path: "SEMI_Interactive_Guide/standards/E133.html", mode: "iframe" },
                            { title: "SEMI E134 - Data Collection Management", path: "SEMI_Interactive_Guide/standards/E134.html", mode: "iframe" },
                            { title: "SEMI E151 - EDA Client Guide", path: "SEMI_Interactive_Guide/standards/E151.html", mode: "iframe" },
                            { title: "SEMI E160 - Data Quality", path: "SEMI_Interactive_Guide/standards/E160.html", mode: "iframe" },
                            { title: "SEMI E164 - Common Metadata", path: "SEMI_Interactive_Guide/standards/E164.html", mode: "iframe" }
                        ]
                    },
                    {
                        title: "Data Dictionary / Productivity / Security",
                        children: [
                            { title: "Data Dictionary / Productivity / Security Overview", path: "SEMI_Interactive_Guide/standards/Data_Productivity_Security_Overview.html", mode: "iframe" },
                            { title: "SEMI E10 - RAM", path: "SEMI_Interactive_Guide/standards/E10.html", mode: "iframe" },
                            { title: "SEMI E116 - Performance Tracking", path: "SEMI_Interactive_Guide/standards/E116.html", mode: "iframe" },
                            { title: "SEMI E172 - SECS Equipment Data Dictionary", path: "SEMI_Interactive_Guide/standards/E172.html", mode: "iframe" },
                            { title: "SEMI E173 - XML SECS-II Message Notation", path: "SEMI_Interactive_Guide/standards/E173.html", mode: "iframe" },
                            { title: "SEMI E187 - Equipment Cybersecurity", path: "SEMI_Interactive_Guide/standards/E187.html", mode: "iframe" }
                        ]
                    },
                    {
                        title: "Streaming Algorithm",
                        children: [
                            { title: "Chan Algorithm", path: "SEMI_Interactive_Guide/algorithms/Chan.html", mode: "iframe" },
                            { title: "KLL Sketch", path: "SEMI_Interactive_Guide/algorithms/KLL.html", mode: "iframe" }
                        ]
                    },
                    { title: "SEMI E10 Legacy Guide", path: "SEMI_Interactive_Guide/SEMI_E10_Guide.html", mode: "iframe" }
                ]
            },
            {
                title: "MESA Smart Manufacturing",
                children: [
                    { title: "MESA Smart Manufacturing Overview", path: "contents/MES/mesa/MESA_MES_Overview.html", mode: "iframe" },
                    {
                        title: "Lifecycles",
                        children: [
                            { title: "생산 라이프사이클", path: "contents/MES/mesa/lifecycles/production.html", mode: "iframe" },
                            { title: "생산 자산 라이프사이클", path: "contents/MES/mesa/lifecycles/production-asset.html", mode: "iframe" },
                            { title: "제품 라이프사이클", path: "contents/MES/mesa/lifecycles/product.html", mode: "iframe" },
                            { title: "공급망 라이프사이클", path: "contents/MES/mesa/lifecycles/supply-chain.html", mode: "iframe" },
                            { title: "인력 라이프사이클", path: "contents/MES/mesa/lifecycles/workforce.html", mode: "iframe" },
                            { title: "주문-수금 라이프사이클", path: "contents/MES/mesa/lifecycles/order-to-cash.html", mode: "iframe" }
                        ]
                    },
                    {
                        title: "Cross-Lifecycle Threads",
                        children: [
                            { title: "품질 Thread", path: "contents/MES/mesa/threads/quality.html", mode: "iframe" },
                            { title: "Compliance Thread", path: "contents/MES/mesa/threads/compliance.html", mode: "iframe" },
                            { title: "Sustainability Thread", path: "contents/MES/mesa/threads/sustainability.html", mode: "iframe" },
                            { title: "Analytics Thread", path: "contents/MES/mesa/threads/analytics.html", mode: "iframe" },
                            { title: "Security Thread", path: "contents/MES/mesa/threads/security.html", mode: "iframe" },
                            { title: "Digital Twin Thread", path: "contents/MES/mesa/threads/digital-twin-thread.html", mode: "iframe" },
                            { title: "Modeling & Simulation Thread", path: "contents/MES/mesa/threads/modeling-simulation.html", mode: "iframe" }
                        ]
                    },
                    {
                        title: "Enabling Technologies",
                        children: [
                            { title: "IIoT", path: "contents/MES/mesa/technologies/iiot.html", mode: "iframe" },
                            { title: "Big Data", path: "contents/MES/mesa/technologies/big-data.html", mode: "iframe" },
                            { title: "AI / ML", path: "contents/MES/mesa/technologies/ai-ml.html", mode: "iframe" },
                            { title: "VR / AR", path: "contents/MES/mesa/technologies/vr-ar.html", mode: "iframe" },
                            { title: "Edge to Cloud", path: "contents/MES/mesa/technologies/edge-to-cloud.html", mode: "iframe" },
                            { title: "Blockchain", path: "contents/MES/mesa/technologies/blockchain.html", mode: "iframe" },
                            { title: "Additive Manufacturing", path: "contents/MES/mesa/technologies/additive.html", mode: "iframe" },
                            { title: "Robotics", path: "contents/MES/mesa/technologies/robotics.html", mode: "iframe" },
                            { title: "Wireless", path: "contents/MES/mesa/technologies/wireless.html", mode: "iframe" }
                        ]
                    },
                    {
                        title: "MESA MES Legacy Functions",
                        children: [
                            { title: "자원 할당 및 상태 관리", path: "contents/MES/mesa/functions/resource-allocation-status.html", mode: "iframe" },
                            { title: "상세 생산 스케줄링", path: "contents/MES/mesa/functions/operations-detail-scheduling.html", mode: "iframe" },
                            { title: "작업 단위 디스패칭", path: "contents/MES/mesa/functions/dispatching-production-units.html", mode: "iframe" },
                            { title: "문서 및 작업표준 관리", path: "contents/MES/mesa/functions/document-control.html", mode: "iframe" },
                            { title: "데이터 수집 및 취득", path: "contents/MES/mesa/functions/data-collection-acquisition.html", mode: "iframe" },
                            { title: "작업자 및 인력 관리", path: "contents/MES/mesa/functions/labor-management.html", mode: "iframe" },
                            { title: "품질 관리", path: "contents/MES/mesa/functions/quality-management.html", mode: "iframe" },
                            { title: "공정 관리", path: "contents/MES/mesa/functions/process-management.html", mode: "iframe" },
                            { title: "설비 보전 관리", path: "contents/MES/mesa/functions/maintenance-management.html", mode: "iframe" },
                            { title: "제품 추적 및 계보", path: "contents/MES/mesa/functions/product-tracking-genealogy.html", mode: "iframe" },
                            { title: "성과 분석", path: "contents/MES/mesa/functions/performance-analysis.html", mode: "iframe" }
                        ]
                    }
                ]
            },
            {
                title: "ANSI/ISA-95 Standard",
                children: [
                    { title: "ISA-95 MES Model Overview", path: "contents/MES/isa95/ISA95_MES_Overview.html", mode: "iframe" },
                    {
                        title: "Activity Models",
                        children: [
                            {
                                title: "Production Operations",
                                children: [
                                    { title: "정의 관리", path: "contents/MES/isa95/activities/production-definition-management.html", mode: "iframe" },
                                    { title: "자원 관리", path: "contents/MES/isa95/activities/production-resource-management.html", mode: "iframe" },
                                    { title: "상세 스케줄링", path: "contents/MES/isa95/activities/production-detailed-scheduling.html", mode: "iframe" },
                                    { title: "디스패칭", path: "contents/MES/isa95/activities/production-dispatching.html", mode: "iframe" },
                                    { title: "실행 관리", path: "contents/MES/isa95/activities/production-execution-management.html", mode: "iframe" },
                                    { title: "데이터 수집", path: "contents/MES/isa95/activities/production-data-collection.html", mode: "iframe" },
                                    { title: "추적", path: "contents/MES/isa95/activities/production-tracking.html", mode: "iframe" },
                                    { title: "성과 분석", path: "contents/MES/isa95/activities/production-performance-analysis.html", mode: "iframe" }
                                ]
                            },
                            {
                                title: "Maintenance Operations",
                                children: [
                                    { title: "정의 관리", path: "contents/MES/isa95/activities/maintenance-definition-management.html", mode: "iframe" },
                                    { title: "자원 관리", path: "contents/MES/isa95/activities/maintenance-resource-management.html", mode: "iframe" },
                                    { title: "상세 스케줄링", path: "contents/MES/isa95/activities/maintenance-detailed-scheduling.html", mode: "iframe" },
                                    { title: "디스패칭", path: "contents/MES/isa95/activities/maintenance-dispatching.html", mode: "iframe" },
                                    { title: "실행 관리", path: "contents/MES/isa95/activities/maintenance-execution-management.html", mode: "iframe" },
                                    { title: "데이터 수집", path: "contents/MES/isa95/activities/maintenance-data-collection.html", mode: "iframe" },
                                    { title: "추적", path: "contents/MES/isa95/activities/maintenance-tracking.html", mode: "iframe" },
                                    { title: "성과 분석", path: "contents/MES/isa95/activities/maintenance-performance-analysis.html", mode: "iframe" }
                                ]
                            },
                            {
                                title: "Quality Operations",
                                children: [
                                    { title: "정의 관리", path: "contents/MES/isa95/activities/quality-definition-management.html", mode: "iframe" },
                                    { title: "자원 관리", path: "contents/MES/isa95/activities/quality-resource-management.html", mode: "iframe" },
                                    { title: "상세 스케줄링", path: "contents/MES/isa95/activities/quality-detailed-scheduling.html", mode: "iframe" },
                                    { title: "디스패칭", path: "contents/MES/isa95/activities/quality-dispatching.html", mode: "iframe" },
                                    { title: "실행 관리", path: "contents/MES/isa95/activities/quality-execution-management.html", mode: "iframe" },
                                    { title: "데이터 수집", path: "contents/MES/isa95/activities/quality-data-collection.html", mode: "iframe" },
                                    { title: "추적", path: "contents/MES/isa95/activities/quality-tracking.html", mode: "iframe" },
                                    { title: "성과 분석", path: "contents/MES/isa95/activities/quality-performance-analysis.html", mode: "iframe" }
                                ]
                            },
                            {
                                title: "Inventory Operations",
                                children: [
                                    { title: "정의 관리", path: "contents/MES/isa95/activities/inventory-definition-management.html", mode: "iframe" },
                                    { title: "자원 관리", path: "contents/MES/isa95/activities/inventory-resource-management.html", mode: "iframe" },
                                    { title: "상세 스케줄링", path: "contents/MES/isa95/activities/inventory-detailed-scheduling.html", mode: "iframe" },
                                    { title: "디스패칭", path: "contents/MES/isa95/activities/inventory-dispatching.html", mode: "iframe" },
                                    { title: "실행 관리", path: "contents/MES/isa95/activities/inventory-execution-management.html", mode: "iframe" },
                                    { title: "데이터 수집", path: "contents/MES/isa95/activities/inventory-data-collection.html", mode: "iframe" },
                                    { title: "추적", path: "contents/MES/isa95/activities/inventory-tracking.html", mode: "iframe" },
                                    { title: "성과 분석", path: "contents/MES/isa95/activities/inventory-performance-analysis.html", mode: "iframe" }
                                ]
                            }
                        ]
                    },
                    {
                        title: "Object / Hierarchy Models",
                        children: [
                            { title: "기능 계층 모델", path: "contents/MES/isa95/models/functional-hierarchy-model.html", mode: "iframe" },
                            { title: "설비 계층 모델", path: "contents/MES/isa95/models/equipment-hierarchy-model.html", mode: "iframe" },
                            { title: "인력 모델", path: "contents/MES/isa95/models/personnel-model.html", mode: "iframe" },
                            { title: "설비 모델", path: "contents/MES/isa95/models/equipment-model.html", mode: "iframe" },
                            { title: "물리 자산 모델", path: "contents/MES/isa95/models/physical-asset-model.html", mode: "iframe" },
                            { title: "자재 모델", path: "contents/MES/isa95/models/material-model.html", mode: "iframe" },
                            { title: "공정 세그먼트 모델", path: "contents/MES/isa95/models/process-segment-model.html", mode: "iframe" },
                            { title: "운영 정의 모델", path: "contents/MES/isa95/models/operations-definition-model.html", mode: "iframe" },
                            { title: "운영 능력 모델", path: "contents/MES/isa95/models/operations-capability-model.html", mode: "iframe" },
                            { title: "운영 스케줄 모델", path: "contents/MES/isa95/models/operations-schedule-model.html", mode: "iframe" },
                            { title: "운영 성과 모델", path: "contents/MES/isa95/models/operations-performance-model.html", mode: "iframe" },
                            { title: "통합 객체 모델", path: "contents/MES/isa95/models/integration-object-model.html", mode: "iframe" }
                        ]
                    }
                ]
            },
            {
                title: "MES 분석 / 참고 문서",
                children: [
                    { title: "Chan Algorithm과 KLL Sketch", path: "contents/MES/chankll.html" },
                    {
                        title: "MES 실시간 DFD / 아키텍처",
                        children: [
                            { title: "전체 아키텍처 개요 DFD (Level 0)", path: "contents/MES/diagrams/dfd_level_0.html", mode: "iframe" },
                            { title: "SEMI E10 장비 상태 트리", path: "contents/MES/diagrams/e10_ram_states.html", mode: "iframe" },
                            { title: "실시간 데이터 수집 및 EES 스트림 분배", path: "contents/MES/diagrams/stream_storage.html", mode: "iframe" },
                            { title: "Process 1.0 상세: SECS/GEM 이벤트 파싱", path: "contents/MES/diagrams/process_1_details.html", mode: "iframe" },
                            { title: "Process 2.0 상세: 실시간 특징 추출 엔진", path: "contents/MES/diagrams/process_2_details.html", mode: "iframe" },
                            { title: "Process 3.0 상세: 기하/통계적 이상치 필터", path: "contents/MES/diagrams/process_3_details.html", mode: "iframe" },
                            { title: "Process 4.0 상세: OEE 및 효율 산출 계산", path: "contents/MES/diagrams/process_4_details.html", mode: "iframe" }
                        ]
                    },
                    {
                        title: "알고리즘 상세 흐름도",
                        children: [
                            { title: "Chan 볼록 껍질 알고리즘 흐름도", path: "contents/MES/diagrams/chan_algorithm_flow.html", mode: "iframe" },
                            { title: "KLL Sketch 데이터 압축 루프 흐름도", path: "contents/MES/diagrams/kll_compaction_flow.html", mode: "iframe" },
                            { title: "분위수 및 통계 비동기 질의 흐름도", path: "contents/MES/diagrams/asynchronous_query.html", mode: "iframe" }
                        ]
                    },
                    { title: "OEE 실시간 DFD", path: "contents/MES/diagrams/oee_realtime_dfd.html", mode: "iframe" },
                    { title: "OEE 설비종합효율", path: "contents/oee.html" },
                    { title: "데이터베이스", path: "contents/database.html" }
                ]
            }
        ]
    },
    {
        title: "System Hazard",
        items: [
            { title: "시스템 해저드 통합본", path: "contents/systemhazard/index.html", mode: "iframe" },
            { title: "조직문화와 시스템 해저드", path: "contents/systemhazard_orgculture/index.html", mode: "iframe" }
        ]
    },
    {
        title: "Developer / Infra",
        items: [
            { title: "개발 경험", path: "contents/developer.html" },
            { title: "Git Guide", path: "contents/git_guide.html", mode: "iframe" },
            { title: "WSL Network Guide", path: "contents/wsl_network_guide.html", mode: "iframe" },
            {
                title: "MES Developer Education",
                children: [
                    { title: "MES 개발자 양성 교육", path: "contents/MES_Developer/MES_Developer_Education.html" },
                    { title: "MES 관련 표준 및 웹사이트", path: "contents/MES_Developer/MES_Website.html" },
                    { title: "개발 도구 설치 및 학습 가이드", path: "contents/MES_Developer/Tool_install.html", mode: "iframe" },
                    { title: "스마트 MES 제조실행 및 개발 시스템", path: "contents/MES_Developer/MES_Guide_UI_test.html", mode: "iframe" },
                    { title: "Excel VBA MES 개발자 매뉴얼 & 코드북", path: "contents/MES_Developer/Manual/index.html", mode: "iframe" }
                ]
            }
        ]
    },
    {
        title: "Nextcloud",
        items: [
            {
                title: "운영 문서",
                children: [
                    { title: "Android Nextcloud", path: "contents/nextcloud/androidnextcloud.html", mode: "iframe" },
                    { title: "SSL 인증서 / HTTPS", path: "contents/nextcloud/cert.html", mode: "iframe" },
                    { title: "Nextcloud HDD 연결", path: "contents/nextcloud/storage-guide.html", mode: "iframe" }
                ]
            },
            {
                title: "Scripts",
                children: [
                    { title: "full-setup.sh", path: "contents/nextcloud/full-setup.sh" },
                    { title: "full-unsetup.sh", path: "contents/nextcloud/full-unsetup.sh" },
                    { title: "termuxbackup.sh", path: "contents/nextcloud/termuxbackup.sh" },
                    { title: "termuxrestore.sh", path: "contents/nextcloud/termuxrestore.sh" }
                ]
            }
        ]
    }
];

window.SITE_MENU_CONFIG = SITE_MENU_CONFIG;
