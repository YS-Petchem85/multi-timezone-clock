// 시간대 정보
const timeZones = {
    'UTC': 'UTC (협정 세계시)',
    'Asia/Seoul': '서울 (한국)',
    'Asia/Tokyo': '도쿄 (일본)',
    'Asia/Shanghai': '상하이 (중국)',
    'Asia/Bangkok': '방콕 (태국)',
    'Asia/Singapore': '싱가포르',
    'Asia/Hong_Kong': '홍콩',
    'Asia/Dubai': '두바이 (UAE)',
    'Asia/Kolkata': '뉴델리 (인도)',
    'Europe/London': '런던 (영국)',
    'Europe/Paris': '파리 (프랑스)',
    'Europe/Berlin': '베를린 (독일)',
    'Europe/Moscow': '모스크바 (러시아)',
    'Africa/Cairo': '카이로 (이집트)',
    'Africa/Lagos': '라고스 (나이지리아)',
    'America/New_York': '뉴욕 (미국 동부)',
    'America/Chicago': '시카고 (미국 중부)',
    'America/Denver': '덴버 (미국 산악)',
    'America/Los_Angeles': '로스앤젤레스 (미국 태평양)',
    'America/Anchorage': '앵커리지 (알래스카)',
    'Pacific/Honolulu': '호놀룰루 (하와이)',
    'America/Toronto': '토론토 (캐나다)',
    'America/Mexico_City': '멕시코시티 (멕시코)',
    'America/Sao_Paulo': '상파울루 (브라질)',
    'America/Argentina/Buenos_Aires': '부에노스아이레스 (아르헨티나)',
    'Australia/Sydney': '시드니 (호주)',
    'Australia/Melbourne': '멜버른 (호주)',
    'Pacific/Auckland': '오클랜드 (뉴질랜드)'
};

// 클락 관리 클래스
class TimezoneClockManager {
    constructor() {
        this.clocks = [];
        this.initDefaultClocks();
        this.initEventListeners();
        this.startClock();
    }

    // 기본 시계 초기화 (서울, 뉴욕, 런던)
    initDefaultClocks() {
        this.addClock('Asia/Seoul');
        this.addClock('America/New_York');
        this.addClock('Europe/London');
    }

    // 이벤트 리스너 초기화
    initEventListeners() {
        document.getElementById('addBtn').addEventListener('click', () => {
            const select = document.getElementById('addTimezone');
            const timezone = select.value;
            if (timezone) {
                this.addClock(timezone);
                select.value = '';
            }
        });

        document.getElementById('addTimezone').addEventListener('change', (e) => {
            if (e.target.value) {
                this.addClock(e.target.value);
                e.target.value = '';
            }
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetClocks();
        });
    }

    // 시계 추가
    addClock(timezone) {
        // 중복 확인
        if (this.clocks.find(c => c.timezone === timezone)) {
            alert('이미 추가된 시간대입니다!');
            return;
        }

        const clock = { timezone };
        this.clocks.push(clock);
        this.renderClocks();
    }

    // 시계 제거
    removeClock(timezone) {
        this.clocks = this.clocks.filter(c => c.timezone !== timezone);
        this.renderClocks();
    }

    // 시계 초기화
    resetClocks() {
        this.clocks = [];
        this.initDefaultClocks();
        this.renderClocks();
    }

    // 시계 렌더링
    renderClocks() {
        const grid = document.getElementById('clocksGrid');
        grid.innerHTML = '';

        if (this.clocks.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>표시할 시간대가 없습니다.</p>
                    <p>위에서 시간대를 추가해주세요.</p>
                </div>
            `;
            return;
        }

        this.clocks.forEach((clock, index) => {
            const card = document.createElement('div');
            card.className = 'clock-card added';
            card.id = `clock-${clock.timezone}`;

            const location = timeZones[clock.timezone] || clock.timezone;
            const offset = this.getTimezoneOffset(clock.timezone);

            card.innerHTML = `
                <button class="remove-btn" data-timezone="${clock.timezone}">×</button>
                <div class="clock-location">${location}</div>
                <div class="clock-timezone">${clock.timezone}</div>
                <div class="clock-offset">UTC ${offset}</div>
                <div class="clock-display" data-timezone="${clock.timezone}">--:--:--</div>
                <div class="clock-date" data-date="${clock.timezone}">--</div>
            `;

            card.querySelector('.remove-btn').addEventListener('click', (e) => {
                this.removeClock(e.target.dataset.timezone);
            });

            grid.appendChild(card);
        });

        this.updateClocks();
    }

    // 시간대 오프셋 계산
    getTimezoneOffset(timezone) {
        const now = new Date();
        const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const offset = (tzTime - utcTime) / (1000 * 60 * 60);
        
        const sign = offset >= 0 ? '+' : '';
        const hours = Math.floor(Math.abs(offset));
        const minutes = Math.round((Math.abs(offset) % 1) * 60);
        
        if (minutes === 0) {
            return `${sign}${hours}`;
        }
        return `${sign}${hours}:${String(minutes).padStart(2, '0')}`;
    }

    // 시계 업데이트
    updateClocks() {
        this.clocks.forEach(clock => {
            const element = document.querySelector(`[data-timezone="${clock.timezone}"]`);
            const dateElement = document.querySelector(`[data-date="${clock.timezone}"]`);

            if (element) {
                const time = this.getTimeInTimezone(clock.timezone);
                element.textContent = time.timeString;
                
                if (dateElement) {
                    dateElement.textContent = time.dateString;
                }
            }
        });
    }

    // 특정 시간대의 시간 구하기
    getTimeInTimezone(timezone) {
        const now = new Date();
        const options = {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(now);

        let hour = '', minute = '', second = '';
        let year = '', month = '', day = '';

        parts.forEach(part => {
            if (part.type === 'hour') hour = part.value;
            if (part.type === 'minute') minute = part.value;
            if (part.type === 'second') second = part.value;
            if (part.type === 'year') year = part.value;
            if (part.type === 'month') month = part.value;
            if (part.type === 'day') day = part.value;
        });

        const timeString = `${hour}:${minute}:${second}`;
        const dateString = `${year}-${month}-${day}`;

        return { timeString, dateString };
    }

    // 시계 시작 (매초 업데이트)
    startClock() {
        this.updateClocks();
        setInterval(() => {
            this.updateClocks();
        }, 1000);
    }
}

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
    new TimezoneClockManager();
});