const clerk = require("../lib/index")
const assert = require("assert")
const sinon = require("sinon")
const path = require("path")
const loadFixture = require("./testHelper").loadFixture

describe("FileClient", function () {
  beforeEach(function() {
    const filename = path.resolve(__dirname, "fixtures", "organizationQueryResponse.json")
    this.client = new clerk.FileClient(filename)
  })

  afterEach(function() {
    sinon.restore()
  })

  describe("#getAllRepositories()", function () {
    it("should return GitHub metadata as an object", function () {
      const fixtureData = JSON.parse(loadFixture("organizationQueryResponse.json")).data

      return this.client.getAllRepositories("dummyorg").then((actualResponse) => {
        assert.equal(actualResponse.length, 3)
      })
    })
  })
})
