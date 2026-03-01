// 1. DOM 요소 선택
const fileItems = document.querySelectorAll('.file-item');
const editorContent = document.getElementById('editor-content');
const currentTab = document.getElementById('current-tab');
const themeToggle = document.getElementById('theme-toggle');

/**
 * 2. 외부 HTML 파일 로드 함수
 * @param {string} fileName - contents 폴더 내의 파일명
 */
async function loadContent(fileName) {
    try {
        // 로컬 보안 정책(CORS) 문제를 피하기 위해 가상 서버 환경 필요
        const response = await fetch(`contents/${fileName}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        editorContent.innerHTML = html;
        
        // 페이지 상단으로 스크롤 이동
        editorContent.scrollTop = 0;
    } catch (error) {
        console.error("콘텐츠 로드 중 오류 발생:", error);
        editorContent.innerHTML = `
            <div class="box" style="border-left-color: #e63946;">
                <h3 style="color: #e63946;">⚠️ 콘텐츠를 불러올 수 없습니다.</h3>
                <p><b>원인:</b> ${error.message}</p>
                <hr>
                <p>1. <b>contents/${fileName}</b> 파일이 존재하는지 확인하세요.</p>
                <p>2. 반드시 <b>Live Preview</b> 또는 <b>Live Server</b>로 실행해야 합니다.</p>
            </div>`;
    }
}

// 3. 메뉴 클릭 이벤트 설정
fileItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetFile = item.getAttribute('data-file');
        if (!targetFile) return;

        // 기존 active 클래스 제거 및 새 아이템에 추가
        const currentActive = document.querySelector('.file-item.active');
        if (currentActive) currentActive.classList.remove('active');
        item.classList.add('active');

        // 상단 탭 텍스트 업데이트
        currentTab.innerText = item.innerText;

        // 콘텐츠 로드
        loadContent(targetFile);
    });
});

// 4. 다크 모드 토글 기능
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.innerText = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
}

// 5. 실시간 시계 업데이트 (시각:분:초)
function updateClock() {
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        const now = new Date();
        clockElement.innerText = now.toLocaleTimeString('ko-KR', { hour12: false });
    }
}

// 6. 초기화 실행
setInterval(updateClock, 1000);
updateClock();

// 시작 시 기본 페이지(About Me) 로드
// 만약 index.html의 'active' 설정이 다른 파일이라면 해당 파일명으로 수정하세요.
loadContent('about.html');

// ==========================================
// 7. 코드 블록 복사 버튼 기능 (이벤트 위임)
// ==========================================
editorContent.addEventListener('click', async (e) => {
    // 클릭한 요소가 'copy-btn' 클래스를 가진 버튼일 경우에만 실행
    if (e.target.classList.contains('copy-btn')) {
        const button = e.target;
        // 버튼과 같은 부모(code-wrapper) 안에 있는 pre 태그(코드 내용)를 찾음
        const codeBlock = button.parentElement.querySelector('pre');
        
        if (!codeBlock) return;

        try {
            // 클립보드에 코드 텍스트 복사
            await navigator.clipboard.writeText(codeBlock.innerText);
            
            // 시각적 피드백 (버튼 텍스트 및 색상 변경)
            const originalText = button.innerText;
            button.innerText = '✅ 복사 완료';
            button.style.backgroundColor = '#27ae60';
            button.style.color = '#fff';
            
            // 2초 뒤에 원래 버튼 상태로 복구
            setTimeout(() => {
                button.innerText = originalText;
                button.style.backgroundColor = '#3e4451';
            }, 2000);
            
        } catch (err) {
            console.error('복사 실패:', err);
            alert('클립보드 복사에 실패했습니다.');
        }
    }
});