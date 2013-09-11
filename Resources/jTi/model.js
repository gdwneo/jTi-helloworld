(function(jTi) {
	jTi.model = function(type, proxy, value) {
		return new jTi.model.fn.init(type, proxy, value);
	};

	jTi.model.fn = jTi.model.prototype = {
		init : function(type, proxy, value) {
			if (proxy) {
				this.__proxy = proxy;
			}
			var i, field, key;
			if (type.mapping) {
				type.mapping.fields = type.mapping.fields || [];
				this.__mapping = type.mapping;
				for ( i = 0; i < type.mapping.fields.length; i++) {
					field = type.mapping.fields[i];
					if (field.nullable === false) {
						switch(field.type) {
							case jTi.db.int:
							case jTi.db.real:
							case jTi.db.numeric:
								this[field.name] = '';
								break;
							case jTi.db.object:
								this[field.name] = {};
								break;
							case jTi.db.array:
								this[field.name] = [];
								break;
							case jTi.db.date:
								this[field.name] = new Date();
								break;
							default:
								this[field.name] = '';
								break;
						}
					} else {
						this[field.name] = null;
					}
				}
			}
			if (type.definition) {
				var definition = type.definition();
				for (key in definition) {
					this[key] = definition[key];
				}
			}
			if (value) {
				for (key in value) {
					this[key] = value[key];
				}
			}
			this.__dirty == true;
			return this;
		},
		save : function() {
			if (!this.__proxy) {
				return this;
			}
			var async = jTi.async(), scope = this;
			this.__proxy.save(this, function() {
				scope.__dirty == false;
				if (scope.__store) {
					for (var i in scope.__store.__binding) {
						scope.__store.__binding[i].add.call(scope.__store.__binding[i], scope);
					}
				}
				async.yield({
					success : true,
					data : scope
				});
			}, function(ex) {
				async.yield({
					success : false,
					exception : ex
				});
			});
			return async;
		},
		update : function() {
			var scope = this;
			if (!this.__proxy) {
				return this;
			}
			var async = jTi.async();
			this.__proxy.update(this, function() {
				scope.__dirty == false;
				if (scope.__store) {
					for (var i in scope.__store.__binding) {
						scope.__store.__binding[i].update.call(scope.__store.__binding[i], scope);
					}
				}
				async.yield({
					success : true,
					data : scope
				});
			}, function(ex) {
				async.yield({
					success : false,
					exception : ex
				});
			});
			return async;
		},
		proxy : function(proxy) {
			if (proxy) {
				this.__proxy = proxy;
				return this;
			}
			return this.__proxy;
		}
	};
	jTi.model.fn.init.prototype = jTi.model.fn;

	jTi.extend(jTi.model, {
		state : {
			detached : 1,
			unchanged : 2,
			added : 3,
			deleted : 4,
			modified : 5
		}
	});
})($);
