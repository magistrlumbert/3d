import { ApolloServer, gql } from 'apollo-server-express'
import { buildFederatedSchema } from '@apollo/federation'
import neo4j from 'neo4j-driver'
import express from 'express'
import dotenv from 'dotenv'
// set environment variables from .env
dotenv.config()
const app = express()

const resolvers = {
  BGI: {
    __resolveType(obj) {
      if (obj.name) {
        return 'Inventor'
      }
      if (obj.licenseID) {
        return 'Licensee'
      }
      if (obj.orgID) {
        return 'Organization'
      }
      if (obj.patentID) {
        return 'Patent'
      }
      return null // GraphQLError is thrown
    },
  },
  Query: {
    get_bgi: async (_, { query }, ctx) => {
      let session = ctx.driver.session()
      const cypherQuery = query
      return await session
        .run(cypherQuery)
        .then((result) => {
          let columns = {}
          let elements = {}
          let nodes = []
          let links = []
          result.records.map((record) => {
            record.keys.map((key) => {
              let element = 0
              try {
                element = record.get(key)
                if (element.start) {
                  //rels
                  let link = {
                    ...element.properties,
                    ['identity']: element.identity.toString(),
                    ['source']: element.start.toString(),
                    ['target']: element.end.toString(),
                    ['type']: element.type.toString(),
                  }

                  links = [...links, link]
                } else {
                  //nodes
                  if (element.identity) {
                    let source = {
                      ...element.properties,
                      ['identity']: element.identity.toString(),
                    }
                    let found = nodes.some(
                      (el) => el.identity === source.identity
                    )
                    if (!found) nodes = [...nodes, source]
                  } else {
                    //columns
                    if (!elements[key]) {
                      elements[key] = {}
                    }
                    elements[key][Object.keys(elements[key]).length] =
                      element.toString()
                    columns = elements
                  }
                }
              } catch (error) {
                console.log(error.message)
              }
            })

            return true
          })
          const answer = {
            nodes: nodes,
            links: links,
            columns: JSON.stringify(columns),
          }
          return answer
        })
        .catch((error) => {
          console.log(error.message)
          return {
            error: error.message,
          }
        })
    },
  },
}

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */

const driver = neo4j.driver(
  process.env.NEO4J_URI_BGI || 'bolt://54.224.51.117:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD_BGI || 'i-08bb780d2ee5c5ec9'
  )
)

const typeDefs = gql`
  union BGI = Inventor | Licensee | Organization | Patent

  extend type Query {
    get_bgi(query: String): ResponseBGI
  }
  type ResponseBGI {
    nodes: [BGI]
    links: [RELS]
    columns: String
    error: String
  }
  type RELS {
    identity: ID!
    source: String
    target: String
    type: String
  }
  type Inventor {
    name: ID!
    identity: String
  }
  type Licensee {
    licenseID: ID!
    identity: String
  }
  type Organization {
    orgID: ID!
    identity: String
  }
  type Patent {
    patentID: ID!
    title: String
    identity: String
  }
`
const server = new ApolloServer({
  context: ({ req }) => {
    return {
      req,
      driver,
    }
  },
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
  playground: true,
  introspection: true,
})

// Specify host, port and path for GraphQL endpoint
const port = 4001
const path = '/graphql'
const host = '0.0.0.0'

server.applyMiddleware({ app, path })

app.listen({ host, port, path }, () => {
  console.log(`GraphQL server ready at http://${host}:${port}${path}`)
})
