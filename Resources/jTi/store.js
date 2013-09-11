(function(jTi) {
	var guid = 0;
	var storeCache = {};

	jTi.store = function(id, type, proxy, collection) {
		if (!type) {
			if (type === null) {
				delete storeCache[id];
				return;
			} else {
				return storeCache[id];
			}
		}
		collection = collection || [];
		if ( collection instanceof jTi) {
			collection = collection.toArray();
		}
		id = id || ++guid;
		return storeCache[id] = new jTi.store.fn.init(id, type, proxy, collection);
	};
	jTi.store.fn = jTi.store.prototype = {
		init : function(id, type, proxy, collection) {
			this.id = id;
			this.__predicate = null;
			this.__type = type;
			this.__proxy = proxy;
			this.__binding = [];
			this.__data = collection;
		},
		bind : function(element) {
			if (this.__binding.indexOf(element) < 0) {
				this.__binding.push(element);
			}
		},
		create : function(data) {
			return jTi.model(this.__type, this.__proxy, data);
		},
		add : function(entity) {
			var async;
			if (this.__data.indexOf(entity) < 0) {
				this.attach(entity);
				this.__data.push(entity);
				async = entity.save();

				for (var i in this.__binding) {
					this.__binding[i].Add.call(this.__binding[i], entity);
				}
			}
			return async;
		},
		update : function(entity) {
			var async;
			if (this.__data.indexOf(entity) > -1) {
				async = entity.update();

				for (var i in this.__binding) {
					this.__binding[i].Update.call(this.__binding[i], entity);
				}
			}
			return async;
		},
		remove : function(entity) {
			var async = jTi.async(), scope = this;
			if (this.__proxy) {
				this.__proxy.remove(this, function() {
					scope.__data.splice(scope.__data.indexOf(entity), 1);
					for (var i in scope.__binding) {
						scope.__binding[i].Delete.call(scope.__binding[i], entity);
					}
					async.yield({
						success : true
					});
				}, function(ex) {
					async.yield({
						success : false,
						exception : ex
					});
				});
			} else {
				this.__data.splice(this.__data.indexOf(entity), 1);
				for (var i in scope.__binding) {
					scope.__binding[i].Delete.call(scope.__binding[i], entity);
				}
				async.yield({
					success : true
				});
			}
			return async;
		},
		find : function(id) {
			return jTi.toEnumerable(this.__data).singleOrDefault(function(t) {
				return t[this.__type.mapping.idProperty] === id;
			});
		},
		load : function(predicate) {
			if ( predicate instanceof jTi) {
				predicate = predicate.toArray();
			}
			if (jTi.isArray(predicate)) {
				this.__data.length = 0;
				for (var i in predicate) {
					this.attach(predicate[i]);
					this.__data.push(predicate[i]);
				}
				for (var i in this.__binding) {
					this.__binding[i].Refresh.call(this.__binding[i]);
				}
				return this;
			}
			var async = jTi.async(), scope = this;
			this.__predicate = predicate;
			if (this.__proxy) {
				this.__proxy.get(predicate, this.__type, function(data) {
					scope.__data.length = 0;
					Array.prototype.push.apply(scope.__data, data);
					for (var i in scope.__binding) {
						scope.__binding[i].Refresh.call(scope.__binding[i]);
					}
					async.yield({
						success : true,
						data : data
					});
				}, function(ex) {
					async.yield({
						success : false,
						exception : ex
					});
				});
			}
			return async;
		},
		reload : function() {
			var async = jTi.async(), scope = this;
			if (this.__proxy) {
				this.__proxy.get(this.__predicate, this.__type, function(data) {
					scope.__data.length = 0;
					Array.prototype.push.apply(scope.__data, data);
					for (var i in scope.__binding) {
						scope.__binding[i].Refresh.call(scope.__binding[i], scope);
					}
					async.yield({
						success : true,
						data : data
					});
				}, function(ex) {
					async.yield({
						success : false,
						exception : ex
					});
				});
			}
			return async;
		},
		get : function(predicate) {
			if (predicate) {
				return jTi.toEnumerable(this.__data).where(predicate).toArray();
			} else {
				return this.__data;
			}
		},
		attach : function(entity) {
			entity.__store = this;
			entity.__proxy = this.__proxy;
			entity.__mapping = this.__type.mapping;
			return entity;
		},
		proxy : function(proxy) {
			if (proxy) {
				this.__proxy = proxy;
				return this;
			}
			return this.__proxy;
		}
	};
	jTi.store.fn.init.prototype = jTi.store.fn;
})($);
