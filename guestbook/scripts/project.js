var KCMS = 'notset';
const TEMPLATE = ''; // Temporary

function setCurrentDirectory(folder) {
	CURRENTDIRECTORY = folder;
}

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

function setKCMS(json) {
	KCMS = json;
}

function getKCMS() {
	return KCMS;
}

function isValidTitle(title) {
	if (!title || title === "") { return false; } // First check to make sure the title is non-null, non-empty, and a string
	else if (!title.match(/^[a-zA-Z0-9_]*$/)) { return false;} // Then check to make sure it only contains valid characters
	else { return true; } // Otherwise, it's valid
}

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

function getPages() {
	return KCMS.pages;
}

function getTemplates() {
	return KCMS.templates;
}

function getTiles() {
	return KCMS.tiles;
}

function getProject(projectTitle) {
	var projects = getProjects();

	for (var i = 0; i < projects.projects.length; i++) {
		if (projects.projects[i].title == projectTitle) {
			return projects.projects[i];
		}
	}
}

function selectPage(num) {
	var page = KCMS.pages[num];
	getFileWithId(page.fileid, function (file) {
		getFileContents(file, showPageToEdit);
	});
}

function downloadTemplate(url) {
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
}

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
	getFile('.projects', false, function(file) {
		updateFile(file, JSON.stringify(newPrjs), function() {
			getFolder(projectTitle + '_Pub', trashFile);
			getFileWithId(folderId, trashFile);
		});
	});
}

function updateKCMS(callback) {
	getFileInFolder('project.kcms', KCMS.folderIDs.main, function(fileId) {
		getFileWithId(fileId, function(file) {
			updateFile(file, JSON.stringify(KCMS, null, 4), callback);
		});
	});
}