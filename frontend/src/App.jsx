import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Venura/Login';
import Register from './pages/Venura/Register';
import Dashboard from './pages/Venura/Dashboard';
import AdminDashboard from './pages/Venura/AdminDashboard';
import Profile from './pages/Venura/Profile';
import DocumentUpload from './pages/Venura/DocumentUpload';
import './index.css';
import { messaging, getToken, onMessage } from './firebaseConfig'; 


function App() {
  const requestPermission = async () => {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BJAr7b_cg0aW_WFAvY7lINmYXn2T1elTXPT4moLC7ZsH-9272wiWL_zjStBwNnT0EXhA_-5-K_uwAaLjkm6Y5Eg",
      });


      console.log("FCM Token:", token);

      // Send token to backend
      await fetch("/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    }
  };
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
