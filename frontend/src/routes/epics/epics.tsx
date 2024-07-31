
import { Box, Button, TextField, Typography } from "@mui/material";
import EpicsTable from "./EpicsTable";
import EpicRow from "./EpicRow";
import { useLoaderData, useNavigate } from "react-router-dom";
const Epics = () => {
  const navigate = useNavigate()
  const epics = useLoaderData();
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
      <EpicsTable>
        {epics.map(epic => <EpicRow epic={epic} key={epic.id} />)}
      </EpicsTable>
    </>
  )
}

export default Epics;
