
import { TableCell, TableRow } from "@mui/material"
import { useNavigate } from "react-router-dom";
import { statuses } from '../stories/CreateStory';

const mapStatus = (status?: string) => {
  if (!status) {
    return ''
  }

  return statuses.find(stat => status === stat.value)?.label;
}
export const SprintStoryRow = ({ story }) => {
  const navigate = useNavigate();
  const status = mapStatus(story.status);
  return (
    <TableRow sx={{ cursor: 'pointer' }} hover={true} onClick={() => navigate(`../../stories/${story.id}`)} >
      <TableCell>{story.title}</TableCell>
      <TableCell>{story.description}</TableCell>
      <TableCell>{status}</TableCell>
      <TableCell>{story?.start_date}</TableCell>
      <TableCell>{story.estimated_completion_date}</TableCell>
    </TableRow >
  )
}
