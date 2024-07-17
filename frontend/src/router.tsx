import { createBrowserRouter } from "react-router-dom";
import Home from "./routes/home/home";
import Login from "./routes/login/login";
import Register from "./routes/register/register";
import Dashboard from "./routes/dashboard/dashboard";
import ProtectedRoute from './routes/protectedRoute/protectedRoute'
import AppLayout from "./components/AppLayout";
import Epics from "./routes/epics/epics";
import Stories from "./routes/stories/stories";
import Tasks from "./routes/tasks/tasks";
import { ResetPassword } from "./routes/ResetPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />
          },
          {
            path: '/epics',
            element: <Epics />
          },
          {
            path: '/stories',
            element: <Stories />
          },
          {
            path: '/tasks',
            element: <Tasks />
          }
        ]
      },
    ],
  },
]);
