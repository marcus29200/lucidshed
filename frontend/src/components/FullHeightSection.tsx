import { Box } from "@mui/material";

const FullHeightSection = ({ children, style = {} }) => (
  <Box sx={{ height: '100%', backgroundColor: 'white', borderRadius: '4px', ...style }}>
    {children}
  </Box>
)

export default FullHeightSection;
