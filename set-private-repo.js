// Script set private repos

const axios = require('axios');

const [,, repo, org] = process.argv;
const token = process.env.TOKEN;

const config = {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
};

axios.patch(`https://api.github.com/repos/${org}/${repo}`, {
  "private": true
}, config)
  .then(response => {
    console.log(`${response}`);
  })
  .catch(error => {
    console.error(`Error: ${error}`);
  });
