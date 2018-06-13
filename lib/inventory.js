const yaml = require("js-yaml")
const jsonata = require("jsonata")
const transforms = require("./transforms")

module.exports = class Inventory {
  constructor(client, agency, measurementType = "modules") {
    this.client = client
    this.agency = agency
    this.measurementType = measurementType
    this.releases = []
  }

  build(orgs, repoTransform = transforms.repositoryTransform) {
    orgs = [].concat(orgs)
    let releaseQueries = []
    for (let org of orgs) {
      releaseQueries.push(this.getReleases(org, repoTransform))
    }
    return Promise.all(releaseQueries).then((results) => {
      for (let result of results) {
        this.releases = this.releases.concat(result)
      }
      return this.metadata()
    })
  }

  getReleases(org, repoTransform = transforms.repositoryTransform) {
      return this.client.getAllRepositories(org).then((data) => {
        let repositories = []
        for (let repoEdge of data.organization.repositories.edges) {
          repositories.push(repoEdge.node)
        }
        let orgReleases = []
        for (let repo of repositories) {
          // Map GitHub repo metadata to Code.gov metadata
          let expression = jsonata(repoTransform)
          let releaseMetadata = expression.evaluate(repo)

          // If there's a .codeinventory.yml file in the repo, use its metadata instead
          if (repo.codeInventoryFile != null) {
            releaseMetadata = this.processOverrides(releaseMetadata, repo.codeInventoryFile.text)
          }

          orgReleases.push(releaseMetadata)
        }

        return orgReleases
      })
  }

  /**
   * Parses a YAML metadata file, merging its contents into GitHub's metadata.
   *
   * @param {Object} metadata Metadata from GitHub
   * @param {String} metadataFileContent Contents of a YAML file that will override GitHub metadata
   * @returns {Object} New metadata object with content merged from metadataFileContent
   */
  processOverrides(metadata, metadataFileContent) {
    const metadataFile = yaml.safeLoad(metadataFileContent)
    let overrides = {
      name: metadataFile.name || metadata.name,
      description: metadataFile.description || metadata.description,
      contact: {
        email: metadataFile.contact.email || metadata.contact.email,
      }
    }
    let updatedMetadata = Object.assign({}, metadata)
    return Object.assign(updatedMetadata, overrides)
  }

  /**
   * Provides all metadata required by Code.gov, ready to convert to code.json.
   *
   * @returns {Object} Metadata object that can be converted to JSON for Code.gov
   */
  metadata() {
    return {
      agency: this.agency,
      measurementType: {
        method: this.measurementType
      },
      version: "2.0.0",
      releases: this.releases
    }
  }
}
