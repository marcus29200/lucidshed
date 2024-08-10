import { Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { BookIcon, DashboardIcon, EpicIcon, SprintIcon } from "../icons/icons";
import { Add } from "@mui/icons-material";


const NAVIGATION_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: () => <DashboardIcon />,
  },
  {
    to: 'epics',
    label: 'Epics',
    icon: () => <EpicIcon />,
    canAdd: true
  },
  {
    to: 'stories',
    label: 'Stories',
    icon: () => <BookIcon />,
    canAdd: true,
  },
  {
    to: 'sprints',
    label: 'Sprints',
    icon: () => <SprintIcon />,
    canAdd: true,
  }
]

// TODO: update the sidebar button to close/open sidebar
// TODO: update active list item css
const Sidebar = () => {
  const { orgId } = useParams()
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const width = expanded ? '240px' : '72px';
  const addItem = (e, to: string) => {
    e.preventDefault();
    navigate(`/${orgId}/${to}/new`)
  }
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
            {item.canAdd ? (
              <IconButton sx={{ zIndex: 10 }} onClick={(e) => addItem(e, item.to)}>
                <Add />
              </IconButton>) : null}
          </ListItemButton>
        ))
        }
      </List>
      <Divider variant="middle" />
    </Drawer >
  )
}

export default Sidebar;
