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
}

function showNewProjectForm() {
	hideError();
	$( "div#projectSelectForm" ).css('display','none');;
	$( "div#newProjectForm" ).css('display','block');
}

function showSelectProjectForm() {
	hideError();
	$( "div#projectSelectForm" ).css('display','block');;
	$( "div#newProjectForm" ).css('display','none');
	$( "div#editProject" ).css('display','none');	
	
	var projects = getProjects();
	var formHTML = "";
	for (var i = 0; i < projects.projects.length; i++) {
		formHTML = formHTML + '<input type="radio" name="selectprj" value=' + projects.projects[i].title + '>' + projects.projects[i].title + '</input><br />';
	}
	formHTML = formHTML + '<input type="button" value="Select Project" onclick="selectProject()" />';
	$( "form#selectForm" ).html(formHTML);
}

function selectProject() {
	hideError();
	var choices = document.getElementsByName("selectprj");
	var prj = getProjects();
	for (var i = 0; i < choices.length; i++) {
		if (choices[i].checked) {
			loadProject(prj.projects[i].folderid);
		}
	}
}

function loadProject(folderId) {
	$( "div#projectSelectForm" ).css('display','none');;
	$( "div#newProjectForm" ).css('display','none');
	getFileInFolder('project.kcms', folderId, function(fileId) {
		getFileWithId(fileId, function(file) {
			getJSONContent(file, function(json) {
				setKCMS(json);
				$( "div#editProject" ).css('display','block');
				showPages();	
				showTemplates();
				showTiles();
			});
		});
	});
}

function showSelectTemplateForm(projectTitle) {
	hideError();
   	$( "div#newProjectForm" ).css('display','none');
	createProject(projectTitle, function() {
	   $( "span#siteName" ).html(projectTitle);
	   $( "div#selectTemplate" ).css('display','block');
	});
}

function selectTemplate() {
	hideError();
	var prj = getProject($( "span#siteName" ).text());
	var checked;
	var choices = document.getElementsByName("templateSeletion");
	for (var i = 0; i < choices.length; i++) {
		if (choices[i].checked) {
		   checked = choices[i];
			loadProject(prj.folderid);
			break;
		}
	}
	
	getFileInFolder('project.kcms', prj.folderid, function(fileId) {
	   getFileWithId(fileId, function(file) {
		   getJSONContent(file, function(json) {
			   setKCMS(json);
			   $( "div#selectTemplate" ).css('display', 'none');
			   $( "div#editProject" ).css('display', 'block');	
		   });
	   });
	});
}

function showError(errorMessage, callback) {
	$( "div#errorMessage" ).css('display','block');
	$( "div#errorMessage" ).html('<font color="red"><h3>ERROR:</h3>' + errorMessage + '</font>');
	if (callback) { callback(); }
}

function hideError() {
	$( "div#errorMessage" ).css('display', 'none');
}

function showPageToEdit(file) {
	var button = '<button onlick="submitPage($( \"div#pageEdit\" ).html())">Submit</button>'
	$( "div#pageEdit" ).html('<iframe srcdoc="'+ file +'"></iframe>' + button);
}

function showPages() {
	var pages = getPages();
	var formHTML = "<ul>";
	for (var i = 0; i < pages.length; i++)
	{
		formHTML = formHTML + '<li id="li_' + i +'">' +  pages[i].title + ' <button id="bt_' + i + '" onclick="selectPage(' + i + ')">Edit</button></li>';
	}
	formHTML = formHTML + "</ul>";
	$( "div#pagesList" ).html(formHTML);
}

function showTemplates() {
	var templates = getTemplates();
	var formHTML = "<ul>";
	for (var i = 0; i < templates.length; i++)
	{
		formHTML = formHTML + '<li>' +  templates[i].title + '</li>';
	}
	formHTML = formHTML + "</ul>";
	$( "div#templatesList" ).html(formHTML);
}

function showTiles() {
	var tiles = getTiles();
	var formHTML = "<ul>";
	for (var i = 0; i < tiles.length; i++)
	{
		formHTML = formHTML + '<li>' +  tiles[i].title + '</li>';
	}
	formHTML = formHTML + "</ul>";
	$( "div#tilesList" ).html(formHTML);
}
