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
  process.env.NEO4J_URI_BGI || 'bolt://54.224.51.117:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD_BGI || 'i-08bb780d2ee5c5ec9'
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
const port = 4001
const path = '/graphql'
const host = '0.0.0.0'

server.applyMiddleware({ app, path })

app.listen({ host, port, path }, () => {
  console.log(`GraphQL bgi server ready at http://${host}:${port}${path}`)
})
