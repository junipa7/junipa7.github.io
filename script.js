const menuConfig = [
    {
        title: "소개",
        items: [
            { title: "About Me", path: "contents/about.html", active: true },
            { title: "교육 이력", path: "contents/education.html" },
            { title: "기타 활동", path: "contents/other.html" }
        ]
    },
    {
        title: "SEMI Interactive Guide",
        items: [
            { title: "Guide Overview", path: "SEMI_Interactive_Guide/SEMI_Data_Flow_Main.html", mode: "iframe" },
            {
                title: "표준별 Guide",
                children: [
                    ["SEMI E5 - SECS-II", "E5"], ["SEMI E37 - HSMS", "E37"], ["SEMI E30 - GEM", "E30"], ["GEM300", "GEM300"],
                    ["SEMI E39 - Object Services", "E39"], ["SEMI E40 - Processing Management", "E40"], ["SEMI E87 - Carrier Management", "E87"],
                    ["SEMI E90 - Substrate Tracking", "E90"], ["SEMI E94 - Control Job", "E94"], ["SEMI E116 - Performance Tracking", "E116"],
                    ["SEMI E120 - Common Equipment Model", "E120"], ["SEMI E125 - Self Description", "E125"], ["SEMI E132 - Authentication", "E132"],
                    ["SEMI E134 - Data Collection", "E134"], ["SEMI E164 - Common Metadata", "E164"], ["SEMI E172 - Data Dictionary", "E172"],
                    ["SEMI E173 - XML SECS-II", "E173"], ["SEMI E187 - Cybersecurity", "E187"], ["SEMI E10 - RAM", "E10"],
                    ["SEMI E151 - Data Quality", "E151"], ["SEMI E160 - Data Quality Communication", "E160"], ["SEMI E133 - APC Interface", "E133"]
                ].map(([title, id]) => ({ title, path: `SEMI_Interactive_Guide/standards/${id}.html`, mode: "iframe" }))
            },
            { title: "SEMI E10 기존 Guide", path: "SEMI_Interactive_Guide/SEMI_E10_Guide.html", mode: "iframe" }
        ]
    },
    {
        title: "SEMI Interactive Developer",
        items: [
            { title: "Developer Overview", path: "SEMI_Interactive_Developer/SEMI_Data_Flow_Developer.html", mode: "iframe" },
            {
                title: "표준별 Developer",
                children: [
                    "E5", "E37", "E30", "GEM300", "E39", "E40", "E87", "E90", "E94", "E116", "E120", "E125", "E132", "E134", "E164", "E172", "E173", "E187", "E10", "E151", "E160", "E133"
                ].map(id => ({ title: `${id} 개발 참고`, path: `SEMI_Interactive_Developer/standards/${id}.html`, mode: "iframe" }))
            },
            {
                title: "Streaming Algorithm",
                children: [
                    { title: "Chan 알고리즘", path: "SEMI_Interactive_Developer/algorithms/Chan.html", mode: "iframe" },
                    { title: "KLL Sketch", path: "SEMI_Interactive_Developer/algorithms/KLL.html", mode: "iframe" }
                ]
            }
        ]
    },
    {
        title: "MES / Analytics",
        items: [
            { title: "MES 로드맵", path: "contents/mes.html" },
            {
                title: "MESA 기반 MES 기능",
                children: [
                    { title: "MESA MES 기능 Overview", path: "contents/MES/mesa/MESA_MES_Overview.html", mode: "iframe" },
                    { title: "자원 할당 및 상태 관리", path: "contents/MES/mesa/functions/resource-allocation-status.html", mode: "iframe" },
                    { title: "상세 생산 스케줄링", path: "contents/MES/mesa/functions/operations-detail-scheduling.html", mode: "iframe" },
                    { title: "작업 단위 디스패칭", path: "contents/MES/mesa/functions/dispatching-production-units.html", mode: "iframe" },
                    { title: "문서 및 작업표준 관리", path: "contents/MES/mesa/functions/document-control.html", mode: "iframe" },
                    { title: "데이터 수집", path: "contents/MES/mesa/functions/data-collection-acquisition.html", mode: "iframe" },
                    { title: "작업자 및 노무 관리", path: "contents/MES/mesa/functions/labor-management.html", mode: "iframe" },
                    { title: "품질 관리", path: "contents/MES/mesa/functions/quality-management.html", mode: "iframe" },
                    { title: "공정 관리", path: "contents/MES/mesa/functions/process-management.html", mode: "iframe" },
                    { title: "설비 보전 관리", path: "contents/MES/mesa/functions/maintenance-management.html", mode: "iframe" },
                    { title: "제품 추적 및 계보", path: "contents/MES/mesa/functions/product-tracking-genealogy.html", mode: "iframe" },
                    { title: "성과 분석", path: "contents/MES/mesa/functions/performance-analysis.html", mode: "iframe" }
                ]
            },
            {
                title: "세부 문서",
                children: [
                    { title: "Chan 알고리즘과 KLL 스케치", path: "contents/MES/chankll.html" },
                    { title: "MES Draw.io XML", path: "contents/MES/drawio.xml" },
                    { title: "OEE Diagram XML", path: "contentsOEE_Diagram.xml" },
                    { title: "Chan/KLL 원본 메모", path: "contents/chankll.txt" }
                ]
            },
            { title: "OEE 설비종합효율", path: "contents/oee.html" },
            { title: "데이터베이스", path: "contents/database.html" }
        ]
    },
    {
        title: "System Hazard",
        items: [
            { title: "시스템 해저드 메인", path: "contents/systemhazard.html" },
            {
                title: "Part 문서",
                children: [
                    { title: "Hazard Index", path: "contents/systemhazard/hazardindex.html" },
                    { title: "Part 1. 개념", path: "contents/systemhazard/part1concept.html" },
                    { title: "Part 2. 원인", path: "contents/systemhazard/part2causes.html" },
                    { title: "Part 3. 사례", path: "contents/systemhazard/part3cases.html" },
                    { title: "Part 4. 영향", path: "contents/systemhazard/part4impact.html" },
                    { title: "Part 5. 전략", path: "contents/systemhazard/part5strategy.html" },
                    { title: "Part 6. 방법론", path: "contents/systemhazard/part6methodology.html" },
                    { title: "Part 7. 적용", path: "contents/systemhazard/part7application.html" }
                ]
            },
            { title: "조직문화와 시스템 해저드", path: "contents/systemhazard_orgculture/index.html", mode: "iframe" }
        ]
    },
    {
        title: "Developer / Infra",
        items: [
            { title: "개발 경험", path: "contents/developer.html" },
            { title: "Git Guide", path: "contents/git_guide.html" },
            { title: "WSL Network Guide", path: "contents/wsl_network_guide.html" }
        ]
    },
    {
        title: "Nextcloud",
        items: [
            {
                title: "운영 문서",
                children: [
                    { title: "Android Nextcloud", path: "contents/nextcloud/androidnextcloud.html" },
                    { title: "SSL 인증서 HTTPS", path: "contents/nextcloud/cert.html" },
                    { title: "Nextcloud HDD 연결", path: "contents/nextcloud/storage-guide.html" }
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

const menuRoot = document.getElementById("menu-root");
const editorContent = document.getElementById("editor-content");
const currentTab = document.getElementById("current-tab");
const themeToggle = document.getElementById("theme-toggle");
const collapseAll = document.getElementById("collapse-all");

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
        button.className = "submenu-toggle";
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

async function loadContent(path, mode = "auto") {
    try {
        editorContent.scrollTop = 0;

        if (mode === "iframe") {
            editorContent.innerHTML = `<iframe class="content-frame" src="${path}" title="${escapeHtml(path)}"></iframe>`;
            return;
        }

        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const text = await response.text();
        const ext = extensionOf(path);
        if (ext === "html" || ext === "htm") {
            editorContent.innerHTML = text;
            return;
        }

        editorContent.innerHTML = `
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
        editorContent.innerHTML = `
            <div class="box box-danger">
                <h3>콘텐츠를 불러올 수 없습니다.</h3>
                <p><b>대상:</b> ${escapeHtml(path)}</p>
                <p><b>원인:</b> ${escapeHtml(error.message)}</p>
                <p>Live Server 또는 로컬 웹 서버에서 열었는지 확인해 주세요.</p>
            </div>`;
    }
}

function activateItem(button) {
    document.querySelectorAll(".file-item.active").forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    let parent = button.parentElement;
    while (parent) {
        if (parent.classList?.contains("collapsed")) {
            parent.classList.remove("collapsed");
            const toggle = parent.querySelector(":scope > .section-toggle, :scope > .submenu-toggle");
            if (toggle) toggle.setAttribute("aria-expanded", "true");
        }
        parent = parent.parentElement;
    }

    currentTab.textContent = button.textContent;
    loadContent(button.dataset.path, button.dataset.mode || "auto");
}

function setAllCollapsed(collapsed) {
    document.querySelectorAll(".menu-section, .submenu").forEach(container => {
        container.classList.toggle("collapsed", collapsed);
        const toggle = container.querySelector(":scope > .section-toggle, :scope > .submenu-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", String(!collapsed));
    });
    collapseAll.textContent = collapsed ? "펼침" : "접기";
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        themeToggle.textContent = document.body.classList.contains("dark-mode") ? "Light" : "Dark";
    });
}

if (collapseAll) {
    let collapsed = false;
    collapseAll.addEventListener("click", () => {
        collapsed = !collapsed;
        setAllCollapsed(collapsed);
    });
}

function updateClock() {
    const clockElement = document.getElementById("clock");
    if (clockElement) {
        clockElement.textContent = new Date().toLocaleTimeString("ko-KR", { hour12: false });
    }
}

renderMenu();
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
