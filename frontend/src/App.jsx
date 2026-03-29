import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Venura/Login";
import Register from "./pages/Venura/Register";
import Dashboard from "./pages/Venura/Dashboard";
import AdminDashboard from "./pages/Venura/AdminDashboard";
import Profile from "./pages/Venura/Profile";
import DocumentUpload from "./pages/Venura/DocumentUpload";
import RequestHistory from "./pages/Venura/RequestHistory";
import NeedRequest from "./pages/Lochana/NeedRequest";
import DonorNeeds from "./pages/Lochana/DonorNeeds";
import DonorItems from "./pages/Lochana/DonorItems";
import BrowseItems from "./pages/Lochana/BrowseItems";
import "./index.css";
import { useEffect, useState } from "react";
import { requestForToken } from "../firebase";
import axios from "axios";

function App() {
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    const fetchFCMToken = async () => {
      try {
        const fcmToken = await requestForToken();

        if (fcmToken) {
          console.log("FCM Token:", fcmToken);
          setFcmToken(fcmToken);

          // Send token to backend
          await axios.patch(
            "http://localhost:5001/api/v1/notifications/save-fcm-token",
            {
              fcmToken: fcmToken,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          console.log("Token saved to backend");
        }
      } catch (err) {
        console.log("Error getting token:", err);
      }
    };

    fetchFCMToken();
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
        <Route path="/request-history" element={<RequestHistory />} />
        <Route path="/needs" element={<NeedRequest />} />
        <Route path="/donor-needs" element={<DonorNeeds />} />
        <Route path="/donor-items" element={<DonorItems />} />
        <Route path="/browse-items" element={<BrowseItems />} />
      </Routes>
    </Router>
  );
}

export default App;
