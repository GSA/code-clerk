#!/usr/bin/env node

const clerk = require("../lib/index")
const ArgumentParser = require("argparse").ArgumentParser
const package = require("../package.json")

require("dotenv").config()

let argParser = new ArgumentParser({
  version: package.version,
  addHelp: true,
  description: package.description
})

argParser.addArgument([ "-t", "--token-var" ], {
  help: "Environment variable containing GitHub token (default: GITHUB_ACCESS_TOKEN)",
  defaultValue: "GITHUB_ACCESS_TOKEN",
  nargs: 1
})

argParser.addArgument("AGENCY", {
  help: "Your agency acronym",
  nargs: 1
})

argParser.addArgument("GITHUB_ORG", {
  help: "List of GitHub organization names to pull metadata from",
  nargs: "+"
})

const args = argParser.parseArgs()

if (!process.env[args.token_var]) {
  console.log(`Please set $${args.token_var} to your GitHub access token (or use '-t')`)
  process.exit(1)
}

const client = new clerk.GitHubClient(process.env[args.token_var])
const inventory = new clerk.Inventory(client, args.AGENCY[0])

inventory.build(args.GITHUB_ORG)
  .then((data) => {
    console.log(JSON.stringify(data))
  })
  .catch((err) => {
    console.error(err)
  })
