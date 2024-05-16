import { Inventory, GitHubClient } from "../lib/index.js"
import assert from "assert"
import sinon from "sinon"
import { loadFixture } from "./testHelper.js"
import djv from "djv"
import repoEdgesFixture from "./fixtures/getAllRepositoriesResult.js"

describe("Inventory", function () {
  beforeEach(function() {
    this.client = new GitHubClient("abc123")
  })

  afterEach(function() {
    sinon.restore()
  })

  describe("#constructor()", function () {
    it("handles a null options parameter by providing defaults", function () {
      const inventory = new Inventory(this.client, "ABC", null)
      assert.equal(inventory.localOverrides, null)
    })
  })

  describe("#build()", function () {
    it("handles an Array arg for the org parameter", function () {
      const getReleasesStub = sinon.stub(Inventory.prototype, "getReleases")
      const inventory = new Inventory(this.client, "ABC")
      return inventory.build(["ABC", "DEF", "XYZ"]).then(() => {
        assert.equal(getReleasesStub.callCount, 3)
      })
    })

    it("handles a String arg for the org parameter", function () {
      const getReleasesStub = sinon.stub(Inventory.prototype, "getReleases")
      const inventory = new Inventory(this.client, "ABC")
      return inventory.build("ABC").then(() => {
        assert.equal(getReleasesStub.callCount, 1)
      })
    })
  })

  describe("#getReleases()", function () {
    it("correctly performs local overrides", function () {
      const getAllRepositoriesStub = sinon.stub(GitHubClient.prototype, "getAllRepositories")
      getAllRepositoriesStub.resolves(repoEdgesFixture)

      const localOverrides = {
        contact: {
          email: "test@example.com"
        }
      }

      const inventory = new Inventory(this.client, "ABC", {
        localOverrides: localOverrides
      })

      return inventory.getReleases("ABC").then((result) => {
        assert.equal(result[0].contact.email, "test@example.com")
        assert.equal(result[1].contact.email, "test@example.com")
      })
    })

    it("correctly performs a user-specified callback", function () {
      const getAllRepositoriesStub = sinon.stub(GitHubClient.prototype, "getAllRepositories")
      getAllRepositoriesStub.resolves(repoEdgesFixture)

      let callbackCounter = 0
      const callback = (metadata) => {
        metadata.newInfo = `item ${callbackCounter}`
        callbackCounter++
      }

      const inventory = new Inventory(this.client, "ABC", {
        callback: callback
      })

      return inventory.getReleases("ABC").then((result) => {
        assert(result[0].newInfo)
        assert.equal(result[0].newInfo, "item 0")
        assert.equal(result[1].newInfo, "item 1")
      })
    })

    it("correctly passes args to a user-specified callback", function () {
      const getAllRepositoriesStub = sinon.stub(GitHubClient.prototype, "getAllRepositories")
      getAllRepositoriesStub.resolves(repoEdgesFixture)

      const callback = sinon.spy()

      const inventory = new Inventory(this.client, "ABC", {
        callback: callback
      })

      return inventory.getReleases("ABC").then((result) => {
        assert(callback.called)
        assert(callback.calledWithMatch(sinon.match.has("name"), "ABC"))
      })
    })
  })

  describe("#cleanup()", function () {
    it("repairs poorly formed URIs", function () {
      const uriFixture = JSON.parse(loadFixture("uriCleanupInvalid.json"))
      const inventory = new Inventory(this.client, "ABC")
      const result = inventory.cleanup(uriFixture)
      assert.equal(result.repositoryURL, "https://extraneous-spaces.example.com/")
      assert.equal(result.homepageURL, "http://missing-schema.example.com/path")
    })

    it("ensures tags are always strings", function () {
      const tagFixture = JSON.parse(loadFixture("tagCleanupInvalid.json"))
      const inventory = new Inventory(this.client, "ABC")
      const result = inventory.cleanup(tagFixture)
      assert(result.tags.includes("foo"))
      assert(result.tags.includes("123"))
      assert(result.tags.includes("bar"))
      assert(result.tags.includes("456"))
      assert(!result.tags.includes(123))
      assert(!result.tags.includes(456))
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
      const inventory = new Inventory(this.client, "ABC")
      inventory.applyTransform(transform, repoData).then((result) => {
        assert.equal(result.name, "cto-website")
        assert.equal(result.description, "Tech at GSA website")
        assert.equal(result.nonexistent, undefined)
      })
    })
  })

  describe("#metadata()", function () {
    it("returns a format compliant with Code.gov schema", function () {
      const validator = djv({ version: "draft-04" })
      validator.addSchema("2.0.0", JSON.parse(loadFixture("codegov-schema-2.0.0.json")))
      const inventory = new Inventory(this.client, "ABC")
      const metadata = inventory.metadata()
      assert(validator.validate("2.0.0", metadata))
      assert.equal(metadata.version, "2.0.0")
    })
  })
})
