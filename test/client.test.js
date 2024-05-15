import { GitHubClient } from "../lib/index.js"
import { repositoryQuery } from "../src/queries.js"
import assert from "assert"
import sinon from "sinon"
import { loadFixture, fakeGraphQLResponse } from "./testHelper.js"
import { GraphQLClient } from "graphql-request"

describe("GitHubClient", function () {
  beforeEach(function() {
    this.client = new GitHubClient("abc123")
  })

  afterEach(function() {
    sinon.restore()
  })

  describe("#getRepository()", function () {
    it("should call the GraphQL client properly", function () {
      const mock = sinon.mock(GraphQLClient.prototype)
      mock.expects("request").withArgs(repositoryQuery, { org: "fakeOrg", repo: "fakeRepo" })
      this.client.getRepository("fakeOrg", "fakeRepo")
      mock.verify()
    })

    it("should return GitHub metadata as an object", function () {
      const gqlClientRequestStub = sinon.stub(GraphQLClient.prototype, "request")
      gqlClientRequestStub.resolves(fakeGraphQLResponse("repositoryQueryResponse.json"))
      const fixtureData = JSON.parse(loadFixture("repositoryQueryResponse.json")).data

      return this.client.getRepository("fakeOrg", "fakeRepo").then((actualResponse) => {
        assert.equal(actualResponse.repository.name, fixtureData.repository.name)
        assert.equal(actualResponse.repository.languages.nodes.length, 4)
      })
    })
  })

  describe("#getAllRepositories()", function () {
    it("should return GitHub metadata as an object", function () {
      const gqlClientRequestStub = sinon.stub(GraphQLClient.prototype, "request")
      gqlClientRequestStub.resolves(fakeGraphQLResponse("organizationQueryResponse.json"))

      return this.client.getAllRepositories("dummyorg").then((actualResponse) => {
        assert.equal(actualResponse.length, 3)
      })
    })
  })
})
