"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _apolloServerExpress = require("apollo-server-express");

var _gateway = require("@apollo/gateway");

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

// set environment variables from .env
_dotenv.default.config();

const app = (0, _express.default)();
console.log('/myNewApp/api/src/index.js');
const gateway = new _gateway.ApolloGateway({
  // This entire `serviceList` is optional when running in managed federation
  // mode, using Apollo Graph Manager as the source of truth.  In production,
  // using a single source of truth to compose a schema is recommended and
  // prevents composition failures at runtime using schema validation using
  // real usage-based metrics.
  serviceList: [{
    name: 'bgi',
    url: `http://0.0.0.0:4001/graphql`
  } // { name: 'casc', url: 'http://localhost:4003/graphql' },
  // { name: 'cec', url: 'http://localhost:4004/graphql' },
  ],
  // Experimental: Enabling this enables the query plan view in Playground.
  __exposeQueryPlanExperimental: false
});
/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */

const server = new _apolloServerExpress.ApolloServer({
  gateway,
  subscriptions: false
}); // Specify host, port and path for GraphQL endpoint

const port = 4000;
const path = '/graphql';
const host = '0.0.0.0';
app.get('/refreshGateway', (request, response) => {
  gateway.load();
  response.sendStatus(200);
});
/*
 * Optionally, apply Express middleware for authentication, etc
 * This also also allows us to specify a path for the GraphQL endpoint
 */

server.applyMiddleware({
  app,
  path
});
app.listen({
  host,
  port,
  path
}, () => {
  console.log(`GraphQL server ready at http://${host}:${port}${path}`);
});