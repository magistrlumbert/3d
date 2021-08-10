import { ApolloServer } from 'apollo-server-express'
import { ApolloGateway } from '@apollo/gateway'
import express from 'express'

const app = express()

const gateway = new ApolloGateway({
  // This entire `serviceList` is optional when running in managed federation
  // mode, using Apollo Graph Manager as the source of truth.  In production,
  // using a single source of truth to compose a schema is recommended and
  // prevents composition failures at runtime using schema validation using
  // real usage-based metrics.
  serviceList: [
    { name: 'bgi', url: `http://0.0.0.0:4001/graphql` },
    { name: 'casc', url: 'http://0.0.0.0:4002/graphql' },
    // { name: 'cec', url: 'http://0.0.0.0:4003/graphql' },
    // { name: 'casic', url: 'http://0.0.0.0:4004/graphql' },
  ],

  // Experimental: Enabling this enables the query plan view in Playground.
  __exposeQueryPlanExperimental: false,
})

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
  gateway,
  subscriptions: false,
})

// Specify host, port and path for GraphQL endpoint
const port = 4000
const path = '/graphql'
const host = '0.0.0.0'

app.get('/refreshGateway', (request, response) => {
  gateway.load()
  response.sendStatus(200)
})

/*
 * Optionally, apply Express middleware for authentication, etc
 * This also also allows us to specify a path for the GraphQL endpoint
 */
server.applyMiddleware({ app, path })

app.listen({ host, port, path }, () => {
  console.log(
    `GraphQL api new server ready it is me at http://${host}:${port}${path}`
  )
})
