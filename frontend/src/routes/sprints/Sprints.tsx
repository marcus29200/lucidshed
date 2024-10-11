import { QueryClient, queryOptions } from "@tanstack/react-query";
import { LoaderFunctionArgs,  useLoaderData, useNavigate } from "react-router-dom"
import { getSprints } from "../../api/sprints";
import { Box,  Typography } from "@mui/material";
import SprintStoryTable from "./SprintStoryTable";
import {  useState } from "react";
import FullHeightSection from "../../components/FullHeightSection";
import { SprintRow } from "./SprintRow";

export const getSprintsQuery = (orgId: string) => queryOptions({
  queryKey: ['sprints'],
  queryFn: async () => getSprints(orgId),
})

export const loader = (queryClient: QueryClient) => {
  return async ({ params }: LoaderFunctionArgs) => {
    if (!params.orgId) {
      throw new Error("no org id");
    }
// something is fucked up with the queryKey...
  return getSprints(params.orgId);
    // return queryClient.ensureQueryData(getSprintsQuery(params.orgId))
  }
}
export const Sprints = () => {
  const sprints = useLoaderData();
  const navigate = useNavigate()
  const [selectedSprint, setSelectedSprint] = useState(sprints[0]);
  return (
    <FullHeightSection>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingX: '12px', paddingY: '6px' }}>
        <Typography variant="h6">Epic Overview</Typography>

      </Box>
      <SprintStoryTable>
        {sprints.map(story => <SprintRow story={story} key={story.id} />)}
      </SprintStoryTable>
    </FullHeightSection>
  )
}

