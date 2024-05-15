#!/usr/bin/env -S node --no-warnings=ExperimentalWarning

// This CLI tool parses a file that contains GitHub GraphQL API results. It is
// mostly for debugging at this point.

import { FileClient, Inventory } from "../lib/index.js"
import { ArgumentParser } from "argparse"
import pkg from "../package.json" assert { type: "json" }
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

const argParser = new ArgumentParser({
  version: pkg.version,
  addHelp: true,
  description: pkg.description
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

const client = new FileClient(args.FILENAME[0])
const inventory = new Inventory(client, args.AGENCY[0], options)

inventory.build(args.AGENCY[0])
  .then((data) => {
    output(JSON.stringify(data))
  })
  .catch((err) => {
    console.error(err)
  })
