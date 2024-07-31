import { AppBar, Box, Divider, Toolbar, Typography } from "@mui/material"

const AppHeader = (props: { children?: React.ReactNode, title: string }) => {
  return (
    <Toolbar sx={{ height: '80px', display: 'flex', backgroundColor: 'white', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
      <Typography variant="h6" component="div">
        {props.title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* In theory the children here would be the action buttons to create a given
      object for each page this is used on */}
        {props.children}
        <Divider orientation="vertical" flexItem />
        {/* this box is really just a placeholder for a user avatar/menu likely */}
        <Box sx={{ backgroundColor: 'neutral.lighter', height: '36px', width: '36px', borderRadius: '8px' }} />
      </Box>
    </Toolbar>
  )
}

export default AppHeader
