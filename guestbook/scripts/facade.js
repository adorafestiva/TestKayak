const CLIENT_ID = '109658754904-8lohlq27j14j5e7c93qmjsj6mp868atg.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive';
var PROJECTS_JSON = 'notset';
var CURRENTDIRECTORY = 'notset';

/**
* Called when the client library is loaded to start the auth flow.
*/
function handleClientLoad() {
	window.setTimeout(checkAuth, 1);
}

/**
* Check if the current user has authorized the application.
*/
function checkAuth() {
	gapi.auth.authorize(
		{'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true},
		handleAuthResult);
}

/**
* Called when authorization server replies.
*
* @param {Object} authResult Authorization result.
*/
function handleAuthResult(authResult) {
	var divAuthorizedContent = document.getElementById('divAuthorizedContent');
	divAuthorizedContent.style.display = 'none';

	var authButton = document.getElementById('authorizeButton');
	authButton.style.display = 'none';

	if (authResult && !authResult.error) {
		// Access token has been successfully retrieved, requests can be sent to the API.
		divAuthorizedContent.style.display = 'block';
		chooseProjects();
	} else {
	// No access token could be retrieved, show the button to start the authorization flow.
		authButton.style.display = 'block';
		authButton.onclick = function() {
			gapi.auth.authorize(
				{'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
				handleAuthResult
			);
		};
	}
}

/**
* Get file on Drive based on title of file and
* forward to callback function.
*
* @param {String} titleName The title of the file to retrieve
* @param {Boolean} inTrash True if the file is in the trash; false otherwise
* @param {Function} callback Function to call when the request is complete.
* @param {String} callbackParam Additional parameter to pass to the callback function.
*/
function getFile(titleName, inTrash, callback, callbackParam) {
	var query = 'title = ' + "'" + titleName + "'";
	var request = gapi.client.request({
		'path': '/drive/v2/files/',
		'method': 'GET',
		'params': {'q': query}
	});
	var file = request.execute(function(resp) {
		if (!resp.error) {
			if(callback) {
				callback(resp.items[0], callbackParam);
			}
		} else {
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* Get folder on Drive based on name
*
* @param {String} folderName The name of the folder
* @param {Function} callback Function to call when the request is complete.
* @param {String} callbackParam Additional parameter to pass to the callback function.
*/
function getFolder(folderName, callback, callbackParam) {
	var query = 'title = ' + "'" + folderName + "'";
	var request = gapi.client.request({
		'path': '/drive/v2/files/',
		'method': 'GET',
		'params': {'q': query}
	});
	var file = request.execute(function(resp) {
		if (!resp.error) {
			console.log(resp.items[0].id);
			callback(resp.items[0], callbackParam);
		} else {
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* NOT IN USE
* Retrieve a file's metadata.
*
* @param {File} file File to retrieve metadata for.
*/
function getFileMetadata(file) {
	console.log('Title: ' + file.title);
	console.log('Description: ' + file.description);
	console.log('MIME type: ' + file.mimeType);
	writeTo('Title: ' + file.title + '\nDescription: ' + file.description + '\nMIME type: ' + file.mimeType, 'results');
}

/**
* Start the file upload.
*
* @param {Object} evt Arguments from the file selector.
*/
function uploadFile(evt) {
	gapi.client.load('drive', 'v2', function() {
		var file = evt.target.files[0];
		insertFile(file);
	});
}

/**
* Insert a file that exists on the user's computer.
*
* @param {File} fileData File object to read data from.
* @param {Function} callback Function to call when the request is complete.
*/
function insertFile(fileData, callback) {
	const boundary = '-------314159265358979323846';
	const delimiter = "\r\n--" + boundary + "\r\n";
	const close_delim = "\r\n--" + boundary + "--";

	var reader = new FileReader();
	reader.readAsBinaryString(fileData);
	reader.onload = function(e) {
		var contentType = fileData.type || 'application/octet-stream';
		var metadata = {
			'title': fileData.name,
			'mimeType': contentType
		};

		var base64Data = btoa(reader.result);
		var multipartRequestBody =
			delimiter +
			'Content-Type: application/json\r\n\r\n' +
			JSON.stringify(metadata) +
			delimiter +
			'Content-Type: ' + contentType + '\r\n' +
			'Content-Transfer-Encoding: base64\r\n' +
			'\r\n' +
			base64Data +
			close_delim;

		var request = gapi.client.request({
			'path': '/upload/drive/v2/files',
			'method': 'POST',
			'params': {'uploadType': 'multipart'},
			'headers': {
				'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
			},
			'body': multipartRequestBody
		});
		if (!callback) {
			callback = function(file) {
				console.log(file)
			};
		}
		request.execute(callback);
	}
}

/**
* Move a file to the trash.
*
* @param {File} file The file to trash.
*/
function trashFile(file) {
	var request = gapi.client.request({
		'path': '/drive/v2/files/' + file.id +'/trash',
		'method': 'POST',
	});
	request.execute(function(resp) {
		if (resp.error) {
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* Move a file out of the trash.
*
* @param {File} file The file to untrash.
*/
function untrashFile(file) {
	var request = gapi.client.request({
		'path': '/drive/v2/files/' + file.id +'/untrash',
		'method': 'POST',
	});
	request.execute(function(resp) { 
		if (resp.error) {
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* Download a file's content.  Displays content in console and
* on page in text box under "File Content:".
*
* @param {File} file File to get contents of.
* @param {Function} callback Function to call after getting the file contents
*/
function getFileContents(file, callback) {
	var download_url;
	if (file.downloadUrl) {
		download_url = file['downloadUrl'];
	} else {
		download_url = file['exportLinks']['text/html'];
	}
	var accessToken = gapi.auth.getToken().access_token;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', download_url);
	xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	xhr.onload = function() {
		console.log(xhr.response);
		callback(xhr.response);
	};
	xhr.onerror = function() {
		console.log('Error when trying to getting file contents.');
		//writeTo('Error when trying to get file contents.', htmlId);
	};
	xhr.send();
}

/**
* Create a new folder
*
* @param {String} folderName Folder name as it would appear in Drive
* @param {Function} callback Function to call after the folder is created
*/
function createNewFolder(folderName, callback) {
	var request = gapi.client.request({
		'path': '/drive/v2/files',
		'method': 'POST',
		'body':{
			"title" : folderName,
			"mimeType" : "application/vnd.google-apps.folder",
		}
	});
	request.execute(function(resp) {
		if (!resp.error) {
			if(callback) {
				callback(resp);
			}
		} else {
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* Create a new file
*
* @param {String} fileName File name as it would appear in Drive
* @param {String} content File content
* @param {String} folderId ID of the folder to create the file in
* @param {Function} callback Function to call after the file is created
*/
function createNewFile(fileName, content, folderId, callback) {
	var request = gapi.client.request({
		'path': '/drive/v2/files',
		'method': 'POST',
		'body':{
			'title' : fileName,
			'mimetype' : 'text/html',
			'parents':[{ "id": folderId }]
		}
	});
	request.execute(function(resp) {
		if (!resp.error) {
			updateFile(resp, content, callback);
		} else {
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* Write to specified textarea
*
* @param {String} text Text to put in the textarea
* @param {String} htmlId Element ID of the textarea to write to
*/
function writeTo (text, htmlId) {
	$( htmlId ).html(text);
}

/**
* Update contents of a file on Drive
*
* @param {File} file The file on Drive to update
* @param {String} text Text to replace contents of file with
* @param {Function} callback The function to be called once the request is completed
*/ 
function updateFile(file, text, callback) {
	const boundary = '-------314159265358979323846'; // Necessary as per Google Devs for update to work
	const delimiter = "\r\n--" + boundary + "\r\n";
	const close_delim = "\r\n--" + boundary + "--";

	var contentType = "text/html";
	var metadata = {'mimeType': contentType,};

	var multipartRequestBody =
	delimiter +  'Content-Type: application/json\r\n\r\n' +
	JSON.stringify(metadata) +
	delimiter + 'Content-Type: ' + contentType + '\r\n' + '\r\n' +
	text +
	close_delim;

	if (!callback) { callback = function(file) { }; }

	var request = gapi.client.request({
		'path': '/upload/drive/v2/files/fileId=' + file.id + '&uploadType=multipart',
		'method': 'PUT',
		'params': {'fileId': file.id, 'uploadType': 'multipart'},
		'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
		'body': multipartRequestBody,
	});
	request.execute(function(resp) {
		if (!resp.error) {
			if (callback) {
				callback(resp.id);
			}
		} else {
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* Get the .projects file on Drive and read the contents
* 
* If such a file does not exist, create one.
* @param {Function} callback The function to be called once the request is complete
*/
function loadProjectsFile(callback) {
	var query = "title = '.projects'";
	var request = gapi.client.request({
		'path': '/drive/v2/files/',
		'method': 'GET',
		'params': {'q': query}
	});
	var file = request.execute(function(resp) {
		if (!resp.error) {
			// If the .projects file doesn't exist, create it
			if (resp.items.length == 0) {
				// Make the default JSON for PROJECTS_JSON
				setProjects(JSON.parse('{ "projects": [ ] }'));
				// Create the .projects file in the root folder
				getRootId(function(folderId) {
					createNewFile('.projects', JSON.stringify(PROJECTS_JSON, null, 4), folderId, function() {
						callback();
					});
				});
			}
			else { // If the .projects file exists, read the content in
				readProjectsFile(resp.items[0], function(json) {
					setProjects(json);
					callback();
				});
			}
		} else { // If an error is thrown when making the request, display the error message
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* Read the contents of the .projects file on Drive
* 
* @param {File} file The .projects file
* @param {Function} callback The function to be called once the request is complete
* @param {String} callbackParam Additional parameter to pass to the callback function.
*/
function readProjectsFile(file, callback, callbackParam) {
	var download_url = file['downloadUrl'];
	var accessToken = gapi.auth.getToken().access_token;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', download_url);
	xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	xhr.onload = function() {
		var json = JSON.parse(xhr.response);
		callback(json);
	};
	xhr.onerror = function() {
		console.log('Error when trying to getting file contents.');
	};
	xhr.send();
}


/**
* Set PROJECTS_JSON to the passed in JSON
* 
* @param {JSON} json JSON to set PROJECTS_JSON to
*/
function setProjects(json) {
	PROJECTS_JSON = json;
}

/**
* Return the PROJECTS_JSON
* 
* @return {JSON} PROJECTS_JSON
*/
function getProjects() {
	return PROJECTS_JSON;
}

/**
* Get the ID of the root folder on Drive
* 
* @param {Function} callback The function to be called once the request is complete
*/
function getRootId(callback) {
	var request = gapi.client.request({
		'path': '/drive/v2/about/',
		'method': 'GET'
	});    
	request.execute(function(resp) {
		if (!resp.error) {
			callback(resp.rootFolderId);
		} else {
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* Read the contents of a JSON file on Drive
* 
* @param {File} file The file to get the JSON contents from
* @param {Function} callback The function to be called once the request is complete
* @param {String} callbackParam Additional parameter to pass to the callback function.
*/
function getJSONContent(file, callback, callbackParam) {
	var download_url = file['downloadUrl'];
	var accessToken = gapi.auth.getToken().access_token;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', download_url);
	xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	xhr.onload = function() {
		var json = JSON.parse(xhr.response);
		callback(json);
	};
	xhr.onerror = function() {
		console.log('Error when trying to getting file contents.');
	};
	xhr.send();
}

/**
* Get a file on Drive using the ID of the file
* 
* @param {String} fileId The fileId of the file on Drive to get
* @param {Function} callback The function to be called once the request is complete
* @param {String} callbackParam Additional parameter to pass to the callback function.
*/
function getFileWithId(fileId, callback, callbackParam) {
	var request = gapi.client.request({
		'path': '/drive/v2/files/' + fileId,
		'method': 'GET'
	});
	var file = request.execute(function(resp) {
		if (!resp.error) {
			if(callback) {
				callback(resp, callbackParam);
			}
		} else {
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* Get a file on Drive located in a particular folder with a particular name.
* 
* @param {String} fileName The name of the file to get from Drive
* @param {String} folderId The ID of the folder where the file is located on Drive
* @param {Function} callback The function to be called once the request is complete
* @param {String} callbackParam Additional parameter to pass to the callback function.
*/
function getFileInFolder(fileName, folderId, callback, callbackParam) {
	var query = 'title = ' + "'" + fileName + "'";
	var request = gapi.client.request({
		'path': '/drive/v2/files/' + folderId + '/children/',
		'method': 'GET',
		'params': {'q': query}
	});
	var file = request.execute(function(resp) {
		if (!resp.error) {
			if(callback) {
				callback(resp.items[0].id, callbackParam);
			}
		} else {
			showError("Received error code " + resp.error.code);
		}
	});
}

/**
* Get a file on Drive at a particular URL.
* 
* @param {String} fileURL The URL of a file to get from Drive
* @param {Function} callback The function to be called once the request is complete
*/
function getFileContentsWithURL(fileURL, callback) {
	var download_url = fileURL;
	var accessToken = gapi.auth.getToken().access_token;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', download_url);
	xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	xhr.onload = function() {
		console.log(xhr.response);
		callback(xhr.response);
	};
	xhr.onerror = function() {
		console.log('Error when trying to getting file contents.');
	};
	xhr.send();
}

/**
* Copy a file on Drive to a specified location with a specified name.
* 
* @param {String} originFileTitle The name of the file to be copied from Drive
* @param {String} newTitle The new name of the file after being copied.
* @param {String} newLocation The ID of the folder where the file is to be copied to
* @param {Function} callback The function to be called once the request is complete
*/
function copyFile(originFileTitle, newTitle, newLocation, callback) {
	getFile(originFileTitle, false, function(file) {
		getFileContents(file, function(contents) {
			createNewFile(newTitle, contents, newLocation, callback);
		});
	});
}