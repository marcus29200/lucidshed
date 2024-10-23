import { createHashRouter } from 'react-router-dom';
import Home from './routes/home/home';
import Login from './routes/Login';
import Register from './routes/register/register';
import Dashboard from './routes/dashboard/dashboard';
import AppLayout from './components/AppLayout';
import { Epics, loader as epicsLoader } from './routes/epics/Epics';
import { EpicDetails, loader as epicLoader } from './routes/epics/Epic';
import { Stories } from './routes/stories/Stories';
import { ResetPassword } from './routes/ResetPassword';
import { CreateOrganization } from './routes/CreateOrganization';
import { loader as organizationLoader } from './api/organizations';
import { loader as meLoader } from './api/users';
import { CreateEpic } from './routes/epics/CreateEpic';
import UserSignupAdditionalInfo from './routes/UserSignupAdditionalInfo';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { Sprints, loader as sprintsLoader } from './routes/sprints/Sprints';
import {
	CreateSprint,
	action as createSprintAction,
} from './routes/sprints/CreateSprint';
import { CreateStory } from './routes/stories/CreateStory';
import { Story } from './routes/stories/Story';
import EpicsDashboard from './routes/epics/EpicDashboard';
import {
	createStoryAction,
	storiesLoader,
	storyLoader,
	updateStoryAction,
} from './routes/stories/Story.hooks';
import SprintsDashboard from './routes/sprints/SprintsDashboard';

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		// this allows us to have a "global" redirect on the loader queries
		// since there is no way to do this in one place with react-router
		// or use a ProtectedRoute component (since loaders will fire before it is rendered)
		onError: (error: Error & { status?: number }) => {
			if (error.status === 401) {
				window.location.replace('/shed/#/login');
			}
		},
	}),
});

export const router = createHashRouter([
	{
		path: '/',
		element: <Home />,
	},
	{
		path: '/login',
		element: <Login />,
	},
	{
		path: '/register',
		element: <Register />,
	},
	{
		path: '/reset-password',
		element: <ResetPassword />,
	},
	{
		path: '/setup/org',
		element: <CreateOrganization />,
	},
	{
		path: '/setup/user',
		loader: meLoader(queryClient),
		element: <UserSignupAdditionalInfo />,
	},
	{
		id: 'user',
		loader: meLoader(queryClient),
		errorElement: <Login />,
		children: [
			{
				element: <AppLayout />,
				path: ':orgId',
				id: 'org',
				loader: organizationLoader(queryClient),
				children: [
					{
						index: true,
						element: <Dashboard />,
					},
					{
						path: 'epics',
						children: [
							{
								index: true,
								element: <Epics />,
								loader: epicsLoader(queryClient),
							},
							{
								path: ':epicId',
								element: <EpicDetails />,
								loader: epicLoader(queryClient),
							},
							{
								path: ':epicId/dashboard',
								element: <EpicsDashboard />,
								loader: epicLoader(queryClient),
							},
							{
								path: 'new',
								element: <CreateEpic />,
							},
						],
					},
					{
						path: 'stories',
						children: [
							{
								index: true,
								loader: storiesLoader(queryClient),
								element: <Stories />,
							},
							{
								path: ':storyId',
								loader: storyLoader(queryClient),
								action: updateStoryAction(queryClient),
								element: <Story />,
							},
							{
								path: 'new',
								action: createStoryAction(queryClient),
								element: <CreateStory />,
							},
						],
					},
					{
						path: 'sprints',
						children: [
							{
								index: true,
								loader: sprintsLoader(queryClient),
								element: <Sprints />,
							},
							{
								path: 'new',
								action: createSprintAction(queryClient),
								element: <CreateSprint />,
							},
							{
								path: 'dashboard',
								element: <SprintsDashboard />,
								loader: sprintsLoader(queryClient),
							},
						],
					},
					{
						path: '*',
						element: <p>Nothing here :(</p>,
					},
				],
			},
		],
	},
	{
		path: '*',
		element: <p>Nothing here :(</p>,
	},
]);
