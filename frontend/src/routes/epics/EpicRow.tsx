import { TableCell, TableRow, LinearProgress, Box, Typography, LinearProgressProps, IconButton, MenuItem, Menu } from "@mui/material"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";

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
const EpicRow = ({ epic }) => {
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
  const formattedCompletionDate = epic.estimated_completion_date ? format(new Date(epic.estimated_completion_date), 'MMM dd, yyyy') : null;
  return (
    <>
      <TableRow sx={{ cursor: 'pointer' }} onClick={() => navigate(`./${epic.id}`, { relative: 'path' })}>
        <TableCell>{epic.title}</TableCell>
        <TableCell>
          <LinearProgressWithLabel value={0} />
        </TableCell>
        <TableCell>{epic.id}</TableCell>
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

export default EpicRow
