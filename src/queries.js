/**
 * Get an organization's basic info, plus metadata on all its repositories.
 *
 * If you customize this query, note that your custom query must have the
 * following structure at a minimum for the inventorying process to work:
 *
 * query($org: String!, $cursor: String, $itemsPerPage: Int) {
 *   organization(login: $org) {
 *     repositories(first: $itemsPerPage, after: $cursor) {
 *       edges {
 *         node {
 *           name
 *         }
 *         cursor
 *       }
 *       pageInfo {
 *         endCursor
 *         hasNextPage
 *       }
 *     }
 *   }
 * }
 */

export const organizationQuery = `query($org: String!, $cursor: String, $itemsPerPage: Int) {
  organization(login: $org) {
    repositories(first: $itemsPerPage, after: $cursor) {
      totalCount
      edges {
        node {
          name
          description
          licenseInfo {
            key
            url
          }
          repositoryTopics(first: 100) {
            nodes {
              topic {
                name
              }
            }
          }
          isPrivate
          url
          homepageUrl
          languages(first: 100) {
            nodes {
              name
            }
          }
          owner {
            ... on Organization {
              login
              email
            }
          }
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}`

/**
 * Get metadata on a specific repository within an organization.
 */
export const repositoryQuery = `query($org: String!, $repo: String!) {
  repository(owner: $org, name: $repo) {
    name
    description
    licenseInfo {
      key
      url
    }
    repositoryTopics(first: 100) {
      nodes {
        topic {
          name
        }
      }
    }
    isPrivate
    url
    homepageUrl
    languages(first: 100) {
      nodes {
        name
      }
    }
    owner {
      ... on Organization {
        login
        email
      }
    }
  }
}`
