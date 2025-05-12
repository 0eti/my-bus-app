const mainContent = document.getElementById('main-content');
const notificationPopup = document.querySelector('.phone .notification');

const btnScan = document.getElementById('btn-scan');
const btnAlarm = document.getElementById('btn-alarm');
const btnSetting = document.getElementById('btn-setting');
const btnCharge = document.getElementById('btn-charge');
const btnMap = document.getElementById('btn-map');

let currentCharge = 0;
let notificationTimeout;

// --- 통영 401번 버스 노선 데이터 ---
const stops_401 = [
    "인평종점", "민양마을", "해양대종점", "인평주공아파트", "도천동주민센터",
    "해양과학대학", "당동노인정", "해저터널", "통영농협", "서호시장",
    "중앙시장", "토성고개", "북신오거리", "북신시장", "수아지오",
    "디지털프라자", "원문마을", "향교마을", "주영팰리스3차앞", "통영종합버스터미널"
];

// 정류장 목록 HTML 생성 함수
function createStopListHtml(stops) {
    return stops.map(stop => `<li data-stop="${stop}">${stop}</li>`).join('');
}

// 지도 정류장 표시 HTML 생성 함수 (일부만 표시하는 예시)
function createMapStopsHtml(stops, currentBusIndex = 5) {
    let html = '';
    const stopCount = stops.length;

    if (stopCount === 0) return '';

    html += `<div class="stop">${stops[0]}</div>`;

    if (currentBusIndex > 1) {
        html += `<div class="stop">...</div>`;
    }

    if (currentBusIndex > 0) {
        html += `<div class="stop">${stops[currentBusIndex - 1]}</div>`;
    }

    html += `<div class="bus">🚌 현재 위치 (${stops[currentBusIndex]})</div>`;

    if (currentBusIndex < stopCount - 1) {
        html += `<div class="stop">${stops[currentBusIndex + 1]}</div>`;
    }

    if (currentBusIndex < stopCount - 2) {
         html += `<div class="stop">...</div>`;
    }

    if (stopCount > 1 && stops[0] !== stops[stopCount - 1]) {
        html += `<div class="stop">${stops[stopCount - 1]}</div>`;
    } else if (stopCount > 1 && stops[0] === stops[stopCount -1] && currentBusIndex !== 0) {
         // 왕복 노선 등에서 시작/종점이 같을 경우, 버스가 시작점에 있지 않을 때만 종점 표시 (선택적)
    }

    return html;
}


// 푸시 알림 표시 함수
function showNotification(message) {
    if (notificationTimeout) clearTimeout(notificationTimeout);
    if (notificationPopup) {
        notificationPopup.textContent = message;
        notificationPopup.classList.add('show');
        notificationTimeout = setTimeout(() => {
            notificationPopup.classList.remove('show');
            notificationTimeout = null;
        }, 3000);
    } else {
        console.error("Notification popup element not found!");
    }
}

// 화면 내용 업데이트 함수
function updateScreen(content) {
    mainContent.innerHTML = content;
    attachDynamicListeners();
}

// --- 버튼 클릭 이벤트 핸들러 ---

// 돋보기 (QR 스캔) 버튼 *** 여기가 수정되었습니다 ***
btnScan.addEventListener('click', () => {
    const qrContent = `
        <div class="qr-section">
            <p>QR 코드를 스캔하세요</p>
            <!-- 이미지 경로를 실제 파일 이름(qrcode.png)으로 변경 -->
            <img src="qrcode.png" alt="QR 코드">
            <button id="capture-button">촬영</button>
        </div>
    `;
    updateScreen(qrContent);
});

// 하차 알림 버튼
btnAlarm.addEventListener('click', () => {
    const alarmContent = `
        <p><span class="bus-info">통영 401번</span> | 알림 받을 정류장을 선택하세요:</p>
        <ul class="stop-list">
            ${createStopListHtml(stops_401)}
        </ul>
    `;
    updateScreen(alarmContent);
});

// 하차 설정 버튼
btnSetting.addEventListener('click', () => {
    const settingContent = `
        <p><span class="bus-info">통영 401번</span> | 하차벨 울릴 정류장을 선택하세요:</p>
        <ul class="stop-list">
             ${createStopListHtml(stops_401)}
        </ul>
    `;
    updateScreen(settingContent);
});

// 충전 버튼
btnCharge.addEventListener('click', () => {
    currentCharge = 0;
    const chargeContent = `
        <div class="charge-section">
            <p id="charge-display">충전 금액: ${currentCharge.toLocaleString()}원</p>
            <div class="preset-buttons">
                <button data-amount="1000">1,000원</button>
                <button data-amount="5000">5,000원</button>
                <button data-amount="10000">10,000원</button>
                <button data-amount="50000">50,000원</button>
                <button data-amount="100000">100,000원</button>
            </div>
            <button id="charge-confirm">충전하기</button>
        </div>
    `;
    updateScreen(chargeContent);
});

// 지도 버튼
btnMap.addEventListener('click', () => {
    // 예시: 현재 버스가 6번째 정류장(해양과학대학)에 있다고 가정 (index 5)
    const currentBusStopIndex = 5;
    const mapContent = `
        <p><span class="bus-info">통영 401번</span> | 실시간 버스 위치</p>
        <div class="map-placeholder">
            ${createMapStopsHtml(stops_401, currentBusStopIndex)}
        </div>
    `;
    updateScreen(mapContent);
});


// --- 동적으로 생성된 요소에 대한 이벤트 리스너 관리 ---
function attachDynamicListeners() {
    // QR 촬영 버튼
    const captureButton = document.getElementById('capture-button');
    if (captureButton) {
        captureButton.addEventListener('click', () => {
            showNotification('QR 코드가 인식되었습니다.');
        });
    }

    // 정류장 목록 아이템 (하차 알림/설정 공통)
    const stopListItems = document.querySelectorAll('.stop-list li');
    stopListItems.forEach(item => {
        item.addEventListener('click', () => {
            const stopName = item.getAttribute('data-stop');
            const titleElement = mainContent.querySelector('p');
            // 알림 메시지에 버스 번호 포함
            if (titleElement && titleElement.textContent.includes('알림 받을')) {
                 showNotification(`401번: ${stopName} 하차 알림이 설정되었습니다.`);
            } else if (titleElement && titleElement.textContent.includes('하차벨 울릴')) {
                 showNotification(`401번: ${stopName} 하차벨 설정이 완료되었습니다.`);
            }
        });
    });

    // 충전 금액 버튼들
    const presetButtons = document.querySelectorAll('.charge-section .preset-buttons button');
    const chargeDisplay = document.getElementById('charge-display');
    if (presetButtons.length > 0 && chargeDisplay) {
        presetButtons.forEach(button => {
            button.addEventListener('click', () => {
                const amount = parseInt(button.getAttribute('data-amount'), 10);
                currentCharge += amount;
                chargeDisplay.textContent = `충전 금액: ${currentCharge.toLocaleString()}원`;
            });
        });
    }

    // 충전하기 버튼
    const chargeConfirmButton = document.getElementById('charge-confirm');
     if (chargeConfirmButton && chargeDisplay) {
        chargeConfirmButton.addEventListener('click', () => {
            if (currentCharge > 0) {
                showNotification(`${currentCharge.toLocaleString()}원이 충전되었습니다.`);
                currentCharge = 0;
                chargeDisplay.textContent = `충전 금액: ${currentCharge}원`;
            } else {
                showNotification('충전할 금액을 선택해주세요.');
            }
        });
    }
}

// 초기 화면 설정
updateScreen('<p>아래 버튼을 눌러 기능을 선택하세요.</p>');