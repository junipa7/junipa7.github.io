const iframeItem = (title, path) => ({ title, path, mode: "iframe" });
const htmlItem = (title, path) => ({ title, path });
const standardItem = (title, id) => iframeItem(title, `SEMI_Interactive_Guide/standards/${id}.html`);
const mesaSmartItem = (title, folder, id) => iframeItem(title, `contents/MES/mesa/${folder}/${id}.html`);
const isa95ActivityItem = (title, id) => iframeItem(title, `contents/MES/isa95/activities/${id}.html`);
const isa95ModelItem = (title, id) => iframeItem(title, `contents/MES/isa95/models/${id}.html`);

const semiStandards = {
    title: "SEMI Standards",
    children: [
        iframeItem("SEMI Guide Overview", "SEMI_Interactive_Guide/SEMI_Data_Flow_Main.html"),
        {
            title: "SECS/GEM 기본",
            children: [
                iframeItem("SECS/GEM Guide Overview", "SEMI_Interactive_Guide/standards/SECS_GEM_Guide_Overview.html"),
                standardItem("SEMI E4 - SECS-I", "E4"),
                standardItem("SEMI E5 - SECS-II", "E5"),
                standardItem("SEMI E37 - HSMS", "E37"),
                standardItem("SEMI E30 - GEM", "E30")
            ]
        },
        {
            title: "GEM300 생산 실행",
            children: [
                iframeItem("GEM300 Production Overview", "SEMI_Interactive_Guide/standards/GEM300_Production_Overview.html"),
                standardItem("GEM300", "GEM300"),
                standardItem("SEMI E39 - Object Services", "E39"),
                standardItem("SEMI E40 - Processing Job", "E40"),
                standardItem("SEMI E87 - Carrier Management", "E87"),
                standardItem("SEMI E90 - Substrate Tracking", "E90"),
                standardItem("SEMI E94 - Control Job", "E94")
            ]
        },
        {
            title: "EDA / Interface A",
            children: [
                iframeItem("EDA / Interface A Overview", "SEMI_Interactive_Guide/standards/EDA_Interface_A_Overview.html"),
                standardItem("SEMI E120 - Common Equipment Model", "E120"),
                standardItem("SEMI E125 - Equipment Data Acquisition", "E125"),
                standardItem("SEMI E132 - Client Authentication", "E132"),
                standardItem("SEMI E133 - Automated EDA Interface", "E133"),
                standardItem("SEMI E134 - Data Collection Management", "E134"),
                standardItem("SEMI E151 - EDA Client Guide", "E151"),
                standardItem("SEMI E160 - Data Quality", "E160"),
                standardItem("SEMI E164 - Common Metadata", "E164")
            ]
        },
        {
            title: "Data Dictionary / Productivity / Security",
            children: [
                iframeItem("Data Dictionary / Productivity / Security Overview", "SEMI_Interactive_Guide/standards/Data_Productivity_Security_Overview.html"),
                standardItem("SEMI E10 - RAM", "E10"),
                standardItem("SEMI E116 - Performance Tracking", "E116"),
                standardItem("SEMI E172 - SECS Equipment Data Dictionary", "E172"),
                standardItem("SEMI E173 - XML SECS-II Message Notation", "E173"),
                standardItem("SEMI E187 - Equipment Cybersecurity", "E187")
            ]
        },
        {
            title: "Streaming Algorithm",
            children: [
                iframeItem("Chan Algorithm", "SEMI_Interactive_Guide/algorithms/Chan.html"),
                iframeItem("KLL Sketch", "SEMI_Interactive_Guide/algorithms/KLL.html")
            ]
        },
        iframeItem("SEMI E10 Legacy Guide", "SEMI_Interactive_Guide/SEMI_E10_Guide.html")
    ]
};

