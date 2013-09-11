(function(jTi) {
	var guid = 0;

	//match the template labels
	var rtemplateExpr = /\{\$.+?\}/gi,
	//match the index labels eg:{$3}
	rindexExpr = /^\{\$([0-9]+)(?:|\:([\w]+))\}$/i,
	//match the data search labels eg:{$3->ProductID}
	rdataExpr = /\{\$([0-9]+)->(.+)\}/i,
	//match the express value labels eg:{$ProductID}
	rvalueExpr = /\{\$(.+)\}/i;

	jTi.ui = function(param, parent, path) {
		if ( typeof param == 'object') {
			return jTi(jTi.ui.fn.createDOMElement(param, parent, path));
		} else {
			return this;
		}
	};

	jTi.extend({
		reg : function(elementDOM, parent) {
			var xPath = '';
			if (parent) {
				var pPath = jTi.nodePath(parent);
				xPath = (pPath === '' ? parent.id : pPath + '>' + parent.id);
			} else {
				documentElement.push(elementDOM);
			}
			return elementDOMCache[elementDOM.id] = {
				Path : xPath,
				DOM : elementDOM
			};
		},
		unreg : function(elementDOM) {
			if (elementDOMCache.hasOwnProperty(elementDOM.id)) {
				var xPath = elementDOMCache[elementDOM.id].Path;
				var isRootElement = xPath === '';
				xPath += isRootElement ? elementDOM.id : '>' + elementDOM.id;
				jTi.toEnumerable(elementDOMCache).where(function(t) {
					return t.value.Path === xPath || t.value.Path.indexOf(xPath + '>') === 0;
				}).select('$.key').forEach(function(t) {
					delete elementDOMCache[t];
				});
				delete elementDOMCache[elementDOM.id];
				if (isRootElement) {
					documentElement.splice(documentElement.indexOf(elementDOM), 1);
				}
			}
		}
	});

	jTi.ui.fn = jTi.ui.prototype = {
		compileTemplate : function(param, path) {
			var match, expression, attributeString, index;
			for (var attribute in param) {
				if (attribute === 'children' || attribute === 'listeners') {
					continue;
				}
				if ( typeof param[attribute] === 'string') {
					expression = param[attribute].match(rtemplateExpr);
					if (expression != null) {
						try {
							attributeString = param[attribute];
							for (var i in expression) {
								match = rdataExpr.exec(expression[i]);
								var value;
								if (match && match[1] && match[2]) {
									//console.log(match[1] + ':' + match[2]);
									index = parseInt(match[1]) - 1;
									value = path[index].data[path[index].index][match[2]];
								} else if (( match = rindexExpr.exec(expression[i])) && match[1]) {
									//console.log(match[1]);
									switch(match[2]) {
										case 'index':
											value = parseInt(path[parseInt(match[1]) - 1].index) + 1;
											break;
										default:
											index = parseInt(match[1]) - 1;
											value = path[index].data[path[index].index];
											break;
									}
								} else if (( match = rvalueExpr.exec(expression[i])) && match[1]) {
									index = path.length - 1;
									value = path[index].data[path[index].index][match[1]];
								}
								if ( typeof value === 'string' || typeof value === 'number') {
									attributeString = attributeString.replace(expression[i], value);
								} else {
									attributeString = value;
								}
							}
							param[attribute] = attributeString;
						} catch(ex) {
						}
					}
				} else if ( typeof param[attribute] === 'object' && param[attribute] != null && typeof param[attribute]['xtype'] != 'string') {
					var objectString = JSON.stringify(param[attribute]);

					var expression = objectString.match(rtemplateExpr);
					if (expression != null) {
						try {
							for (var i in expression) {
								match = rdataExpr.exec(expression[i]);
								var value;
								if (match && match[1] && match[2]) {
									if (parseInt(match[1]) > path.length) {
										continue;
									}
									index = parseInt(match[1]) - 1;
									value = path[index].data[path[index].index][match[2]];
								} else if (( match = rindexExpr.exec(expression[i])) && match[1]) {
									if (parseInt(match[1]) > path.length) {
										continue;
									}
									switch(match[2]) {
										case 'index':
											value = parseInt(path[parseInt(match[1]) - 1].index) + 1;
											break;
										default:
											index = parseInt(match[1]) - 1;
											value = path[index].data[path[index].index];
											break;
									}
								} else if (( match = rvalueExpr.exec(expression[i])) && match[1]) {
									index = path.length - 1;
									value = path[index].data[path[index].index][match[1]];
								}
								if ( typeof value === 'string' || typeof value === 'number') {
									objectString = objectString.replace(expression[i], value);
								}
							}
							param[attribute] = JSON.parse(objectString);
						} catch(ex) {
						}
					}
				}
			}
			return param;
		},
		// compileTemplate : function(param, path) {
		// for (var attribute in param) {
		// if ( typeof param[attribute] === 'string') {
		// var expression = param[attribute].match(/\$\(.+?\)/gi);
		// if (expression != null) {
		// var attributeString = param[attribute];
		// for (var index in expression) {
		// var storeName = /[^\(->]+(?=->)/i.exec(expression[index]);
		// if (storeName != null) {
		// var dataString = expression[index].replace('$(' + storeName[0] + '->', '');
		// dataString = dataString.substring(0, dataString.length - 1);
		// for (var i in path) {
		// dataString = dataString.replace('[$' + i + ']', '[' + path[i] + ']');
		// dataString = dataString.replace('$' + i, parseInt(path[i]) + 1);
		// }
		// var data = jTi.store(storeName[0]).get();
		// var value = eval(dataString);
		// if ( typeof value === 'string' || typeof value === 'number') {
		// attributeString = attributeString.replace(expression[index], value);
		// } else {
		// attributeString = value;
		// }
		// }
		// }
		// param[attribute] = attributeString;
		// }
		// } else if ( typeof param[attribute] === 'object' && param[attribute] != null && typeof param[attribute]['xtype'] != 'string') {
		// var objectString = JSON.stringify(param[attribute]);
		//
		// var expression = objectString.match(/\$\(.+?\)/gi);
		// if (expression != null) {
		// for (var index in expression) {
		// var storeName = /[^\(->]+(?=->)/i.exec(expression[index]);
		// if (storeName != null) {
		// var dataString = expression[index].replace('$(' + storeName[0] + '->', '');
		// dataString = dataString.substring(0, dataString.length - 1);
		// for (var i in path) {
		// dataString = dataString.replace('[$' + i + ']', '[' + path[i] + ']');
		// }
		// var data = jTi.store(storeName[0]).get();
		// var value = eval(dataString);
		// if ( typeof value === 'string' || typeof value === 'number') {
		// objectString = objectString.replace(expression[index], value);
		// }
		// }
		// }
		// param[attribute] = JSON.parse(objectString);
		// }
		// }
		// }
		// return param;
		// },
		createDOMElement : function(param, parent, path) {
			if ( typeof param.xtype === 'undefined' || param.xtype == null) {
				throw new Error(L('componentWithoutXtype'));
			}
			var children = param.children;
			delete param.children;
			var events = param.listeners;
			delete param.listeners;
			var definedDOMElements = {};
			param = this.compileTemplate(param, path);
			var animations = param.animations;
			delete param.animations;
			for (var attribute in param) {
				if (param[attribute] && typeof param[attribute] === 'object' && param[attribute].xtype) {
					definedDOMElements[attribute] = param[attribute];
				}
			}
			for (var attribute in definedDOMElements) {
				delete param[attribute];
			}
			if ( typeof param.id === 'string') {
				if (param.id.indexOf('>') > -1) {
					throw new Error('component id cannot include ">"');
				} else if (jTi('#' + param.id).length > 0) {
					throw new Error('component id "' + param.id + '" has been used');
				}
			} else {
				guid++;
				param.id = 'gdw-c' + guid;
			}
			//create registered control;
			var elementDOM = jTi.component(param.xtype)(param);

			elementDOM.xtype = param.xtype;
			if (elementDOM.xtype != 'animation') {
				jTi.reg(elementDOM, parent);
			}
			//create control's children
			if (children) {
				if (jTi.type(children) === 'array') {
					for (var i in children) {
						$(elementDOM).append(this.createDOMElement(children[i], elementDOM, path));
					}
				} else if (param.xtype === 'datacontainer') {
					//set data form view template
					var store = jTi.store(children.source);
					if (store) {
						store.bind(elementDOM);
					}
					elementDOM.dataSource = children.source;
					elementDOM.dataTemplate = children.template;
					if (children.query) {
						elementDOM.queryProperty = children.query;
					}
				} else {
					$(elementDOM).append(this.createDOMElement(children, elementDOM, path));
				}
			}
			//create user defined control attribute
			for (var attribute in definedDOMElements) {
				var definedDOMElement = this.createDOMElement(definedDOMElements[attribute], elementDOM, path);
				//jTi.fn.reg(definedDOMElement);
				elementDOM[attribute] = definedDOMElement;
			}
			for (var name in animations) {
				animations[name].xtype = 'animation';
				elementDOM[name] = this.createDOMElement(animations[name], elementDOM, path);
				elementDOM.addEventListener(name, function(e) {
					e.source.animate(e.source[e.type], function() {
						if (jTi.isFunction(e.callback)) {
							e.callback();
						}
					});
					e.source.latestAnimationName = e.type;
				});
			}
			//bind event listener
			for (var name in events) {
				if (jTi.isFunction(events[name])) {
					elementDOM.addEventListener(name.toLowerCase(), events[name]);
				}
				// } else {
				// elementDOM[name] = events[name];
				// }
			}
			//jTi.fn.reg(elementDOM);
			return elementDOM;
		},
	};

	// function addChildren(parent, child) {
	// if (parent) {
	// if (parent.xtype === 'table' && child.xtype === 'tablerow') {
	// parent.appendRow(child, child.appendStyle);
	// } else if (parent.xtype === 'scrollable') {
	// parent.addView(child);
	// } else if (child.xtype === 'tablesection' || child.xtype === 'listsection') {
	// parent.appendSection(child, child.appendStyle);
	// } else {
	// parent.add(child);
	// }
	// }
	// }

})($);
