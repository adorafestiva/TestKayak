function chooseProjects() {
	// Load the .projects file at root of drive
	// Will create .projects if not found
	loadProjectsFile();
	
	// Get contents of .projects file
	window.setTimeout(createProjectsDialog, 5000);
}

function createProjectsDialog() {
	var projects = getProjects();
	console.log(projects);
	
	if (projects.projects.length == 0) {
		console.log(' There are no projects ');
	}
	else {
		console.log(' There are ' + projects.projects.length + ' projects');
	}
	//$( "dialog-form" ).dialog( "open" );
}

function selectProject(folderId) {
   getFileInFolder('project.kcms', folderId, function(fileId) {
      getFileWithId(fileId, function(file) {
         getJSONContent(file, function(json) {
            setKCMS(json);
         });
      });
   });
}
