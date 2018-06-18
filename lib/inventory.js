const yaml = require("js-yaml")
const jsonata = require("jsonata")
const transforms = require("./transforms")

module.exports = class Inventory {

  constructor(client, agency, measurementType = "modules", options = {}) {
    this.client = client
    // code.json metadata properties
    this.agency = agency
    this.measurementType = measurementType
    this.version = "2.0.0"
    this.releases = []
    // Inventory build options
    this.transform = options.transform || transforms.defaultGitHubTransform
    this.localOverrides = options.localOverrides
    this.callback = options.callback || (() => {})
  }

  build(orgs) {
    orgs = [].concat(orgs)
    const releaseQueries = []
    for (let org of orgs) {
      releaseQueries.push(this.getReleases(org))
    }

    return Promise.all(releaseQueries).then((results) => {
      for (let result of results) {
        this.releases = this.releases.concat(result)
      }
      return this.metadata()
    })
  }

  getReleases(org) {
    return this.client.getAllRepositories(org)
      .then((repoEdges) => {
        const releases = []
        for (let repoEdge of repoEdges) {
          // Transform GitHub repo metadata to Code.gov metadata
          let releaseMetadata = this.applyTransform(this.transform, repoEdge.node)

          const overrides = []

          // If there's a .codeinventory.yml file in the repo, use its metadata instead
          if (repoEdge.node.codeInventoryFile != null) {
            const yamlOverrides = yaml.safeLoad(repoEdge.node.codeInventoryFile.text)
            overrides.push(yamlOverrides)
          }

          // If there are local overrides, include those
          if (this.localOverrides) {
            overrides.push(this.localOverrides)
          }

          // Apply all overrides in order
          releaseMetadata = Object.assign(releaseMetadata, ...overrides)

          // Apply callback
          this.callback(releaseMetadata, org)

          releases.push(releaseMetadata)
        }
        return releases
      })
  }

  /**
   * Applies the given transform to the data.
   *
   * @param {String} transform A JSONata expression describing the transform
   * @param {Object} data The input data to transform
   * @returns {String} Transformed data in JSON
   */
  applyTransform(transform, data) {
    return jsonata(transform).evaluate(data)
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
      version: this.version,
      releases: this.releases
    }
  }
}
