import { createBrowserRouter } from "react-router-dom";
import Home from "./routes/home/home";
import Login from "./routes/Login";
import Register from "./routes/register/register";
import Dashboard from "./routes/dashboard/dashboard";
import ProtectedRoute from './routes/protectedRoute/protectedRoute'
import AppLayout from "./components/AppLayout";
import Epics from "./routes/epics/Epics";
import Stories from "./routes/stories/stories";
import Tasks from "./routes/tasks/tasks";
import { ResetPassword } from "./routes/ResetPassword";
import { CreateOrganization } from "./routes/CreateOrganization";
import { getOrganization } from "./api/organizations";
import EpicsCreationForm from "./routes/epics/EpicsCreationForm";
import { getEpics } from "./api/epics";
import UserSignupAdditionalInfo from "./routes/UserSignupAdditionalInfo";
import { getUser } from "./api/users";
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
    loader: async () => {
      const userId = localStorage.getItem('userId');
      return getUser(userId);
    },
    element: <UserSignupAdditionalInfo />
  },
  {
    element: <ProtectedRoute />,
    id: 'user',
    loader: async () => {
      const userId = localStorage.getItem('userId');
      return getUser(userId as string)
    },
    children: [
      {
        element: <AppLayout />,
        path: ':orgId',
        loader: async ({ params }) => {
          return getOrganization(params.orgId);
        },
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          {
            path: 'epics',
            children: [

              {
                index: true,
                element: <Epics />,
                loader: async ({ params }) => {
                  return getEpics({ orgId: params.orgId, });
                },
              },
              {
                path: 'new',
                element: <EpicsCreationForm />
              }
            ],
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
