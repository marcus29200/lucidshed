import { Box, Button, Grid, TextField, Typography } from "@mui/material"
import FullHeightSection from "../../components/FullHeightSection"
import { DatePicker } from "@mui/x-date-pickers"
import { ActionFunctionArgs, Form, redirect, useNavigate } from 'react-router-dom';
import { QueryClient } from "@tanstack/react-query";
import { createSprint } from "../../api/sprints";


export const action = (queryClient: QueryClient) => {
  return async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    await createSprint({
      orgId: params.orgId,
      data: {
        title: updates.title,
        description: updates.description,
        start_date: new Date(updates.startDate).toISOString(),
        end_date: new Date(updates.endDate).toISOString(),
      }
    })
    queryClient.invalidateQueries({ queryKey: ['sprints'] });
    return redirect(`/${params.orgId}/sprints`)
  }
}

export const CreateSprint = () => {
  const navigate = useNavigate();
  return (
    <FullHeightSection>
      <Box sx={{
        padding: '20px', minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column'
      }}>
        <Typography variant="subtitle1" align="left">Create New Sprint</Typography>
        <Typography variant="subtitle2" color="neutral.light" align="left" sx={{ marginBottom: '16px' }}>Fill out the following details to create a new sprint</Typography>
        <Typography variant="body1" align="left">Basic Details</Typography>
        <Form method="post" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid item xs={8}>
              <TextField variant="outlined" size="small" margin="dense" fullWidth label="Title" id="title" name="title"></TextField>
              <TextField variant="outlined" size="small" margin="dense" fullWidth label="Description" id="description" name="description" multiline minRows={8}></TextField>
            </Grid>
            <Grid item xs={4}>
              <DatePicker label="Start date" name="startDate" slotProps={{ textField: { variant: "outlined", size: "small", margin: 'dense', fullWidth: true } }}></DatePicker>
              <DatePicker label="End date" name="endDate" slotProps={{ textField: { variant: "outlined", size: "small", margin: 'dense', fullWidth: true } }}></DatePicker>
              {/* TODO: TEAMS AND FILES */}
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant="contained" sx={{ backgroundColor: 'neutral.lightest', color: 'black' }} color="neutral" onClick={() => navigate('..', { relative: 'path' })}>Cancel</Button>
            <Button variant="contained" type="submit">Create Sprint</Button>
          </Box>
        </Form>
      </Box >
    </FullHeightSection>
  )

}

