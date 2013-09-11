(function(jTi) {
	jTi.db = function(url, name) {
		return new jTi.db.fn.init(url, name);
	};
	jTi.db.fn = jTi.db.prototype = {
		init : function(url, name) {
			if (!name) {
				this.db = Ti.Database.open(url);
			} else {
				this.db = Ti.Database.install(url, name);
			}
			return this;
		},
		executeSqlCommand : function(sql, param) {
			return this.db.execute(sql, param);
		},
		createTable : function(mapping) {
			var sql = 'CREATE TABLE IF NOT EXISTS [' + mapping.dataset + '](';
			for (var i in mapping.fields) {
				if (i > 0)
					sql += ',';
				sql += '[' + mapping.fields[i].name + '] ' + mapping.fields[i].type;
				if (mapping.fields[i].nullable === false) {
					sql += ' NOT NULL';
				}
				if (mapping.fields[i].name === mapping.idProperty) {
					sql += ' PRIMARY KEY';
				}
			}
			sql += ')';
			//Ti.API.info(sql);
			this.db.execute(sql);
		},
		createMapping : function(tableName) {
			var struct = this.db.executeSqlCommand('PRAGMA table_info([' + tableName + '])');
			var mapping = {
				dataset : tableName,
				fields : []
			};
			while (struct.isValidRow()) {
				mapping.addReference(rows.fieldByName('name'), rows.fieldByName('type'));
				mapping.fields.push({
					name : rows.fieldByName('name'),
					type : rows.fieldByName('type'),
					nullable : !rows.fieldByName('notnull')
				});
				if (rows.fieldByName('pk') == 1) {
					mapping.idProperty = rows.fieldByName('name');
				}

				struct.next();
			}
			return mapping;
		},
		dropTable : function(tableName) {
			this.db.execute('DROP TABLE IF EXISTS [' + tableName + ']');
		},
		toDbType : function(object, type) {
			var value;
			switch(type) {
				case jTi.db.object:
				case jTi.db.array:
					value = JSON.stringify(object);
					break;
				case jTi.db.date:
					//value = object;
					value = object.getTime().toString();
					break;
				case jTi.db.boolean:
					value = object ? 1 : 0;
					break;
				default:
					value = object;
					break;
			}
			return value;
		},
		sqlQuery : function(type, sql, param) {
			var rows = this.db.execute(sql, param), records = [];
			while (rows.isValidRow()) {
				var record = jTi.model(type);
				if (record.__mapping == null) {
					for (var i = 0; i < rows.fieldCount; i++) {
						var fieldname = rows.fieldName(i);
						if (param.hasOwnProperty(fieldname)) {
							record[fieldname] = rows.field(i);
						}
					}
				} else {
					for (var i in record.__mapping.fields) {
						var value;

						switch(record.__mapping.fields[i].type) {
							case jTi.db.object:
							case jTi.db.array:
								value = JSON.parse(rows.fieldByName(record.__mapping.fields[i].name));
								break;
							case jTi.db.date:
								value = new Date(parseInt(rows.fieldByName(record.__mapping.fields[i].name)));
								break;
							case jTi.db.boolean:
								value = !!parseInt(rows.fieldByName(record.__mapping.fields[i].name));
								break;
							default:
								value = rows.fieldByName(record.__mapping.fields[i].name);
								break;
						}
						record[record.__mapping.fields[i].name] = value;
					}
				}
				records.push(record);
				rows.next();
			}
			return records;
		},
		currentTrans : null,
		trans : function(fn) {
			if (!this.currentTrans)
				this.currentTrans = jTi.trans(this.db);
			if (fn) {
				this.currentTrans.begin(fn);
			}
			return this.currentTrans;
		}
	};

	jTi.extend(jTi.db, {
		'string' : 'TEXT',
		'int' : 'INTEGER',
		'real' : 'REAL',
		'numeric' : 'NUMERIC',
		'date' : 'DATETEXT',
		'object' : 'OBJTEXT',
		'array' : 'ARRTEXT',
		'image' : 'BLOB',
		'boolean' : 'INTBOOL'
	});
	jTi.db.fn.init.prototype = jTi.db.fn;
})($);
