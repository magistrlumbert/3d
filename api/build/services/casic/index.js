"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _apolloServer = require("apollo-server");

var _federation = require("@apollo/federation");

var _neo4jDriver = _interopRequireDefault(require("neo4j-driver"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _resolvers = _interopRequireDefault(require("./resolvers.js"));

// import { Neo4jGraphQL } from '@neo4j/graphql'
// set environment variables from .env
_dotenv.default.config();

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
// console.log('process.env.NEO4J_URI_CASIC', process.env.NEO4J_URI_CASIC)
const driver = _neo4jDriver.default.driver(process.env.NEO4J_URI_CASIC || 'bolt://3.208.1.4:7687', _neo4jDriver.default.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD_CASIC || 'i-0e331822501bc6d84'));

const typeDefs = (0, _apolloServer.gql)`
  extend type Query {
    allIn: [Inventor]
  }
  type CASIC @key(fields: "id") {
    id: ID!
  }
  type Inventor @key(fields: "name") {
    name: ID!
  }
  type Licensee @key(fields: "licenseID") {
    licenseID: ID!
  }
  type Organization @key(fields: "orgID") {
    orgID: ID!
  }
  type Patent @key(fields: "patentID") {
    patentID: ID!
    title: String
  }
`;
const server = new _apolloServer.ApolloServer({
  context: ({
    req
  }) => {
    return {
      req,
      driver,
      driverConfig: {
        database: process.env.NEO4J_DATABASE || 'neo4j'
      }
    };
  },
  schema: (0, _federation.buildFederatedSchema)([{
    typeDefs,
    resolvers: _resolvers.default
  }])
});
server.listen({
  port: 4002
}).then(({
  url
}) => {
  console.log(`🚀 Server ready at ${url}`);
});