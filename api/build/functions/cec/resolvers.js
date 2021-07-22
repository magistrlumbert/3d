"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

var _some = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/some"));

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
      console.log('wish you were here');
      let session = ctx.driver.session(); // const cypherQuery = `MATCH (n)-[r]-(m)
      //                     RETURN n, m, r
      //                     LIMIT 50`

      const cypherQuery = query;
      console.log(cypherQuery);
      return await session.run(cypherQuery).then(result => {
        var _context;

        let nodes = [];
        let links = [];
        const resData = (0, _map.default)(_context = result.records).call(_context, record => {
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
var _default = resolvers;
exports.default = _default;