/**
 * JSONata expression to transform a GitHub GraphQL repository query result
 * into Code.gov metadata schema format.
 *
 * This transform meets the Code.gov schema minimum requirements, plus tries
 * to make the most use of available GitHub metadata.
 */
module.exports.defaultGitHubTransform = `{
	"name": name,
  "description": $boolean(description) ? description : name,
	"permissions": {
    "licenses": $boolean(licenseInfo) ? [
      {
        "URL": [licenseInfo].url,
        "name": [licenseInfo].key
      }
    ] : null,
    "usageType": isPrivate ? "governmentWideReuse" : "openSource"
  },
  "tags": $boolean(repositoryTopics.nodes) ? repositoryTopics[].nodes.topic.name : owner[].login,
  "repositoryURL": url,
  "homepageURL": $boolean(homepageUrl) ? homepageUrl : undefined,
  "contact": {
    "email": owner.email
  },
  "languages": languages[].nodes.name,
  "laborHours": 0,
  "vcs": "git",
  "organization": owner.login
}`

/**
 * JSONata expression to transform a GitHub GraphQL repository query result
 * into Code.gov metadata schema format.
 *
 * This transform provides the bare minimum required by Code.gov.
 */
module.exports.minimumGitHubTransform = `{
	"name": name,
  "description": $boolean(description) ? description : name,
	"permissions": {
    "licenses": $boolean(licenseInfo) ? [
      {
        "URL": [licenseInfo].url,
        "name": [licenseInfo].key
      }
    ] : null,
    "usageType": isPrivate ? "governmentWideReuse" : "openSource"
  },
  "tags": $boolean(repositoryTopics.nodes) ? repositoryTopics[].nodes.topic.name : owner[].login,
  "repositoryURL": url,
  "contact": {
    "email": owner.email
  },
  "laborHours": 0
}`
