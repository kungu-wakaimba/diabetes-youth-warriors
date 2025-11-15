// Diabetes Management Toolkit - JavaScript
// localStorage keys
const STORAGE_KEYS = {
    BLOOD_SUGAR: 'diabetes_blood_sugar',
    CARBS: 'diabetes_carbs',
    MEDICATION: 'diabetes_medication',
    WATER: 'diabetes_water',
    ACTIVITY: 'diabetes_activity'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTools();
    loadAllData();
});

// ============================================
// TOOLKIT TOGGLE FUNCTIONALITY
// ============================================
function toggleToolkit() {
    const toolkitGrid = document.getElementById('toolkit-grid');
    const toolkitHeader = document.querySelector('.toolkit-header');
    
    if (toolkitGrid && toolkitHeader) {
        toolkitGrid.classList.toggle('expanded');
        toolkitHeader.classList.toggle('collapsed');
    }
}

// Initialize date/time inputs
function initializeTools() {
    // Set default time to now
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    const dateTimeString = now.toISOString().slice(0, 16);
    
    const bsTimeInput = document.getElementById('bs-time');
    if (bsTimeInput) {
        bsTimeInput.value = dateTimeString;
    }
    
    const medTimeInput = document.getElementById('med-time');
    if (medTimeInput) {
        medTimeInput.value = timeString;
    }
}

// BMI Calculator
function calculateBMI() {
    const height = parseFloat(document.getElementById('bmi-height').value);
    const weight = parseFloat(document.getElementById('bmi-weight').value);
    const resultDiv = document.getElementById('bmi-result');
    
    if (!height || !weight || height <= 0 || weight <= 0) {
        resultDiv.innerHTML = '<p class="error">Please enter valid height and weight.</p>';
        return;
    }
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const roundedBMI = bmi.toFixed(1);
    
    let category = '';
    let color = '';
    if (bmi < 18.5) {
        category = 'Underweight';
        color = '#3b82f6';
    } else if (bmi < 25) {
        category = 'Normal weight';
        color = '#10b981';
    } else if (bmi < 30) {
        category = 'Overweight';
        color = '#f59e0b';
    } else {
        category = 'Obese';
        color = '#ef4444';
    }
    
    resultDiv.innerHTML = `
        <div class="bmi-result" style="color: ${color};">
            <div class="bmi-value">${roundedBMI}</div>
            <div class="bmi-category">${category}</div>
        </div>
    `;
}

// Blood Sugar Tracker
function addBloodSugar() {
    const reading = parseFloat(document.getElementById('bs-reading').value);
    const time = document.getElementById('bs-time').value;
    
    if (!reading || !time) {
        alert('Please enter both reading and time.');
        return;
    }
    
    const entry = {
        reading: reading,
        time: time,
        timestamp: new Date().toISOString()
    };
    
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOOD_SUGAR) || '[]');
    history.push(entry);
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Keep only last 10 entries
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem(STORAGE_KEYS.BLOOD_SUGAR, JSON.stringify(history));
    displayBloodSugarHistory();
    
    // Clear inputs
    document.getElementById('bs-reading').value = '';
}

function displayBloodSugarHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOOD_SUGAR) || '[]');
    const historyDiv = document.getElementById('bs-history');
    
    if (history.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No readings yet. Add your first reading!</p>';
        return;
    }
    
    let html = '<div class="history-list">';
    history.forEach(entry => {
        const date = new Date(entry.time);
        const timeStr = date.toLocaleString();
        const status = getBloodSugarStatus(entry.reading);
        html += `
            <div class="history-item ${status.class}">
                <div class="history-value">${entry.reading} mg/dL</div>
                <div class="history-time">${timeStr}</div>
            </div>
        `;
    });
    html += '</div>';
    historyDiv.innerHTML = html;
}

function getBloodSugarStatus(reading) {
    if (reading < 70) {
        return { class: 'low', label: 'Low' };
    } else if (reading > 180) {
        return { class: 'high', label: 'High' };
    } else {
        return { class: 'normal', label: 'Normal' };
    }
}

// Carb Counter
function addCarbs() {
    const amount = parseFloat(document.getElementById('carb-amount').value);
    const food = document.getElementById('carb-food').value.trim();
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid carb amount.');
        return;
    }
    
    const today = new Date().toDateString();
    const entry = {
        amount: amount,
        food: food || 'Unknown',
        date: today,
        timestamp: new Date().toISOString()
    };
    
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARBS) || '[]');
    history.push(entry);
    
    localStorage.setItem(STORAGE_KEYS.CARBS, JSON.stringify(history));
    updateCarbDisplay();
    
    // Clear inputs
    document.getElementById('carb-amount').value = '';
    document.getElementById('carb-food').value = '';
}

function updateCarbDisplay() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARBS) || '[]');
    const today = new Date().toDateString();
    
    const todayCarbs = history
        .filter(entry => entry.date === today)
        .reduce((sum, entry) => sum + entry.amount, 0);
    
    document.getElementById('carb-total').textContent = todayCarbs.toFixed(0);
    displayCarbHistory();
}

function displayCarbHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARBS) || '[]');
    const today = new Date().toDateString();
    const todayEntries = history.filter(entry => entry.date === today).slice(-5);
    const historyDiv = document.getElementById('carb-history');
    
    if (todayEntries.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No entries today.</p>';
        return;
    }
    
    let html = '<div class="history-list">';
    todayEntries.reverse().forEach(entry => {
        html += `
            <div class="history-item">
                <div class="history-value">${entry.amount}g</div>
                <div class="history-time">${entry.food}</div>
            </div>
        `;
    });
    html += '</div>';
    historyDiv.innerHTML = html;
}

// Medication Reminder
function addMedication() {
    const name = document.getElementById('med-name').value.trim();
    const time = document.getElementById('med-time').value;
    const dose = document.getElementById('med-dose').value.trim();
    
    if (!name || !time) {
        alert('Please enter medication name and time.');
        return;
    }
    
    const entry = {
        name: name,
        time: time,
        dose: dose || 'N/A',
        timestamp: new Date().toISOString()
    };
    
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICATION) || '[]');
    history.push(entry);
    history.sort((a, b) => a.time.localeCompare(b.time));
    
    // Keep only last 10 entries
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem(STORAGE_KEYS.MEDICATION, JSON.stringify(history));
    displayMedicationHistory();
    
    // Clear inputs
    document.getElementById('med-name').value = '';
    document.getElementById('med-dose').value = '';
}

function displayMedicationHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICATION) || '[]');
    const historyDiv = document.getElementById('med-history');
    
    if (history.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No medications added yet.</p>';
        return;
    }
    
    let html = '<div class="history-list">';
    history.forEach(entry => {
        html += `
            <div class="history-item">
                <div class="history-value">${entry.name}</div>
                <div class="history-time">${entry.time} - ${entry.dose}</div>
            </div>
        `;
    });
    html += '</div>';
    historyDiv.innerHTML = html;
}

// Water Intake Logger
function addWater() {
    const amount = parseFloat(document.getElementById('water-amount').value);
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }
    
    const today = new Date().toDateString();
    const entry = {
        amount: amount,
        date: today,
        timestamp: new Date().toISOString()
    };
    
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATER) || '[]');
    history.push(entry);
    
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(history));
    updateWaterDisplay();
    
    // Clear input
    document.getElementById('water-amount').value = '';
}

function updateWaterDisplay() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATER) || '[]');
    const today = new Date().toDateString();
    const goal = 2000;
    
    const todayWater = history
        .filter(entry => entry.date === today)
        .reduce((sum, entry) => sum + entry.amount, 0);
    
    document.getElementById('water-total').textContent = todayWater;
    
    const percentage = Math.min((todayWater / goal) * 100, 100);
    document.getElementById('water-bar').style.width = percentage + '%';
    
    displayWaterHistory();
}

function displayWaterHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATER) || '[]');
    const today = new Date().toDateString();
    const todayEntries = history.filter(entry => entry.date === today).slice(-5);
    const historyDiv = document.getElementById('water-history');
    
    if (todayEntries.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No entries today.</p>';
        return;
    }
    
    let html = '<div class="history-list">';
    todayEntries.reverse().forEach(entry => {
        html += `
            <div class="history-item">
                <div class="history-value">${entry.amount}ml</div>
            </div>
        `;
    });
    html += '</div>';
    historyDiv.innerHTML = html;
}

// Activity Monitor
function addActivity() {
    const type = document.getElementById('activity-type').value.trim();
    const duration = parseFloat(document.getElementById('activity-duration').value);
    
    if (!type || !duration || duration <= 0) {
        alert('Please enter activity type and duration.');
        return;
    }
    
    const today = new Date().toDateString();
    const entry = {
        type: type,
        duration: duration,
        date: today,
        timestamp: new Date().toISOString()
    };
    
    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]');
    history.push(entry);
    
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(history));
    updateActivityDisplay();
    
    // Clear inputs
    document.getElementById('activity-type').value = '';
    document.getElementById('activity-duration').value = '';
}

function updateActivityDisplay() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]');
    const today = new Date().toDateString();
    
    const todayActivity = history
        .filter(entry => entry.date === today)
        .reduce((sum, entry) => sum + entry.duration, 0);
    
    document.getElementById('activity-total').textContent = todayActivity;
    displayActivityHistory();
}

function displayActivityHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY) || '[]');
    const today = new Date().toDateString();
    const todayEntries = history.filter(entry => entry.date === today).slice(-5);
    const historyDiv = document.getElementById('activity-history');
    
    if (todayEntries.length === 0) {
        historyDiv.innerHTML = '<p class="no-data">No activities logged today.</p>';
        return;
    }
    
    let html = '<div class="history-list">';
    todayEntries.reverse().forEach(entry => {
        html += `
            <div class="history-item">
                <div class="history-value">${entry.type}</div>
                <div class="history-time">${entry.duration} min</div>
            </div>
        `;
    });
    html += '</div>';
    historyDiv.innerHTML = html;
}

