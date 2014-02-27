var KCMS = 'notset'

function setCurrentDirectory(folder) {
	CURRENTDIRECTORY = folder;
}

function createProject(projectTitle, callback) {
	if (!projectTitle || projectTitle.length === "" ) { alert('Please enter a Project Name'); }
	else {
		// Create folder on Drive
		createNewFolder(projectTitle + '_Dev', function(folder) {
			setCurrentDirectory(folder);
			createNewFile('project.kcms', '{ "title": "' + projectTitle +'", "pages": [ ], "templates": [ ], "tiles": [ ], "folderIDs": { "main": "' + CURRENTDIRECTORY.id +'" } }', CURRENTDIRECTORY.id, function(file) {
				json = getProjects();
				json.projects.push({ "title": projectTitle, "id": "someuniqueid", "folderid": CURRENTDIRECTORY.id });
				setProjects(json);
				getFile('.projects', false, updateFile, JSON.stringify(json));
				//callback(CURRENTDIRECTORY.id);
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

function createPage(title) {
	createNewFile(title + '.html', '<!doctype html><html></html>', KCMS.folderIDs.main, function(fileid) {
		KCMS.pages.push({ "title": title, "fileid": fileid});
		getFileInFolder('project.kcms', KCMS.folderIDs.main, function(fileId) {
			getFileWithId(fileId, function(file) {
				updateFile(file, JSON.stringify(KCMS));
				showPages();
			});
		});
	});
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
