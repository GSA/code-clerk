const yaml = require("js-yaml")
const jsonata = require("jsonata")
const transforms = require("./transforms")

module.exports = class Inventory {

  constructor(client, agency, options = {}) {
    // Handle null parameters if needed
    options = options || {}

    this.client = client

    // code.json metadata properties
    this.agency = agency
    this.measurementType = options.measurementType || "modules"
    this.version = options.version || "2.0.0"
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

          // Run a final sanity check on metadata
          releaseMetadata = this.cleanup(releaseMetadata)

          // Apply callback
          this.callback(releaseMetadata, org)

          releases.push(releaseMetadata)
        }
        return releases
      })
  }

  /**
   * Catches common issues with metadata and ensures it is properly formatted
   * in accordance with the code.json schema.
   *
   * @param {Object} metadata The release metadata to clean up
   */
  cleanup(metadata) {
    // Basic sanity check on URLs
    const urlProperties = ["repositoryURL", "homepageURL"]
    for (const urlProperty of urlProperties) {
      if (metadata[urlProperty]) {
        let url = metadata[urlProperty]
        url = url.trim()
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = `http://${url}`
        }
        metadata[urlProperty] = url
      }
    }

    // Ensure all tags are strings
    for (const t in metadata.tags) {
      metadata.tags[t] = metadata.tags[t].toString()
    }

    return metadata
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
