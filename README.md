# Code Clerk

Harvests project metadata from GitHub repositories. The harvested metadata is formatted to make it easy to produce a code.json file for Code.gov.

## Installation

Locally:

```sh
npm install code-clerk
```

System-wide:

```sh
npm install -g code-clerk
```

## Usage

### API

```javascript
const clerk = require("code-clerk")

const client = new clerk.GitHubClient(YOUR_GITHUB_ACCESS_TOKEN)
const inventory = new clerk.Inventory(client, "ABC") // ABC is your agency acronym
const orgs = ["ABC", "AgencyZ"] // List of GitHub organization names

inventory.build(orgs).then((data) => {
  console.log(JSON.stringify(data)) // Here's your code.json
})
```

### CLI

First, check out the built-in usage information:

```sh
codeclerk --help
```

#### Example 1

Assuming:

* Your GitHub access token is in an environment variable named `GITHUB_ACCESS_TOKEN` (the default)
* Your agency's acronym is _ABC_
* Your agency has two GitHub organizations, named _AgencyABC_ and _AgencyXYZ_

You could get your code.json output by running this command:

```sh
codeclerk ABC AgencyABC AgencyXYZ
```

#### Example 2

Assuming:

* Your GitHub access token is in an environment variable named `GITHUB_TOKEN`
* Your agency's acronym is _XYZ_
* Your agency has one GitHub organization, named _XYZ_

You could get your code.json output by running this command:

```sh
codeclerk -t GITHUB_TOKEN XYZ XYZ
```
