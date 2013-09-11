(function(jTi) {
	jTi.proxy.rest = function(url) {
		return new jTi.proxy.db.fn.init(url);
	};

	jTi.proxy.rest.fn = jTi.proxy.rest.prototype = {
		init : function(url) {
			this.__url = url;
			return this;
		},
		save : function(entity, sucfn, failfn) {
			var api = jTi.fixFolder(this.__url, entity.__mapping.dataset), obj;
			for (var i in entity.__mapping.fields) {
				obj[entity.__mapping.fields[i].name] = entity[entity.__mapping.fields[i].name];
			}
			jTi.post(api, JSON.stringify(obj), sucfn, failfn);
			return true;
		},
		update : function(entity, sucfn, failfn) {
			var api = jTi.fixFolder(this.__url, entity.__mapping.dataset, entity[entity.__mapping.idProperty]), obj;
			for (var i in entity.__mapping.fields) {
				obj[entity.__mapping.fields[i].name] = entity[entity.__mapping.fields[i].name];
			}
			jTi.ajax({
				url : api,
				type : 'put',
				data : JSON.stringify(obj),
				success : sucfn,
				fail : failfn
			});
			return true;
		},
		get : function(predicate, type, sucfn, failfn) {
			var api = jTi.fixFolder(this.__url, type.mapping.dataset), scope = this;

			jTi.get(api, function(data) {
				var records = [];
				for (var i in data) {
					records.push(jTi.model(type, scope, data[i]));
				}
				if (sucfn) {
					sucfn(records);
				};
			}, failfn);
			return true;
		},
		remove : function(entity, sucfn, failfn) {
			var api = jTi.fixFolder(this.__url, entity.__mapping.dataset, entity[entity.__mapping.idProperty]);
			jTi.ajax({
				url : api,
				type : 'delete',
				success : sucfn,
				fail : failfn
			});
			return true;
		}
	};
	jTi.proxy.rest.fn.init.prototype = jTi.proxy.rest.fn;
})($);
