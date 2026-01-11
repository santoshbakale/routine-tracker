const API_URL = 'http://localhost:3000/api';
let currentDay = getCurrentDay();

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function getCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
}

function initializeApp() {
    loadDayButtons();
    loadTasks(currentDay);
    loadTimetable();
    loadAnalytics();
    setupEventListeners();
    updateStats();
}

function setupEventListeners() {
    // Task form submission
    document.getElementById('task-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await addTask();
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('task-modal').style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('task-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Reload data for specific sections
    if (sectionId === 'dashboard') {
        loadTasks(currentDay);
        updateStats();
    } else if (sectionId === 'timetable') {
        loadTimetable();
    } else if (sectionId === 'analytics') {
        loadAnalytics();
    }
}

function loadDayButtons() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const container = document.getElementById('day-buttons');
    container.innerHTML = '';

    days.forEach(day => {
        const button = document.createElement('button');
        button.className = `day-btn ${day === currentDay ? 'active' : ''}`;
        button.textContent = day;
        button.onclick = () => {
            currentDay = day;
            document.querySelectorAll('.day-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadTasks(day);
        };
        container.appendChild(button);
    });
}

async function loadTasks(day) {
    try {
        const response = await fetch(`${API_URL}/tasks/${day}`);
        const tasks = await response.json();
        displayTasks(tasks);
        updateStats();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function displayTasks(tasks) {
    const container = document.getElementById('tasks-list');
    if (!tasks || tasks.length === 0) {
        container.innerHTML = '<p class="no-tasks">No tasks scheduled for today. Add some tasks to get started!</p>';
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-info">
                <h4>${task.title}</h4>
                <p>${task.description || 'No description'}</p>
            </div>
            <div class="task-time">
                <span class="time-badge">${formatTime(task.startTime)} - ${formatTime(task.endTime)}</span>
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                <div class="task-actions">
                    <button class="btn-complete" onclick="toggleComplete('${task.id}')">
                        <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                        ${task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button class="btn-edit" onclick="editTask('${task.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

async function addTask() {
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        day: document.getElementById('task-day').value,
        category: document.getElementById('task-category').value,
        startTime: document.getElementById('task-start').value,
        endTime: document.getElementById('task-end').value,
        priority: document.getElementById('task-priority').value
    };

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            alert('Task added successfully!');
            document.getElementById('task-form').reset();
            loadTasks(currentDay);
            loadTimetable();
            showSection('dashboard');
        }
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task');
    }
}

async function toggleComplete(taskId) {
    const taskItem = document.querySelector(`[data-id="${taskId}"]`);
    const completed = taskItem.classList.contains('completed');
    
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !completed })
        });

        if (response.ok) {
            taskItem.classList.toggle('completed');
            updateStats();
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadTasks(currentDay);
            loadTimetable();
            updateStats();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function setPriority(priority) {
    document.getElementById('task-priority').value = priority;
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(priority)) {
            btn.classList.add('active');
        }
    });
}

async function loadTimetable() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        const tasks = await response.json();
        displayTimetable(tasks);
    } catch (error) {
        console.error('Error loading timetable:', error);
    }
}

function displayTimetable(tasks) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
    
    const container = document.getElementById('timetable-days');
    container.innerHTML = '';

    days.forEach(day => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        dayColumn.innerHTML = `<div class="day-header">${day}</div>`;

        timeSlots.forEach(hour => {
            const cell = document.createElement('div');
            cell.className = 'time-cell';
            cell.id = `${day}-${hour}`;
            
            // Find tasks for this day and hour
            const hourTasks = tasks.filter(task => 
                task.day === day && 
                parseInt(task.startTime.split(':')[0]) === hour
            );

            hourTasks.forEach(task => {
                const duration = calculateDuration(task.startTime, task.endTime);
                const taskElement = document.createElement('div');
                taskElement.className = `timetable-task ${task.category}`;
                taskElement.style.height = `${duration * 60}px`;
                taskElement.style.backgroundColor = getCategoryColor(task.category);
                taskElement.innerHTML = `
                    <strong>${task.title}</strong><br>
                    <small>${formatTime(task.startTime)} - ${formatTime(task.endTime)}</small>
                `;
                taskElement.onclick = () => showTaskDetails(task);
                cell.appendChild(taskElement);
            });

            dayColumn.appendChild(cell);
        });

        container.appendChild(dayColumn);
    });
}

function calculateDuration(startTime, endTime) {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end - start) / (1000 * 60 * 60); // hours
}

function getCategoryColor(category) {
    const colors = {
        work: '#4299e1',
        study: '#48bb78',
        exercise: '#ed8936',
        meal: '#f56565',
        leisure: '#9f7aea',
        sleep: '#4fd1c7'
    };
    return colors[category] || '#a0aec0';
}

async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}/summary`);
        const summary = await response.json();
        displayAnalytics(summary);
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function displayAnalytics(summary) {
    // Update summary table
    const tableBody = document.getElementById('summary-body');
    tableBody.innerHTML = summary.map(item => `
        <tr>
            <td>${item.day}</td>
            <td>${item.total}</td>
            <td>${item.completed}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${item.percentage}%"></div>
                </div>
                ${item.percentage}%
            </td>
        </tr>
    `).join('');

    // Create completion chart
    const completionChart = document.getElementById('completion-chart');
    completionChart.innerHTML = '';
    
    summary.forEach(item => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${item.percentage}%`;
        bar.title = `${item.day}: ${item.percentage}%`;
        completionChart.appendChild(bar);
    });
}

async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/tasks/${currentDay}`);
        const tasks = await response.json();
        
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('today-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('productivity').textContent = `${percentage}%`;
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

function showTaskDetails(task) {
    document.getElementById('modal-title').textContent = task.title;
    document.getElementById('modal-body').innerHTML = `
        <p><strong>Description:</strong> ${task.description || 'No description'}</p>
        <p><strong>Day:</strong> ${task.day}</p>
        <p><strong>Time:</strong> ${formatTime(task.startTime)} - ${formatTime(task.endTime)}</p>
        <p><strong>Category:</strong> ${task.category}</p>
        <p><strong>Priority:</strong> <span class="priority-badge priority-${task.priority}">${task.priority}</span></p>
        <p><strong>Status:</strong> ${task.completed ? 'Completed' : 'Pending'}</p>
    `;
    document.getElementById('task-modal').style.display = 'flex';
}

// Add edit task function
async function editTask(taskId) {
    // Implementation for editing tasks
    alert('Edit feature coming soon!');
}