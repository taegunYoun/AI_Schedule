// 전체 JavaScript 코드 그대로
// DOM 요소
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const scheduleModal = document.getElementById('scheduleModal');
const closeModal = document.getElementById('closeModal');
const overlay = document.getElementById('overlay');
const pushNotification = document.getElementById('pushNotification');
const saveSchedule = document.getElementById('saveSchedule');

// 탭 요소
const chatTab = document.getElementById('chatTab');
const calendarTab = document.getElementById('calendarTab');
const notificationsTab = document.getElementById('notificationsTab');
const settingsTab = document.getElementById('settingsTab');

// 뷰 요소
const chatView = document.getElementById('chatView');
const calendarView = document.getElementById('calendarView');
const notificationsView = document.getElementById('notificationsView');
const settingsView = document.getElementById('settingsView');

// 토글 요소들
const toggles = document.querySelectorAll('.toggle');

// 현재 시간 업데이트
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.querySelector('.time').textContent = `${hours}:${minutes}`;
}

updateTime();
setInterval(updateTime, 60000);

// 채팅 메시지 추가 함수
function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message user-message';
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addAppMessage(message) {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
        chatMessages.removeChild(typingIndicator);

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message app-message';
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
}

// 1. 일정 추가 함수를 수정 - 중복 체크 로직 추가
function addSchedule(scheduleData) {
    // 중복 체크: 이미 같은 날짜/시간/장소의 일정이 있는지 확인
    const isDuplicate = schedulesData.some(existingSchedule => 
        existingSchedule.date === scheduleData.date && 
        existingSchedule.time === scheduleData.time && 
        existingSchedule.location === scheduleData.location
    );
    
    // 중복이 아닌 경우에만 추가
    if (!isDuplicate) {
        // 일정 데이터에 추가
        schedulesData.push(scheduleData);
        
        // 달력에 일정 표시 갱신
        updateCalendarWithSchedule(scheduleData);
        
        // 현재 선택된 날짜가 추가된 일정의 날짜인 경우 이벤트 목록 갱신
        if (selectedDate === scheduleData.date) {
            updateEventsList();
        }
        
        // 토스트 메시지 표시
        showToast('일정이 달력에 추가되었습니다!');
    } else {
        // 중복 일정인 경우 메시지 표시
        showToast('이미 같은 일정이 등록되어 있습니다.');
    }
}

function addScheduleCard(date, time, location, memo) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 같은 일정 카드가 이미 있는지 확인
            const existingCards = chatMessages.querySelectorAll('.schedule-card');
            let isDuplicate = false;
            
            existingCards.forEach(card => {
                const cardDate = card.querySelector('.schedule-item:nth-child(1) span:last-child').textContent;
                const cardTime = card.querySelector('.schedule-item:nth-child(2) span:last-child').textContent;
                const cardLocation = card.querySelector('.schedule-item:nth-child(3) span:last-child').textContent;
                
                if (cardDate === date && cardTime === time && cardLocation === location) {
                    isDuplicate = true;
                }
            });
            
            // 중복이 아닌 경우에만 카드 추가
            if (!isDuplicate) {
                const cardElement = document.createElement('div');
                cardElement.className = 'schedule-card';
                cardElement.innerHTML = `
                    <div class="schedule-details">
                        <div class="schedule-item"><span class="emoji"><img src="png/date-icon.png" alt="날짜 아이콘" width="24" height="24"></span> <span>날짜:</span> <span>${date}</span></div>
                        <div class="schedule-item"><span class="emoji"><img src="png/time-icon.png" alt="시간 아이콘" width="24" height="24"></span> <span>시간:</span> <span>${time}</span></div>
                        <div class="schedule-item"><span class="emoji"><img src="png/place-icon.png" alt="장소소 아이콘" width="24" height="24"></span> <span>장소:</span> <span>${location}</span></div>
                        <div class="schedule-item"><span class="emoji"><img src="png/memo-icon.png" alt="메모모 아이콘" width="24" height="24"></span> <span>메모:</span> <span>${memo}</span></div>
                    </div>
                `;
                chatMessages.appendChild(cardElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            resolve();
        }, 500);
    });
}

