const fs = require('fs');
const axios = require('axios');

const token = process.env.TOKEN;
const org = process.env.ORG;

const config = {
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }
};

// Leer archivo JSON
const permissions = JSON.parse(fs.readFileSync('permissions.json', 'utf8'));

// Función para modificar permisos
const modifyPermissions = async (repo, user, permission) => {
  const url = `https://api.github.com/repos/${org}/${repo}/collaborators/${user}`;
  try {
    await axios.put(url, null, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        permission: permission
      }
    });
    return `Successfully modified permissions for ${user} in ${repo}`;
  } catch (error) {
    const errorMsg = `Error modifying permissions for ${user} in ${repo}: ${error.message}`;
    if (error.response) {
      const detailedError = `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`;
      return `${errorMsg}\n${detailedError}`;
    }
    return errorMsg;
  }
};

// Función principal para iterar sobre repositorios y modificar permisos
const main = async () => {
  const results = [];

  for (const [repo, usersObj] of Object.entries(permissions.repos)) {
    for (const [user, permission] of Object.entries(usersObj.user)) {
      const result = await modifyPermissions(repo, user, permission);
      results.push(result);
    }
  }

  // Imprimir todos los resultados
  console.log(results.join('\n'));

  // Escribir resultados en un archivo para capturarlos en el resumen del workflow
  fs.writeFileSync('results.log', results.join('\n'), 'utf8');
};

// Ejecutar la función principal
main().catch(error => {
  console.error(`Unhandled error: ${error.message}`);
});