const mesaSmartModel = {
    title: "MESA Smart Manufacturing",
    children: [
        iframeItem("MESA Smart Manufacturing Overview", "contents/MES/mesa/MESA_MES_Overview.html"),
        {
            title: "Lifecycles",
            children: [
                mesaSmartItem("생산 라이프사이클", "lifecycles", "production"),
                mesaSmartItem("생산 자산 라이프사이클", "lifecycles", "production-asset"),
                mesaSmartItem("제품 라이프사이클", "lifecycles", "product"),
                mesaSmartItem("공급망 라이프사이클", "lifecycles", "supply-chain"),
                mesaSmartItem("인력 라이프사이클", "lifecycles", "workforce"),
                mesaSmartItem("주문-현금화 라이프사이클", "lifecycles", "order-to-cash")
            ]
        },
        {
            title: "Cross-Lifecycle Threads",
            children: [
                mesaSmartItem("품질 스레드", "threads", "quality"),
                mesaSmartItem("컴플라이언스 스레드", "threads", "compliance"),
                mesaSmartItem("지속가능성 스레드", "threads", "sustainability"),
                mesaSmartItem("분석 스레드", "threads", "analytics"),
                mesaSmartItem("보안 스레드", "threads", "security"),
                mesaSmartItem("디지털 트윈/스레드", "threads", "digital-twin-thread"),
                mesaSmartItem("모델링/시뮬레이션 스레드", "threads", "modeling-simulation")
            ]
        },
        {
            title: "Enabling Technologies",
            children: [
                mesaSmartItem("IIoT", "technologies", "iiot"),
                mesaSmartItem("Big Data", "technologies", "big-data"),
                mesaSmartItem("AI / ML", "technologies", "ai-ml"),
                mesaSmartItem("VR / AR", "technologies", "vr-ar"),
                mesaSmartItem("Edge to Cloud", "technologies", "edge-to-cloud"),
                mesaSmartItem("Blockchain", "technologies", "blockchain"),
                mesaSmartItem("Additive", "technologies", "additive"),
                mesaSmartItem("Robotics", "technologies", "robotics"),
                mesaSmartItem("Wireless", "technologies", "wireless")
            ]
        },
        {
            title: "MESA MES Legacy Functions",
            children: [
                iframeItem("자원 할당 및 상태 관리", "contents/MES/mesa/functions/resource-allocation-status.html"),
                iframeItem("상세 생산 스케줄링", "contents/MES/mesa/functions/operations-detail-scheduling.html"),
                iframeItem("작업 단위 디스패칭", "contents/MES/mesa/functions/dispatching-production-units.html"),
                iframeItem("문서 및 작업표준 관리", "contents/MES/mesa/functions/document-control.html"),
                iframeItem("데이터 수집 및 취득", "contents/MES/mesa/functions/data-collection-acquisition.html"),
                iframeItem("작업자 및 인력 관리", "contents/MES/mesa/functions/labor-management.html"),
                iframeItem("품질 관리", "contents/MES/mesa/functions/quality-management.html"),
                iframeItem("공정 관리", "contents/MES/mesa/functions/process-management.html"),
                iframeItem("설비 보전 관리", "contents/MES/mesa/functions/maintenance-management.html"),
                iframeItem("제품 추적 및 계보", "contents/MES/mesa/functions/product-tracking-genealogy.html"),
                iframeItem("성과 분석", "contents/MES/mesa/functions/performance-analysis.html")
            ]
        }
    ]
};

