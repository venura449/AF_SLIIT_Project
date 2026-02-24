import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Venura/Login';
import Register from './pages/Venura/Register';
import Dashboard from './pages/Venura/Dashboard';
import AdminDashboard from './pages/Venura/AdminDashboard';
import Profile from './pages/Venura/Profile';
import DocumentUpload from './pages/Venura/DocumentUpload';
import './index.css';
import { messaging, onMessage } from "./firebase";
import { use, useEffect } from 'react';


function App() {

  useEffect(() => {
   
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
