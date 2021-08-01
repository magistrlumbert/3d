import { typeDefs } from './graphql-schema.js'
import resolvers from './resolvers.js'
import { ApolloServer, gql } from 'apollo-server-express'
import { buildFederatedSchema } from '@apollo/federation'
import neo4j from 'neo4j-driver'
import express from 'express'
import dotenv from 'dotenv'
// set environment variables from .env
dotenv.config()
const app = express()

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */

const driver = neo4j.driver(
  process.env.NEO4J_URI_CASC || 'bolt://34.239.140.111:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD_CASC || 'i-0cd55b5744e56cfcc'
  )
)

const server = new ApolloServer({
  context: ({ req }) => {
    return {
      req,
      driver,
    }
  },
  schema: buildFederatedSchema([
    {
      typeDefs: gql(typeDefs),
      resolvers,
    },
  ]),
  playground: true,
  introspection: true,
})

// Specify host, port and path for GraphQL endpoint
const port = 4002
const path = '/graphql'
const host = '0.0.0.0'

server.applyMiddleware({ app, path })

app.listen({ host, port, path }, () => {
  console.log(`GraphQL casc server ready at http://${host}:${port}${path}`)
})
