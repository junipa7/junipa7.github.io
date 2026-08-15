const menuRoot = document.getElementById("menu-root");
const editorContent = document.getElementById("editor-content");
const currentTab = document.getElementById("current-tab");
const themeToggle = document.getElementById("theme-toggle");
const collapseAll = document.getElementById("collapse-all");
const previewTabs = document.getElementById("preview-tabs");

const menuConfig = window.SITE_MENU_CONFIG || SITE_MENU_CONFIG;
const openTabs = [];
let activeTabKey = "";
let tabSequence = 0;
let isMenuCollapsed = true;

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

function tabKey(path, mode = "auto") {
    return `${mode || "auto"}::${path}`;
}

function createButton(className, text) {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.textContent = text;
    return button;
}

function createItem(item, depth = 0) {
    if (item.children) {
        const group = document.createElement("div");
        group.className = `submenu depth-${depth}`;
        const button = createButton(`submenu-toggle depth-${depth}`, item.title);
        button.setAttribute("aria-expanded", "true");

        const body = document.createElement("div");
        body.className = "submenu-items";
        item.children.forEach(child => body.appendChild(createItem(child, depth + 1)));

        button.addEventListener("click", () => toggleContainer(group, button));
        group.append(button, body);
        return group;
    }

    const button = createButton(`file-item depth-${depth}`, item.title);
    button.dataset.path = item.path;
    button.dataset.mode = item.mode || "auto";
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
        const button = createButton("section-toggle", section.title);
        button.setAttribute("aria-expanded", "true");

        const body = document.createElement("div");
        body.className = "section-items";
        section.items.forEach(item => body.appendChild(createItem(item)));

        button.addEventListener("click", () => toggleContainer(sectionEl, button));
        sectionEl.append(button, body);
        menuRoot.appendChild(sectionEl);
    });
}

function setAllCollapsed(collapsed) {
    document.querySelectorAll(".menu-section, .submenu").forEach(container => {
        container.classList.toggle("collapsed", collapsed);
        const toggle = container.querySelector(":scope > .section-toggle, :scope > .submenu-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", String(!collapsed));
    });
    collapseAll.textContent = collapsed ? "펼치기" : "접기";
    collapseAll.setAttribute("aria-pressed", String(!collapsed));
}

function expandParents(element) {
    let parent = element.parentElement;
    while (parent) {
        if (parent.classList?.contains("collapsed")) {
            parent.classList.remove("collapsed");
            const toggle = parent.querySelector(":scope > .section-toggle, :scope > .submenu-toggle");
            if (toggle) toggle.setAttribute("aria-expanded", "true");
        }
        parent = parent.parentElement;
    }
}

function activateItem(button) {
    expandParents(button);
    openPreviewPath(button.textContent, button.dataset.path, button.dataset.mode || "auto", button);
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

    if (activeTabKey !== key) {
        renderPreviewTabs();
        return;
    }

    const nextTab = openTabs[index] || openTabs[index - 1];
    if (nextTab) {
        focusPreviewTab(nextTab.key);
        return;
    }

    activeTabKey = "";
    currentTab.textContent = "Preview";
    document.querySelectorAll(".file-item.active").forEach(item => item.classList.remove("active"));
    renderPreviewTabs();
}

function renderPreviewTabs() {
    previewTabs.innerHTML = "";
    openTabs.forEach(tab => {
        const tabButton = createButton(`preview-tab${tab.key === activeTabKey ? " active" : ""}`, "");
        tabButton.setAttribute("role", "tab");
        tabButton.setAttribute("aria-selected", String(tab.key === activeTabKey));
        tabButton.tabIndex = 0;
        tabButton.title = tab.title;

        const title = document.createElement("span");
        title.className = "preview-tab-title";
        title.textContent = tab.title;

        const close = createButton("preview-tab-close", "×");
        close.setAttribute("aria-label", `${tab.title} 닫기`);

        tabButton.addEventListener("click", () => focusPreviewTab(tab.key));
        tabButton.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                focusPreviewTab(tab.key);
            }
        });
        close.addEventListener("click", event => {
            event.stopPropagation();
            closePreviewTab(tab.key);
        });

        tabButton.append(title, close);
        previewTabs.appendChild(tabButton);
    });
}

async function loadContent(path, mode = "auto", target = editorContent) {
    editorContent.scrollTop = 0;

    try {
        if (mode === "iframe") {
            target.innerHTML = `<iframe class="content-frame" src="${escapeHtml(path)}" title="${escapeHtml(path)}" scrolling="no"></iframe>`;
            const iframe = target.querySelector("iframe");
            iframe.addEventListener("load", () => resizeContentIframe(iframe));
            return;
        }

        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const text = await response.text();
        const ext = extensionOf(path);
        if (ext === "html" || ext === "htm") {
            target.innerHTML = text;
            typesetMath(target);
            return;
        }

        target.innerHTML = `
            <div class="box">
                <span class="box-title">${escapeHtml(path)}</span>
                <p>텍스트 파일로 표시 중입니다.</p>
            </div>
            <div class="code-wrapper">
                <button class="copy-btn" type="button">복사</button>
                <pre><code>${escapeHtml(text)}</code></pre>
            </div>`;
    } catch (error) {
        console.error("Content load failed:", error);
        target.innerHTML = `
            <div class="box box-danger">
                <h3>콘텐츠를 불러오지 못했습니다.</h3>
                <p><b>대상:</b> ${escapeHtml(path)}</p>
                <p><b>원인:</b> ${escapeHtml(error.message)}</p>
                <p>로컬 서버에서 열었는지, 파일 경로가 올바른지 확인해 주세요.</p>
            </div>`;
    }
}

function typesetMath(target) {
    if (window.MathJax && typeof MathJax.typesetPromise === "function") {
        MathJax.typesetPromise([target]).catch(error => console.log(`MathJax typeset failed: ${error.message}`));
    }
}

function resizeContentIframe(iframe) {
    try {
        const iframeDoc = iframe.contentWindow.document;
        iframe.style.height = `${iframeDoc.documentElement.scrollHeight + 30}px`;
        iframeDoc.body.classList.toggle("dark-mode", document.body.classList.contains("dark-mode"));
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

function updateThemeButton(isDark) {
    themeToggle.textContent = isDark ? "Light" : "Dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
}

function updateClock() {
    const clockElement = document.getElementById("clock");
    if (clockElement) {
        clockElement.textContent = new Date().toLocaleTimeString("ko-KR", { hour12: false });
    }
}

async function copyCode(button) {
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
    } catch (error) {
        console.error("Copy failed:", error);
        alert("클립보드 복사에 실패했습니다.");
    }
}

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    updateThemeButton(isDark);
    editorContent.querySelectorAll("iframe").forEach(iframe => resizeContentIframe(iframe));
});

collapseAll.addEventListener("click", () => {
    isMenuCollapsed = !isMenuCollapsed;
    setAllCollapsed(isMenuCollapsed);
});

editorContent.addEventListener("click", event => {
    if (event.target.classList.contains("copy-btn")) {
        copyCode(event.target);
    }
});

renderMenu();
setAllCollapsed(isMenuCollapsed);
updateThemeButton(false);
setInterval(updateClock, 1000);
updateClock();

const initialItem = document.querySelector(".file-item.active") || document.querySelector(".file-item");
if (initialItem) activateItem(initialItem);
