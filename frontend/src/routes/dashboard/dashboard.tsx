import { useAuth } from "../../hooks/auth";
const Dashboard = () => {
  const { user } = useAuth();
  return <p>Welcome {user.email}!</p>
}

export default Dashboard;