// Load all data on page load
function loadAllData() {
    displayBloodSugarHistory();
    updateCarbDisplay();
    displayMedicationHistory();
    updateWaterDisplay();
    updateActivityDisplay();
}

// Allow Enter key to submit forms
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const target = e.target;
        if (target.id === 'bmi-height' || target.id === 'bmi-weight') {
            calculateBMI();
        } else if (target.id === 'bs-reading' || target.id === 'bs-time') {
            addBloodSugar();
        } else if (target.id === 'carb-amount' || target.id === 'carb-food') {
            addCarbs();
        } else if (target.id === 'med-name' || target.id === 'med-time' || target.id === 'med-dose') {
            addMedication();
        } else if (target.id === 'water-amount') {
            addWater();
        } else if (target.id === 'activity-type' || target.id === 'activity-duration') {
            addActivity();
        }
    }
});

// ============================================
// DAILY TIP CAROUSEL
// ============================================
const diabetesTips = [
    {
        icon: '💡',
        title: 'Stay Hydrated',
        content: 'Drinking plenty of water helps your kidneys flush out excess sugar through urine. Aim for 8-10 glasses daily.'
    },
    {
        icon: '🥗',
        title: 'Eat Balanced Meals',
        content: 'Include lean protein, healthy fats, and complex carbs in every meal to maintain stable blood sugar levels.'
    },
    {
        icon: '🏃',
        title: 'Regular Exercise',
        content: 'Physical activity helps your body use insulin more effectively. Aim for at least 30 minutes of moderate exercise daily.'
    },
    {
        icon: '📊',
        title: 'Monitor Regularly',
        content: 'Check your blood sugar levels at consistent times each day to identify patterns and make informed decisions.'
    },
    {
        icon: '😴',
        title: 'Prioritize Sleep',
        content: 'Getting 7-9 hours of quality sleep helps regulate hormones that affect blood sugar control.'
    },
    {
        icon: '🧘',
        title: 'Manage Stress',
        content: 'Stress can raise blood sugar levels. Practice relaxation techniques like deep breathing or meditation.'
    },
    {
        icon: '🍎',
        title: 'Choose Low-GI Foods',
        content: 'Foods with a low glycemic index release sugar slowly, helping maintain stable blood glucose levels.'
    }
];

let currentTipIndex = 0;

function changeTip(direction) {
    currentTipIndex += direction;
    if (currentTipIndex < 0) {
        currentTipIndex = diabetesTips.length - 1;
    } else if (currentTipIndex >= diabetesTips.length) {
        currentTipIndex = 0;
    }
    
    const tip = diabetesTips[currentTipIndex];
    document.getElementById('tip-title').textContent = tip.title;
    document.getElementById('tip-content').textContent = tip.content;
    document.querySelector('.tip-icon').textContent = tip.icon;
    
    updateTipDots();
}

function updateTipDots() {
    const dotsContainer = document.getElementById('tip-dots');
    dotsContainer.innerHTML = '';
    diabetesTips.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `dot ${index === currentTipIndex ? 'active' : ''}`;
        dot.onclick = () => {
            currentTipIndex = index;
            changeTip(0);
        };
        dotsContainer.appendChild(dot);
    });
}

// Auto-rotate tips every 5 seconds
setInterval(() => {
    changeTip(1);
}, 5000);

// Initialize tip dots
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('tip-dots')) {
        updateTipDots();
    }
});

// ============================================
// COMMUNITY POLL WIDGET
// ============================================
const POLL_STORAGE_KEY = 'diabetes_poll_votes';

function loadPollData() {
    return JSON.parse(localStorage.getItem(POLL_STORAGE_KEY) || '{"votes": [0, 0, 0, 0]}');
}

function savePollData(data) {
    localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(data));
}

function votePoll(optionIndex) {
    const data = loadPollData();
    data.votes[optionIndex]++;
    savePollData(data);
    updatePollDisplay();
}

function updatePollDisplay() {
    const data = loadPollData();
    const total = data.votes.reduce((sum, votes) => sum + votes, 0);
    
    data.votes.forEach((votes, index) => {
        const percent = total > 0 ? Math.round((votes / total) * 100) : 0;
        document.getElementById(`poll-${index}`).textContent = `${percent}%`;
        
        const option = document.querySelectorAll('.poll-option')[index];
        if (total > 0) {
            option.style.setProperty('--vote-percent', `${percent}%`);
        }
    });
    
    document.getElementById('poll-total').textContent = `${total} vote${total !== 1 ? 's' : ''}`;
}

function resetPoll() {
    if (confirm('Are you sure you want to reset the poll?')) {
        savePollData({ votes: [0, 0, 0, 0] });
        updatePollDisplay();
    }
}

// Initialize poll display
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('poll-total')) {
        updatePollDisplay();
    }
});

