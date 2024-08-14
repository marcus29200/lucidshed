import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers"
import { QueryClient } from "@tanstack/react-query";
import { ActionFunctionArgs, redirect, useNavigate, Form } from "react-router-dom"
import { createEpic } from "../../api/epics";
import FullHeightSection from "../../components/FullHeightSection";

// TODO: replace with the other type in the api directory
type Priority = 'critical' | 'high' | 'medium' | 'low';

// these are hard coded temporarily until they become configurable
const priorities = [
  {
    label: 'Critical',
    value: 'critical',
  },
  {
    label: 'High',
    value: 'high'
  },
  {
    label: 'Medium',
    value: 'medium',
  },
  {
    label: 'Small',
    value: 'low',
  }
]

export const action = (queryClient: QueryClient) => {
  return async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();

    await createEpic({
      orgId: params.orgId as string,
      data: {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        estimated_completion_date: new Date(formData.get('targetDate') as string).toISOString(),
        priority: formData.get('priority') as Priority,
        item_type: 'epic',
      }
    })
    await queryClient.invalidateQueries({ queryKey: ['epics'] })
    return redirect(`/${params.orgId}/epics`)
  }
}

export const CreateEpic = () => {
  const navigate = useNavigate()
  return (
    <FullHeightSection>
      <Box sx={{
        padding: '20px', minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column'
      }}>
        <Typography variant="subtitle1" align="left">Create New Epic</Typography>
        <Typography variant="subtitle2" color="neutral.light" align="left" sx={{ marginBottom: '16px' }}>Fill out the following details to create a new epic</Typography>
        <Typography variant="body1" align="left">Basic Details</Typography>
        <Form method="post" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid item xs={8}>
              <TextField variant="outlined" size="small" margin="dense" fullWidth label="Title" id="title" name="title"></TextField>
              <TextField variant="outlined" size="small" margin="dense" fullWidth label="Description" id="description" name="description" multiline minRows={8}></TextField>
            </Grid>
            <Grid item xs={4}>
              <DatePicker label="Estimated Completion" name="targetDate" slotProps={{ textField: { variant: "outlined", size: "small", margin: 'dense', fullWidth: true } }}></DatePicker>
              <FormControl sx={{ width: '100%' }}>
                <InputLabel size="small" id="priority-label">Priority</InputLabel>
                <Select variant="outlined" size="small" margin="dense" fullWidth labelId="priority-label" label="Priority" id="priority" name="priority">{
                  priorities.map(priority => <MenuItem value={priority.value} key={priority.value}>{priority.label}</MenuItem>)
                }</Select>
              </FormControl>
              <TextField variant="outlined" size="small" margin="dense" fullWidth label="Product Area" id="category" name="category"></TextField>
              <TextField variant="outlined" size="small" margin="dense" fullWidth label="Attachments/Files"></TextField>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant="contained" sx={{ backgroundColor: 'neutral.lightest', color: 'black' }} color="neutral" onClick={() => navigate('..', { relative: 'path' })}>Cancel</Button>
            <Button variant="contained" type="submit">Create Epic</Button>
          </Box>
        </Form>
      </Box >
    </FullHeightSection>
  )
}

