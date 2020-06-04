#!/usr/bin/env node

const clerk = require("../lib/index")
const ArgumentParser = require("argparse").ArgumentParser
const package = require("../package.json")
const fs = require("fs")

require("dotenv").config()

const argParser = new ArgumentParser({
  version: package.version,
  addHelp: true,
  description: package.description
})

argParser.addArgument([ "-o", "--output-file" ], {
  help: "Write output to file (default: stdout)",
  nargs: 1
})

argParser.addArgument("AGENCY", {
  help: "Your agency acronym",
  nargs: 1
})

argParser.addArgument("FILENAME", {
  help: "GraphQL output file name",
  nargs: 1
})

const args = argParser.parseArgs()

const output = function (result) {
  if (!args.output_file) {
    console.log(result)
  } else {
    const filename = args.output_file.toString()
    fs.writeFileSync(filename, result)
  }
}

const options = {
  callback: (releaseMetadata, org) => {
    console.error(`Processing ${org} - ${releaseMetadata.name}`)
  }
}

const client = new clerk.FileClient(args.FILENAME[0])
const inventory = new clerk.Inventory(client, args.AGENCY[0], options)

inventory.build(args.AGENCY[0])
  .then((data) => {
    output(JSON.stringify(data))
  })
  .catch((err) => {
    console.error(err)
  })
