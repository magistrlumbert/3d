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
// console.log("process.env.NEO4J_URI_BGI", process.env.NEO4J_URI_BGI)
const driver = _neo4jDriver.default.driver(process.env.NEO4J_URI_BGI || 'bolt://54.224.51.117:7687', _neo4jDriver.default.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD_BGI || 'i-08bb780d2ee5c5ec9'));

const typeDefs = (0, _apolloServer.gql)`
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
  port: 4001
}).then(({
  url
}) => {
  console.log(`🚀 Server ready at ${url}`);
});