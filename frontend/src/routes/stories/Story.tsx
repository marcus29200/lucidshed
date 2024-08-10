import { QueryClient, queryOptions } from "@tanstack/react-query";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { getStory } from "../../api/stories";

export const storyQuery = (orgId: string, storyId: string) => queryOptions({
  queryKey: ['story', orgId, storyId],
  queryFn: async () => getStory(orgId, storyId)
})

export const loader = (queryClient: QueryClient) => {
  return async ({ params }: LoaderFunctionArgs) => {
    const { orgId, id } = params;
    if (!orgId || !id) {
      throw new Error('Missing orgId or story id');
    }
    return queryClient.ensureQueryData(storyQuery(orgId, id));
  }
}

export const Story = () => {
  const story = useLoaderData();
  console.log("the story: ", story);
  return (
    <p>Story page</p>
  )
}
