import { Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { BookIcon, DashboardIcon, EpicIcon, SprintIcon, TaskIcon } from "../icons/icons";


const NAVIGATION_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: () => <DashboardIcon />
  },
  {
    to: 'epics',
    label: 'Epics',
    icon: () => <EpicIcon />,
  },
  {
    to: 'stories',
    label: 'Stories',
    icon: () => <BookIcon />,
  },
  {
    to: 'tasks',
    label: 'Tasks',
    icon: () => <TaskIcon />,
  },
  {
    to: 'sprints',
    label: 'Sprints',
    icon: () => <SprintIcon />
  }
]

// TODO: update the sidebar button to close/open sidebar
// TODO: update active list item css
const Sidebar = () => {
  const { orgId } = useParams()
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

      <Divider />
      <List>
        {NAVIGATION_ITEMS.map(item => (
          <ListItemButton key={item.to} selected={location.pathname.includes(item.to) && item.to != '/'} color="primary" component={Link} to={`/${orgId}/${item.to}`} style={{ textDecoration: 'none', paddingLeft: '22px' }}>
            <ListItemIcon>
              {item.icon()}
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
