var KCMS = 'notset'

function setCurrentDirectory(folder)
{
   CURRENTDIRECTORY = folder;
}

function createProject(projectTitle) {
   // Create folder on Drive
   createNewFolder(projectTitle + '_Dev', function(folder) {
      setCurrentDirectory(folder);
      createNewFile('project.kcms', '{ "title": "' + projectTitle +'", }', CURRENTDIRECTORY.id, function(folderId) {
         json = PROJECTS_JSON;
         json.projects.push({ "title": projectTitle, "id": "someuniqueid", "folderid": CURRENTDIRECTORY.id });
         getFile('.projects', false, updateFile, JSON.stringify(json));
      });
   });
   
   createNewFolder(projectTitle + '_Pub');
}

function setKCMS(json) {
   KCMS = json;
}

