import { Box, Typography } from "@mui/material";
import { useLoaderData } from "react-router-dom";
import Section from "../../components/Section";

export const EpicPage = () => {
  const epic = useLoaderData();
  return (
    <>
      <Section>
        <Typography variant="h3">{epic.title}</Typography>
      </Section>
      <Section>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingX: '12px', paddingY: '6px' }}>
          <Typography variant="h6">Stories</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TextField variant="outlined" size="small" margin="none" label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}></TextField>
            <Button variant="contained" onClick=>Create Story</Button>

          <Button variant="contained" onClick=>Create Story</Button>
      </Box>
    </Box >
      </Section >
    </>
    );
};

