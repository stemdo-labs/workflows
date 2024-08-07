const fs = require('fs');
const axios = require('axios');

const token = process.env.TOKEN;
const jsonFilePath = process.env.JSON_FILE_PATH || 'repos.json'; // Usar 'repos.json' por defecto

const config = {
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }
};

// Leer y parsear el archivo JSON
const readJsonFile = () => {
  try {
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to read or parse JSON file: ${error.message}`);
  }
};

// Obtener usuarios de un repositorio
const getRepoCollaborators = async (org, repo) => {
  const url = `https://api.github.com/repos/stemdo-labs/${repo}/collaborators`;
  try {
    const response = await axios.get(url, config);
    return response.data.map(collaborator => collaborator.login);
  } catch (error) {
    throw new Error(`Failed to get collaborators for ${repo}: ${error.message}`);
  }
};

// Modificar permisos de un usuario en un repositorio
const modifyPermissions = async (org, repo, user) => {
  const url = `https://api.github.com/repos/stemdo-labs/${repo}/collaborators/${user}`;
  try {
    await axios.put(url, null, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        permission: 'read'
      }
    });
    return {
      repo,
      user,
      status: 'Success',
      message: `Permissions set to read for ${user}`
    };
  } catch (error) {
    let errorMsg = `Error modifying permissions for ${user} in ${repo}: ${error.message}`;
    if (error.response) {
      errorMsg = `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`;
    }
    return {
      repo,
      user,
      status: 'Failed',
      message: errorMsg
    };
  }
};

// Función principal
const main = async () => {
  const results = [];
  try {
    const jsonData = readJsonFile();
    const repos = jsonData;

    for (const repo of repos) {
      const collaborators = await getRepoCollaborators('stemdo-labs', repo);
      for (const user of collaborators) {
        const result = await modifyPermissions('stemdo-labs', repo, user);
        results.push(result);
      }
    }

    // Crear el contenido del archivo de resultados en formato Markdown
    let markdownResults = '### Summary of Permission Modifications\n\n';
    markdownResults += '| Repo | User | Status | Message |\n';
    markdownResults += '|------|------|--------|---------|\n';

    let allSuccess = true;

    results.forEach(result => {
      if (result.status === 'Failed') {
        allSuccess = false;
      }
      markdownResults += `| ${result.repo} | ${result.user} | ${result.status} | ${result.message} |\n`;
    });

    if (allSuccess) {
      markdownResults = '### All permissions were modified successfully!\n\n' + markdownResults;
    } else {
      markdownResults = '### Some permissions could not be modified.\n\n' + markdownResults;
    }

    // Escribir resultados en un archivo para capturarlos en el resumen del workflow
    fs.writeFileSync('results.log', markdownResults, 'utf8');

  } catch (error) {
    console.error(`Unhandled error: ${error.message}`);
  }
};

// Ejecutar la función principal
main();
