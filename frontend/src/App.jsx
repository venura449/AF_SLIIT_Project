import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Venura/Login';
import Register from './pages/Venura/Register';
import Dashboard from './pages/Venura/Dashboard';
import AdminDashboard from './pages/Venura/AdminDashboard';
import Profile from './pages/Venura/Profile';
import DocumentUpload from './pages/Venura/DocumentUpload';
import './index.css';
import { useEffect, useState } from 'react';
import { requestForToken } from '../firebase';
import axios from "axios";

function App() {
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    const fetchFCMToken =async () => {
        try{
           const token = await requestForToken();

          if (token) {
            console.log("FCM Token:", token);

            // Send token to backend
            await axios.post("http://localhost:5001/api/v1/notifications/save-fcm-token", {
              token: token
            }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            });

            console.log("Token saved to backend");
          }

        } catch (err) {
          console.log("Error getting token:", err);
        }
      };

      fetchFCMToken();
    }, []
  );


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
