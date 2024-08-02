import { useRouteLoaderData } from "react-router-dom";
const Dashboard = () => {
  const user = useRouteLoaderData("user");
  return <p>Welcome {user.email}!</p>
}

export default Dashboard;
