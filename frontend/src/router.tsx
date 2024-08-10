import { createBrowserRouter, redirect } from "react-router-dom";
import Home from "./routes/home/home";
import Login from "./routes/Login";
import Register from "./routes/register/register";
import Dashboard from "./routes/dashboard/dashboard";
import AppLayout from "./components/AppLayout";
import EpicsList from "./routes/epics/EpicsList";
import { Epic, loader as epicLoader } from './routes/epics/Epic';
import { Stories, loader as storiesLoader } from './routes/stories/Stories';
import { ResetPassword } from "./routes/ResetPassword";
import { CreateOrganization } from "./routes/CreateOrganization";
import { loader as organizationLoader } from './api/organizations';
import { loader as meLoader } from './api/users';
import EpicsCreationForm from "./routes/epics/EpicsCreationForm";
import { getEpics } from "./api/epics";
import UserSignupAdditionalInfo from "./routes/UserSignupAdditionalInfo";
import { QueryCache, QueryClient } from '@tanstack/react-query';


const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // this allows us to have a "global" redirect on the loader queries
    // since there is no way to do this in one place with react-router
    // or use a ProtectedRoute component (since loaders will fire before it is rendered)
    onError: (error: any) => {
      if (error?.status === 401) {
        window.location.replace('/login');
      }
    }
  })
})

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
    loader: meLoader(queryClient),
    element: <UserSignupAdditionalInfo />
  },
  {
    id: 'user',
    loader: meLoader(queryClient),
    children: [
      {
        element: <AppLayout />,
        path: ':orgId',
        id: 'org',
        loader: organizationLoader(queryClient),
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
                element: <EpicsList />,
                loader: async ({ params }) => {
                  return getEpics({ orgId: params.orgId, });
                },
              },
              {
                path: ':id',
                element: <Epic />,
                loader: epicLoader(queryClient)
              },
              {
                path: 'new',
                element: <EpicsCreationForm />
              }
            ],
          },
          {
            path: 'stories',
            children: [
              {
                index: true,
                element: <Stories />
              }
            ]
          },
          {
            path: '*',
            element: <p>Nothing here :(</p>
          }

        ]
      },
    ],
  },
  {
    path: '*',
    element: <p>Nothing here :(</p>
  }
]);
