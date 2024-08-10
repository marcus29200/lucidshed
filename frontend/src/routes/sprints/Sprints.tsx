import { QueryClient, queryOptions } from "@tanstack/react-query";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom"
import { getSprints } from "../../api/sprints";

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
    <p>Sprints homie</p>

  )
}
