//processing request
function route(handle, pathname, response, post) {
	
	//add inf to console
	console.log('About to route a request for ' + pathname);
	
	handle['/download'](response, post, pathname);
}
//export functions
exports.route = route;