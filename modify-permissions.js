const fs = require('fs');
const axios = require('axios');

// Obtener argumentos
const [,, org, repo, username, permission] = process.argv;
const token = process.env.TOKEN;

// Configuración de la solicitud
const config = {
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  }
};

// URL de la API
const url = `https://api.github.com/repos/${org}/${repo}/collaborators/${username}`;

// Inicializar el archivo de resumen
fs.writeFileSync('summary.txt', '', 'utf8');

// Función para escribir en el archivo de resumen
const writeSummary = (message) => {
  fs.appendFileSync('summary.txt', `${message}\n`, 'utf8');
};

// Solicitud para modificar permisos
axios.put(url, {
  permission: permission
}, config)
  .then(response => {
    const successMessage = `Successfully modified permissions for ${username} in ${repo}`;
    console.log(successMessage);
    writeSummary(successMessage);
  })
  .catch(error => {
    const errorMessage = `Error modifying permissions: ${error.message}`;
    console.error(errorMessage);
    writeSummary(errorMessage);
    if (error.response) {
      const statusMessage = `Status: ${error.response.status}`;
      const dataMessage = `Data: ${JSON.stringify(error.response.data)}`;
      console.error(statusMessage);
      console.error(dataMessage);
      writeSummary(statusMessage);
      writeSummary(dataMessage);
    }
  });
