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

### CLI Usage

First, check out the built-in usage information:

```sh
codeclerk --help
```

#### Example 1

Assuming:

* Your GitHub access token is in an environment variable named `GITHUB_ACCESS_TOKEN` (the default)
* Your agency's acronym is _ABC_
* Your agency has two GitHub organizations, named _AgencyABC_ and _AgencyXYZ_

You could get your code.json output by running this command (prints the JSON to your console):

```sh
codeclerk ABC AgencyABC AgencyXYZ
```

#### Example 2

Assuming:

* Your GitHub access token is in an environment variable named `GITHUB_TOKEN`
* Your agency's acronym is _XYZ_
* Your agency has one GitHub organization, named _XYZ_

You could get your code.json output by running this command (saves the JSON to a file named `code.json`):

```sh
codeclerk -t GITHUB_TOKEN -o code.json XYZ XYZ
```

### Basic API Usage

You can easily integrate Code Clerk into your project. Just instantiate a client and run the inventory on your GitHub organization(s). The data returned by the inventory follows the `code.json` format. If your repository includes a `.codeinventory.yml` file, its contents will override any metadata that Code Clerk automatically

```javascript
const clerk = require("code-clerk")

const client = new clerk.GitHubClient(YOUR_GITHUB_ACCESS_TOKEN)
const inventory = new clerk.Inventory(client, "ABC") // ABC is your agency acronym
const orgs = ["ABC", "AgencyZ"] // List of GitHub organization names

inventory.build(orgs).then((data) => {
  console.log(JSON.stringify(data)) // Here's your code.json
})
```

### Advanced API Usage

If you want to customize the way Code Clerk builds your `code.json` file, you can do so via *transforms* and *overrides*.

#### Transforms

A transform is simply a [JSONata](https://jsonata.org/) expression that takes a GitHub GraphQL API response and turns it into a format compatible with the Code.gov schema.

You can see the included transforms in [transform.js](lib/transforms.js). There are two: `defaultGitHubTransform` and `minimumGitHubTransform`. The default transform tries to make as much use of GitHub metadata as possible when building your `code.json`. The minimum transform only takes the necessary GitHub metadata to build a `code.json` that meets the bare minimum specified by the Code.gov schema.

You can write your own transform if the included transforms don't meet your needs. Refer to the [JSONata documentation](http://docs.jsonata.org/overview.html) for guidance on how to write JSONata transforms.

To use your custom transform:

```javascript
const myCustomTransform = `{
  (your custom JSONata transform goes here)
}`
const inventory = new clerk.Inventory(client, "ABC", { transform: myCustomTransform })
```

#### Overrides

An override lets you manually specify a value to use in your repositories' metadata instead of what Code Clerk automatically pulls from the GitHub GraphQL API.

An example of an override is to use a specific contact email for all repositories in your organization instead of the email address listed on the GitHub organization:

```javascript
const myOverrides = {
  contact: {
    email: "opensource@example.gov"
  }
}
const inventory = new clerk.Inventory(client, "ABC", { localOverrides: myOverrides })
```

#### Callback

While Code Clerk is building an inventory of your organization's repositories, it can report back some status information on what it is currently processing.

An example would be to print which repository Code Clerk is currently processing:

```javascript
function myCallback(releaseMetadata, org) {
  console.log(`Currently processing repository ${releaseMetadata.name} in the GitHub organization ${org}`)
}
const inventory = new clerk.Inventory(client, "ABC", { callback: myCallback })
```
