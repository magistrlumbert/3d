"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _neo4jDriver = _interopRequireDefault(require("neo4j-driver"));

// import { neo4jgraphql } from 'neo4j-graphql-js'
const driver = _neo4jDriver.default.driver(process.env.NEO4J_URI || 'bolt://localhost:7687', _neo4jDriver.default.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'neo4j'));

const resolvers = {
  Query: {
    customResolverBgi: async (_, __) => {
      console.log('wish you were here');
      let session = driver.session();
      const cypherQuery = `MATCH(n) RETURN count(n) as count`;
      return await session.run(cypherQuery).then(result => {
        var _context;

        const resData = (0, _map.default)(_context = result.records).call(_context, record => {
          const owner = record.get('count') === null ? null : record.get('owner').properties;
          return owner;
        });
        return resData;
      });
    } // getUserCount: async (object, params, ctx, resolveInfo) => {
    //   const result = await neo4jgraphql(object, params, ctx, resolveInfo, true)
    //   return result
    // },

  }
};
var _default = resolvers;
exports.default = _default;