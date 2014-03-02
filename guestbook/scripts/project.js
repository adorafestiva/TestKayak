var KCMS = 'notset';
const TEMPLATE = 'https://drive.google.com/uc?export=download&id=0B8DgRi1SFqK7NnE0RzJmaWJ1NFU';

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
			getFileContentWithURL(template, function(file) {
				createNewFile('template.html', file, CURRENTDIRECTORY.id);
			}
			createNewFile('project.kcms', '{ "title": "' + projectTitle +'", "pages": [ ], "templates": [ ], "tiles": [ ], "folderIDs": { "main": "' + CURRENTDIRECTORY.id +'" } }', CURRENTDIRECTORY.id, function(file) {
				json = getProjects();
				json.projects.push({ "title": projectTitle, "id": "someuniqueid", "folderid": CURRENTDIRECTORY.id });
				setProjects(json);
				getFile('.projects', false, updateFile, JSON.stringify(json));
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
		createNewFile(title + '.html', '<!doctype html><html><head></head><body></body></html>', KCMS.folderIDs.main, function(fileid) {
			KCMS.pages.push({ "title": title, "fileid": fileid});
			getFileInFolder('project.kcms', KCMS.folderIDs.main, function(fileId) {
				getFileWithId(fileId, function(file) {
					updateFile(file, JSON.stringify(KCMS));
					showPages();
				});
			});
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

function downloadTemplate(url)
{
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
