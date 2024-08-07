const axios = require('axios');
const fs = require('fs');
const path = require('path');

const reposFilePath = path.join(process.cwd(), 'repos.json');
const repos = JSON.parse(fs.readFileSync(reposFilePath, 'utf8'));

const token = process.env.TOKEN;
const org = 'stemdo-labs'; // Organización

let summary = '### Summary of Permission Modifications\n\n';
summary += '| Repo | User | Status | Message |\n';
summary += '|------|------|--------|---------|\n';

const updatePermissions = async () => {
  for (const repo of repos) {
    try {
      const url = `https://api.github.com/repos/${org}/${repo}/collaborators`;

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
            `https://api.github.com/repos/${org}/${repo}/collaborators/${collaborator.login}`,
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

  // Imprimir el resumen en formato Markdown
  console.log(summary);
};

updatePermissions().catch(error => {
  console.error('Error updating permissions:', error);
  process.exit(1);
});
