exports.module = function(param) {
	param.base = param.base || 'view';
	var container = jTi.component(param.base)(param);

	container.Refresh = function(pathDictionary, updateDate) {
		if (updateDate == null) {
			updateDate = new Date();
		}
		if (this.UpdateDate && this.UpdateDate > updateDate) {
			return;
		}
		var attributePath = this.dataSource.split('>');
		jTi(this).empty();

		if (pathDictionary == null) {
			pathDictionary = {};
		}
		var path;
		if (!pathDictionary.hasOwnProperty(attributePath[0])) {
			path = [];
			pathDictionary[attributePath[0]] = path;
		} else {
			path = pathDictionary[attributePath[0]];
		}
		var index = attributePath.length - 1, parentNode = path[index - 1],
		// load data source after query
		dataSource = queryDataSource(index > 0 ? parentNode.data[parentNode.index][attributePath[index]] : jTi.store(attributePath[0]).get(), this.queryProperty);
		if (path.length === index) {
			path.push({
				index : 0,
				data : dataSource
			});
		} else {
			path[index] = {
				index : 0,
				data : dataSource
			};
		}
		var size = this.toImage(), width = size.width / dataSource.length, height = size.height / dataSource.length;

		this.UpdateDate = new Date();
		for (var i = 0; i < dataSource.length; i++) {
			path[index].index = parseInt(i);
			if (path.length > attributePath.length) {
				path.splice(attributePath.length);
			}
			var template = jTi.extend(true, {}, this.dataTemplate);
			var element = jTi.ui.fn.createDOMElement(template, this, path);
			element.width = element.width || width;
			element.height = element.height || height;
			if (dataSource[i].__mapping) {
				element.DataReferenceIndex = dataSource[i][dataSource[i].__mapping.idProperty];
			}
			setChildData.call(this, element, pathDictionary, updateDate);

			jTi(this).append(element);
		}
		if (jTi.isFunction(this.onLoadComplete)) {
			this.onLoadComplete.call(this);
		}
	};
	container.Add = function(entity) {
		var dataSource = queryDataSource(jTi.store(this.dataSource).get(), this.queryProperty), pathDictionary = {}, size = this.toImage(), width = size.width / dataSource.length, height = size.height / dataSource.length, index = dataSource.indexOf(entity);
		if (index < 0) {
			return;
		}
		// init the binding path
		var path = [{
			index : index,
			data : dataSource
		}];
		pathDictionary[this.dataSource] = path;
		this.UpdateDate = new Date();
		var template = jTi.extend(true, {}, this.dataTemplate);
		var element = jTi.ui.fn.createDOMElement(template, this, path);
		element.width = element.width || width;
		element.height = element.height || height;
		element.DataReferenceIndex = entity[entity.__mapping.idProperty];
		setChildData.call(this, element, pathDictionary, this.UpdateDate);

		jTi(this).append(element);

		if (jTi.isFunction(this.onAddComplete)) {
			this.onAddComplete.call(this, element);
		}
	};
	container.Update = function(entity) {
		//create new control
		var dataSource = queryDataSource(jTi.store(this.dataSource).get(), this.queryProperty), pathDictionary = {}, size = this.toImage(), width = size.width / dataSource.length, height = size.height / dataSource.length, index = dataSource.indexOf(entity);
		if (index < 0) {
			return;
		}
		// init the binding path
		var path = [{
			index : dataSource.indexOf(entity),
			data : dataSource
		}];
		pathDictionary[this.dataSource] = path;
		this.UpdateDate = new Date();
		var template = jTi.extend(true, {}, this.dataTemplate);
		var newProperties = jTi.ui.fn.compileTemplate(template, path);

		newProperties.width = newProperties.width || width;
		newProperties.height = newProperties.height || height;
		newProperties.DataReferenceIndex = entity[entity.__mapping.idProperty];
		//updateOldControl
		// var oldControl = null, rowIndex = jTi();
		// if (this.base === 'table') {
		// for (var i in this.sections) {
		// for (var j in this.sections[i].rows) {
		// if (this.sections[i].rows[j].DataReferenceIndex == entity[entity.map.primaryKey]) {
		// oldControl = this.sections[i].rows[j];
		// this.insertRowBefore(rowIndex, control);
		// this.deleteRow(oldControl);
		// break;
		// }
		// rowIndex++;
		// }
		// }
		// } else {
		// for (var i in this.children) {
		// if (this.children.DataReferenceIndex == entity[entity.map.primaryKey]) {
		// oldControl = this.children[i];
		// oldControl.applyProperties(newProperties);
		// oldControl.removeAllChildren();
		// for (var i in control.children) {
		// oldControl.add(control.children[i]);
		// }
		// break;
		// }
		// }
		// }
		var element = jTi(this).children("[DataReferenceIndex='" + entity[entity.__mapping.idProperty] + "']");
		// remove old children and insert new one
		if (!element.size() === 0) {
			return;
		}
		var type = container.base;
		if (type === 'table' || type === 'list') {
			var rowIndex = element.index();
			element.remove();
			element = jTi(jTi.ui.fn.createDOMElement(newProperties, this, path));
			setChildData.call(this, element, pathDictionary, this.UpdateDate);
			if (dataSource.length === 1) {
				$(this).append(element);
			} else {
				element.insertAt(rowIndex, this);
			}

		} else {
			//TODO: use selector to find the children and update properties

		}

		if (jTi.isFunction(this.onUpdateComplete)) {
			this.onUpdateComplete.call(this, element);
		}
	};
	container.Delete = function(entity) {
		var element = jTi(this).children("[DataReferenceIndex='" + entity[entity.__mapping.idProperty] + "']");
		if (!element.size() === 0) {
			return;
		}
		var rowIndex = element.index();
		element.remove();
		if (jTi.isFunction(this.onDeleteComplete)) {
			this.onDeleteComplete.call(this);
		}
	};
	return container;
};