function addLocationOptions() {
    return new Promise((resolve) => {
        setTimeout(() => {
            addAppMessage('출발 위치를 선택해 주세요:');

            setTimeout(() => {
                const locations = [
                    { emoji: '🏠', name: '집 (저장된 위치)' },
                    { emoji: '🏢', name: '회사 (저장된 위치)' },
                    { emoji: '📌', name: '현재 위치 (GPS)' }
                ];

                locations.forEach((location, index) => {
                    setTimeout(() => {
                        const locationElement = document.createElement('div');
                        locationElement.className = 'notification';
                        locationElement.innerHTML = `
                            <span class="emoji">${location.emoji}</span>
                            ${location.name}
                        `;

                        locationElement.addEventListener('click', () => {
                            document.querySelectorAll('.notification').forEach(el => {
                                el.classList.remove('selected');
                            });
                            locationElement.classList.add('selected');

                            setTimeout(() => {
                                analyzeTraffic();
                            }, 1000);
                        });

                        chatMessages.appendChild(locationElement);
                        chatMessages.scrollTop = chatMessages.scrollHeight;

                        if (index === locations.length - 1) {
                            resolve();
                        }
                    }, index * 300);
                });
            }, 500);
        }, 500);
    });
}

function analyzeTraffic() {
    addAppMessage('교통 상황을 분석 중입니다...');

    setTimeout(() => {
        const weatherElement = document.createElement('div');
        weatherElement.className = 'notification weather-alert';
        weatherElement.innerHTML = `
            <span class="emoji">☔</span>
            <div>오후에 비 예보가 있습니다. 우산을 챙기세요!</div>
        `;
        chatMessages.appendChild(weatherElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            const transportElement = document.createElement('div');
            transportElement.className = 'notification transport-alert';
            transportElement.innerHTML = `
                <span class="emoji">🚇</span>
                <div>최적 경로: 지하철, 소요 시간 약 26분</div>
            `;
            chatMessages.appendChild(transportElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            setTimeout(() => {
                const confirmElement = document.createElement('div');
                confirmElement.className = 'notification';
                confirmElement.innerHTML = `
                    <div style="width: 100%;">
                        <div>이 경로로 교통 알림을 설정할까요?</div>
                        <div class="action-buttons">
                            <button class="action-button confirm-button">예, 알림 설정</button>
                            <button class="action-button cancel-button">아니오</button>
                        </div>
                    </div>
                `;

                confirmElement.querySelector('.confirm-button').addEventListener('click', () => {
                    chatMessages.removeChild(confirmElement);
                    addAppMessage('알림이 설정되었습니다! 출발 시간에 알려드릴게요.');
                    document.querySelector('.calendar-day.has-event').classList.add('selected');
                    setTimeout(() => {
                        showPushNotification();
                    }, 5000);
                });

                confirmElement.querySelector('.cancel-button').addEventListener('click', () => {
                    chatMessages.removeChild(confirmElement);
                    addAppMessage('알림 설정이 취소되었습니다.');
                });

                chatMessages.appendChild(confirmElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }, 1000);
    }, 2000);
}

function showPushNotification() {
    pushNotification.classList.add('show');

    setTimeout(() => {
        pushNotification.classList.remove('show');
    }, 5000);
}

function analyzeSchedule(input) {
    const dateMatch = input.match(/(\d+)월\s*(\d+)일/);
    const timeMatch = input.match(/(오전|오후)\s*(\d+)시/);

    let cleanedInput = input.replace(/(오전|오후)\s*\d+시/, '').replace(/\s+/g, ' ').trim();
    let parts = cleanedInput.split(' ');

    const locationKeywords = ['역', '동', '구', '로', '가', '대학교', '대', '빌딩', '센터', '공원', '카페'];
    let locationIndex = -1;

    for (let i = 0; i < parts.length; i++) {
        for (const keyword of locationKeywords) {
            if (parts[i].endsWith(keyword)) {
                locationIndex = i;
                break;
            }
        }
        if (locationIndex !== -1) break;
    }

    let location = locationIndex !== -1 ? parts[locationIndex] : '장소 미정';
    let memo = '';
    if (locationIndex !== -1 && locationIndex + 1 < parts.length) {
        memo = parts.slice(locationIndex + 1).join(' ');
    } else if (locationIndex === -1 && dateMatch && timeMatch) {
        const dateEnd = input.indexOf(timeMatch[0]) + timeMatch[0].length;
        memo = input.substring(dateEnd).trim();
    }

    // 🗓️ 요일 계산
    let weekday = '요일 미정';
    if (dateMatch) {
        const now = new Date();
        const year = now.getFullYear();
        const month = parseInt(dateMatch[1]) - 1; // JS에서 0월부터 시작
        const day = parseInt(dateMatch[2]);
        const dateObj = new Date(year, month, day);
        const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        weekday = weekdays[dateObj.getDay()];
    }

    return {
        date: dateMatch ? `${dateMatch[1]}월 ${dateMatch[2]}일 (${weekday})` : '날짜 미정',
        time: timeMatch ? `${timeMatch[1]} ${timeMatch[2]}시` : '시간 미정',
        location: location,
        memo: memo || '메모 없음'
    };
}


function markCalendar(dateText) {
    const match = dateText.match(/(\d+)월\s*(\d+)일/);
    if (!match) return;

    const month = parseInt(match[1]);
    const day = parseInt(match[2]);

    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(dayEl => {
        if (dayEl.dataset.month == month && dayEl.dataset.day == day) {
            dayEl.classList.add('has-event');
        }
    });
}


function handleInput() {
    const message = chatInput.value.trim();
    if (message) {
        addUserMessage(message);
        chatInput.value = '';

        if (message.includes('월') && message.includes('일') && (message.includes('오전') || message.includes('오후'))) {
            const schedule = analyzeSchedule(message);

            setTimeout(() => {
                addAppMessage('일정이 등록되었습니다.');

                addScheduleCard(
                    schedule.date,
                    schedule.time,
                    schedule.location,
                    schedule.memo
                ).then(() => {
                    markCalendar(schedule.date);  // ← 달력에 반영
                    addLocationOptions();
                });
            }, 1000);
        } else {
            setTimeout(() => {
                addAppMessage('일정을 등록하시려면 날짜, 시간, 장소를 포함해서 입력해주세요. 예: "4월 23일 오후 3시 강남역 스터디"');
            }, 1000);
        }
    }
}

function showView(viewId) {
    chatView.style.display = 'none';
    calendarView.style.display = 'none';
    notificationsView.style.display = 'none';
    settingsView.style.display = 'none';

    chatTab.classList.remove('active');
    calendarTab.classList.remove('active');
    notificationsTab.classList.remove('active');
    settingsTab.classList.remove('active');

    switch(viewId) {
        case 'chatView':
            chatView.style.display = 'flex';
            chatTab.classList.add('active');
            break;
        case 'calendarView':
            calendarView.style.display = 'flex';
            calendarTab.classList.add('active');
            break;
        case 'notificationsView':
            notificationsView.style.display = 'flex';
            notificationsTab.classList.add('active');
            break;
        case 'settingsView':
            settingsView.style.display = 'flex';
            settingsTab.classList.add('active');
            break;
    }
}

sendButton.addEventListener('click', handleInput);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleInput();
    }
});
chatTab.addEventListener('click', (e) => {
    e.preventDefault();
    showView('chatView');
});
calendarTab.addEventListener('click', (e) => {
    e.preventDefault();
    showView('calendarView');
});
notificationsTab.addEventListener('click', (e) => {
    e.preventDefault();
    showView('notificationsView');
});
settingsTab.addEventListener('click', (e) => {
    e.preventDefault();
    showView('settingsView');
});

