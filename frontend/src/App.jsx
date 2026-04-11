import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "./services/stripe";
import { useEffect } from "react";
import Login from "./pages/Venura/Login";
import Register from "./pages/Venura/Register";
import ForgotPassword from "./pages/Venura/ForgotPassword";
import ResetPassword from "./pages/Venura/ResetPassword";
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
import FeedbackPage from "./pages/Heyli/Feedback";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { listenForForegroundMessages } from "../firebase";

function AppRoutes() {
  return (
    
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

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
          <PrivateRoute roles={["Recipient", "Donor"]}>
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
      <Elements stripe={stripePromise}>
        <DonorNeeds />
      </Elements>
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

      <Route
        path="/feedback"
        element={
          <PrivateRoute>
            <FeedbackPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    const unsubscribe = listenForForegroundMessages((payload) => {
      const title = payload?.notification?.title || "New notification";
      const body = payload?.notification?.body || "You received a new update.";

      toast.info(`${title}: ${body}`);

      if (Notification.permission === "granted") {
        new Notification(title, { body });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
