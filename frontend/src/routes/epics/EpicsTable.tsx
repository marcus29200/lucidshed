import { TableContainer, TableHead, Table, TableRow, TableBody, TableCell, Paper } from '@mui/material'
const EpicsTable = () => {
  const rows = []
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
          {/* {rows.map((row) => ( */}
          {/*   <TableRow */}
          {/*     key={row.name} */}
          {/*     sx={{ '&:last-child td, &:last-child th': { border: 0 } }} */}
          {/*   > */}
          {/*     <TableCell component="th" scope="row"> */}
          {/*       {row.name} */}
          {/*     </TableCell> */}
          {/*     <TableCell align="right">{row.calories}</TableCell> */}
          {/*     <TableCell align="right">{row.fat}</TableCell> */}
          {/*     <TableCell align="right">{row.carbs}</TableCell> */}
          {/*     <TableCell align="right">{row.protein}</TableCell> */}
          {/*   </TableRow> */}
          {/* ))} */}
        </TableBody>
      </Table>
    </TableContainer >
  )
}

export default EpicsTable;
