var KCMS = 'notset'; // All of the information for this Project in JSON format
const TEMPLATE = ''; // Temporary

/**
* Set the current working directory.
* @param {File} folder Folder to set as the current working directory
*/
function setCurrentDirectory(folder) {
	CURRENTDIRECTORY = folder;
}

/**
* Create a project with specified title.  This creates
* two folders on the user's drive.  In the Dev folder, the KCMS
* file is created.  Also, the .projects file is updated to contain
* this project.
*
* @param {String} projectTitle Title of the Project to create
* @param {Function} callback The function to call once the request is complete.
*/
function createProject(projectTitle, callback) {
	if (!isValidTitle(projectTitle) ) { 
		showError('Project title is invalid!<br />Please enter title using only letters, numbers, and underscores (_).', function() {
		   $( "div#newProjectForm" ).css('display','block');
		}); 
	}
	else {
		// Create folder on Drive
		createNewFolder(projectTitle + '_Dev', function(folder) {
			//var content = downloadTemplate(TEMPLATE);
			setCurrentDirectory(folder);
			
			var kcms = JSON.parse('{ "title": "' + projectTitle +'", "pages": [ ], "templates": [ ], "tiles": [ ], "folderIDs": { "main": "' + CURRENTDIRECTORY.id +'" } }');
			setKCMS(kcms);
			createNewFile('project.kcms', JSON.stringify(kcms, null, 4), CURRENTDIRECTORY.id, function(file) {
				json = getProjects();
				json.projects.push({ "title": projectTitle, "id": "someuniqueid", "folderid": CURRENTDIRECTORY.id });
				setProjects(json);
				getFile('.projects', false, updateFile, JSON.stringify(json, null, 4));
				if (callback) { callback(); }
			});
		});

		createNewFolder(projectTitle + '_Pub');
	}
}

/**
* Set KCMS to the most up to date JSON.
* @param {JSON} json JSON to set KCMS to
*/
function setKCMS(json) {
	KCMS = json;
}

/**
* Return KCMS
* @return {JSON} KCMS
*/
function getKCMS() {
	return KCMS;
}

/**
* Verify that a particular title is valid for use.  To be
* valid, the title must:
*	- be non-null, non-empty, and a string
*	- contain only numbers, letters (upper and lower case), and underscores
* @param {String} title Title to check for validity
* @return {Boolean} True if the title is valid; false otherwise.
*/
function isValidTitle(title) {
	if (!title || title === "") { return false; } // First check to make sure the title is non-null, non-empty, and a string
	else if (!title.match(/^[a-zA-Z0-9_]*$/)) { return false;} // Then check to make sure it only contains valid characters
	else { return true; } // Otherwise, it's valid
}

/**
* Create a new Page for the Project.
*
* @param {String} title Title for the new Page
*/
function createPage(title) {
	hideError();
	if (!isValidTitle(title)) { showError('Page title is invalid!<br />Please enter title using only letters, numbers, and underscores (_).');}
	else {
		copyFile('template.html', title + '.html', KCMS.folderIDs.main, function(fileid) {
			KCMS.pages.push({ "title": title, "fileid": fileid});
			updateKCMS(showPages);
		});
	}
}

/*
* Return the list of Pages for the Project.
* @return {JSONArray}
*/
function getPages() {
	return KCMS.pages;
}

/*
* Return the list of Templates for the Project.
* @return {JSONArray}
*/
function getTemplates() {
	return KCMS.templates;
}

/*
* Return the list of Tiles for the Project.
* @return {JSONArray}
*/
function getTiles() {
	return KCMS.tiles;
}

/*
* Gets a project with a given title.
*
* @param {String} projectTitle Title of the project to get
* @return {JSON} Returns selected project
*/
function getProject(projectTitle) {
	var projects = getProjects();

	for (var i = 0; i < projects.projects.length; i++) {
		if (projects.projects[i].title == projectTitle) {
			return projects.projects[i];
		}
	}
}

/*
* Loads a selected page to edit.
*
* @param {Number} num Number of selected page.
*/
function selectPage(num) {
	var page = KCMS.pages[num];
	getFileWithId(page.fileid, function (file) {
		getFileContents(file, showPageToEdit);
	});
}

/*function downloadTemplate(url) {
  var iframe;
  iframe = document.getElementById("hiddenDownloader");
  if (iframe === null)
  {
    iframe = document.createElement('iframe');  
    iframe.id = "hiddenDownloader";
    //iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);
  }
  iframe.src = url;
  return iframe.contentDocument.body.innerHTML; 
}*/

/**
* Deletes a project from Google Drive.  Updates the .projects
* file to reflect the changes.
*
* @param {String} projectTitle Title of project to delete.
*/ 
function deleteProject(projectTitle) {
	var prjs = getProjects(); // Get the current projects JSON
	var folderId;
	var newPrjs = {
		projects: []
	};
	for (var i = 0; i < prjs.projects.length; i++)
	{
		if (prjs.projects[i].title != projectTitle) // Add all non-matching projects to the JSON array
		{
			newPrjs.push({"title": prjs.projects[i].title, "id": prjs.projects[i].id, "folderid": prjs.projects[i].folderid});
		} else { // For the matching project, get the folder ID.
			folderId = prjs.projects[i].folderid;
		}
	}
	
	setProjects(newPrjs); // Set the projects JSON
	
	// Update .projects file
	getFile('.projects', false, function(file) {
		updateFile(file, JSON.stringify(newPrjs), function() {
			getFolder(projectTitle + '_Pub', trashFile); // Trash Pub file
			getFileWithId(folderId, trashFile); // Trash Dev file
		});
	});
}

/*
* Update the KCMS file with the latest KCMS content.
*
* @param {Function} callback Function to call after request is complete.
*/
function updateKCMS(callback) {
	getFileInFolder('project.kcms', KCMS.folderIDs.main, function(fileId) {
		getFileWithId(fileId, function(file) {
			updateFile(file, JSON.stringify(KCMS, null, 4), callback);
		});
	});
}
