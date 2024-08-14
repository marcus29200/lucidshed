import { Box, Button, Typography, TextField } from "@mui/material";
import FullHeightSection from "../../components/FullHeightSection"
import { Link, LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { QueryClient, queryOptions } from "@tanstack/react-query";
import { getStories } from "../../api/stories";
import StoryRow from "./StoryRow";
import StoriesTable from "./StoriesTable";

export const storiesQuery = (orgId: string, search?: string) => queryOptions({
  queryKey: ['stories', orgId, search],
  queryFn: async () => getStories(orgId, search)
})

export const loader = (queryClient: QueryClient) => {
  return async ({ params }: LoaderFunctionArgs) => {
    const { orgId, search } = params;
    if (!orgId) {
      throw new Error('no org id');
    }
    // something is fucked up with the queryKey...
    return getStories(orgId, search);
    // return queryClient.ensureQueryData(storiesQuery(orgId, search));
  }
}

// TODO: stories table
export const Stories = () => {
  const stories = useLoaderData();
  return (
    <FullHeightSection style={{ padding: '12px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingY: '12px' }}>
        <Typography variant="h6">Stories</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TextField variant="outlined" size="small" margin="none" label="Search"></TextField>
          <Button variant="contained" component={Link} to="new">Create Story</Button>
        </Box>
      </Box>
      <StoriesTable>
        {stories.map(story => <StoryRow story={story} key={story.id} />)}
      </StoriesTable>

    </FullHeightSection>
  )
}

