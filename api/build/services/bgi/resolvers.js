"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/map"));

const resolvers = {
  Query: {
    me() {
      return users;
    },

    getInventors: async (_, params, ctx) => {
      console.log('ctx: ');
      let session = ctx.driver.session();
      console.log('session: ');
      const cypherQuery = `MATCH (inventors:Inventor) RETURN inventors`;
      return await session.run(cypherQuery).then(result => {
        var _context;

        console.log(result);
        const resData = (0, _map.default)(_context = result.records).call(_context, record => {
          const inventor = record.get('inventors') === null ? null : record.get('inventors').properties;
          console.log(inventor); // let { id, title, type, priority, notes, created_at, due_date } =

          return inventor;
        });
        return resData;
      });
    }
  } // User: {
  //   __resolveReference(object) {
  //     return users.find((user) => user.id === object.id)
  //   },
  // },

};
const users = [{
  id: '1',
  name: 'Ada Lovelace',
  birthDate: '1815-12-10',
  username: '@ada'
}, {
  id: '2',
  name: 'Alan Turing',
  birthDate: '1912-06-23',
  username: '@complete'
}];
var _default = resolvers;
exports.default = _default;