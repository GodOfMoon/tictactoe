//libs
var fs = require('fs');
var path = require('path');

//function for download files from server
function download(response, post, pathname) {
	console.log('Request handler "download" was called. Downloading ' + pathname);
	
	//request for index.html
	if (pathname === '' || pathname === '/' || pathname === undefined)
		pathname = '/index.html';
	var filePath = '.' + pathname;
	
	//http status code
	var statusCode = ''; 
	
	//check file extension & declare content type
	var extname = path.extname(filePath);
	var contentType = '';
	switch (extname) {
		case '.html':
			contentType = 'text/html; charset=utf-8';
			filePath = './html' + pathname
			break;
		case '.css':
			contentType = 'text/css';
			filePath = './css' + pathname
			break;	
	}
	//if file not exist
	if (!fs.existsSync(filePath) || (contentType === '')){
//		console.log('Error. Cannot download file ' + pathname);
		
		filePath = './html/index.html';
		contentType = 'text/html; charset=utf-8';
		//statusCode = 404;
	}
	//download file
	fs.readFile(filePath, function(error, content) {
		if (statusCode === '') {
			statusCode = 200;
		}
		response.writeHead(statusCode, { 'Content-Type': contentType});
		response.end(content, 'utf-8');
	});
}
//export function
exports.download = download;