function queryDataSource(data, query) {
	if (query) {
		var dataEnum = jTi.toEnumerable(data);
		if ( typeof query === 'object') {
			for (var fn in query) {
				dataEnum = dataEnum[fn](query[fn]);
			}
		} else {
			dataEnum = dataEnum.where(query);
		}
		data = jTi(dataEnum.toArray());
	}
	return data;
}

function setChildData(element, pathDictionary, updateDate) {
	if (!element) {
		return;
	}
	for (var attribute in element) {
		if (attribute != 'parent' && attribute != 'children' && element[attribute] && typeof element[attribute] === 'object') {
			if (jTi.type(element[attribute]) === 'array') {
				for (var i in element[attribute]) {
					if (element[attribute][i]['xtype'] === 'datacontainer' && typeof element[attribute][i]['Refresh'] === 'function' && typeof element[attribute]['dataSource'] === 'string') {
						element[attribute][i].Refresh.call(element[attribute][i], pathDictionary, updateDate);
					} else {
						setChildData.call(this, element[attribute][i], pathDictionary, updateDate);
					}
					//console.log('query object');
				}
			} else {
				if (element[attribute]['xtype'] === 'datacontainer' && typeof element[attribute]['Refresh'] === 'function' && typeof element[attribute]['dataSource'] === 'string') {
					element[attribute].Refresh.call(element[attribute], pathDictionary, updateDate);
				} else {
					setChildData.call(this, element[attribute], pathDictionary, updateDate);
				}
				//console.log('query object');
			}
		}
	}

	if (element.children && jTi.type(element.children) === 'array') {
		for (var i in element.children) {
			if (element.children[i] && typeof element.children[i]['dataSource'] === 'string' && element.children[i]['xtype'] == 'datacontainer' && typeof element.children[i]['Refresh'] === 'function') {
				//if (element.children[i] && jTi.type(element.children[i]['dataSource']) === 'string' && jTi.type(element.children[i]['xtype']) === 'datacontainer' && jTi.type(element.children[i]['Refresh']) === 'function') {
				element.children[i].Refresh.call(element.children[i], pathDictionary, updateDate);
			} else {
				setChildData.call(this, element.children[i], pathDictionary, updateDate);
			}
		}
	}
}