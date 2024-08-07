
import { Box } from "@mui/material";

// Use to wrap widgets and any other content with a soft white background
const Section = ({ children }) => (
  <Box sx={{ backgroundColor: 'white', borderRadius: '4px' }}>
    {children}
  </Box>
)

export default Section;
