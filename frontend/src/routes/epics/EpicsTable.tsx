import { TableContainer, TableHead, Table, TableRow, TableBody, TableCell, Paper } from '@mui/material'
const EpicsTable = ({ children }) => {
  return (
    <TableContainer component={Paper} >
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Epic Name</TableCell>
            <TableCell>Progress</TableCell>
            <TableCell>Epic ID</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>Target Date</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </TableContainer >
  )
}

export default EpicsTable;
