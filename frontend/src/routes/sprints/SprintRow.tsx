import { TableCell, TableRow } from "@mui/material"

export const SprintRow = ({ story }) => {
  console.log("sprint: ", story)
  return (
    <TableRow>
      <TableCell>{story.title}</TableCell>
      <TableCell>{story.description}</TableCell>
      <TableCell>{story.description}</TableCell>
      <TableCell>{story.status}</TableCell>
      <TableCell>{story}</TableCell>
      <TableCell>{story.estimated_completion_date}</TableCell>
    </TableRow>
  )
}