const isa95Standard = {
    title: "ANSI/ISA-95 Standard",
    children: [
        iframeItem("ISA-95 MES Model Overview", "contents/MES/isa95/ISA95_MES_Overview.html"),
        {
            title: "Activity Models",
            children: [
                {
                    title: "Production Operations",
                    children: [
                        isa95ActivityItem("정의 관리", "production-definition-management"),
                        isa95ActivityItem("자원 관리", "production-resource-management"),
                        isa95ActivityItem("상세 스케줄링", "production-detailed-scheduling"),
                        isa95ActivityItem("디스패칭", "production-dispatching"),
                        isa95ActivityItem("실행 관리", "production-execution-management"),
                        isa95ActivityItem("데이터 수집", "production-data-collection"),
                        isa95ActivityItem("추적", "production-tracking"),
                        isa95ActivityItem("성과 분석", "production-performance-analysis")
                    ]
                },
                {
                    title: "Maintenance Operations",
                    children: [
                        isa95ActivityItem("정의 관리", "maintenance-definition-management"),
                        isa95ActivityItem("자원 관리", "maintenance-resource-management"),
                        isa95ActivityItem("상세 스케줄링", "maintenance-detailed-scheduling"),
                        isa95ActivityItem("디스패칭", "maintenance-dispatching"),
                        isa95ActivityItem("실행 관리", "maintenance-execution-management"),
                        isa95ActivityItem("데이터 수집", "maintenance-data-collection"),
                        isa95ActivityItem("추적", "maintenance-tracking"),
                        isa95ActivityItem("성과 분석", "maintenance-performance-analysis")
                    ]
                },
                {
                    title: "Quality Operations",
                    children: [
                        isa95ActivityItem("정의 관리", "quality-definition-management"),
                        isa95ActivityItem("자원 관리", "quality-resource-management"),
                        isa95ActivityItem("상세 스케줄링", "quality-detailed-scheduling"),
                        isa95ActivityItem("디스패칭", "quality-dispatching"),
                        isa95ActivityItem("실행 관리", "quality-execution-management"),
                        isa95ActivityItem("데이터 수집", "quality-data-collection"),
                        isa95ActivityItem("추적", "quality-tracking"),
                        isa95ActivityItem("성과 분석", "quality-performance-analysis")
                    ]
                },
                {
                    title: "Inventory Operations",
                    children: [
                        isa95ActivityItem("정의 관리", "inventory-definition-management"),
                        isa95ActivityItem("자원 관리", "inventory-resource-management"),
                        isa95ActivityItem("상세 스케줄링", "inventory-detailed-scheduling"),
                        isa95ActivityItem("디스패칭", "inventory-dispatching"),
                        isa95ActivityItem("실행 관리", "inventory-execution-management"),
                        isa95ActivityItem("데이터 수집", "inventory-data-collection"),
                        isa95ActivityItem("추적", "inventory-tracking"),
                        isa95ActivityItem("성과 분석", "inventory-performance-analysis")
                    ]
                }
            ]
        },
        {
            title: "Object / Hierarchy Models",
            children: [
                isa95ModelItem("기능 계층 모델", "functional-hierarchy-model"),
                isa95ModelItem("설비 계층 모델", "equipment-hierarchy-model"),
                isa95ModelItem("인력 모델", "personnel-model"),
                isa95ModelItem("설비 모델", "equipment-model"),
                isa95ModelItem("물리 자산 모델", "physical-asset-model"),
                isa95ModelItem("자재 모델", "material-model"),
                isa95ModelItem("공정 세그먼트 모델", "process-segment-model"),
                isa95ModelItem("운영 정의 모델", "operations-definition-model"),
                isa95ModelItem("운영 능력 모델", "operations-capability-model"),
                isa95ModelItem("운영 스케줄 모델", "operations-schedule-model"),
                isa95ModelItem("운영 성과 모델", "operations-performance-model"),
                isa95ModelItem("통합 객체 모델", "integration-object-model")
            ]
        }
    ]
};

const mesDiagrams = {
    title: "MES 실시간 DFD / 아키텍처",
    children: [
        iframeItem("전체 아키텍처 개요 DFD (Level 0)", "contents/MES/diagrams/dfd_level_0.html"),
        iframeItem("SEMI E10 장비 상태 트리", "contents/MES/diagrams/e10_ram_states.html"),
        iframeItem("실시간 데이터 수집 및 EES 스트림 분배", "contents/MES/diagrams/stream_storage.html"),
        iframeItem("Process 1.0 상세: SECS/GEM 이벤트 파싱", "contents/MES/diagrams/process_1_details.html"),
        iframeItem("Process 2.0 상세: 실시간 특징 추출 엔진", "contents/MES/diagrams/process_2_details.html"),
        iframeItem("Process 3.0 상세: 기하/통계적 이상치 필터", "contents/MES/diagrams/process_3_details.html"),
        iframeItem("Process 4.0 상세: OEE 및 효율 산출 계산", "contents/MES/diagrams/process_4_details.html")
    ]
};

const algorithmFlowcharts = {
    title: "알고리즘 상세 흐름도",
    children: [
        iframeItem("Chan 볼록 껍질 알고리즘 흐름도", "contents/MES/diagrams/chan_algorithm_flow.html"),
        iframeItem("KLL Sketch 데이터 압축 루프 흐름도", "contents/MES/diagrams/kll_compaction_flow.html"),
        iframeItem("분위수 및 통계 비동기 질의 흐름도", "contents/MES/diagrams/asynchronous_query.html")
    ]
};

