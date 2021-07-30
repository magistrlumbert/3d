import React from 'react'
import { useLazyQuery, gql } from '@apollo/client'
import Title from './Title'
import ForceGraph3D from 'react-force-graph-3d'
import { Button, TextareaAutosize } from '@material-ui/core'
import { useJsonToCsv } from 'react-json-csv'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core'

const ALL = gql`
  query get_bgi($query: String) {
    get_bgi(query: $query) {
      nodes {
        __typename
        ... on Inventor {
          name
          identity
        }
        ... on Licensee {
          licenseID
          identity
        }
        ... on Organization {
          orgID
          identity
        }
        ... on Patent {
          patentID
          identity
        }
      }
      links {
        identity
        source
        target
        type
      }
      error
      columns
    }
  }
`

export default function BGI() {
  const [cypherQuery, setCypherQuery] = React.useState(
    'MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 100'
  )
  const [runCustomQuery, response] = useLazyQuery(ALL)
  let nodes = false
  let links = false
  let error = false
  let columns = false
  let column_heads = false
  let size = false

  if (response.loading) {
    return 'Loading...'
  }

  if (response.error) return <p>Error</p>
  if (response.loading) return <p>Loading</p>

  if (response.data && response.data.get_bgi && response.data.get_bgi.nodes) {
    nodes = response.data.get_bgi.nodes
  }

  if (response.data && response.data.get_bgi && response.data.get_bgi.links) {
    links = response.data.get_bgi.links
  }

  if (response.data && response.data.get_bgi && response.data.get_bgi.error) {
    error = response.data.get_bgi.error
  }

  if (
    response.data &&
    response.data.get_bgi &&
    response.data.get_bgi.columns &&
    response.data.get_bgi.columns !== '{}'
  ) {
    columns = JSON.parse(response.data.get_bgi.columns)
    column_heads = Object.keys(columns)
    size = Object.keys(columns[column_heads[0]]).length
  }
  const returnTableCells = (columns) => {
    const newMap = [...Array(size)].map((_, i) => i)
    return newMap.map((_, i) => {
      return (
        <TableRow key={'id-' + i}>
          {column_heads.map((headCell) => {
            return (
              <TableCell key={headCell + i}>{columns[headCell][i]}</TableCell>
            )
          })}
        </TableRow>
      )
    })
  }
  const handleLoadGraph = async (e) => {
    e.preventDefault()
    try {
      await runCustomQuery({
        variables: { query: cypherQuery },
      })
    } catch (e) {
      console.error(e)
    }
  }
  const downLoadGraph = () => {
    const { saveAsCsv } = useJsonToCsv()
    let filename = 'Csv-file-nodes'
    let fields = {
      identity: 'identity',
      patentID: 'patentId',
      __typename: 'typename',
      licenseID: 'licenseID',
    }
    // save edges to csv
    data = []
    for (const [key, value] of Object.entries(nodes)) {
      data = [...data, value]
      console.log(key, value)
    }
    saveAsCsv({ data, fields, filename })

    console.log('nodes saved')

    filename = 'Csv-file-edges'
    let data = []
    fields = {
      identity: 'identity',
      source: 'source',
      target: 'target',
      type: 'type',
      __typename: 'typename',
    }
    for (const [key, value] of Object.entries(links)) {
      data = [...data, value]
      console.log(key)
    }
    saveAsCsv({ data, fields, filename })

    console.log('edges saved')
  }
  return (
    <React.Fragment>
      <Title>BGI</Title>
      {nodes &&
        links &&
        !response.error &&
        !response.loading &&
        nodes.length > 0 && (
          <>
            <ForceGraph3D
              graphData={{
                nodes: JSON.parse(JSON.stringify(nodes)),
                links: JSON.parse(JSON.stringify(links)),
              }}
              nodeId="identity"
              linkCurvature={0.2}
              linkDirectionalArrowRelPos={1}
              linkDirectionalArrowLength={10}
            />
          </>
        )}

      {columns && (
        <Table>
          <TableHead>
            <TableRow>
              {column_heads.map((headCell) => (
                <TableCell key={headCell}>{headCell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{returnTableCells(columns)}</TableBody>
        </Table>
      )}

      {error && <>{error}</>}
      <aside className="button-bar">
        <p>
          <TextareaAutosize
            onChange={(e) => {
              setCypherQuery(e.target.value)
            }}
            aria-label="empty textarea"
            placeholder="Type cypher query here"
          />
        </p>
        <Button variant="contained" onClick={handleLoadGraph}>
          Load graph)
        </Button>
        <Button variant="contained" onClick={downLoadGraph}>
          download in csv
        </Button>
      </aside>
    </React.Fragment>
  )
}
