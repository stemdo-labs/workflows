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

axios.put(`https://api.github.com/repos/${org}/${repo}/collaborators/${username}`, {}, {
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  },
  params: {
    permission: permission
  }
})
.then(response => {
  console.log(`Successfully modified permissions for ${username} in ${repo}`);
})
.catch(error => {
  console.error(`Error modifying permissions: ${error.message}`);
});