const formButton = document.createElement('div');
formButton.className = 'form-button';
formButton.innerHTML = '<img src="png/manual-input.png" alt="수동 입력" width="28" height="28"> 수동으로 일정 입력하기';
formButton.addEventListener('click', () => {
    scheduleModal.classList.add('show');
    overlay.classList.add('show');
});
chatMessages.appendChild(formButton);
closeModal.addEventListener('click', () => {
    scheduleModal.classList.remove('show');
    overlay.classList.remove('show');
});
overlay.addEventListener('click', () => {
    scheduleModal.classList.remove('show');
    overlay.classList.remove('show');
});
saveSchedule.addEventListener('click', () => {
    scheduleModal.classList.remove('show');
    overlay.classList.remove('show');
    addAppMessage('일정이 추가되었습니다.');
    setTimeout(() => {
        showPushNotification();
    }, 3000);
});
toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
    });
});
setTimeout(() => {

    sendButton.click();
}, 1000);

function generateCalendar(year, month) {
    const calendarGrid = document.querySelector('.calendar-grid');
    const monthSelector = document.querySelector('.month-selector');
    
    // 월 이름 설정 (한국어)
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                        '7월', '8월', '9월', '10월', '11월', '12월'];
    
    // 날짜 객체 생성
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    // 월 표시 업데이트
    monthSelector.textContent = `${year}년 ${monthNames[month - 1]}`;
    
    // 그리드 초기화
    calendarGrid.innerHTML = '';
    
    // 요일 이름 생성
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    dayNames.forEach(day => {
        const dayNameElement = document.createElement('div');
        dayNameElement.className = 'calendar-day-name';
        dayNameElement.textContent = day;
        calendarGrid.appendChild(dayNameElement);
    });
    
    // 이전 달의 마지막 날짜 구하기
    const prevMonthLastDay = new Date(year, month - 1, 0);
    
    // 첫 날의 요일 (0-6, 0은 일요일)
    const startingDay = firstDay.getDay();
    
    // 이전 달의 날짜 채우기
    for (let i = 0; i < startingDay; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day disabled';
        dayElement.textContent = prevMonthLastDay.getDate() - (startingDay - 1 - i);
        dayElement.dataset.month = month - 1 > 0 ? month - 1 : 12;
        dayElement.dataset.year = month - 1 > 0 ? year : year - 1;
        dayElement.dataset.day = prevMonthLastDay.getDate() - (startingDay - 1 - i);
        calendarGrid.appendChild(dayElement);
    }
    
    // 로컬 스토리지에서 이벤트 가져오기
    const storedEvents = JSON.parse(localStorage.getItem('scheduleEvents') || '[]');
    
    // 현재 달의 날짜 채우기
    const today = new Date();
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // 데이터 속성 추가 (나중에 쉽게 찾기 위해)
        dayElement.dataset.month = month;
        dayElement.dataset.year = year;
        dayElement.dataset.day = day;
        
        // 오늘 날짜 표시
        if (year === today.getFullYear() && 
            month === today.getMonth() + 1 && 
            day === today.getDate()) {
            dayElement.classList.add('current');
        }
        
        // 이벤트 있는 날짜 표시
        const hasEvent = storedEvents.some(event => 
            event.year === year && event.month === month && event.day === day
        );
        
        if (hasEvent) {
            dayElement.classList.add('has-event');
        }
        
        dayElement.addEventListener('click', () => {
            // 기존에 선택된 날짜 선택 해제
            document.querySelectorAll('.calendar-day').forEach(el => {
                el.classList.remove('selected');
            });
            
            // 클릭된 날짜 선택
            dayElement.classList.add('selected');
            
            // 해당 날짜의 이벤트 표시
            updateEventsList(year, month, day);
        });
        
        calendarGrid.appendChild(dayElement);
    }
    
    // 다음 달의 날짜 채우기 (필요한 만큼)
    const remainingCells = 42 - (startingDay + lastDay.getDate());
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day disabled';
        dayElement.textContent = day;
        dayElement.dataset.month = month + 1 > 12 ? 1 : month + 1;
        dayElement.dataset.year = month + 1 > 12 ? year + 1 : year;
        dayElement.dataset.day = day;
        calendarGrid.appendChild(dayElement);
    }
}

