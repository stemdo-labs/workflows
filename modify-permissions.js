const axios = require('axios');

const [,, org, repo, username, permission] = process.argv;
const token = process.env.TOKEN;

const config = {
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }
};

const url = `https://api.github.com/repos/${org}/${repo}/collaborators/${username}`;

axios.put(url, {
  permission: permission
}, config)
  .then(response => {
    console.log(`Successfully modified permissions for ${username} in ${repo}`);
  })
  .catch(error => {
    console.error(`Error modifying permissions: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
  });
