import { Routes, Route } from "react-router";
import Login from "./pages/register/Login";
import MainLayout from "./layouts/MainLayout";
import SignUp from "./pages/register/SignUp";
import MainPage from "./pages/register/homepage/mainpage";
import Blogs from "./pages/register/homepage/Blogs";
import BlogView from "./pages/register/homepage/BlogView";
import Pricing from "./pages/register/homepage/Pricing";
import AuthLayout from "./layouts/AuthLayout";
import UserDashboardLayout from "./layouts/user-dashboard-layout";
import UserDashboardHome from "./pages/user-dashboard/UserDashboardHome";
import Courses from "./pages/user-dashboard/Courses";
import UserSettings from "./pages/user-dashboard/UserSettings";
import CourseDetail from "./pages/user-dashboard/CourseDetail";
import RootLayout from "./layouts/RootLayout";
import Users from "./pages/users/Users";
import Enrollments from "./pages/enrollments/Enrollments";
import DashboardBlogs from "./pages/blogs/Blogs";

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog" element={<BlogView />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          <Route path="/dashboard" element={<UserDashboardLayout />}>
            <Route path="" element={<UserDashboardHome />} />
            <Route path="courses" element={<Courses />} />
            <Route path="course/:id" element={<CourseDetail />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="users" element={<Users />} />
            <Route path="enrollments" element={<Enrollments />} />
            <Route path="blogs" element={<DashboardBlogs />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
