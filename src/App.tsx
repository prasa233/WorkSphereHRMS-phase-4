import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Attendance } from "./pages/Attendance";
import { Leaves } from "./pages/Leaves";
import { Payroll } from "./pages/Payroll";
import { Employees } from "./pages/Employees";
import { LeaveApprovals } from "./pages/LeaveApprovals";
import { UserManagement } from "./pages/UserManagement";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/forbidden" element={<div>You don’t have access to this page.</div>} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/payroll" element={<Payroll />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["HR", "ADMIN"]} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/leave-approvals" element={<LeaveApprovals />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/users" element={<UserManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}