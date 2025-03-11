import { createHashRouter } from 'react-router-dom';
import Home from './routes/home/home';
import Login from './routes/Login';
import Register from './routes/register/register';
import AppLayout from './components/AppLayout';
import { Epics, epicsLoader } from './routes/epics/Epics';
import { EpicDetails, epicLoader } from './routes/epics/Epic';
import { Stories } from './routes/stories/Stories';
import { ResetPassword } from './routes/ResetPassword';
import { CreateOrganization } from './routes/CreateOrganization';
import { organizationLoader } from './api/organizations';
import { meLoader } from './api/users';
import { CreateEpic } from './routes/epics/CreateEpic';
import UserSignupAdditionalInfo from './routes/UserSignupAdditionalInfo';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { Sprints, sprintsLoader } from './routes/sprints/Sprints';
import {
	CreateSprint,
	action as createSprintAction,
} from './routes/sprints/CreateSprint';
import { CreateStory } from './routes/stories/CreateStory';
import { Story } from './routes/stories/Story';
import EpicsDashboard from './routes/epics/EpicDashboard';
import { storiesLoader, storyLoader } from './routes/stories/Story.hooks';
import SprintsDashboard from './routes/sprints/SprintsDashboard';
import BacklogList from './routes/backlog/BacklogList';
import { backlogLoader } from './routes/backlog/backlog.loaders';
import { featureRequestsLoader } from './routes/featureRequests/featureRequests.loader';
import FeatureRequestList from './routes/featureRequests/FeatureRequestsList';
import ProductRequestList from './routes/productRequests/ProductRequestsList';
import FeaturesList from './routes/features/FeaturesList';
import {
	featureDetailLoader,
	featuresLoader,
} from './routes/features/features.loader';
import FeatureDetail from './routes/features/FeatureDetails';

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		// this allows us to have a "global" redirect on the loader queries
		// since there is no way to do this in one place with react-router
		// or use a ProtectedRoute component (since loaders will fire before it is rendered)
		onError: (error: Error & { status?: number; detail?: string }) => {
			console.log(error);

			if (error.status === 401 || error.detail === 'Invalid Token') {
				window.location.replace('/shed/#/login');
			}
			if (error.status === 404) {
				console.log(window.location.pathname);
				window.location.replace(
					window.location.pathname.split('/').slice(0, -1).join('/')
				);
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
		children: [
			{
				element: <AppLayout />,
				path: ':orgId',
				id: 'org',
				loader: organizationLoader(queryClient),
				children: [
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
								element: <Story />,
							},
							{
								path: 'new',
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
						path: 'backlog',
						children: [
							{
								index: true,
								loader: backlogLoader(queryClient),
								element: <BacklogList />,
							},
						],
					},
					{
						path: 'product-requests',
						children: [
							{
								index: true,
								element: <ProductRequestList />,
							},
						],
					},
					{
						path: 'feature-requests',
						children: [
							{
								index: true,
								loader: featureRequestsLoader(queryClient),
								element: <FeatureRequestList />,
							},
							{
								path: ':featureRequestId',
								loader: featureRequestsLoader(queryClient),
								element: <FeatureRequestList />,
							},
						],
					},
					{
						path: 'features',
						children: [
							{
								index: true,
								loader: featuresLoader(queryClient),
								element: <FeaturesList />,
							},
							{
								path: ':new',
								loader: featuresLoader(queryClient),
								element: <FeaturesList />,
							},
							{
								path: ':featureId/requests',
								loader: featureDetailLoader(queryClient),
								element: <FeatureDetail />,
							},
							{
								path: ':featureId/requests/:featureRequestId',
								loader: featureDetailLoader(queryClient),
								element: <FeatureDetail />,
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
