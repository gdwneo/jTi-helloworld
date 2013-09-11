(function(jTi) {
	jTi.proxy.db = function(db) {
		return new jTi.proxy.db.fn.init(db);
	};

	jTi.proxy.db.fn = jTi.proxy.db.prototype = {
		init : function(db) {
			this.__db = db;
			return this;
		},
		save : function(entity, sucfn, failfn) {
			try {
				this.prepare(entity);
				var param = [];
				var fieldString = '';
				var paramString = '';
				for (var i in entity.__mapping.fields) {
					if (i > 0) {
						fieldString += ',';
						paramString += ',';
					}
					fieldString += '[' + entity.__mapping.fields[i].name + ']';
					paramString += '?';

					param.push(this.__db.toDbType(entity[entity.__mapping.fields[i].name], entity.__mapping.fields[i].type));
				}
				var sql = 'Insert Into [' + entity.__mapping.dataset + '](' + fieldString + ') values(' + paramString + ')';
				this.__db.executeSqlCommand(sql, param);
				if (sucfn) {
					sucfn();
				}
				return true;
			} catch(ex) {
				if (failfn) {
					failfn(ex);
				}
				return false;
			}
		},
		update : function(entity, sucfn, failfn) {
			try {
				this.prepare(entity);
				var sql = 'update [' + entity.__mapping.dataset + '] set ';
				var param = [];
				var count = 0;
				for (var i in entity.__mapping.fields) {
					if (entity.__mapping.fields[i].name != entity.__mapping.idProperty) {
						if (count > 0) {
							sql += ',';
						} else {
							count++;
						}
						sql += '[' + entity.__mapping.fields[i].name + ']=?';

						param.push(this.__db.toDbType(entity[entity.__mapping.fields[i].name], entity.__mapping.fields[i].type));
					}
				}
				sql += ' where [' + entity.__mapping.idProperty + '] = ?';
				param.push(entity[entity.__mapping.idProperty]);
				this.__db.executeSqlCommand(sql, param);
				if (sucfn) {
					sucfn();
				}
				return true;
			} catch(ex) {
				if (failfn) {
					failfn(ex);
				}
				return false;
			}
		},
		get : function(predicate, type, sucfn, failfn) {
			try {
				var sql = 'select * from [' + type.mapping.dataset + ']', param = [], result;
				if (predicate) {
					sql += ' where 1=1';
					for (var key in predicate) {
						sql += ' and ' + key + '=?';
						param.push(predicate[key]);
					}
				}
				result = this.__db.sqlQuery(type, sql, param);
				for (var i in result) {
					result[i].__proxy = this;
				}
				if (sucfn) {
					sucfn(result);
				}
				return result;
			} catch(ex) {
				if (failfn) {
					failfn(ex);
				}
				return false;
			}
		},
		remove : function(entity, sucfn, failfn) {
			try {
				var sql = 'delete from [' + entity.__mapping.dataset + '] where ' + entity.__mapping.idProperty + '=?';
				this.__db.executeSqlCommand(sql, id);
				if (sucfn) {
					sucfn();
				}
				return true;
			} catch(ex) {
				if (failfn) {
					failfn(ex);
				}
				return false;
			}
		},
		prepare : function(entity) {
			if (entity.__mapping && entity.__mapping.fields.length === 0) {
				entity.__mapping = this.__db.createMap(entity.__mapping.dataset);
			}
		}
	};
	jTi.proxy.db.fn.init.prototype = jTi.proxy.db.fn;
})($);
