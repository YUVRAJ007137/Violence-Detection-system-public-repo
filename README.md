  

---

## 🚨 **Violence Detection System - Frontend (React + Vite + TypeScript)**

### 📌 **Description**
This repository contains the **frontend** part of the **Violence Detection System**, a real-time surveillance web application that allows users to:  
- **Add IP cameras** for monitoring.  
- **Receive notifications** when violence is detected.  
- **View live camera footage**.  

The **backend (Flask + Python)** and **Supabase API** are **not uploaded** in this repository for security purposes. You need to set up your **backend** and **Supabase API** separately.  

---

## ✅ **Features**
### 🎥 **Camera Management**
- Add, modify, and remove cameras via the web interface.  
- View real-time footage of cameras.  

### ⚠️ **Violence Detection Notification**
- Displays notifications if the AI model detects violence.  
- Notifications are fetched from **Supabase database**.  

### 📊 **User Dashboard**
- Allows users to log in and access their cameras and notifications.  
- Provides a clean and responsive UI with real-time updates.  

---

## ⚠ **Note: Backend API & Supabase API Are Not Uploaded**
- The **backend (Flask + Python)** and **AI model** are not uploaded to this repository.  
- You need to create your own backend and host it to make the system functional.  
- **Supabase API Keys** are also not provided here. You need to generate your own **Supabase Project** and add the keys in the `.env` file.  

---

## 📜 **Installation**
### 🔥 Clone the Repository
```bash
git clone https://github.com/your-username/violence-detection-system-frontend.git
cd violence-detection-system-frontend
```

### 💻 Install Dependencies
```bash
npm install
```

### 🔐 Setup Environment Variables
1. Create a `.env` file in the **root directory**.  
2. Add the following content:  
```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_BACKEND_URL=YOUR_BACKEND_API_URL
```

- **VITE_SUPABASE_URL:** Get this from your **Supabase Project Settings** → API → Project URL.  
- **VITE_SUPABASE_ANON_KEY:** Get this from your **Supabase Project Settings** → API → anon public key.  
- **VITE_BACKEND_URL:** This should be the URL of your **Flask Backend API** (if deployed).  

---

## 🚀 Run the Project
To start the development server, run:  
```bash
npm run dev
```
The app will run locally at:  
```
http://localhost:5173
```

---

## 📂 Project Structure
```
root
│
├── public
│
├── src
│   ├── components
│   │   ├── Navbar.tsx
│   │   ├── CameraList.tsx
│   │   ├── NotificationList.tsx
│   │
│   ├── pages
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │
│   ├── services
│   │   ├── supabase.ts    <-- Supabase API integration
│   │   ├── api.ts         <-- Backend API integration
│
├── .env
├── package.json
├── vite.config.ts
```

---

## 📊 **Database Structure (Supabase)**
### 📋 Users Table
| Column Name | Type     | Description            |
|-------------|----------|------------------------|
| user_id     | UUID     | Primary Key            |
| email       | Text     | User Email Address     |
| password    | Text     | Hashed User Password   |

### 🎥 Cameras Table
| Column Name | Type     | Description            |
|-------------|----------|------------------------|
| camera_id   | UUID     | Primary Key            |
| user_id     | UUID     | Foreign Key            |
| ip_address  | Text     | Camera IP Address      |

### 📬 Notifications Table
| Column Name     | Type     | Description       |
|-----------------|----------|-------------------|
| notification_id | UUID     | Primary Key       |
| user_id         | UUID     | Foreign Key       |
| camera_id       | UUID     | Foreign Key       |
| text            | Text     | Notification Text |
| timestamp       | Timestamp | Date & Time       |

---

## ✅ **How It Works**
1. **User Login/Registration:** Users can log in or register using their email and password.  
2. **Add Camera:** Users can add any IP camera by providing its IP address.  
3. **Stream Live Footage:** The app continuously streams footage from added cameras.  
4. **Violence Detection:** If the AI model (in backend) detects violence, a notification is added to Supabase.  
5. **Notification Display:** The frontend captures these notifications and displays them with timestamps.  

---

## 💡 **To Connect With Backend**
- After setting up your backend (Flask API), update the `VITE_BACKEND_URL` in your `.env` file.  
- Example:  
```
VITE_BACKEND_URL=http://your-backend-url.com
```

---

## 💎 **Upcoming Features**
✅ **Mobile App (Android/iOS)** using **React Native.**  
✅ **Cloud Storage** for storing video footage.  
✅ **Push Notifications** for critical events.  
✅ **Automatic Camera Discovery** in LAN network.  

---

## 📬 **Contribution**
We welcome contributions to enhance the project. If you have:  
- Suggestions for improvement.  
- Bug reports.  
- Feature requests.  
Feel free to **open an issue** or submit a **pull request**.  

---

## 📜 **License**
This project is licensed under the **MIT License**.

---

## 💖 **Support**
If you liked this project or found it helpful, please ⭐ **star the repository**.  
For any questions or collaboration, contact me at:  
📧 **Email:** [yuvrajsc42@gmail.com](mailto:yuvrajsc42@gmail.com)  
💬 **LinkedIn:** [linkedin.com/in/yuvraj-chaudhari](https://linkedin.com/in/yuvraj-chaudhari)  

---

## ⚠ **Disclaimer**
- This project is for educational and personal use only.  
- Do not use this system for illegal surveillance or unauthorized activities.  
- The developer is not responsible for any misuse of this application.  

---


