// Script for modify-permissions workflow

const axios = require('axios');

const [,, org, repo, username, permission] = process.argv;
const token = process.env.PERSONAL_ACCESS_TOKEN;

const config = {
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }
};

axios.put(`https://api.github.com/orgs/${org}/teams/${username}/repos/${org}/${repo}`, {
  permission: permission
}, config)
  .then(response => {
    console.log(`Successfully modified permissions for ${username} in ${repo}`);
  })
  .catch(error => {
    console.error(`Error modifying permissions: ${error.message}`);
  });
