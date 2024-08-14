import { QueryClient, queryOptions } from "@tanstack/react-query";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom"
import { getSprints } from "../../api/sprints";
import Section from "../../components/Section";
import { Box } from "@mui/material";
import SprintTable from "./SprintTable";
import SprintSearchInput from "./SprintSearchInput";

export const getSprintsQuery = (orgId: string) => queryOptions({
  queryKey: ['sprints'],
  queryFn: async () => getSprints(orgId),
})

export const loader = (queryClient: QueryClient) => {
  return async ({ params }: LoaderFunctionArgs) => {
    if (!params.orgId) {
      throw new Error("no org id");
    }

    return queryClient.ensureQueryData(getSprintsQuery(params.orgId))
  }
}
export const Sprints = () => {
  const sprints = useLoaderData();
  console.log(sprints)
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }} >
        <SprintSearchInput sprints={sprints} />
      </Box >
      <p>Sprints homie</p>
    </>
  )
}
