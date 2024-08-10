import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import LogoHeader from "../components/LogoHeader";
import { useMutation } from "@tanstack/react-query";
import { useLoaderData, useNavigate } from "react-router-dom";
import { User, patchUser } from "../api/users";
import { useAuth } from "../hooks/auth";


const UserSignupAdditionalInfo = () => {
  const navigate = useNavigate();
  const user: User = useLoaderData();
  console.log("the user: ", user)
  const { updateUser } = useAuth();
  const { mutate } = useMutation({
    mutationFn: patchUser,
    onSuccess: (data) => {
      console.log("the data?: ", data)
      updateUser(data)
      const orgId = localStorage.getItem("orgId") as string;
      navigate(`/${orgId}`)
    },
    onError: (error) => {
      console.error(error)
    }
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const userId = user.id;
    const form = e.target;
    const firstName = form.elements?.firstName?.value;
    const lastName = form.elements?.lastName?.value;
    const title = form.elements?.title?.value;
    const bio = form.elements?.bio?.value;
    mutate({
      id: userId,
      data: {
        first_name: firstName,
        last_name: lastName,
        title,
        bio
      }
    })
  }


  return (
    <>
      <LogoHeader />
      <Container maxWidth="sm" sx={{ textAlign: "left" }}>
        <Typography variant="h5" sx={{ marginBottom: '16px' }}>Create your user profile</Typography>
        <Typography variant="h6" sx={{ marginBottom: '16px' }}>Add your personal information</Typography>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <form style={{ width: '100%' }} onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  size="small"
                  label="First name"
                  name="firstName"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  size="small"
                  label="Last name"
                  name="lastName"
                  autoFocus
                />
              </Grid>
            </Grid>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              size="small"
              label="Title"
              name="title"
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              size="small"
              label="Bio"
              name="bio"
              multiline
              maxRows={3}
              minRows={3}
              autoFocus
              sx={{ marginBottom: "32px" }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Done
            </Button>
          </form>
        </div >
      </Container>
    </>
  )
}

export default UserSignupAdditionalInfo;
