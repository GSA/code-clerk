const GraphQLClient = require("graphql-request").GraphQLClient
const queries = require("./queries")

module.exports = class GitHubClient {
  /**
   * Provides a client that can perform basic GitHub repository queries
   * @param {String} token GitHub access token
   * @param {Object} options Options
   */
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

  /**
   * Get all repositories in the given GitHub organization.
   *
   * Serves as a facade for getAllRepositoryPages(), which has extra parameters
   * that are intended to handle multiple GraphQL calls.
   *
   * @param {String} org GitHub organization name
   * @returns {Promise<any[]>} An array of repositories
   */
  getAllRepositories(org) {
    return this.getAllRepositoryPages(org)
  }

  /**
   * Get all repositories in the given GitHub organization. Users of this
   * module typically should use its facade, getAllRepositories(), instead.
   *
   * @param {*} org GitHub organization name
   * @param {*} autoPaginate Whether or not all items should be retrieved
   * @param {*} cursor Represents the current page
   * @param {*} repoEdges Contains accumulated repository edges so far
   * @returns {Promise<any[]>} An array of repositories
   */
  getAllRepositoryPages(org, autoPaginate = true, cursor = undefined, repoEdges = []) {
    const gqlVariables = {
      "org": org,
      "cursor": cursor,
      "itemsPerPage": 100
    }

    return this.gqlClient
      .request(this.organizationQuery, gqlVariables)
      .then(responseData => {
        repoEdges = repoEdges.concat(responseData.organization.repositories.edges)

        if (autoPaginate) {
          const pageInfo = responseData.organization.repositories.pageInfo
          if (pageInfo.hasNextPage) {
            return this.getAllRepositoryPages(org, autoPaginate, pageInfo.endCursor, repoEdges)
          }
        }

        return repoEdges
      })
  }

  /**
   * Get a specific repository in the given GitHub organization.
   *
   * @param {String} org GitHub organization name
   * @param {String} repo GitHub repository name
   * @returns {Promise<any>} A repository
   */
  getRepository(org, repo) {
    const gqlVariables = {
      "org": org,
      "repo": repo
    }
    return this.gqlClient.request(this.repositoryQuery, gqlVariables)
  }
}
