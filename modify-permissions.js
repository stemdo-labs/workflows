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
const modifyPermissions = async (repo, entity, entityName, permission) => {
  const url = `https://api.github.com/repos/${org}/${repo}/collaborators/${entityName}`;
  try {
    await axios.put(url, { permission: permission }, config);
    console.log(`Successfully modified permissions for ${entityName} in ${repo}`);
  } catch (error) {
    console.error(`Error modifying permissions for ${entityName} in ${repo}: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
  }
};

// Iterar sobre repositorios y modificar permisos
(async () => {
  const newRepos = [];  // Lista de nuevos repositorios

  for (const [repo, entities] of Object.entries(permissions.repos)) {
    for (const [user, permission] of Object.entries(entities.users)) {
      await modifyPermissions(repo, 'user', user, permission);
    }
    for (const [group, permission] of Object.entries(entities.groups)) {
      // Supongamos que tienes una función para obtener los usuarios del grupo
      const groupUsers = await getUsersFromGroup(group);  
      for (const user of groupUsers) {
        await modifyPermissions(repo, 'group', user, permission);
      }
    }

    // Verificar si el repositorio es nuevo y agregarlo a la lista
    if (!permissions.repos[repo]) {
      newRepos.push(repo);
      permissions.repos[repo] = entities;
    }
  }

  // Guardar cambios en el archivo JSON si hay nuevos repos
  if (newRepos.length > 0) {
    fs.writeFileSync('permissions.json', JSON.stringify(permissions, null, 2), 'utf8');
    console.log('Updated permissions.json with new repositories:', newRepos);
  }
})();
