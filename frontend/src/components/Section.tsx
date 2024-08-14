
import { Box } from "@mui/material";

// Use to wrap widgets and any other content with a soft white background
const Section = ({ children, style = {} }) => (
  <Box sx={{ backgroundColor: 'white', borderRadius: '4px', ...style }}>
    {children}
  </Box>
)

export default Section;
