import React from 'react'

import { useQuery, gql } from '@apollo/client'
import Title from './Title'
import ForceGraph3D from 'react-force-graph-3d'

const ALL = gql`
  query {
    get_casic {
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
        ... on Undefined {
          id
        }
      }
      links {
        identity
        source
        target
        type
      }
    }
  }
`

export default function CASIC() {
  let nodes = false
  let links = false
  const { loading, error, data } = useQuery(ALL)

  if (error) return <p>Error</p>
  if (loading) return <p>Loading</p>

  if (data && data.get_casic && data.get_casic.nodes) {
    nodes = data.get_casic.nodes
  }

  if (data && data.get_casic && data.get_casic.links) {
    links = data.get_casic.links
  }

  return (
    <React.Fragment>
      <Title>CASIC</Title>
      {nodes && links && !error && !loading && nodes.length > 0 && (
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
      )}
    </React.Fragment>
  )
}
