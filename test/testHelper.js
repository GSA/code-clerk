const fs = require("fs")
const path = require("path")

module.exports.loadFixture = function(fixtureFile) {
  return fs.readFileSync(path.join(__dirname, "fixtures", fixtureFile), { encoding: "UTF-8" })
}

module.exports.fakeGraphQLResponse = function(fixtureFile) {
  return JSON.parse(exports.loadFixture(fixtureFile)).data
}