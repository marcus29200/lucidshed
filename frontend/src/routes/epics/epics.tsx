
import { Box, Button, TextField, Typography } from "@mui/material";
import EpicsTable from "./EpicsTable";
import { useNavigate } from "react-router-dom";
const Epics = () => {
  const navigate = useNavigate()
  // TODO: there needs to be a loader :)
  // TODO: fill top action bar (search/filter/create)
  // TODO: add table and row items

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingX: '12px', paddingY: '6px' }}>
        <Typography variant="h6">Epic Overview</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TextField variant="outlined" size="small" margin="none" label="search"></TextField>
          <Button variant="contained" onClick={() => navigate('new')}>Create Epic</Button>
        </Box>
      </Box>
      <EpicsTable />

    </>

  )
}

export default Epics;
