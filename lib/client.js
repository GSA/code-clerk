const GraphQLClient = require("graphql-request").GraphQLClient
const queries = require("./queries")

module.exports = class GitHubClient {
  constructor(token) {
    this.endpoint = "https://api.github.com/graphql"
    this.headers = {
      "Authorization": `Bearer ${token}`
    }
    this.gqlClient = new GraphQLClient(this.endpoint, {
      headers: this.headers
    })
  }

  getAllRepositories(org) {
    return this.getAllRepositoryPages(org)
  }

  getAllRepositoryPages(org, cursor = undefined, repoEdges = []) {
    const gqlVariables = {
      "org": org,
      "cursor": cursor,
      "itemsPerPage": 100
    }

    return this.gqlClient
      .request(queries.organizationQuery, gqlVariables)
      .then(data => {
        repoEdges = repoEdges.concat(data.organization.repositories.edges)

        const pageInfo = data.organization.repositories.pageInfo
        if (pageInfo.hasNextPage) {
          return this.getAllRepositoryPages(org, pageInfo.endCursor, repoEdges)
        }

        const result = ({
          organization: {
            repositories: { edges: repoEdges }
          }
        })

        return result
      })
  }

  getRepository(org, repo) {
    const gqlVariables = {
      "org": org,
      "repo": repo
    }
    return this.gqlClient.request(queries.repositoryQuery, gqlVariables)
  }
}