const menuConfig = [
    {
        title: "소개",
        items: [
            { title: "About Me", path: "contents/about.html", active: true },
            htmlItem("교육 이력", "contents/education.html"),
            htmlItem("기타 활동", "contents/other.html"),
            iframeItem("워런 버핏의 조언", "contents/Life_Advice/lessons_from_warren_buffett.html")
        ]
    },
    {
        title: "MES / Analytics",
        items: [
            iframeItem("SEMI · MESA · ISA-95 관계 정의", "contents/MES/semi-mesa-isa95-relationship.html"),
            htmlItem("AI 포함 4-Tier MES 개발 가이드", "contents/MES/ai-4tier-mes.html"),
            semiStandards,
            mesaSmartModel,
            isa95Standard,
            {
                title: "MES 분석 / 참고 문서",
                children: [
                    htmlItem("Chan Algorithm과 KLL Sketch", "contents/MES/chankll.html"),
                    mesDiagrams,
                    algorithmFlowcharts,
                    iframeItem("OEE 실시간 DFD (High-Level)", "contents/MES/diagrams/oee_realtime_dfd.html"),
                    htmlItem("OEE 설비종합효율", "contents/oee.html"),
                    htmlItem("데이터베이스", "contents/database.html")
                ]
            }
        ]
    },
    {
        title: "System Hazard",
        items: [
            iframeItem("시스템 해저드 통합본", "contents/systemhazard/index.html"),
            iframeItem("조직문화와 시스템 해저드", "contents/systemhazard_orgculture/index.html")
        ]
    },
    {
        title: "Developer / Infra",
        items: [
            htmlItem("개발 경험", "contents/developer.html"),
            iframeItem("Git Guide", "contents/git_guide.html"),
            iframeItem("WSL Network Guide", "contents/wsl_network_guide.html")
        ]
    },
    {
        title: "Nextcloud",
        items: [
            {
                title: "운영 문서",
                children: [
                    iframeItem("Android Nextcloud", "contents/nextcloud/androidnextcloud.html"),
                    iframeItem("SSL 인증서 / HTTPS", "contents/nextcloud/cert.html"),
                    iframeItem("Nextcloud HDD 연결", "contents/nextcloud/storage-guide.html")
                ]
            },
            {
                title: "Scripts",
                children: [
                    htmlItem("full-setup.sh", "contents/nextcloud/full-setup.sh"),
                    htmlItem("full-unsetup.sh", "contents/nextcloud/full-unsetup.sh"),
                    htmlItem("termuxbackup.sh", "contents/nextcloud/termuxbackup.sh"),
                    htmlItem("termuxrestore.sh", "contents/nextcloud/termuxrestore.sh")
                ]
            }
        ]
    }
];

const menuRoot = document.getElementById("menu-root");
const editorContent = document.getElementById("editor-content");
const currentTab = document.getElementById("current-tab");
const themeToggle = document.getElementById("theme-toggle");
const collapseAll = document.getElementById("collapse-all");
const previewTabs = document.getElementById("preview-tabs");
const openTabs = [];
let activeTabKey = "";
let tabSequence = 0;

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function extensionOf(path) {
    const cleanPath = path.split("#")[0].split("?")[0];
    const match = cleanPath.toLowerCase().match(/\.([a-z0-9]+)$/);
    return match ? match[1] : "";
}

function createItem(item, depth = 0) {
    if (item.children) {
        const group = document.createElement("div");
        group.className = `submenu depth-${depth}`;
        const button = document.createElement("button");
        button.className = `submenu-toggle depth-${depth}`;
        button.type = "button";
        button.setAttribute("aria-expanded", "true");
        button.textContent = item.title;
        const body = document.createElement("div");
        body.className = "submenu-items";
        item.children.forEach(child => body.appendChild(createItem(child, depth + 1)));
        button.addEventListener("click", () => toggleContainer(group, button));
        group.append(button, body);
        return group;
    }

    const button = document.createElement("button");
    button.className = `file-item depth-${depth}`;
    button.type = "button";
    button.dataset.path = item.path;
    button.dataset.mode = item.mode || "auto";
    button.textContent = item.title;
    if (item.active) button.classList.add("active");
    button.addEventListener("click", () => activateItem(button));
    return button;
}

function toggleContainer(container, button) {
    const collapsed = container.classList.toggle("collapsed");
    button.setAttribute("aria-expanded", String(!collapsed));
}

