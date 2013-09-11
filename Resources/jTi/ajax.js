(function(jTi) {
	var ajaxLocation;

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	function ajaxExtend(target, src) {
		var key, deep, flatOptions = jTi.ajaxSettings.flatOptions || {};

		for (key in src ) {
			if (src[key] !== undefined) {
				( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[key] = src[key];
			}
		}
		if (deep) {
			jTi.extend(true, target, deep);
		}

		return target;
	}


	jTi.extend({
		active : 0,
		ajaxSettings : {
			timeout : _NETWORK_TIMEOUT_SETTING || 0,
			contentType : "application/json; charset=UTF-8",
			async : true,
			type : 'get',
			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions : {
				url : true
			}
		},
		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup : function(target, settings) {
			return settings ?

			// Building a settings object
			ajaxExtend(ajaxExtend(target, jTi.ajaxSettings), settings) :

			// Extending ajaxSettings
			ajaxExtend(jTi.ajaxSettings, target);
		},
		// Main method
		ajax : function(url, options) {
			if ( typeof url === "object") {
				options = url;
				url = undefined;
			} else {
				options.url = url;
			}
			// Force options to be an object
			options = options || {};
			var s = jTi.ajaxSetup({}, options), url = (url || s.url || ajaxLocation ) + "", data = s.data || null, method = s.type, header = s.header || {}, beforefn = s.beforeSend, async = s.async;
			// connection
			delete s.data, s.url, s.success, s.header, s.beforeSend, s.fail;
			var client = Ti.Network.createHTTPClient(s);
			if (s.timeout > 0) {
				client.setTimeout(s.timeout);
			}

			client.onload = function(e) {
				var cookie = e.source.getResponseHeader('Set-Cookie');
				if ( typeof cookie != 'undefined' && cookie != null) {
					Ti.App.Properties.setString("cookie", cookie);
				}
				if (e.source.success) {
					var responseText = e.source.responseText == null ? null : e.source.responseText.replace(new RegExp('(^|[^\\\\])\\"\\\\/Date\\((-?[0-9]+\\+?[0-9]+)\\)\\\\/\\"', 'g'), "$1new Date($2)");
					e.source.success.call(this, eval('(' + responseText + ')'));
				}
			};
			client.onerror = function(e) {
				Ti.API.info(e.source.responseText);
				if (e.source.fail) {
					var errorInfo = {};
					if (e.source.status == 401) {
						errorInfo = JSON.parse(e.source.responseText);
					} else if (e.code > 400) {
						Ti.API.info(e.source.responseText);
						errorInfo = JSON.parse(e.source.responseText);
					} else {
						errorInfo = {
							Code : e.source.status,
							Message : e.error
						};
					}
					e.source.fail.call(this, errorInfo);
				}
			};
			if (jTi.isFunction(beforefn)) {
				beforefn.call(this, client);
			}
			console.log('url:' + url);
			client.open(method, url, async);
			client.setRequestHeader('Content-Type', s.contentType);
			for (var key in header) {
				client.setRequestHeader(key, header[key]);
			}
			client.send(data);
		}
	});

	jTi.each(["get", "post"], function(i, method) {
		jTi[method] = function(url, data, sucfn, failfn) {
			// shift arguments if data argument was omitted
			if (jTi.isFunction(data)) {
				failfn = failfn || sucfn;
				sucfn = data;
				data = undefined;
			}

			return jTi.ajax({
				url : url,
				type : method,
				data : data,
				success : sucfn,
				fail : failfn
			});
		};
	});
})($);
