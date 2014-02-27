function chooseProjects() {
	// Load the .projects file at root of drive
	// Will create .projects if not found
	loadProjectsFile(createProjectsDialog);
}

function createProjectsDialog() {
	var projects = getProjects();
	console.log(projects);
	
	if (projects.projects.length == 0) {
		console.log(' There are no projects ');
		showNewProjectForm();
	}
	else {
		console.log(' There are ' + projects.projects.length + ' projects');
		showSelectProjectForm();
	}
	//$( "dialog-form" ).dialog( "open" );
}

function showNewProjectForm() {
	document.getElementById('newProjectForm').style.display = 'block';
	document.getElementById('projectSelectForm').style.display = 'none';
}

function showSelectProjectForm() {
	document.getElementById('projectSelectForm').style.display = 'block';
	document.getElementById('newProjectForm').style.display = 'none';
	document.getElementById('editProject').style.display = 'none';	
	
	var projects = getProjects();
	var formHTML = "";
	for (var i = 0; i < projects.projects.length; i++)
	{
		formHTML = formHTML + '<input type="radio" name="selectprj" value=' + projects.projects[i].title + '>' + projects.projects[i].title + '</input><br />';
	}
	formHTML = formHTML + '<input type="button" value="Select Project" onclick="selectProject()" />';
	$( "form#selectForm" ).html(formHTML);
}

function selectProject() {
	var choices = document.getElementsByName("selectprj");
	var prj = getProjects();
	for (var i = 0; i < choices.length; i++) {
		if (choices[i].checked) {
			loadProject(prj.projects[i].folderid);
		}
	}
}

function loadProject(folderId) {
	document.getElementById('projectSelectForm').style.display = 'none';
	document.getElementById('newProjectForm').style.display = 'none';
	getFileInFolder('project.kcms', folderId, function(fileId) {
		getFileWithId(fileId, function(file) {
			getJSONContent(file, function(json) {
				setKCMS(json);
				document.getElementById('editProject').style.display = 'block';
				showPages();	
				showTemplates();
				showTiles();
			});
		});
	});
}

function showSelectTemplateForm(projectTitle) {
	createProject(projectTitle);
	document.getElementById('newProjectForm').style.display = 'none';
	document.getElementById('selectTemplate').style.display = 'block';
}

function selectTemplate() {
   var prj = getProjects();
   var folderId;
	var choices = document.getElementsByName("templateSeletion");
	for (var i = 0; i < choices.length; i++) {
		if (choices[i].checked) {
		   folderId = prj.projects[i].folderid;
			loadProject(folderId);
		}
	}
	
	getFileInFolder('project.kcms', folderId, function(fileId) {
	   getFileWithId(fileId, function(file) {
		   getJSONContent(file, function(json) {
			   setKCMS(json);
			   document.getElementById('selectTemplate').style.display = 'none';
			   document.getElementById('editProject').style.display = 'block';	
		   });
	   });
	});
}

function showPages() {
   var pages = getPages();
	var formHTML = "<br />";
	for (var i = 0; i < pages.length; i++)
	{
		formHTML = formHTML + '<br />' + pages[i].title;
	}
	
	$( "div#pagesList" ).html(formHTML);
}

function showTemplates() {
   var templates = getTemplates();
	var formHTML = "<br />";
	for (var i = 0; i < templates.length; i++)
	{
		formHTML = formHTML + '<br />' + templates[i].title;
	}
	
	$( "div#templatesList" ).html(formHTML);
}

function showTiles() {
   var tiles = getTiles();
	var formHTML = "<br />";
	for (var i = 0; i < tiles.length; i++)
	{
		formHTML = formHTML + '<br />' + tiles[i].title;
	}
	
	$( "div#tilesList" ).html(formHTML);
}
