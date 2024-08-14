import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import SprintSearchInput from "./SprintSearchInput";
import Section from "../../components/Section";
import SprintTable from "./SprintTable";
import { SprintStoryRow } from "./SprintStoryRow";
import { getStories } from "../../api/stories";
import { getSprint } from "../../api/sprints";
import { QueryClient } from "@tanstack/react-query";

// probably will want to use defer here eventually
export const loader = (queryClient: QueryClient) => {
  return async ({ params }: LoaderFunctionArgs) => {
    const { orgId, sprintId } = params;
    console.log('org and sprint id: ', orgId, sprintId)
    const [stories, sprint] = await Promise.all([
      getStories(orgId, '', sprintId),
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
  console.log(stories, sprint)
  const [selectedSprint, setSelectedSprint] = useState(sprint);
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} >
        <SprintSearchInput sprint={selectedSprint} setSprint={setSelectedSprint} />
      </Box >
      <Section>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingX: '12px', paddingY: '6px' }}>
          <Box>
            <Typography variant="subtitle1" align="left">{sprint.title} stories</Typography>
          </Box>
        </Box>

        {/* <SprintTable> */}

        {/* </SprintTable> */}
      </Section >
    </>
  )

}
