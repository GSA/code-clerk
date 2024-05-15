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
   * @param {String} org GitHub organization name
   * @returns {Promise<any[]>} An array of repositories
   */
  async getAllRepositories(org) {
    const contents = await fs.readFile(this.filename)
    const metadata = JSON.parse(contents)
    const result = metadata.data.organization.repositories.edges
    return result
  }

  /**
   * Get a specific repository in the given GitHub organization.
   *
   * @param {String} org GitHub organization name
   * @param {String} repo GitHub repository name
   * @returns {Promise<any>} A repository
   */
  getRepository(org, repo) {
    throw new Error('Method not implemented')
  }
}
