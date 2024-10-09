import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/poppins';
import '@fontsource/poppins/400.css'; // Specify weight
import '@fontsource/poppins/500.css'; // Specify weight
import '@fontsource/poppins/600.css'; // Specify weight
import '@fontsource/poppins/700.css'; // Specify weight
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router, queryClient } from './router';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { AuthProvider } from './hooks/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterDateFns}>
				<QueryClientProvider client={queryClient}>
					<AuthProvider>
						<RouterProvider router={router} />
					</AuthProvider>
				</QueryClientProvider>
			</LocalizationProvider>
		</ThemeProvider>
	</React.StrictMode>
);
