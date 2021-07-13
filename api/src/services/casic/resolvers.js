const resolvers = {
  CASIC: {
    __resolveType(obj) {
      if (obj.name) {
        return 'Inventor'
      }
      if (obj.licenseID) {
        return 'Licensee'
      }
      if (obj.orgID) {
        return 'Organization'
      }
      if (obj.patentID) {
        return 'Patent'
      }
      return null // GraphQLError is thrown
    },
  },
  Query: {
    get_casic: async (_, params, ctx) => {
      let session = ctx.driver.session()
      const cypherQuery = `MATCH (n)-[r]-(m)
                          RETURN n, m, r
                          LIMIT 50`
      return await session.run(cypherQuery).then((result) => {
        let nodes = []
        let links = []
        const resData = result.records.map((record) => {
          const n = record.get('n') === null ? null : record.get('n').properties
          let source = {
            ...n,
            ['identity']: record.get('n').identity.toString(),
          }
          const m = record.get('m') === null ? null : record.get('m').properties
          let target = {
            ...m,
            ['identity']: record.get('m').identity.toString(),
          }
          const r = record.get('r') === null ? null : record.get('r').properties
          let link = {
            ...r,
            ['identity']: record.get('r').identity.toString(),
            ['source']: record.get('r').start.toString(),
            ['target']: record.get('r').end.toString(),
            ['type']: record.get('r').type.toString(),
          }

          let found = nodes.some((el) => el.identity === source.identity)
          if (!found) nodes = [...nodes, source]
          found = nodes.some((el) => el.identity === target.identity)
          if (!found) nodes = [...nodes, target]

          links = [...links, link]
          return {
            nodes: nodes,
            links: links,
          }
        })

        return {
          nodes: nodes,
          links: links,
        }
      })
    },
  },
}

export default resolvers
