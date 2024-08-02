import { Box, Button, Grid, TextField, Typography } from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers"
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom"
import { createEpic } from "../../api/epics";

const EpicsCreationForm = () => {
  const { orgId } = useParams();
  const { mutate } = useMutation({
    mutationFn: createEpic,
    onSuccess: () => {
      navigate('..', { relative: 'path' });
    },
    onError: (error) => {
      // TODO: present some kind of error toast
      console.error(error)
    }
  });

  // TODO: set up the mutation
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.target as any;
    mutate({
      orgId: orgId as string,
      data: {
        title: form?.elements?.title?.value,
        description: form?.elements?.description?.value,
        // estimated_completion_date: new Date(form?.elements?.targetDate?.value).toISOString(),
        priority: form?.elements?.priority?.value,
        item_type: 'epic'
      }
    })

  }
  const navigate = useNavigate()
  return (
    <Box sx={{
      padding: '20px', minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column'
    }}>
      <Typography variant="subtitle1" align="left">Create New Epic</Typography>
      <Typography variant="subtitle2" color="neutral.light" align="left" sx={{ marginBottom: '16px' }}>Fill out the following details to create a new epic</Typography>
      <Typography variant="body1" align="left">Basic Details</Typography>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          <Grid item xs={8}>
            <TextField variant="outlined" size="small" margin="dense" fullWidth label="Title" id="title" name="title"></TextField>
            <TextField variant="outlined" size="small" margin="dense" fullWidth label="Description" id="description" name="description" multiline minRows={8}></TextField>
          </Grid>
          <Grid item xs={4}>
            <DatePicker label="Estimated Completion" name="targetDate" slotProps={{ textField: { variant: "outlined", size: "small", margin: 'dense', fullWidth: true } }}></DatePicker>
            <TextField variant="outlined" size="small" margin="dense" fullWidth label="Priority" id="priority" name="priority"></TextField>
            <TextField variant="outlined" size="small" margin="dense" fullWidth label="Category" id="category" name="category"></TextField>
            <TextField variant="outlined" size="small" margin="dense" fullWidth label="Attachments/Files"></TextField>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button variant="contained" sx={{ backgroundColor: 'neutral.lightest', color: 'black' }} color="neutral" onClick={() => navigate('..', { relative: 'path' })}>Cancel</Button>
          <Button variant="contained" type="submit">Create Epic</Button>
        </Box>
      </form>
    </Box >

  )
}

export default EpicsCreationForm
