import { useRouteLoaderData } from "react-router-dom";
const Dashboard = () => {
  const [_, user] = useRouteLoaderData("userData");
  return <p>Welcome {user.email}!</p>
}

export default Dashboard;
