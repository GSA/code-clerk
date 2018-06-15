const clerk = require("../lib/index")
const queries = require("../lib/queries")
const assert = require("assert")
const sinon = require("sinon")
const loadFixture = require("./testHelper").loadFixture
const fakeGraphQLResponse = require("./testHelper").fakeGraphQLResponse
const GraphQLClient = require("graphql-request").GraphQLClient

describe("GitHubClient", function () {
  beforeEach(function() {
    this.client = new clerk.GitHubClient("abc123")
  })

  afterEach(function() {
    sinon.restore()
  })

  describe("#getRepository()", function () {
    it("should call the GraphQL client properly", function () {
      const mock = sinon.mock(GraphQLClient.prototype)
      mock.expects("request").withArgs(queries.repositoryQuery, { org: "fakeOrg", repo: "fakeRepo" })
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
      const fixtureData = JSON.parse(loadFixture("organizationQueryResponse.json")).data

      return this.client.getAllRepositories("dummyorg").then((actualResponse) => {
        assert.equal(actualResponse.length, 3)
      })
    })
  })
})
