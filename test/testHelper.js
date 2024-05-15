import fs from "fs"
import path from "path"

export function loadFixture(fixtureFile) {
  return fs.readFileSync(path.join(import.meta.dirname, "fixtures", fixtureFile), { encoding: "UTF-8" })
}

export function fakeGraphQLResponse(fixtureFile) {
  return JSON.parse(loadFixture(fixtureFile)).data
}
