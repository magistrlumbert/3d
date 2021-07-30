"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/keys"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

var _keys2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/object/keys"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/json/stringify"));

var _apolloServerExpress = require("apollo-server-express");

var _federation = require("@apollo/federation");

var _neo4jDriver = _interopRequireDefault(require("neo4j-driver"));

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

// set environment variables from .env
_dotenv.default.config();

const app = (0, _express.default)();
const resolvers = {
  BGI: {
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
    get_bgi: async (_, {
      query
    }, ctx) => {
      let session = ctx.driver.session();
      const cypherQuery = query;
      return await session.run(cypherQuery).then(result => {
        var _context;

        let columns = {};
        let elements = {};
        let nodes = [];
        let links = [];
        (0, _map.default)(_context = result.records).call(_context, record => {
          var _context2;

          (0, _map.default)(_context2 = (0, _keys.default)(record)).call(_context2, key => {
            let element = 0;

            try {
              element = record.get(key);

              if (element.start) {
                //rels
                let link = { ...element.properties,
                  ['identity']: element.identity.toString(),
                  ['source']: element.start.toString(),
                  ['target']: element.end.toString(),
                  ['type']: element.type.toString()
                };
                links = [...links, link];
              } else {
                //nodes
                if (element.identity) {
                  let source = { ...element.properties,
                    ['identity']: element.identity.toString()
                  };
                  let found = (0, _some.default)(nodes).call(nodes, el => el.identity === source.identity);
                  if (!found) nodes = [...nodes, source];
                } else {
                  //columns
                  if (!elements[key]) {
                    elements[key] = {};
                  }

                  elements[key][(0, _keys2.default)(elements[key]).length] = element.toString();
                  columns = elements;
                }
              }
            } catch (error) {
              console.log(error.message);
            }
          });
          return true;
        });
        const answer = {
          nodes: nodes,
          links: links,
          columns: (0, _stringify.default)(columns)
        };
        return answer;
      }).catch(error => {
        console.log(error.message);
        return {
          error: error.message
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

const driver = _neo4jDriver.default.driver(process.env.NEO4J_URI_BGI || 'bolt://54.224.51.117:7687', _neo4jDriver.default.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD_BGI || 'i-08bb780d2ee5c5ec9'));

const typeDefs = (0, _apolloServerExpress.gql)`
  union BGI = Inventor | Licensee | Organization | Patent

  extend type Query {
    get_bgi(query: String): ResponseBGI
  }
  type ResponseBGI {
    nodes: [BGI]
    links: [RELS]
    columns: String
    error: String
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
const server = new _apolloServerExpress.ApolloServer({
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
}); // Specify host, port and path for GraphQL endpoint

const port = 4001;
const path = '/graphql';
const host = '0.0.0.0';
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