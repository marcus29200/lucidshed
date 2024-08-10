import { TableCell, TableRow, LinearProgress, Box, Typography, LinearProgressProps, IconButton, MenuItem, Menu } from "@mui/material"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";

// duplicated from the epics page, abstractions could be made later
// to reduce duplication
function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}
// TODO: add typing for epic
const StoryRow = ({ story }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();
  const formattedCompletionDate = story.estimated_completion_date ? format(new Date(story.estimated_completion_date), 'MMM dd, yyyy') : null;
  return (
    <>
      <TableRow sx={{ cursor: 'pointer' }} onClick={() => navigate(`./${story.id}`, { relative: 'path' })}>
        <TableCell>{story.title}</TableCell>
        <TableCell>
          <LinearProgressWithLabel value={0} />
        </TableCell>
        <TableCell>{story.id}</TableCell>
        <TableCell></TableCell>
        <TableCell>{formattedCompletionDate}</TableCell>
        <TableCell>
          <IconButton onClick={handleClick}>
            <MoreHorizIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>Item</MenuItem>
      </Menu>
    </>
  )
}

export default StoryRow
