# 📅 Daily Routine Tracker

A full-stack web application to track daily routines and create personalized timetables. Built with Node.js backend and vanilla JavaScript frontend. Works perfectly on Termux (Android).

## 🚀 Features

### ✅ Core Features
- **Daily Task Management**: Add, edit, delete, and complete tasks
- **Weekly Timetable**: Visual schedule with time slots
- **Task Categories**: Work, Study, Exercise, Meal, Leisure, Sleep
- **Priority Levels**: Low, Medium, High
- **Progress Tracking**: Daily and weekly completion rates
- **Analytics Dashboard**: Visual statistics and insights

### 📱 Mobile-First Design
- Responsive layout for all screen sizes
- Touch-friendly interface
- Works offline with local storage backup

### 🔧 Technical Features
- RESTful API backend
- JSON database (no external DB required)
- Real-time updates
- Data persistence

## 🛠️ Installation & Setup

### Prerequisites
- Termux app installed on Android
- Basic knowledge of command line

### Step 1: Setup Termux
```bash
# Update packages
pkg update && pkg upgrade

# Install Node.js and Git
pkg install nodejs git

# Verify installation
node --version
npm --version