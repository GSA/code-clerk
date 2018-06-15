const clerk = require("../lib/index")
const assert = require("assert")
const sinon = require("sinon")
const loadFixture = require("./testHelper").loadFixture
const djv = require("djv")
const transforms = require("../lib/transforms")

describe("Inventory", function () {
  beforeEach(function() {
    let client = new clerk.GitHubClient("abc123")
    this.inventory = new clerk.Inventory(client, "ABC")
  })

  afterEach(function() {
    sinon.restore()
  })

  describe("#build()", function () {
    it("handles an Array arg for the org parameter", function () {
      const getReleasesStub = sinon.stub(clerk.Inventory.prototype, "getReleases")
      return this.inventory.build(["ABC", "DEF", "XYZ"]).then(() => {
        assert.equal(getReleasesStub.callCount, 3)
      })
    })

    it("handles a String arg for the org parameter", function () {
      const getReleasesStub = sinon.stub(clerk.Inventory.prototype, "getReleases")
      return this.inventory.build("ABC").then(() => {
        assert.equal(getReleasesStub.callCount, 1)
      })
    })
  })

  describe("#getReleases()", function () {
    it("correctly performs YAML overrides", function () {
      const repoEdgesFixture = require("./fixtures/getAllRepositoriesResult")
      const getAllRepositoriesStub = sinon.stub(clerk.GitHubClient.prototype, "getAllRepositories")
      getAllRepositoriesStub.resolves(repoEdgesFixture)

      return this.inventory.getReleases("ABC", transforms.defaultGitHubTransform).then((result) => {
        assert.equal(result[0].name, "Test 1 Override")
        assert.equal(result[0].description, "Description override")
        assert.equal(result[1].name, "mobile-fu")
      })
    })

    it("correctly performs local overrides", function () {
      const repoEdgesFixture = require("./fixtures/getAllRepositoriesResult")
      const getAllRepositoriesStub = sinon.stub(clerk.GitHubClient.prototype, "getAllRepositories")
      getAllRepositoriesStub.resolves(repoEdgesFixture)

      const localOverrides = {
        contact: {
          email: "test@example.com"
        }
      }
      return this.inventory.getReleases("ABC", transforms.defaultGitHubTransform, localOverrides).then((result) => {
        assert.equal(result[0].contact.email, "test@example.com")
        assert.equal(result[1].contact.email, "test@example.com")
      })
    })
  })

  describe("#transform()", function () {
    it("correctly executes a transform on data", function () {
      const transform = `{
        "name": name,
        "description": $boolean(description) ? description : name,
        "nonexistent": nonexistent
      }`
      const repoData = JSON.parse(loadFixture("repositoryQueryResponse.json")).data.repository
      const result = this.inventory.applyTransform(transform, repoData)
      assert.equal(result.name, "cto-website")
      assert.equal(result.description, "Tech at GSA website")
      assert.equal(result.nonexistent, undefined)
    })
  })

  describe("#metadata()", function () {
    it("returns a format compliant with Code.gov schema", function () {
      const validator = djv({ version: "draft-04" })
      validator.addSchema("2.0.0", JSON.parse(loadFixture("codegov-schema-2.0.0.json")))
      const metadata = this.inventory.metadata()
      assert(validator.validate("2.0.0", metadata))
      assert.equal(metadata.version, "2.0.0")
    })
  })
})
