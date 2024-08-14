import { TableContainer, TableHead, Table, TableRow, TableBody, TableCell, Paper } from '@mui/material'
const SprintTable = ({ children }) => {
  return (
    <TableContainer component={Paper} >
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Story Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Progress</TableCell>
            <TableCell>Assigned To</TableCell>
            <TableCell>Due Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </TableContainer >
  )
}

export default SprintTable;
