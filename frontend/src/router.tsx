import { createBrowserRouter } from "react-router-dom";
import Home from "./routes/home/home";
import Login from "./routes/Login";
import Register from "./routes/register/register";
import Dashboard from "./routes/dashboard/dashboard";
import ProtectedRoute from './routes/protectedRoute/protectedRoute'
import AppLayout from "./components/AppLayout";
import Epics from "./routes/epics/epics";
import Stories from "./routes/stories/stories";
import Tasks from "./routes/tasks/tasks";
import { ResetPassword } from "./routes/ResetPassword";
import { CreateOrganization } from "./routes/CreateOrganization";
import { getOrganization } from "./api/organizations";
// import { QueryClient } from "@tanstack/react-query";

// const queryClient = new QueryClient({
//         queryCache: new QueryCache({
//         onError: (error) => {
//           if (
//             error?.response?.status === 400 ||
//             error?.response?.status === 401
//           ) {
//             navigate();
//           }
//         },
//       }),
// })

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
    path: "/setup/org",
    element: <CreateOrganization />
  },
  {
    path: "/setup/user",
    element: <>This will be user setup</>
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        path: ':orgId',
        loader: async ({ params }) => {
          return getOrganization(params.orgId);
        },
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />
          },
          {
            path: 'epics',
            loader: async ({ params }) => {
              console.log(params)
              // TODO: get epics
            },
            element: <Epics />
          },
          {
            path: 'stories',
            element: <Stories />
          },
          {
            path: 'tasks',
            element: <Tasks />
          }
        ]
      },
    ],
  },
]);
