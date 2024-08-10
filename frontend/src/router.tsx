import { createBrowserRouter, redirect } from "react-router-dom";
import Home from "./routes/home/home";
import Login from "./routes/Login";
import Register from "./routes/register/register";
import Dashboard from "./routes/dashboard/dashboard";
import AppLayout from "./components/AppLayout";
import EpicsList from "./routes/epics/EpicsList";
import { Epic, loader as epicLoader } from './routes/epics/Epic';
import { Stories } from './routes/stories/Stories';
import { ResetPassword } from "./routes/ResetPassword";
import { CreateOrganization } from "./routes/CreateOrganization";
import { loader as organizationLoader } from './api/organizations';
import { loader as meLoader } from './api/users';
import { CreateEpic, action as createEpicAction } from "./routes/epics/CreateEpic";
import { getEpics } from "./api/epics";
import UserSignupAdditionalInfo from "./routes/UserSignupAdditionalInfo";
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { Sprints, loader as sprintsLoader } from "./routes/sprints/Sprints";
import { CreateSprint, action as createSprintAction } from "./routes/sprints/CreateSprint";


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
                action: createEpicAction(queryClient),
                element: <CreateEpic />
              }
            ],
          },
          {
            path: 'stories',
            children: [
              {
                index: true,
                // loader: storiesLoader(queryClient),
                element: <Stories />
              }
            ]
          },
          {
            path: 'sprints',
            children: [
              {
                index: true,
                loader: sprintsLoader(queryClient),
                element: <Sprints />
              },
              {
                path: 'new',
                action: createSprintAction(queryClient),
                element: <CreateSprint />
              }


            ],
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
