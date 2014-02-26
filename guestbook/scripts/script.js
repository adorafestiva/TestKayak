function chooseProjects() {
	// Load the .projects file at root of drive
	// Will create .projects if not found
	loadProjectsFile();
	
	// Get contents of .projects file
	window.setTimeout(createProjectsDialog,1500);
}

function createProjectsDialog()
{
	var projects = getProjects();
	console.log(projects);
	
	if (projects.projects.length == 0) {
		console.log(' There are no projects ');
	}
	else {
		console.log(' There are ' + projects.projects.length + ' projects');
	}
	$( "dialog-form" ).dialog( "open" );
}

$( "dialog-form" ).dialog({
      autoOpen: flase,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        allFields.val( "" ).removeClass( "ui-state-error" );
      }
    });