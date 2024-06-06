
import { Button } from "@mui/material";
import AppHeader from "../../components/AppHeader";
const Epics = () => {
  const title = "Epics"
  return (
    <>
      <AppHeader title={title}>
        <Button variant="contained" color="primary">Create new</Button>
      </AppHeader>
    </>
  )
}

export default Epics;
