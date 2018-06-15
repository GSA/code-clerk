const clerk = require("../lib/index")
const assert = require("assert")
const sinon = require("sinon")
const loadFixture = require("./testHelper").loadFixture
const djv = require("djv")
const yaml = require("js-yaml")

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
