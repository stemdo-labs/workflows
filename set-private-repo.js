// Script set private repos

const axios = require('axios');

const [,, repo, org] = process.argv;
const token = process.env.TOKEN;

const config = {
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }
};

axios.put(`https://api.github.com/orgs/${org}/repos/${repo}`, {
  private: true
}, config)
  .then(response => {
    console.log(`${response}`);
  })
  .catch(error => {
    console.error(`Error: ${error.message}`);
  });
