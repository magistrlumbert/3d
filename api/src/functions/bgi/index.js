import { ApolloServer, gql } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import neo4j from 'neo4j-driver'
// import { Neo4jGraphQL } from '@neo4j/graphql'
import dotenv from 'dotenv'
// set environment variables from .env
dotenv.config()

import resolvers from 'resolvers.js'

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */

// console.log("process.env.NEO4J_URI_BGI", process.env.NEO4J_URI_BGI)
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
    get_bgi: ResponseBGI
  }
  type ResponseBGI {
    nodes: [BGI]
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

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
