//function for checking files
function notExist(file){
	var fs = require('fs');
	if (! fs.existsSync(file) ){
		console.log('File ' + file + ' not exist ');
		return true;
	} else {
		return false;
	}
}
//declare the required files
var files = [
	'css/style.css',
	'html/index.html',
	'requestHandlers.js',
	'server.js',
	'router.js'
];
//check files
var error = false;
for (var i = 0; i < files.length; i++){
	if(notExist(files[i])){
		error = true;
		break;
	}
}
//if no errors
if (!error) {
	var server = require('./server');
	var router = require('./router');
	var requestHandlers = require('./requestHandlers');

	//declare set of server functions
	var handle = {}
	handle['/download'] = requestHandlers.download; //download file from server
	
	server.start(router.route, handle);	
}