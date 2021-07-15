import { ApolloServer, gql } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import neo4j from 'neo4j-driver'
// import { Neo4jGraphQL } from '@neo4j/graphql'
import dotenv from 'dotenv'
// set environment variables from .env
dotenv.config()

import resolvers from './resolvers.js'

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */

// console.log('process.env.NEO4J_URI_CASIC', process.env.NEO4J_URI_CASIC)
const driver = neo4j.driver(
  process.env.NEO4J_URI_CASIC || 'bolt://3.208.1.4:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD_CASIC || 'i-0e331822501bc6d84'
  )
)

const typeDefs = gql`
  union CASIC = Inventor | Licensee | Organization | Patent | Undefined

  extend type Query {
    get_casic: Response
  }
  type Response {
    nodes: [CASIC]
    links: [RELS]
  }
  type RELS {
    identity: ID!
    source: String
    target: String
    type: String
  }
  type Undefined {
    identity: String
    id: String
  }
  type Inventor {
    identity: String
    name: ID!
  }
  type Licensee {
    identity: String
    licenseID: ID!
  }
  type Organization {
    identity: String
    orgID: ID!
  }
  type Patent {
    identity: String
    patentID: ID!
    title: String
  }
`

const server = new ApolloServer({
  context: ({ req }) => {
    return {
      req,
      driver,
      driverConfig: { database: process.env.NEO4J_DATABASE || 'neo4j' },
    }
  },
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
})

server.listen({ port: 4002 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})