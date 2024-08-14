import { Box, FormControl, Grid, InputLabel, Select, TextField, Typography, MenuItem, Button } from "@mui/material"
import FullHeightSection from "../../components/FullHeightSection"
import { ActionFunctionArgs, Form, redirect, useNavigate } from "react-router-dom"
import { DatePicker } from "@mui/x-date-pickers"
import { QueryClient } from "@tanstack/react-query"
import { createStory } from "../../api/stories"
import { useState } from "react"

const METADATA_FIELD_OPTIONS: { value: string, label: string }[] = [
  {
    label: 'Due Date',
    value: 'due-date'
  },
  {
    label: 'Estimated time',
    value: 'estimated-time'
  }
]

export const action = (queryClient: QueryClient) => {
  return async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const newData = await createStory({
      orgId: params.orgId as string,
      data: {
        title: data.title,
        description: data.description,
        item_type: 'story',
      }
    });
    await queryClient.invalidateQueries({ queryKey: ['stories'] }, { throwOnError: true });

    return redirect(`/${params.orgId}/stories`)
  }
}

export const CreateStory = () => {
  const navigate = useNavigate();
  const [metadataFields, setMetaDataFields] = useState();

  return (
    <FullHeightSection>
      <Box sx={{
        padding: '20px', minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column'
      }}>
        <Typography variant="subtitle1" align="left">Create New Story</Typography>
        <Typography variant="subtitle2" color="neutral.light" align="left" sx={{ marginBottom: '16px' }}>Fill out the following details to create a new story</Typography>
        <Typography variant="body1" align="left">Basic Details</Typography>
        <Form method="post" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid item xs={8}>
              <TextField variant="outlined" size="small" margin="dense" fullWidth label="Title" id="title" name="title"></TextField>
              <TextField variant="outlined" size="small" margin="dense" fullWidth label="Description" id="description" name="description" multiline minRows={8}></TextField>
            </Grid>
            <Grid item xs={4}>
              <FormControl sx={{ width: '100%', mt: '8px' }}>
                <InputLabel size="small" id="extra-details">Add story details</InputLabel>
                <Select variant="outlined" size="small" margin="dense" fullWidth labelId="extra-details" label="Add story details" id="extra-details" name="extra-details" value=''>
                  {METADATA_FIELD_OPTIONS.map(opt => <MenuItem value={opt.value} key={opt.value}>{opt.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant="contained" sx={{ backgroundColor: 'neutral.lightest', color: 'black' }} color="neutral" onClick={() => navigate('..', { relative: 'path' })}>Cancel</Button>
            <Button variant="contained" type="submit">Create Story</Button>
          </Box>
        </Form>
      </Box >
    </FullHeightSection>
  )
}
