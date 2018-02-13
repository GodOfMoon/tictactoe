//Здесь перенаправляем запрос в обработчик
function route(handle, pathname, response, post) {
	console.log('About to route a request for ' + pathname);
	//Проверяем тип запроса
	if (typeof handle[pathname] === 'function') {
		handle[pathname](response, post, pathname);
	} else {
		handle['/download'](response, post, pathname);
	}
}
//Создаем возможность использовать функцию из других файлов
exports.route = route;