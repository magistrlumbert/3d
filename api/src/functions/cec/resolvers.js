const resolvers = {
  CEC: {
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
    get_cec: async (_, { query }, ctx) => {
      let session = ctx.driver.session()
      const cypherQuery = query
      return await session
        .run(cypherQuery)
        .then((result) => {
          let columns = {}
          let elements = {}
          let nodes = []
          let links = []
          result.records.map((record) => {
            record.keys.map((key) => {
              let element = 0
              try {
                element = record.get(key)
                if (element.start) {
                  //rels
                  let link = {
                    ...element.properties,
                    ['identity']: element.identity.toString(),
                    ['source']: element.start.toString(),
                    ['target']: element.end.toString(),
                    ['type']: element.type.toString(),
                  }

                  links = [...links, link]
                } else {
                  //nodes
                  if (element.identity) {
                    let source = {
                      ...element.properties,
                      ['identity']: element.identity.toString(),
                    }
                    let found = nodes.some(
                      (el) => el.identity === source.identity
                    )
                    if (!found) nodes = [...nodes, source]
                  } else {
                    //columns
                    if (!elements[key]) {
                      elements[key] = {}
                    }
                    elements[key][Object.keys(elements[key]).length] =
                      element.toString()
                    columns = elements
                  }
                }
              } catch (error) {
                console.log(error.message)
              }
            })

            return true
          })
          const answer = {
            nodes: nodes,
            links: links,
            columns: JSON.stringify(columns),
          }
          return answer
        })
        .catch((error) => {
          console.log(error.message)
          return {
            error: error.message,
          }
        })
    },
  },
}
export default resolvers
