import { Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";


const NAVIGATION_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: "dashboard"
  },
  {
    to: '/epics',
    label: 'Epics',
    icon: "book"
  },
  {
    to: '/stories',
    label: 'Stories',
    icon: 'book',
  },
  {
    to: '/tasks',
    label: 'Tasks',
    icon: 'tasks',
  },
  {
    to: '/sprints',
    label: 'Sprints',
    icon: 'sprint'
  }
]

const Sidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const width = expanded ? '240px' : '72px';
  return (
    <Drawer
      sx={{
        width,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          overflowX: 'hidden'
        },
      }}
      variant="permanent" anchor="left">
      <Box sx={{ display: "flex", alignItems: 'center', justifyContent: 'center', paddingY: '20px', gap: '16px' }}>
        {expanded ? (
          <>
            <img src="/logo.svg" width="140" />
            <ArrowBackIcon onClick={() => setExpanded(false)} />
          </>
        ) : <img src="/mini-logo.svg" height="40" onClick={() => setExpanded(true)} />}
      </Box>

      <Divider variant="middle" />
      <List>
        {NAVIGATION_ITEMS.map(item => (
          <ListItemButton key={item.to} selected={location.pathname.includes(item.to)} color="primary" component={Link} to={item.to} style={{ textDecoration: 'none', paddingLeft: '22px' }}>
            <ListItemIcon>
              {/* TODO: implement actual icons later */}
              <WidgetsOutlinedIcon />
            </ListItemIcon>
            <ListItemText sx={{ color: 'black' }}>
              {item.label}
            </ListItemText>
          </ListItemButton>
        ))
        }
      </List>
      <Divider variant="middle" />

    </Drawer>
  )
}

export default Sidebar;
