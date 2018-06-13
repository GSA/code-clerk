/**
 * JSONata expression to transform a GraphQL repository query result into
 * Code.gov metadata schema format.
 */
module.exports.repositoryTransform = `{
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
