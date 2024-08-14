import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import EpicsTable from "./EpicsTable";
import EpicRow from "./EpicRow";
import { LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router-dom";
import FullHeightSection from "../../components/FullHeightSection";
import { getEpics } from "../../api/epics";
import { QueryClient, queryOptions } from "@tanstack/react-query";

export const epicsQuery = (orgId: string) => queryOptions({
  queryKey: ['epics', orgId],
  queryFn: async () => getEpics(orgId)
})


export const loader = (queryClient: QueryClient) => {
  return async ({ params }: LoaderFunctionArgs) => {
    if (!params.orgId) {
      throw new Error('No org id provided')
    }
    return queryClient.ensureQueryData(epicsQuery(params.orgId, params.search))
  }
}


export const Epics = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('');
  // TODO: add a type for the epics list
  const epics = useLoaderData();
  const filteredItems = epics.filter(epic => epic.title.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <FullHeightSection>
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
    </FullHeightSection>
  )
}