function renderMenu() {
    menuRoot.innerHTML = "";
    menuConfig.forEach(section => {
        const sectionEl = document.createElement("section");
        sectionEl.className = "menu-section";
        const button = document.createElement("button");
        button.className = "section-toggle";
        button.type = "button";
        button.setAttribute("aria-expanded", "true");
        button.textContent = section.title;
        const body = document.createElement("div");
        body.className = "section-items";
        section.items.forEach(item => body.appendChild(createItem(item, 0)));
        button.addEventListener("click", () => toggleContainer(sectionEl, button));
        sectionEl.append(button, body);
        menuRoot.appendChild(sectionEl);
    });
}

function tabKey(path, mode = "auto") {
    return `${mode || "auto"}::${path}`;
}

function resizeContentIframe(iframe) {
    try {
        iframe.style.height = `${iframe.contentWindow.document.documentElement.scrollHeight + 30}px`;
        iframe.contentWindow.document.body.classList.toggle("dark-mode", document.body.classList.contains("dark-mode"));
        attachIframeLinkHandler(iframe);
    } catch (error) {
        iframe.style.height = "80vh";
    }
}

function relativePathFromUrl(url) {
    const parsed = new URL(url, window.location.href);
    if (parsed.origin !== window.location.origin) return "";
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, "")) + parsed.search + parsed.hash;
}

function titleFromLink(link, path) {
    return link.querySelector("strong")?.textContent?.trim() || link.textContent.trim() || path.split("/").pop();
}

function attachIframeLinkHandler(iframe) {
    const doc = iframe.contentWindow?.document;
    if (!doc || doc.body.dataset.parentTabsAttached === "true") return;
    doc.body.dataset.parentTabsAttached = "true";

    doc.addEventListener("click", event => {
        const link = event.target.closest?.("a[href]");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

        const path = relativePathFromUrl(link.href);
        if (!path) return;

        event.preventDefault();
        openPreviewPath(titleFromLink(link, path), path, "iframe");
    });
}

function renderPreviewTabs() {
    previewTabs.innerHTML = "";
    openTabs.forEach(tab => {
        const button = document.createElement("div");
        button.className = `preview-tab${tab.key === activeTabKey ? " active" : ""}`;
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", String(tab.key === activeTabKey));
        button.tabIndex = 0;
        button.title = tab.title;

        const title = document.createElement("span");
        title.className = "preview-tab-title";
        title.textContent = tab.title;

        const close = document.createElement("button");
        close.className = "preview-tab-close";
        close.type = "button";
        close.setAttribute("aria-label", `${tab.title} 닫기`);
        close.textContent = "x";

        button.addEventListener("click", () => focusPreviewTab(tab.key));
        button.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                focusPreviewTab(tab.key);
            }
        });
        close.addEventListener("click", event => {
            event.stopPropagation();
            closePreviewTab(tab.key);
        });

        button.append(title, close);
        previewTabs.appendChild(button);
    });
}

function focusPreviewTab(key) {
    const tab = openTabs.find(item => item.key === key);
    if (!tab) return;

    activeTabKey = key;
    currentTab.textContent = tab.title;
    document.querySelectorAll(".file-item.active").forEach(item => item.classList.remove("active"));
    if (tab.button?.isConnected) tab.button.classList.add("active");

    openTabs.forEach(item => item.panel.classList.toggle("active", item.key === key));
    renderPreviewTabs();
}

function closePreviewTab(key) {
    const index = openTabs.findIndex(tab => tab.key === key);
    if (index < 0) return;

    const [closed] = openTabs.splice(index, 1);
    closed.panel.remove();

    if (activeTabKey === key) {
        const nextTab = openTabs[index] || openTabs[index - 1];
        if (nextTab) {
            focusPreviewTab(nextTab.key);
        } else {
            activeTabKey = "";
            currentTab.textContent = "Preview";
            document.querySelectorAll(".file-item.active").forEach(item => item.classList.remove("active"));
            renderPreviewTabs();
        }
        return;
    }

    renderPreviewTabs();
}

function openPreviewTab(button) {
    const path = button.dataset.path;
    const mode = button.dataset.mode || "auto";
    openPreviewPath(button.textContent, path, mode, button);
}

