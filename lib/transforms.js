/**
 * JSONata expression to transform a GraphQL repository query result into
 * Code.gov metadata schema format.
 */
module.exports.repositoryTransform = `{
	"name": name,
  "description": description,
	"permissions": {
    "licenses": $boolean(licenseInfo) ? [
      {
        "URL": [licenseInfo].url,
        "name": [licenseInfo].key
      }
    ] : null,
    "usageType": isPrivate ? "governmentWideReuse" : "openSource"
  },
  "tags": repositoryTopics.nodes,
  "repositoryURL": url,
  "homepageURL": [$boolean(homepageUrl)].homepageUrl,
  "contact": {
    "email": owner.email
  },
  "languages": languages.[nodes].name,
  "laborHours": 0,
  "vcs": "git",
  "organization": owner.login
}`
