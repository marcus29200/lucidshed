import { Box, Button, Typography, TextField } from "@mui/material";
import FullHeightSection from "../../components/FullHeightSection"
import { Link } from "react-router-dom";

// TODO: stories loader
// TODO: stories table
export const Stories = () => {
  return (
    <FullHeightSection>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingX: '12px', paddingY: '6px' }}>
        <Typography variant="h6">Stories</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TextField variant="outlined" size="small" margin="none" label="Search"></TextField>
          <Button variant="contained" component={Link} to="new">Create Epic</Button>
        </Box>
      </Box>
    </FullHeightSection>
  )
}

