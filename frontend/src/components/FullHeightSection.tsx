import { Box } from "@mui/material";

const FullHeightSection = ({ children }) => (
  <Box sx={{ height: '100%', backgroundColor: 'white', borderRadius: '4px' }}>
    {children}
  </Box>
)

export default FullHeightSection;
