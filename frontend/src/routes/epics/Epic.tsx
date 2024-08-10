import { Box, Typography, TextField, Button, Grid } from "@mui/material";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom"
import Section from "../../components/Section";
import { format } from "date-fns";
import { QueryClient, queryOptions } from "@tanstack/react-query";
import { getEpic } from "../../api/epics";

export const epicDetailQuery = (orgId: string, epicId: string) => queryOptions({
  queryKey: ['epics', 'detail', orgId, epicId],
  queryFn: async () => getEpic({ orgId, epicId }),
})


export const loader = (queryClient: QueryClient) => {
  return async ({ params }: LoaderFunctionArgs) => {
    if (!params.orgId) {
      throw new Error('No org id provided')
    }
    if (!params.id) {
      throw new Error('No epic id provided');
    }
    return queryClient.ensureQueryData(epicDetailQuery(params.orgId, params.id))
  }
}

export const Epic = () => {
  const epic = useLoaderData();
  const formattedCompletionDate = epic.estimated_completion_date ? format(new Date(epic.estimated_completion_date), 'MMM dd, yyyy') : null;
  return (
    <>
      <Section>
        <Grid container sx={{ padding: 0 }}>
          <Grid item xs={6}>
            <Typography variant="h4" align="left">{epic.title}</Typography>
            <TextField variant="outlined" size="small" margin="dense" fullWidth label="Description" id="description" name="description" multiline minRows={8} value={epic.description}></TextField>
          </Grid>
          <Grid item xs={6}>
            {/* TODO: format all of this */}
            <Typography>{formattedCompletionDate}</Typography>
            <Typography>{epic.priority[0].toUpperCase() + epic.priority.slice(1)}</Typography>
            <Typography>{epic.product_area}</Typography>
            <Typography>Attachments/Files</Typography>
          </Grid>
        </Grid>
      </Section>
      <br />
      <Section>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingX: '12px', paddingY: '6px' }}>
          <Typography variant="h6">Stories</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TextField variant="outlined" size="small" margin="none" label="Search">
            </TextField>
            <Button variant="outlined">Add Story</Button>

            <Button variant="contained">Create Story</Button>
          </Box>
        </Box>
      </Section>
    </>
  )
}
