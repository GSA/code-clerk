import { FileClient } from "../lib/index.js"
import assert from "assert"
import sinon from "sinon"
import path from "path"

describe("FileClient", function () {
  beforeEach(function() {
    const filename = path.resolve(import.meta.dirname, "fixtures", "organizationQueryResponse.json")
    this.client = new FileClient(filename)
  })

  afterEach(function() {
    sinon.restore()
  })

  describe("#getAllRepositories()", function () {
    it("should return GitHub metadata as an object", function () {
      return this.client.getAllRepositories("dummyorg").then((actualResponse) => {
        assert.equal(actualResponse.length, 3)
      })
    })
  })
})
