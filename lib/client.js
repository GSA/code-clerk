const GraphQLClient = require("graphql-request").GraphQLClient
const queries = require("./queries")

module.exports = class GitHubClient {
  constructor(token, options = {}) {
    this.endpoint = options.endpoint || "https://api.github.com/graphql"
    this.headers = options.headers || {
      "Authorization": `Bearer ${token}`
    }
    this.organizationQuery = options.organizationQuery || queries.organizationQuery
    this.repositoryQuery = options.repositoryQuery || queries.repositoryQuery
    this.gqlClient = new GraphQLClient(this.endpoint, {
      headers: this.headers
    })
  }

  getAllRepositories(org) {
    return this.getAllRepositoryPages(org)
  }

  getAllRepositoryPages(org, autoPaginate = true, cursor = undefined, repoEdges = []) {
    const gqlVariables = {
      "org": org,
      "cursor": cursor,
      "itemsPerPage": 100
    }

    return this.gqlClient
      .request(this.organizationQuery, gqlVariables)
      .then(data => {
        repoEdges = repoEdges.concat(data.organization.repositories.edges)

        if (autoPaginate) {
          const pageInfo = data.organization.repositories.pageInfo
          if (pageInfo.hasNextPage) {
            return this.getAllRepositoryPages(org, pageInfo.endCursor, repoEdges)
          }
        }

        const result = {
          organization: {
            repositories: { edges: repoEdges }
          }
        }

        return result
      })
      .catch(err => {
        console.error(err)
      })
  }

  getRepository(org, repo) {
    const gqlVariables = {
      "org": org,
      "repo": repo
    }
    return this.gqlClient.request(this.repositoryQuery, gqlVariables)
  }
}
