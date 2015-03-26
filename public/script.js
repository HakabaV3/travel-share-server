var ENTRY_POINT = document.location.protocol + '//' +
	document.location.host + '/api/v1';

var app = {
	$method: null,
	$url: null,
	$token: null,
	$body: null,
	$response: null,

	initialize: function() {
		app.$method = document.querySelector('#method');
		app.$url = document.querySelector('#url');
		app.$body = document.querySelector('#body');
		app.$token = document.querySelector('#token');
		app.$form = document.querySelector('#form');
		app.$response = document.querySelector('#response');

		app.attachEventHandler();

		document.querySelector('#entryPoint').textContent = ENTRY_POINT;
	},
	attachEventHandler: function() {
		app.$form.addEventListener('submit', app.onFormSubmit);
	},
	send: function(method, url, body) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.onload = app.onXHRLoaded;
		xhr.setRequestHeader('Content-Type', 'application/json');
		if (app.$token.value) {
			xhr.setRequestHeader('X-Token', app.$token.value);
		}
		xhr.send(body);
	},
	onFormSubmit: function(ev) {
		var method = app.$method.value,
			url = ENTRY_POINT + app.$url.value,
			body = app.$body.value;

		app.send(method, url, body);

		ev.stopPropagation();
		ev.preventDefault();
	},
	onXHRLoaded: function() {
		var xhr = this,
			json = null;

		try {
			json = JSON.parse(xhr.responseText);
		} catch (e) {

		}

		if (json && json.result && json.result.token) {
			app.$token.value = json.result.token;
		}

		app.$response.innerText = xhr.responseText;
	}
};

window.onload = app.initialize;
