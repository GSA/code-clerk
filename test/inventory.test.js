const clerk = require("../lib/index")
const assert = require("assert")
const sinon = require("sinon")
const loadFixture = require("./testHelper").loadFixture
const djv = require("djv")

describe("Inventory", function () {
  beforeEach(function() {
    this.client = sinon.spy(clerk.Client)
    this.inventory = new clerk.Inventory(this.client, "ABC")
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
