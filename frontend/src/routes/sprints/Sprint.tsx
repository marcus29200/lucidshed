import { Box, Grid, LinearProgress, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Form, LoaderFunctionArgs, useLoaderData, useLocation, useSearchParams, useSubmit } from "react-router-dom";
import SprintSearchInput from "./SprintSearchInput";
import Section from "../../components/Section";
import SprintStoryTable from "./SprintStoryTable";
import { SprintStoryRow } from "./SprintStoryRow";
import { getStories } from "../../api/stories";
import { getSprint } from "../../api/sprints";
import { QueryClient } from "@tanstack/react-query";
import { DatePicker } from "@mui/x-date-pickers";
// TODO: move this to some util or constants file

// probably will want to use defer here eventually
export const loader = (queryClient: QueryClient) => {
  return async ({ params, request }: LoaderFunctionArgs) => {

    const url = new URL(request.url)
    const search = url.searchParams?.get('search')
    const { orgId, sprintId } = params;
    const [stories, sprint] = await Promise.all([
      getStories(orgId, search, sprintId),
      getSprint(orgId, sprintId)
    ])
    return {
      stories,
      sprint
    }
  }
}

export const Sprint = () => {
  const { stories, sprint } = useLoaderData();
  console.log("the sprint: ", sprint)
  const [description, setDescription] = useState(sprint.description)
  const location = useLocation();
  const search = new URLSearchParams(location.search).get('search') ?? ''
  const [startDate, setStartDate] = useState(new Date(sprint.startDate))
  const [endDate, setEndDate] = useState(new Date(sprint.endDate))
  const [selectedSprint, setSelectedSprint] = useState(sprint);
  const progress = stories.reduce((acc, story) => {
    if (story?.status === 'done') {
      acc += (100 * (1 / stories.length));
    }
    return acc;
  }, 0)
  useEffect(() => {
    setDescription(sprint.description)
    setStartDate(new Date(sprint.startDate))
    setEndDate(new Date(sprint.endDate))
  }, [sprint?.id])
  const submit = useSubmit()
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} >
        <SprintSearchInput sprint={selectedSprint} setSprint={setSelectedSprint} redirectOnSelect />
      </Box >
      <Typography variant="subtitle1" align="left">{sprint.title}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <TextField variant="outlined"
            InputProps={{
              sx: { backgroundColor: 'white' }
            }}
            size="small" margin="dense" fullWidth label="Description" id="description" name="description" value={description} onChange={e => setDescription(e.target.value)} sx={{ margin: 'none' }}
            multiline maxRows={3} minRows={4}
          ></TextField>
        </Grid>
        <Grid item xs={4}>
          <DatePicker value={startDate} onChange={e => setStartDate(e.target.value)}
            label="Start date"
            slotProps={{
              textField: {
                variant: "outlined", size: "small", margin: 'dense', fullWidth: true, InputProps: {
                  sx: { backgroundColor: 'white' }
                }
              }
            }}
          ></DatePicker>
          <DatePicker value={endDate} onChange={e => setEndDate(e.target.value)}
            label="End date"
            slotProps={{
              textField: {
                variant: "outlined", size: "small", margin: 'dense', fullWidth: true, InputProps: {
                  sx: { backgroundColor: 'white' }
                }
              }
            }}
          ></DatePicker>
        </Grid>
      </Grid >
      <br />
      <Typography variant="subtitle2" align="left" sx={{ paddingBottom: '4px' }} >{progress}% to Complete</Typography >
      <LinearProgress variant="determinate" value={progress} />
      <br />


      <Section style={{ padding: '12px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingY: '6px' }}>
          <Box>
            <Typography variant="subtitle1" align="left">{sprint.title} stories</Typography>
          </Box>
          <Form method="get" onChange={e => {
            submit(e.currentTarget)
          }}>
            <TextField name="search" variant="outlined" size="small" margin="dense" label="Search stories" />
          </Form>

        </Box>
        <SprintStoryTable>
          {stories.filter(story => story.title.toLowerCase().includes(search.toLowerCase())).map(story => <SprintStoryRow story={story} key={story.id} />)}
        </SprintStoryTable>
      </Section >
    </>
  )

}
