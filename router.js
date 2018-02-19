//processing request
function route(handle, pathname, response, post) {
	
	//add inf to console
	console.log('About to route a request for ' + pathname);
	
	//check the type of request
	if (typeof handle[pathname] === 'function') {
		handle[pathname](handle, response, post);
	} else {
		handle['/download'](handle, response, post, pathname);		
	}
}
//export functions
exports.route = route;