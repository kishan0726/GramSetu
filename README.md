GramSetu - Village Connectivity Solution
https://img.shields.io/badge/React%2520Native-0.76+-61DAFB?logo=react
https://img.shields.io/badge/React-18+-61DAFB?logo=react
https://img.shields.io/badge/Node.js-16+-339933?logo=node.js
https://img.shields.io/badge/Firebase-11+-FFCA28?logo=firebase
https://img.shields.io/badge/License-MIT-green.svg

GramSetu (ग्रामसेतु - "Village Bridge") is a comprehensive multi-platform application designed to connect rural communities with local services, governance, and each other. The system serves three distinct user roles: Admin (web panel), Shopkeepers (mobile app), and Villagers/Users (mobile app).

🌟 Features
👨‍💼 Admin Web Panel
Dashboard - Real-time statistics, report generation, mini village map

User Management - Add/update users, expire/restore accounts

Shop Management - Approve/reject shops, view shop locations

Announcements - Create, edit, and publish village announcements

Map Visualization - Complete village map with important places

Complaint Management - Track complaints (pending → in-progress → resolved)

Profile Management - Update profile, change password

🏪 Shopkeeper Mobile App
Registration - Register shop and wait for admin approval

Authentication - Login, forgot password with email verification

Shop Management - Edit shop details, upload documents

Inventory - Add items with prices, manage stock levels

Location - Provide live shop location for navigation

Multi-language - English and Gujarati support

👤 User Mobile App
Authentication - Register/Login with email verification

Announcements - View village announcements

Complaint System - Register complaints with live location, track status

Shop Directory - Browse shops, search items, check prices & availability

Navigation - Interactive village map with path finding (Dijkstra's algorithm)

Community - Chat with other users, public service information

Multi-language - English and Gujarati support

🏗️ Architecture
text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web App       │────▶│    Backend      │────▶│   Firebase      │
│   (React.js)    │◀────│   (Node.js)     │◀────│   Realtime DB   │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │                        ▲
                                 │                        │
                                 ▼                        │
┌─────────────────┐     ┌─────────────────┐     ┌─────────┴─────────┐
│ Mobile App      │────▶│   Email Service │     │   Cloudinary      │
│ (React Native)  │◀────│   (Gmail SMTP)  │     │   Image Storage   │
└─────────────────┘     └─────────────────┘     └───────────────────┘
Web Application communicates with Backend for all services

Mobile Application uses Firebase Realtime Database directly

Mobile App connects to Backend only for email services (forgot password)

Images stored in Cloudinary

🛠️ Technology Stack
Frontend (Web)
React.js 18+

React Router

Axios

Chart.js for analytics

Mobile Application
React Native 0.76+

React Navigation 6.x

React Native Vector Icons

React Native WebView

React Native Geolocation

AsyncStorage

React Native Permissions

Backend
Node.js 16+

Express.js 4.x

Nodemailer

Cloudinary SDK

Firebase Admin SDK

Database & Storage
Firebase Realtime Database

Cloudinary (Image Storage)

Email Service
Gmail SMTP with Nodemailer

📋 Prerequisites
Node.js (v16 or higher)

npm (v8 or higher)

Android Studio (with SDK)

Java JDK (v11 or higher)

Firebase Account

Cloudinary Account

Google Account (for email service)

🚀 Getting Started
1. Clone the Repository
bash
git clone https://github.com/yourusername/gramsetu.git
cd gramsetu
2. Firebase Setup
Create Firebase Project
Go to Firebase Console

Click Create Project and follow the steps

Enable Realtime Database

Set database rules to test mode:

json
{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}
Download Configuration
Go to Project Settings → Your Apps

Download google-services.json

Place it in: mobile/android/app/google-services.json

3. Backend Setup
bash
cd backend
npm install
Configure Environment Variables
Create .env file in the backend folder:

env
# Firebase
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
Get Firebase Admin Credentials
In Firebase Console, go to Project Settings → Service Accounts

Click Generate New Private Key

Download and save as serviceAccountKey.json in the backend folder

Get Cloudinary Credentials
Login to Cloudinary

Go to Dashboard

Copy Cloud Name, API Key, and API Secret

Setup Gmail App Password
Enable 2-Step Verification on your Google Account

Go to Security → App Passwords

Generate password for Mail app on Other device

Use this 16-character password in .env (not your Gmail password)

4. Mobile App Setup
bash
cd mobile
npm install
Configure Cloudinary
Add your Cloudinary cloud name in these files:

mobile/src/screens/EditShopDetail.jsx

mobile/src/screens/ProfileScreen.jsx

mobile/src/screens/ShopkeeperAprovalWait.jsx

javascript
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
Clean Android Build
bash
cd android
gradlew clean
cd ..
5. Web App Setup
bash
cd web
npm install
6. Running the Project
Start Backend Server
bash
cd backend
node server.js
# Server runs on http://localhost:5000 (default)
Start Web Application
bash
cd web
npm start
# Web app runs on http://localhost:3000
Start Mobile Application
bash
cd mobile
npx react-native run-android
# For iOS: npx react-native run-ios
📁 Project Structure
text
gramsetu/
├── backend/                 # Node.js backend
│   ├── server.js
│   ├── firebase.js
│   ├── routes/
│   ├── controllers/
│   └── .env
├── web/                     # React.js web admin panel
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
├── mobile/                   # React Native mobile app
│   ├── src/
│   │   ├── screens/         # All screen components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Language context
│   │   ├── config/          # Firebase config
│   │   └── App.jsx
│   ├── android/
│   └── package.json
└── README.md
🔑 Key Features in Detail
Admin Dashboard
Real-time statistics (total users, shops, complaints)

Interactive charts and graphs

Report generation (PDF/Excel)

Mini map overview with important locations

Quick navigation to all sections

Complaint Management
Users can register complaints with:

Title and description

Category (water, electricity, road, etc.)

Priority (urgent, high, medium, low)

Live location (GPS)

Images

Real-time status tracking

Map view of all complaint locations

Shop Directory & Navigation
Browse shops by category

Search for specific items across all shops

View item prices and availability

Live shop locations on map

Shortest path finding using Dijkstra's algorithm

Distance calculation (meters/km)

Multi-language Support
English (default)

Gujarati (ગુજરાતી)

All UI elements, labels, and notifications translated

Seamless language switching

Offline Capabilities
Maps work without internet (OpenStreetMap tiles)

Complaint registration with offline queue

Cached shop data

🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

📧 Contact
Project Link: https://github.com/yourusername/gramsetu

🙏 Acknowledgments
OpenStreetMap for free map tiles

Leaflet for mapping library

Firebase for realtime database

Cloudinary for image storage

All contributors and users

GramSetu - Connecting Villages to the Digital World 🌾📱