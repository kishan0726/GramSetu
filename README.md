# GramSetu - Village Connectivity Solution

![React Native](https://img.shields.io/badge/React%20Native-0.76+-61DAFB?logo=react)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js)
![Firebase](https://img.shields.io/badge/Firebase-11+-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**GramSetu** is a comprehensive **multi-platform application** designed to connect rural communities with local services, governance, and each other.

The system serves **three distinct user roles**:

* **Admin** – Web Admin Panel
* **Shopkeepers** – Mobile Application
* **Villagers / Users** – Mobile Application

---

# 🌟 Features

## 👨‍💼 Admin Web Panel

* **Dashboard** – Real-time statistics, report generation, mini village map
* **User Management** – Add/update users, expire/restore accounts
* **Shop Management** – Approve/reject shops, view shop locations
* **Announcements** – Create, edit, and publish village announcements
* **Map Visualization** – Complete village map with important places
* **Complaint Management** – Track complaints (pending → in-progress → resolved)
* **Profile Management** – Update profile, change password

---

## 🏪 Shopkeeper Mobile App

* **Registration** – Register shop and wait for admin approval
* **Authentication** – Login, forgot password with email verification
* **Shop Management** – Edit shop details, upload documents
* **Inventory Management** – Add items with prices and manage stock
* **Location Sharing** – Provide live shop location for navigation
* **Multi-language Support** – English and Gujarati

---

## 👤 User Mobile App

* **Authentication** – Register/Login with email verification
* **Announcements** – View village announcements
* **Complaint System** – Register complaints with live location and track status
* **Shop Directory** – Browse shops and check product availability
* **Navigation System** – Interactive village map with path finding using **Dijkstra’s algorithm**
* **Community Chat** – Connect with other users
* **Public Services Information**
* **Multi-language Support** – English and Gujarati

---

### System Flow

* Web Application communicates with **Backend** for all services.
* Mobile Application connects **directly to Firebase** for database access.
* Mobile Application connects to **Backend only for Email Services**.
* Images are stored using **Cloudinary**.

---

# 🛠️ Technology Stack

## Frontend (Web)

* React.js 18+
* React Router
* Axios
* Chart.js

## Mobile Application

* React Native 0.76+
* React Navigation
* React Native Vector Icons
* React Native WebView
* React Native Geolocation
* AsyncStorage
* React Native Permissions

## Backend

* Node.js 16+
* Express.js
* Nodemailer
* Cloudinary SDK
* Firebase Admin SDK

## Database & Storage

* Firebase Realtime Database
* Cloudinary

## Email Service

* Gmail SMTP (Nodemailer)

---

# 📋 Prerequisites

Install the following before running the project:

* Node.js (v16+)
* npm (v8+)
* Android Studio
* Java JDK (v17)
* Firebase Account
* Cloudinary Account
* Google Account (for email service)

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/kishan0726/GramSetu
cd gramsetu
```

---

# 2. Firebase Setup

### Create Firebase Project

1. Go to Firebase Console
   https://console.firebase.google.com

2. Click **Create Project**

3. Follow setup steps.

---

### Enable Realtime Database

Go to:

```
Build → Realtime Database
```

Click **Create Database**

Select **Test Mode**

---

### Update Database Rules

```
{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}
```

---

### Download Firebase Configuration

Go to:

```
Project Settings → Your Apps
```

Download:

```
google-services.json
```

Place file inside:

```
app/GramSetu/android/app/google-services.json
```

---

# 3. Backend Setup

```
cd backend
npm install
```

---

## Configure Environment Variables

Create `.env` file inside **backend folder**

```
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

### Firebase Admin Credentials

1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Click **Generate New Private Key**

Save file as:

```
backend/serviceAccountKey.json
```

open : 

```
backend/firebase.js
```

Replace Database URL with Your URL : 
```
https://your-project-default-rtdb.firebaseio.com
```

---

### Cloudinary Credentials

Login to Cloudinary dashboard and copy:

* Cloud Name
* API Key
* API Secret

---

### Gmail Email Setup

1. Enable **2-Step Verification** in Google account
2. Go to **Security → App Passwords**
3. Generate password for:

```
App: Mail
Device: Other
```

Use this **16-character password** in `.env`.

---

# 4. Mobile App Setup

```
cd app/Gramsetu
npm install
```

---

### Configure Cloudinary

Add your cloud name in:

```
app/GramSetu/src/screens/EditShopDetail.jsx
app/GramSetu/src/screens/ProfileScreen.jsx
app/GramSetu/src/screens/ShopkeeperAprovalWait.jsx
```

```
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
```

---

### Clean Android Build

```
cd android
gradlew clean
cd ..
```

---

# 5. Web App Setup

```
cd web
npm install
```

---

# ▶ Running the Project

## Start Backend Server

```
cd backend
node server.js
```

Backend runs on:

```
http://localhost:5000
```

---

## Start Web Application

```
cd web
npm start
```

Runs on:

```
http://localhost:3000
```

---

## Start Mobile Application

```
cd app/GramSetu
npx react-native run-android
```

For iOS:

```
npx react-native run-ios
```

---

# 📁 Project Structure

```
gramsetu
│
├── backend
│   ├── cloudinary.js
│   ├── emailService.js
│   ├── firebase.js
│   ├── server.js
│   └── .env
│
├── web
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   |   ├── AdminReportGenerator.jsx
│   │   |   ├── Home.jsx
│   │   |   ├── Map.jsx
│   │   |   ├── Navbar.jsx
│   │   |   ├── NavigateMap.jsx
│   │   |   └── Sidebar.jsx
│   │   ├── pages
│   │   |   ├── AdminProfile.jsx
│   │   |   ├── Announcement.jsx
│   │   |   ├── Complaint.jsx
│   │   |   ├── Dashboard.jsx
│   │   |   ├── ForgotPassword.jsx
│   │   |   ├── Login.jsx
│   │   |   ├── Shops.jsx
│   │   |   ├── User.jsx
│   │   |   └── UserDetail.jsx
│   │   ├── stylesheets
│   │   |   ├── AdminProfile.css
│   │   |   ├── Announcement.css
│   │   |   ├── Complaint.css
│   │   |   ├── Dashboard.css
│   │   |   ├── ForgotPassword.css
│   │   |   ├── Home.css
│   │   |   ├── Login.css
│   │   |   ├── Map.css
│   │   |   ├── Navbar.css
│   │   |   ├── NavigateMap.css
│   │   |   ├── Shops.css
│   │   |   ├── Sidebar.css
│   │   |   ├── User.css
│   │   |   └── UserDetail.css
│   │   └── App.jsx
│   └── package.json
│
├── app/Gramsetu
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   |   └── LanguageSwitcher.jsx
│   │   ├── config
│   │   |   └── firebase.js
│   │   ├── context
│   │   |   └── LanguageContext.jsx
│   │   ├── screens
│   │   |   ├── AddChatUserScreen.jsx
│   │   |   ├── AddShopItem.jsx
│   │   |   ├── AnnouncementsScreen.jsx
│   │   |   ├── ChatListScreen.jsx
│   │   |   ├── ChatRequestsScreen.jsx
│   │   |   ├── ChatScreen.jsx
│   │   |   ├── ChatSetupScreen.jsx
│   │   |   ├── CommunityScreen.jsx
│   │   |   ├── ComplaintsScreen.jsx
│   │   |   ├── DashboardScreen.jsx
│   │   |   ├── EditShopDetails.jsx
│   │   |   ├── ForgotPassword.jsx
│   │   |   ├── ForgotPasswordUser.jsx
│   │   |   ├── ManageStock.jsx
│   │   |   ├── MapScreen.jsx
│   │   |   ├── NavigateScreen.jsx
│   │   |   ├── ProfileScreen.jsx
│   │   |   ├── PublicServiceScreen.jsx
│   │   |   ├── ShopInventory.jsx
│   │   |   ├── ShopkeeperApprovalWait.jsx
│   │   |   ├── ShopkeeperDashboard.jsx
│   │   |   ├── ShopkeeperLogin.jsx
│   │   |   ├── ShopkeeperProfile.jsx
│   │   |   ├── ShopkeeperSignup.jsx
│   │   |   ├── ShopkeeperScreen.jsx
│   │   |   ├── UserLogin.jsx
│   │   |   └── WelcomeScreen.jsx
│   │   └── App.tsx
│   ├── android
│   └── package.json
│
└── README.md
```

---

# 🔑 Key Features

## Admin Dashboard

* Real-time statistics
* Interactive charts
* Report generation
* Village map overview

---

## Complaint Management

Users can register complaints including:

* Title & Description
* Category
* Priority
* Live Location (GPS)
* Images
* Status Tracking

---

## Shop Directory

* Browse shops by category
* Search products across shops
* Live shop locations
* Shortest path navigation using **Dijkstra algorithm**

---

## Multi-language Support

* English
* Gujarati (ગુજરાતી)

All UI elements support both languages.

---

# 📧 Contact

Project Link:

```
https://github.com/kishan0726/GramSetu
```

---

# 🙏 Acknowledgments

* OpenStreetMap
* Leaflet
* Firebase
* Cloudinary
* All contributors

---

# GramSetu – Connecting Villages to the Digital World 📱
