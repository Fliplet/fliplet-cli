/**


[] Publish changes on file change

[] Should automatically run “npm run build/watch” behind the scenes if necessary and wait for that process to finish before it syncs the files

[] Be as fast as possible in making changes live (e.g. no recompilation)

[] Widget scoped to current studio user (package, name, orgId, etc)

[] Can only run on staging, development and local

[] Works on widgets, helpers, menus, themes

[] Should support multiple concurrent processes on different directories

 */


const configstore = require('./lib/configstore');
const { getUser } = require('./lib/publish');

(async function() {
  const user = getUser();

  if (!user) {
    return console.error('Please log in first via the "fliplet login" command.');
  }

  console.log(user);
})();
