"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _apolloServer = require("apollo-server");

var _federation = require("@apollo/federation");

var _neo4jDriver = _interopRequireDefault(require("neo4j-driver"));

var _dotenv = _interopRequireDefault(require("dotenv"));

// set environment variables from .env
_dotenv.default.config();

const resolvers = {
  CASC: {
    __resolveType(obj) {
      if (obj.name) {
        return 'Inventor';
      }

      if (obj.licenseID) {
        return 'Licensee';
      }

      if (obj.orgID) {
        return 'Organization';
      }

      if (obj.patentID) {
        return 'Patent';
      }

      return null; // GraphQLError is thrown
    }

  },
  Query: {
    get_casc: async (_, {
      query
    }, ctx) => {
      let session = ctx.driver.session();
      const cypherQuery = query;
      return await session.run(cypherQuery).then(result => {
        var _context;

        let nodes = [];
        let links = [];
        (0, _map.default)(_context = result.records).call(_context, record => {
          const n = record.get('n') === null ? null : record.get('n').properties;
          let source = { ...n,
            ['identity']: record.get('n').identity.toString()
          };
          const m = record.get('m') === null ? null : record.get('m').properties;
          let target = { ...m,
            ['identity']: record.get('m').identity.toString()
          };
          const r = record.get('r') === null ? null : record.get('r').properties;
          let link = { ...r,
            ['identity']: record.get('r').identity.toString(),
            ['source']: record.get('r').start.toString(),
            ['target']: record.get('r').end.toString(),
            ['type']: record.get('r').type.toString()
          };
          let found = (0, _some.default)(nodes).call(nodes, el => el.identity === source.identity);
          if (!found) nodes = [...nodes, source];
          found = (0, _some.default)(nodes).call(nodes, el => el.identity === target.identity);
          if (!found) nodes = [...nodes, target];
          links = [...links, link];
          return {
            nodes: nodes,
            links: links
          };
        });
        return {
          nodes: nodes,
          links: links
        };
      });
    }
  }
};
/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */

const driver = _neo4jDriver.default.driver(process.env.NEO4J_URI_CASC || 'bolt://34.239.140.111:7687', _neo4jDriver.default.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD_CASC || 'i-0cd55b5744e56cfcc'));

const typeDefs = (0, _apolloServer.gql)`
  union CASC = Inventor | Licensee | Organization | Patent

  extend type Query {
    get_casc(query: String): ResponseCASC
  }
  type ResponseCASC {
    nodes: [CASC]
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
      driver
    };
  },
  schema: (0, _federation.buildFederatedSchema)([{
    typeDefs,
    resolvers
  }]),
  playground: true,
  introspection: true
});
server.listen({
  port: 4003
}).then(({
  url
}) => {
  console.log(`🚀 Server ready at ${url}`);
});