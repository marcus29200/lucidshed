import { Button, Container, TextField, Typography } from "@mui/material"
import { useNavigate } from 'react-router-dom';
import LogoHeader from "../components/LogoHeader"
import { resetPassword } from "../api/auth";
import { useMutation } from "@tanstack/react-query";

export const CreateOrganization = () => {
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      console.log(data);

      navigate(`/dashboard/${data.id}`)
    },
    onError: (error) => {
      console.error(error);
    }
  });

  const onSubmit = (e) => {
    e.preventDefault()
    const form = e.target as any;
    console.log(form.elements['organizationId'].value);
    console.log(form.elements['title'].value);
  }
  return (
    <>
      <LogoHeader />
      <Container maxWidth="sm" sx={{ textAlign: "left" }}>
        <Typography variant="h5" sx={{ marginBottom: '16px' }}>Create your team</Typography>
        <Typography variant="h6" sx={{ marginBottom: '16px' }}>The place where everybody will be in sync</Typography>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <form style={{ width: '100%' }} onSubmit={onSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="title"
              inputProps={{
                minLength: '4',
              }}
              sx={{ marginTop: '0px', marginBottom: '32px' }}
              size="small"
              label="Organization title"
              id="organizationName"
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="organizationId"
              inputProps={{
                minLength: '4',
              }}
              sx={{ marginTop: '0px', marginBottom: '32px' }}
              size="small"
              label="lucidshed.com/"
              id="organizationId"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Next
            </Button>
          </form>
        </div>
      </Container >
    </>
  )
}
