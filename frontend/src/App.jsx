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
import DonorDashboard from "./pages/Lochana/DonorDashboard";
import "./index.css";
import { useEffect, useState } from "react";
import { requestForToken } from "../firebase";
import axios from "axios";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

function AppRoutes() {
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    const fetchFCMToken = async () => {
      try {
        const fcmToken = await requestForToken();

        if (fcmToken) {
          console.log("FCM Token:", fcmToken);
          setFcmToken(fcmToken);

          // Send token to backend
          const apiUrl =
            import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";
          await axios.patch(
            `${apiUrl}/notifications/save-fcm-token`,
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
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Recipient-only routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={["Recipient"]}>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/needs"
        element={
          <PrivateRoute roles={["Recipient"]}>
            <NeedRequest />
          </PrivateRoute>
        }
      />
      <Route
        path="/upload-id"
        element={
          <PrivateRoute roles={["Recipient"]}>
            <DocumentUpload />
          </PrivateRoute>
        }
      />

      {/* Donor-only routes */}
      <Route
        path="/donor-dashboard"
        element={
          <PrivateRoute roles={["Donor"]}>
            <DonorDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/donor-needs"
        element={
          <PrivateRoute roles={["Donor"]}>
            <DonorNeeds />
          </PrivateRoute>
        }
      />
      <Route
        path="/donor-items"
        element={
          <PrivateRoute roles={["Donor"]}>
            <DonorItems />
          </PrivateRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute roles={["Admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* Authenticated routes (any role) */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/browse-items"
        element={
          <PrivateRoute>
            <BrowseItems />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
