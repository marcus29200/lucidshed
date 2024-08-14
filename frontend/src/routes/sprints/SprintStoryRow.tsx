
import { TableCell, TableRow } from "@mui/material"

export const SprintStoryRow = ({ story }) => {
  return (
    <TableRow sx={{ cursor: 'pointer' }} hover={true}>
      <TableCell>{story.title}</TableCell>
      <TableCell>{story.description}</TableCell>
      <TableCell>{story.status}</TableCell>
      <TableCell>{story?.start_date}</TableCell>
      <TableCell>{story.estimated_completion_date}</TableCell>
    </TableRow>
  )
}
