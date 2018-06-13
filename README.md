# Code Clerk

Harvests project metadata from GitHub repositories. The harvested metadata can be used to produce a code.json file for Code.gov.

## Installation

```sh
npm install code-clerk
```

## Usage

```javascript
const clerk = require("code-clerk")

const client = new clerk.GitHubClient(YOUR_GITHUB_ACCESS_TOKEN)
const inventory = new clerk.Inventory(client, "ABC") // ABC is your agency acronym
const orgs = ["ABC", "AgencyZ"] // List of GitHub organization names

inventory.build(orgs).then((data) => {
  console.log(JSON.stringify(data)) // Here's your code.json
})
```
