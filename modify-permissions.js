const axios = require('axios');

const fs = require('fs');
const path = require('path');

const reposFilePath = path.join(process.cwd(), 'repos.json');
const repos = JSON.parse(fs.readFileSync(reposFilePath, 'utf8'));

let summary = '### Summary of Permission Modifications\n\n';
summary += '| Repo | User | Status | Message |\n';
summary += '|------|------|--------|---------|\n';

const token = process.env.TOKEN;

let results = [];

const updatePermissions = async () => {
  for (const repo of repos) {
    try {
      const url = `https://api.github.com/repos/${repo}/collaborators`;

      // Obtener los colaboradores actuales
      const { data: collaborators } = await axios.get(url, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      for (const collaborator of collaborators) {
        try {
          // Actualizar permisos a lectura
          await axios.put(
            `https://api.github.com/repos/${repo}/collaborators/${collaborator.login}`,
            { permission: 'read' },
            {
              headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            }
          );

          summary += `| ${repo} | ${collaborator.login} | Success | Permissions updated to 'read' |\n`;
        } catch (error) {
          summary += `| ${repo} | ${collaborator.login} | Failed | ${error.message} |\n`;
        }
      }
    } catch (error) {
      summary += `| ${repo} | N/A | Failed | ${error.message} |\n`;
    }
  }

  console.log(`::set-output name=summary::${summary}`);
};

updatePermissions().catch(error => {
  console.error('Error updating permissions:', error);
  process.exit(1);
});
