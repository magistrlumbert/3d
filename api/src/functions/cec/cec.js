import { ApolloServer, gql } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'
// set environment variables from .env
dotenv.config()

const resolvers = {
  CEC: {
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
    get_cec: async (_, { query }, ctx) => {
      let session = ctx.driver.session()
      const cypherQuery = query
      return await session.run(cypherQuery).then((result) => {
        let nodes = []
        let links = []
        result.records.map((record) => {
          const n = record.get('n') === null ? null : record.get('n').properties
          let source = {
            ...n,
            ['identity']: record.get('n').identity.toString(),
          }
          const m = record.get('m') === null ? null : record.get('m').properties
          let target = {
            ...m,
            ['identity']: record.get('m').identity.toString(),
          }
          const r = record.get('r') === null ? null : record.get('r').properties
          let link = {
            ...r,
            ['identity']: record.get('r').identity.toString(),
            ['source']: record.get('r').start.toString(),
            ['target']: record.get('r').end.toString(),
            ['type']: record.get('r').type.toString(),
          }

          let found = nodes.some((el) => el.identity === source.identity)
          if (!found) nodes = [...nodes, source]
          found = nodes.some((el) => el.identity === target.identity)
          if (!found) nodes = [...nodes, target]

          links = [...links, link]
          return {
            nodes: nodes,
            links: links,
          }
        })

        return {
          nodes: nodes,
          links: links,
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
  process.env.NEO4J_URI_CEC || 'bolt://3.84.244.188:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD_CEC || 'i-097e24bd8d65274e0'
  )
)

const typeDefs = gql`
  union CEC = Inventor | Licensee | Organization | Patent

  extend type Query {
    get_cec(query: String): ResponseCEC
  }
  type ResponseCEC {
    nodes: [CEC]
    links: [RELS]
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

server.listen({ port: 4004 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
