import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';


const AppLayout = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }} >
        <Outlet />
      </Box>
    </Box>
  )
}

export default AppLayout;
