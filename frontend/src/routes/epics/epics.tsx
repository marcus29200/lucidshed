import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import EpicsTable from "./EpicsTable";
import EpicRow from "./EpicRow";
import { useLoaderData, useNavigate } from "react-router-dom";

const Epics = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('');
  // TODO: type the epics
  const epics = useLoaderData();
  // TODO: implement search


  const filteredItems = epics.filter(epic => epic.title.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingX: '12px', paddingY: '6px' }}>
        <Typography variant="h6">Epic Overview</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TextField variant="outlined" size="small" margin="none" label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}></TextField>
          <Button variant="contained" onClick={() => navigate('new')}>Create Epic</Button>
        </Box>
      </Box>
      <EpicsTable>
        {filteredItems.map(epic => <EpicRow epic={epic} key={epic.id} />)}
      </EpicsTable>
    </>
  )
}

export default Epics;