function openPreviewPath(title, path, mode = "auto", button = null) {
    const key = tabKey(path, mode);
    let tab = openTabs.find(item => item.key === key);

    if (!tab) {
        const panel = document.createElement("div");
        panel.className = "tab-panel";
        panel.id = `preview-panel-${++tabSequence}`;
        editorContent.appendChild(panel);

        tab = { key, title, path, mode, button, panel };
        openTabs.push(tab);
        loadContent(path, mode, panel);
    } else {
        tab.title = title;
        tab.button = button;
    }

    focusPreviewTab(key);
}

async function loadContent(path, mode = "auto", target = editorContent) {
    try {
        editorContent.scrollTop = 0;

        if (mode === "iframe") {
            target.innerHTML = `<iframe class="content-frame" src="${path}" title="${escapeHtml(path)}" scrolling="no" onload="resizeContentIframe(this)"></iframe>`;
            return;
        }

        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const text = await response.text();
        const ext = extensionOf(path);
        if (ext === "html" || ext === "htm") {
            target.innerHTML = text;
            if (window.MathJax && typeof MathJax.typesetPromise === "function") {
                MathJax.typesetPromise([target]).catch(err => console.log(`MathJax typeset failed: ${err.message}`));
            }
            return;
        }

        target.innerHTML = `
            <div class="box box-primary">
                <span class="box-title">${escapeHtml(path)}</span>
                <p>텍스트 파일로 표시 중입니다.</p>
            </div>
            <div class="code-wrapper">
                <button class="copy-btn">복사</button>
                <pre><code>${escapeHtml(text)}</code></pre>
            </div>`;
    } catch (error) {
        console.error("콘텐츠 로드 오류:", error);
        target.innerHTML = `
            <div class="box box-danger">
                <h3>콘텐츠를 불러올 수 없습니다.</h3>
                <p><b>대상:</b> ${escapeHtml(path)}</p>
                <p><b>원인:</b> ${escapeHtml(error.message)}</p>
                <p>Live Server 또는 로컬 웹 서버에서 열었는지 확인해 주세요.</p>
            </div>`;
    }
}

function activateItem(button) {
    let parent = button.parentElement;
    while (parent) {
        if (parent.classList?.contains("collapsed")) {
            parent.classList.remove("collapsed");
            const toggle = parent.querySelector(":scope > .section-toggle, :scope > .submenu-toggle");
            if (toggle) toggle.setAttribute("aria-expanded", "true");
        }
        parent = parent.parentElement;
    }

    openPreviewTab(button);
}

function setAllCollapsed(collapsed) {
    document.querySelectorAll(".menu-section, .submenu").forEach(container => {
        container.classList.toggle("collapsed", collapsed);
        const toggle = container.querySelector(":scope > .section-toggle, :scope > .submenu-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", String(!collapsed));
    });
    collapseAll.textContent = collapsed ? "펼치기" : "접기";
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");
        themeToggle.textContent = isDark ? "Light" : "Dark";
        
        editorContent.querySelectorAll("iframe").forEach(iframe => resizeContentIframe(iframe));
    });
}

let isMenuCollapsed = true;
if (collapseAll) {
    collapseAll.addEventListener("click", () => {
        isMenuCollapsed = !isMenuCollapsed;
        setAllCollapsed(isMenuCollapsed);
    });
}

function updateClock() {
    const clockElement = document.getElementById("clock");
    if (clockElement) {
        clockElement.textContent = new Date().toLocaleTimeString("ko-KR", { hour12: false });
    }
}

renderMenu();
setAllCollapsed(isMenuCollapsed);
setInterval(updateClock, 1000);
updateClock();

const initialItem = document.querySelector(".file-item.active") || document.querySelector(".file-item");
if (initialItem) activateItem(initialItem);

editorContent.addEventListener("click", async e => {
    if (!e.target.classList.contains("copy-btn")) return;
    const button = e.target;
    const codeBlock = button.parentElement.querySelector("pre");
    if (!codeBlock) return;

    try {
        await navigator.clipboard.writeText(codeBlock.innerText);
        const originalText = button.innerText;
        button.innerText = "복사 완료";
        button.classList.add("copied");
        setTimeout(() => {
            button.innerText = originalText;
            button.classList.remove("copied");
        }, 1800);
    } catch (err) {
        console.error("복사 실패:", err);
        alert("클립보드 복사에 실패했습니다.");
    }
});
