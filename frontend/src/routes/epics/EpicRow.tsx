import { TableCell, TableRow, LinearProgress, Box, Typography, LinearProgressProps, IconButton } from "@mui/material"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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
const EpicRow = ({ epic }) => {
  return (
    <TableRow>
      <TableCell>{epic.title}</TableCell>
      <TableCell>
        <LinearProgressWithLabel value={0} />
      </TableCell>
      <TableCell>{epic.id}</TableCell>
      <TableCell></TableCell>
      <TableCell>{epic.estimated_completion_date}</TableCell>
      <TableCell>
        <IconButton>
          <MoreHorizIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

export default EpicRow
