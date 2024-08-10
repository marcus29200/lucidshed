import { Box, Button, Typography, TextField } from "@mui/material";
import FullHeightSection from "../../components/FullHeightSection"
import { Link, LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { QueryClient, queryOptions } from "@tanstack/react-query";
import { getStories } from "../../api/stories";

export const storiesQuery = (orgId: string, search?: string) => queryOptions({
  queryKey: ['stories', orgId],
  queryFn: async () => getStories(orgId, search)
})

export const loader = (queryClient: QueryClient) => {
  return async ({ params }: LoaderFunctionArgs) => {
    const { orgId, search } = params;
    if (!orgId) {
      throw new Error('no org id');
    }
    return queryClient.ensureQueryData(storiesQuery(orgId, search));
  }
}
// TODO: stories table
export const Stories = () => {
  const stories = useLoaderData();
  console.log('stories: ', stories);
  return (
    <FullHeightSection>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingX: '12px', paddingY: '6px' }}>
        <Typography variant="h6">Stories</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TextField variant="outlined" size="small" margin="none" label="Search"></TextField>
          <Button variant="contained" component={Link} to="new">Create Epic</Button>
        </Box>
      </Box>
    </FullHeightSection>
  )
}

