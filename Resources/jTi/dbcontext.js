(function(jTi) {
	var modelCache = {};

	jTi.dbcontext = function(modelfolder, db) {
		return new jTi.dbcontext.fn.init(modelfolder, db);
	};
	jTi.dbcontext.fn = jTi.dbcontext.prototype = {
		init : function(modelfolder, db) {
			if (!( db instanceof jTi.db)) {
				db = jTi.db(db);
			}
			if (!modelCache.hasOwnProperty(modelfolder)) {
				modelCache.modelfolder = {};
			}
			this.__db = db;
			this.__proxy = jTi.proxy.db(db);
			this.__folder = modelfolder;
			this.__dbSets = {};
			this.__association = [];
			this.__referCache = {};
			return this;
		},
		add : function(modelName) {
			var model = require(jTi.fixFolder(this.__folder, modelName));
			if (!model.mapping) {
				model.mapping = this.__db.createMapping(modelName);
			} else {
				model.mapping.dataset = model.mapping.dataset || modelName;
				model.mapping.fields = model.mapping.fields || [];
				if (model.mapping.fields.length === 0) {
					model.mapping = this.__db.createMapping(model.mapping.dataset);
				}
			}
			if (model.mapping.fields.length === 0 && model.definition) {
				var definition = model.definition();
				for (var propertiy in definition) {
					if (definition.hasOwnProperty(propertiy)) {
						switch(jTi.type(definition[propertiy])) {
							case 'number':
								model.mapping.fields.push({
									name : propertiy,
									type : parseInt(entity[propertiy]) === entity[propertiy] ? jTi.db.int : jTi.db.real
								});
								break;
							case 'string':
								model.mapping.fields.push({
									name : propertiy,
									type : jTi.db.text
								});
								break;
							case 'array':
								model.mapping.fields.push({
									name : propertiy,
									type : jTi.db.array
								});
								break;
							case 'object':
								model.mapping.fields.push({
									name : propertiy,
									type : jTi.db.object
								});
								break;
							case 'date':
								model.mapping.fields.push({
									name : propertiy,
									type : jTi.db.date
								});
								break;
							case 'boolean':
								model.mapping.fields.push({
									name : propertiy,
									type : jTi.db.boolean
								});
								break;
						}
						if (model.mapping.idProperty == null && (propertiy === 'ID' || propertiy === modelName + 'ID')) {
							model.mapping.idProperty = propertiy;
						}
					}
				}
			}
			model.name = model.name || modelName;
			model.reference = model.reference || [];
			for (var i in model.reference) {
				model.reference[i].ownerModel = model.reference[i].ownerModel || modelName;
				model.reference[i].associationKey = model.reference[i].associationKey || modelCache[this.__folder][model.reference[i].model].mapping.idProperty;
				this.__association.push(model.reference[i]);
			}
			modelCache[this.__folder] = modelCache[this.__folder] || {};
			modelCache[this.__folder][modelName] = model;
			this.__db.createTable(model.mapping);
			return this;
		},
		set : function(modelName) {
			var model = modelCache[this.__folder][modelName], dbset;
			if (!model) {
				throw new Error(L('modelNotFound'));
			}
			if (!( dbset = this.__dbSets[modelName])) {
				dbset = jTi.dbset(model, this);
				this.__dbSets[modelName] = dbset;
			}
			return dbset;
		},
		clean : function(modelName) {
			this.__db.dropTable(modelCache[this.__folder][modelName].mapping.dataset);
			this.__db.createTable(modelCache[this.__folder][modelName].mapping);
			if (this.__dbSets[modelName]) {
				this.__dbSets[modelName].__dataSet.length = 0;
				this.__dbSets[modelName].__needSync = true;
			}
		},
		saveChange : function() {
			var count = 0;
			for (var name in this.__dbSets) {
				for (var i in this.__dbSets[name].__dataSet) {
					var entity = this.__dbSets[name].__dataSet[i];
					switch(entity.__state) {
						case jTi.model.state.added:
							//console.log('add:' + name);
							if (entity.save()) {
								entity.__state = jTi.model.state.unchanged;
								count++;
							}
							break;
						case jTi.model.state.modified:
							//console.log('modify:' + name);
							if (entity.update()) {
								entity.__state = jTi.model.state.unchanged;
								count++;
							}
							break;
						case jTi.model.state.deleted:
							//console.log('remove:' + name);
							if (this.__proxy.remove(entity)) {
								this.__dbSets[name].__dataSet.splice(this.__dbSets[name].__dataSet.indexOf(entity), 1);
								count++;
							}
							break;
					}
				}
			}
			return count;
		},
		refresh : function() {
			for (var name in this.__dbSets) {
				this.__dbSets[name].__needSync = true;
			}
		}
	};

	jTi.dbcontext.fn.init.prototype = jTi.dbcontext.fn;
})($);