// 페이지 로드 시 현재 월의 달력 생성
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    generateCalendar(today.getFullYear(), today.getMonth() + 1);
    
    // 달력 탐색 버튼 이벤트
    const prevMonthBtn = document.querySelector('.calendar-nav-btn:first-child');
    const nextMonthBtn = document.querySelector('.calendar-nav-btn:last-child');
    
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth() + 1;
    
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 1) {
            currentMonth = 12;
            currentYear--;
        }
        generateCalendar(currentYear, currentMonth);
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
        generateCalendar(currentYear, currentMonth);
    });
});

function updateEventsList(year, month, day) {
    const eventsList = document.querySelector('.events-list');
    
    // 기존 이벤트 리스트 초기화
    eventsList.innerHTML = `<h3>${year}년 ${month}월 ${day}일 일정</h3>`;
    
    // 로컬 스토리지에서 이벤트 가져오기
    const storedEvents = JSON.parse(localStorage.getItem('scheduleEvents') || '[]');
    
    // 해당 날짜의 이벤트 필터링
    const dayEvents = storedEvents.filter(event => 
        event.year === year && event.month === month && event.day === day
    ).sort((a, b) => {
        // 시간순으로 정렬
        const parseTime = (timeStr) => {
            const match = timeStr.match(/(\d+)시/);
            return match ? parseInt(match[1]) : 0;
        };
        return parseTime(a.time) - parseTime(b.time);
    });
    
    if (dayEvents.length > 0) {
        dayEvents.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <div class="event-time">${event.time}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-location">
                    <span>📍</span>
                    <span>${event.location}</span>
                </div>
                <div class="map-view">
                    <!-- 간단한 지도 시뮬레이션 -->
                    <div class="map-marker" style="top: 60%; left: 70%;"></div>
                    <div class="map-marker" style="top: 30%; left: 30%;"></div>
                    <div class="map-route" style="width: 50%; top: 45%; left: 30%; transform: rotate(30deg);"></div>
                </div>
                <div class="transportation-options">
                    <div class="transport-option selected">
                        <div class="transport-time">26분</div>
                        <div class="transport-details">
                            <span>🚇</span>
                            <span>지하철</span>
                        </div>
                    </div>
                    <div class="transport-option">
                        <div class="transport-time">35분</div>
                        <div class="transport-details">
                            <span>🚌</span>
                            <span>버스</span>
                        </div>
                    </div>
                    <div class="transport-option">
                        <div class="transport-time">20분</div>
                        <div class="transport-details">
                            <span>🚗</span>
                            <span>택시</span>
                        </div>
                    </div>
                </div>
                <button class="complete-schedule-btn" data-index="${index}">✓ 일정 완료</button>
            `;
            
            eventsList.appendChild(eventCard);
            
            // 완료 버튼 이벤트 리스너 추가
            const completeBtn = eventCard.querySelector('.complete-schedule-btn');
            completeBtn.addEventListener('click', () => {
                // 현재 이벤트의 고유 정보를 식별하기 위한 키 생성
                // 이벤트를 식별하기 위해 제목, 시간, 위치 정보를 사용
                const eventKey = `${event.title}_${event.time}_${event.location}`;
                
                // 로컬 스토리지에서 해당 일정 제거
                const storedEvents = JSON.parse(localStorage.getItem('scheduleEvents') || '[]');
                
                // 완료된 일정을 제외한 모든 일정 필터링
                const updatedEvents = storedEvents.filter(item => {
                    const itemKey = `${item.title}_${item.time}_${item.location}`;
                    // 같은 날짜의 같은 일정인 경우만 제외
                    if (item.year === year && item.month === month && item.day === day && itemKey === eventKey) {
                        return false; // 제거할 일정
                    }
                    return true; // 유지할 일정
                });
                
                // 로컬 스토리지 업데이트
                localStorage.setItem('scheduleEvents', JSON.stringify(updatedEvents));
                
                // 챗봇 화면에서도 일정 카드 제거 (채팅 내역에 있는 경우)
                removeChatScheduleCard(event.title, event.time, event.location);
                
                // 달력 및 일정 목록 업데이트
                generateCalendar(year, month);
                updateEventsList(year, month, day);
                
                // 삭제 성공 알림
                addAppMessage('일정이 완료되었습니다.');
            });
        });
    } else {
        const noEventElement = document.createElement('div');
        noEventElement.className = 'chat-message app-message';
        noEventElement.textContent = '해당 날짜에 예정된 일정이 없습니다.';
        eventsList.appendChild(noEventElement);
    }
}

// 채팅 내역에서 일정 카드 제거 함수 (새로 추가)
function removeChatScheduleCard(title, time, location) {
    // 채팅 내역의 모든 일정 카드 검색
    const scheduleCards = document.querySelectorAll('.schedule-card');
    
    scheduleCards.forEach(card => {
        const cardLocation = card.querySelector('.schedule-item:nth-child(3) span:last-child').textContent;
        const cardTime = card.querySelector('.schedule-item:nth-child(2) span:last-child').textContent;
        
        // 제목 확인은 복잡할 수 있으므로 시간과 장소만으로 매칭
        if (cardTime.includes(time) && cardLocation === location) {
            // 일정 카드를 채팅 내역에서 제거
            card.remove();
        }
    });
}

function markCalendar(schedule) {
    // 일정 날짜에서 월과 일을 추출
    const match = schedule.date.match(/(\d+)월\s*(\d+)일/);
    if (!match) return;

    // 입력받은 일정의 월, 일을 사용
    const scheduleMonth = parseInt(match[1]);
    const scheduleDay = parseInt(match[2]);

    // 현재 연도 사용 (필요하면 연도 파싱 로직 추가)
    const now = new Date();
    const year = now.getFullYear();

    // 로컬 스토리지에서 기존 이벤트 불러오기
    const storedEvents = JSON.parse(localStorage.getItem('scheduleEvents') || '[]');

    // 중복 체크 없이 새 일정 추가 (원하신다면 중복 체크 조건 추가 가능)
    storedEvents.push({
        year: year,
        month: scheduleMonth,
        day: scheduleDay,
        title: schedule.memo || '일정',
        time: schedule.time,
        location: schedule.location
    });

    // 변경된 일정 저장
    localStorage.setItem('scheduleEvents', JSON.stringify(storedEvents));

    // 달력의 각 날짜 요소 업데이트 (해당 날짜에 이벤트가 있음을 표시)
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(dayEl => {
        // 기존 이벤트 표시 제거
        dayEl.classList.remove('has-event', 'selected');
        // 등록한 일정 날짜와 일치하면 표시 추가
        if (parseInt(dayEl.dataset.month) === scheduleMonth && 
            parseInt(dayEl.dataset.day) === scheduleDay) {
            dayEl.classList.add('has-event', 'selected');
        }
    });

    // 달력에 표시되는 월을 현재 일정의 월로 업데이트
    const monthSelectorElement = document.querySelector('.month-selector');
    const currentMonthText = monthSelectorElement.textContent;
    const currentMonthMatch = currentMonthText.match(/(\d+)년\s*(\d+)월/);
    if (currentMonthMatch) {
        const currentYear = parseInt(currentMonthMatch[1]);
        let currentMonthNum = parseInt(currentMonthMatch[2]);

        // 만약 등록한 일정의 월과 현재 선택된 월이 다르면 달력을 일정의 월로 변경
        if (currentMonthNum !== scheduleMonth) {
            monthSelectorElement.textContent = `${year}년 ${scheduleMonth}월`;
            generateCalendar(year, scheduleMonth);
        } else {
            // 같은 달이면 기존 달력을 그대로 갱신
            generateCalendar(currentYear, currentMonthNum);
        }
    }
}


function handleInput() {
    const message = chatInput.value.trim();
    if (message) {
        addUserMessage(message);
        chatInput.value = '';

        if (message.includes('월') && message.includes('일') && (message.includes('오전') || message.includes('오후'))) {
            const schedule = analyzeSchedule(message);

            setTimeout(() => {
                addAppMessage('일정이 등록되었습니다.');

                addScheduleCard(
                    schedule.date,
                    schedule.time,
                    schedule.location,
                    schedule.memo
                ).then(() => {
                    markCalendar(schedule);  // 개선된 markCalendar 함수 호출
                    addLocationOptions();
                });
            }, 1000);
        } else {
            setTimeout(() => {
                addAppMessage('일정을 등록하시려면 날짜, 시간, 장소를 포함해서 입력해주세요. 예: "4월 23일 오후 3시 강남역 스터디"');
            }, 1000);
        }
    }
}

// 저장 버튼 클릭 시 일정 추가 로직 개선
saveSchedule.addEventListener('click', () => {
    // 모달에서 입력된 값 가져오기
    const scheduleTitle = document.querySelector('#scheduleModal .form-input[placeholder="일정 이름을 입력하세요"]').value;
    const scheduleDate = document.querySelector('#scheduleModal .form-input[type="date"]').value;
    const scheduleTime = document.querySelector('#scheduleModal .form-input[type="time"]').value;
    const scheduleLocation = document.querySelector('#scheduleModal .form-input[placeholder="장소를 입력하세요"]').value;
    const scheduleMemo = document.querySelector('#scheduleModal .form-input[placeholder="메모를 입력하세요"]').value;

    // 날짜 형식 변환
    const dateParts = scheduleDate.split('-');
    const formattedDate = `${dateParts[1]}월 ${dateParts[2]}일`;
    const formattedTime = `${parseInt(scheduleTime.split(':')[0]) > 12 ? '오후' : '오전'} ${parseInt(scheduleTime.split(':')[0]) % 12}시`;

    const schedule = {
        date: formattedDate,
        time: formattedTime,
        location: scheduleLocation || '장소 미정',
        memo: scheduleTitle || scheduleMemo || '일정'
    };

    // 모달 닫기
    scheduleModal.classList.remove('show');
    overlay.classList.remove('show');

    // 일정 추가 메시지
    addAppMessage('일정이 추가되었습니다.');

    // 일정 카드 및 달력 마크
    addScheduleCard(
        schedule.date,
        schedule.time,
        schedule.location,
        schedule.memo
    ).then(() => {
        markCalendar(schedule);
    });

    // 푸시 알림 시뮬레이션
    setTimeout(() => {
        showPushNotification();
    }, 3000);
});

function addCalendarNavigation() {
    const calendarView = document.getElementById('calendarView');
    const calendarGrid = document.querySelector('.calendar-grid');
    let touchStartX = 0;
    let touchCurrentX = 0;
    let isDragging = false;
    let translateX = 0;

    // 그라데이션 오버레이 요소 생성
    const gradientOverlay = document.createElement('div');
    gradientOverlay.classList.add('calendar-swipe-overlay');
    calendarView.appendChild(gradientOverlay);

    calendarView.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchCurrentX = touchStartX;
        isDragging = true;
        calendarGrid.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)';
        gradientOverlay.style.opacity = '0';
        gradientOverlay.style.background = 'none';
    });

    calendarView.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        touchCurrentX = e.touches[0].clientX;
        translateX = touchCurrentX - touchStartX;
        
        const dampingFactor = 0.5;
        const absTranslateX = Math.abs(translateX);
        const gridWidth = calendarGrid.offsetWidth;
        
        calendarGrid.style.transform = `translateX(${translateX * dampingFactor}px)`;

        // 그라데이션 오버레이 효과
        if (absTranslateX > 10) {
            gradientOverlay.style.opacity = '1';
            const gradient = translateX < 0 
                ? `linear-gradient(to right, transparent, rgba(142, 130, 255, 0.2) ${Math.min(absTranslateX / gridWidth * 100, 50)}%, transparent)`
                : `linear-gradient(to left, transparent, rgba(142, 130, 255, 0.2) ${Math.min(absTranslateX / gridWidth * 100, 50)}%, transparent)`;
            gradientOverlay.style.background = gradient;
        }
    });

    calendarView.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        const monthSelectorElement = document.querySelector('.month-selector');
        const currentMonthText = monthSelectorElement.textContent;
        const currentMonthMatch = currentMonthText.match(/(\d+)년\s*(\d+)월/);
        
        if (currentMonthMatch) {
            let currentYear = parseInt(currentMonthMatch[1]);
            let currentMonth = parseInt(currentMonthMatch[2]);

            // 충분히 드래그되었는지 확인
            const threshold = calendarGrid.offsetWidth * 0.3;
            
            if (translateX < -threshold) {
                // 다음 달로 이동
                currentMonth++;
                if (currentMonth > 12) {
                    currentMonth = 1;
                    currentYear++;
                }
                calendarGrid.classList.add('calendar-transition-right');
                generateCalendar(currentYear, currentMonth);
            } else if (translateX > threshold) {
                // 이전 달로 이동
                currentMonth--;
                if (currentMonth < 1) {
                    currentMonth = 12;
                    currentYear--;
                }
                calendarGrid.classList.add('calendar-transition-left');
                generateCalendar(currentYear, currentMonth);
            }

            // 원래 위치로 되돌리기
            calendarGrid.style.transform = 'translateX(0)';
            
            // 그라데이션 초기화
            gradientOverlay.style.opacity = '0';
            gradientOverlay.style.background = 'none';
        }
    });
}

// 페이지 로드 시 내비게이션 이벤트 추가
document.addEventListener('DOMContentLoaded', () => {
    addCalendarNavigation();
});