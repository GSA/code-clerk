import fs from "fs/promises"

export class FileClient {
  /**
   * Provides a client based on a local GraphQL output file
   * @param {String} filename GraphQL output file
   */
  constructor(filename) {
    this.filename = filename
  }

  /**
   * Get all repositories in the given GitHub organization.
   *
   * @param {String} org GitHub organization name (ignored for FileClient)
   * @returns {Promise<any[]>} An array of repositories
   */
  async getAllRepositories(org) {
    const contents = await fs.readFile(this.filename)
    const metadata = JSON.parse(contents)
    return metadata.data.organization.repositories.edges
  }

  /**
   * Get a specific repository in the given GitHub organization.
   *
   * @param {String} org GitHub organization name (ignored for FileClient)
   * @param {String} repo GitHub repository name
   * @returns {Promise<any>} A repository
   */
  async getRepository(org, repo) {
    const repos = await this.getAllRepositories(org)
    return repos.find((r) => r.node.name === repo)?.node
  }
}
