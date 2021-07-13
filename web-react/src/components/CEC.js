import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { useQuery, gql } from '@apollo/client'
import Title from './Title'
import moment from 'moment'

const ALL = gql`
  {
    get_cec(options: { limit: 10, sort: { date: DESC } }) {
      user {
        name
      }
      business {
        name
      }
      date
      text
      stars
    }
  }
`

export default function CEC() {
  const { loading, error, data } = useQuery(ALL)
  if (error) return <p>Error</p>
  if (loading) return <p>Loading</p>

  return (
    <React.Fragment>
      <Title>CEC</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>CEC Name</TableCell>
            <TableCell>User CEC</TableCell>
            <TableCell>CEC Text</TableCell>
            <TableCell align="right">Review CEC</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.reviews.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{moment(row.date).format('MMMM Do YYYY')}</TableCell>
              <TableCell>{row.business.name}</TableCell>
              <TableCell>{row.user.name}</TableCell>
              <TableCell>{row.text}</TableCell>
              <TableCell align="right">{row.stars}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  )
}
