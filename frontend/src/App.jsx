import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Venura/Login';
import Register from './pages/Venura/Register';
import Dashboard from './pages/Venura/Dashboard';
import AdminDashboard from './pages/Venura/AdminDashboard';
import Profile from './pages/Venura/Profile';
import DocumentUpload from './pages/Venura/DocumentUpload';
import './index.css';
import VAPID_KEY from './config.js';
import { messaging, getToken, onMessage } from "./firebase";
import { use, useEffect } from 'react';

function App() {
  const requestPermission = async () => {
    try{
      if(Notification.permission === "granted") {
        console.log("Notification permission already granted.");
        return;
      }

      if(Notification.permission === "denied") {
        console.log("Notification permission denied.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
        });

        console.log("FCM Token:", token);

        // Send token to backend
        await fetch("http://localhost:5001/api/v1/notification/save-token", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ token }),
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("fcm-permission-granted")) {
      requestPermission().then(() => {
        localStorage.setItem("fcm-permission-granted", "true");
      });
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground notification:", payload);
      alert(`${payload.notification.title}\n${payload.notification.body}`);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload-id" element={<DocumentUpload />} />
      </Routes>
    </Router>
  );
}

export default App;
