(function(jTi) {
	var rreturn = /\r/g,
	// filter for root elements
	pFilterRoot = '(?:^|>){0}(?:>|$)';
	jTi.fn.extend({
		attr : function(name, value) {
			return jTi.access(this, jTi.attr, name, value, arguments.length > 1);
		},
		removeAttr : function(name) {
			return this.each(function() {
				jTi.removeAttr(this, name);
			});
		},
		val : function(value) {
			var ret, isFunction, elem = this[0];
			if (!arguments.length) {
				if (elem && jTi.isFunction(elem.getValue)) {
					ret = elem.xtype === 'label' ? elem.getText() : elem.getValue();
					return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
				}
				return;
			}
			isFunction = jTi.isFunction(value);
			return this.each(function(i) {
				var val;
				if (!jTi.isFunction(this.setValue)&&!jTi.isFunction(this.setText)) {
					return;
				}

				if (isFunction) {
					val = value.call(this, i, jTi(this).val());
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if (val == null) {
					val = "";
				} else if ( typeof val === "number") {
					val += "";
				} else if (jTi.isArray(val)) {
					val = jTi.map(val, function(value) {
						return value == null ? "" : value + "";
					});
				}
				// If set returns undefined, fall back to normal setting
				this.xtype === 'label' ? elem.setText(val) : elem.setValue(val);
			});
		},
		open : function(openStyle) {
			return this.each(function() {
				if (jTi.isFunction(this.open)) {
					this.open(openStyle || this.openStyle);
				}
			});
		},
		show : function() {
			return this.each(function() {
				if (jTi.isFunction(this.show)) {
					this.show();
				}
			});
		},
		hide : function() {
			return this.each(function() {
				if (jTi.isFunction(this.hide)) {
					this.hide();
				}
			});
		},
		blur : function() {
			return this.each(function() {
				if (jTi.isFunction(this.blur)) {
					this.blur();
				}
			});
		},
		animate : function(content, fn) {
			return this.each(function() {
				if (jTi.isDOM(this)) {
					if (jTi.isFunction(fn)) {
						this.animate(content, fn);
					} else {
						this.animate(content);
					}
				}
			});
		},
		append : function(content) {
			if (jTi.isDOM(content)) {
				var elem = this.get(0), cPath = jTi.nodePath(content), p = jTi(content).parent(), pathArray;
				if (jTi.isDOM(elem)) {
					if (p.get(0) != elem) {
						if (cPath === '') {
							documentElement.splice(documentElement.indexOf(content), 1);
						}
						jTi.destory(content);
						updateElementPath(content, elem);
					}
					var xtype = elem.xtype === 'datacontainer' ? elem.base : elem.xtype;
					switch(xtype) {
						case 'tabgroup':
							elem.addTab(content);
							break;
						case 'table':
							switch(content.xtype) {
								case 'tablerow':
									elem.appendRow(content, content.appendStyle);
									break;
								case 'tablesection':
									elem.appendSection(content, content.appendStyle);
									break;
								default:
									elem.remove(content);
									break;
							}
							break;
						case 'list':
							if (content.xtype === 'listsection') {
								elem.appendSection(content, content.appendStyle);
							} else {
								elem.add(content);
							}
							break;
						case 'scrollable':
							elem.addView(content);
							break;
						default:
							elem.add(content);
							break;
					}
				}
				return this;
			} else if ( content instanceof jTi) {
				return this.each(function() {
					if (jTi.isDOM(this)) {
						var p = this;
						content.each(function() {
							jTi(p).append(this);
						});
					}
				});
			} else {
				return this.each(function() {
					if (jTi.isDOM(this)) {
						jTi.ui(content, this);
					}
				});
			}
		},

		// table and list support insert function, so only need update the path and insert children
		// other container doesn't support insert, so we only can remove the childrens and add again.
		insertAt : function(index, parent) {
			var elem = this.get(0), elems = [], i;

			if (!jTi.isDOM(elem)) {
				return this;
			}
			elems.push(elem);
			var xtype = parent.xtype === 'datacontainer' ? parent.base : parent.xtype;
			switch(xtype) {
				case 'scrollable':
					for ( i = parent.getViews().length; i > 0; i--) {
						if (i > index) {
							elems.push(parent.getViews()[i - 1]);
							parent.removeView(parent.getViews()[i - 1]);
						}
					}
					break;
				case 'table':
					updateElementPath(elem, parent);
					if (elem.xtype === 'tablerow') {
						parseInt(index) <= 0 ? parent.insertRowBefore(0, elem, elem.insertStyle) : parent.insertRowAfter(index - 1, elem, elem.insertStyle);
					} else {
						parseInt(index) <= 0 ? parent.insertSectionBefore(0, elem, elem.insertStyle) : parent.insertSectionAfter(index - 1, elem, elem.insertStyle);
					}
					return this;
				case 'list':
					updateElementPath(elem, parent);
					parent.insertSectionAt(index, elem, elem.insertStyle);
					return this;
				case 'tablesection':
					for ( i = parent.rowCount; i > 0; i--) {
						if (i > index) {
							elems.push(parent.rows[i - 1]);
							parent.remove(parent.rows[i - 1]);
						}
					}
					break;
				case 'tabgroup':
					for ( i = parent.tabs.length; i > 0; i--) {
						if (i > index) {
							elems.push(parent.tabs[i - 1]);
							parent.removeTab(parent.tabs[i - 1]);
						}
					}
					break;
				default:
					for ( i = parent.children.length; i > 0; i--) {
						if (i > index) {
							elems.push(parent.children[i - 1]);
							parent.removeTab(parent.children[i - 1]);
						}
					}
					break;
			}
			return jTi(parent).append(jTi(elems));
		},
		insertAfter : function(elem) {
			var index = 0;
			if ( typeof elem === 'string') {
				elem = jTi(elem).get(0);
			}
			if (!jTi.isDOM(elem)) {
				return this;
			}
			this.insertAt(jTi(elem).index() + 1, parent);
		},
		insertBefore : function(elem) {
			if ( typeof elem === 'string') {
				elem = jTi(elem).get(0);
			}
			if (!jTi.isDOM(elem)) {
				return this;
			}
			this.insertAt(jTi(elem).index(), parent);
		},
		index : function() {
			elem = this.get(0);
			var parent = this.parent().get(0), index = 0;

			var xtype = parent.xtype === 'datacontainer' ? parent.base : parent.xtype;
			switch(xtype) {
				case 'scrollable':
					index = parent.getViews().indexOf(elem);
					break;
				case 'table':
					if (elem.xtype === 'tablesection') {
						index = parent.sections.indexOf(elem);
					} else {
						var i = 0;
						for (; i < parent.sections.length; i++) {
							var pos = parent.sections[i].rows.indexOf(elem);
							if (pos > -1) {
								index += pos;
								break;
							} else {
								index = (i === parent.sections.length - 1) ? -1 : index + parent.sections.rowCount;
							}
						}
					}
					break;
				case 'list':
					index = parent.sections.indexOf(elem);
					break;
				case 'tablesection':
					index = parent.rows.indexOf(elem);
					break;
				case 'tabgroup':
					index = parent.tabs.indexOf(elem);
					break;
				default:
					index = parent.children.indexOf(elem);
					break;
			}
			return index;
		},

		// empty : function() {
		// var elem;
		// return this.each(function() {
		// if (jTi.isDOM(this)) {
		// elem = jTi(this);
		// var children = elem.children();
		// elem.children().each(function() {
		// switch(elem.attr('xtype')) {
		// case 'scrollable':
		// if (elem.attr('views').indexOf(this) > -1) {
		// jTi(this).remove();
		// }
		// break;
		// case 'table','list':
		// if (elem.attr('sections').indexOf(this) > -1) {
		// jTi(this).remove();
		// } else if (elem.attr('rows').indexOf(this) > -1) {
		// jTi(this).remove();
		// }
		// break;
		// case 'tablesection':
		// if (elem.attr('rows').indexOf(this) > -1) {
		// jTi(this).remove();
		// }
		// break;
		// case 'tabgroup':
		// if (elem.attr('tabs').indexOf(this) > -1) {
		// jTi(this).remove();
		// }
		// break;
		// default:
		// if (elem.attr('children').indexOf(this) > -1) {
		// jTi(this).remove();
		// }
		// break;
		// }
		// });
		// }
		// });
		// },

		empty : function() {
			return this.each(function() {
				if (jTi.isDOM(this)) {

					var xtype = this.xtype === 'datacontainer' ? this.base : this.xtype;
					switch(xtype) {
						case 'scrollable':
							jTi(this.views).each(function() {
								jTi(this).remove();
							});
							break;
						case 'table':
						case 'list':
							jTi(this.sections).each(function() {
								if ( typeof this.id === 'string') {
									jTi(this).remove();
								} else {
									jTi(this.rows).each(function() {
										jTi(this).remove();
									});
								}
							});
							break;
						case 'tablesection':
							jTi(this.rows).each(function() {
								jTi(this).remove();
							});
							break;
						case 'tabgroup':
							jTi(this.tabs).each(function() {
								jTi(this).remove();
							});
							break;
						default:
							jTi(this.children).each(function() {
								jTi(this).remove();
							});
							break;
					}
				}
			});
		},

		remove : function() {
			this.each(function() {
				if (jTi.isDOM(this)) {
					jTi.destory(this);
					jTi.unreg(this);
				}
			});
			for (var i = 0; i < this.length; i++) {
				delete this[i];
			}
			this.length = 0;
		},
		on : function(type, fn) {
			// if (!eventCache.hasOwnProperty(this.selector)) {
			// eventCache[this.selector] = {};
			// }
			// if (!eventCache[this.selector].hasOwnProperty(type)) {
			// eventCache[this.selector][type] = [];
			// }
			// eventCache[this.selector][type].push(fn);
			return this.each(function() {
				jTi.event.add(this, type, fn);
			});
		},
		off : function(type, fn) {
			// if (eventCache.hasOwnProperty(this.selector) && eventCache[this.selector].hasOwnProperty(type) && eventCache[this.selector][type].indexOf(fn) > -1) {
			// eventCache[this.selector][type].splice(eventCache[this.selector][type].indexOf(fn), 1);
			// }
			return this.each(function() {
				jTi.event.remove(this, type, fn);
			});
		},
		trigger : function(type, data) {
			return this.each(function() {
				jTi.event.trigger(this, type, data);
			});
		}
	});

	function updateElementPath(elem, parent) {
		var pPath = jTi.nodePath(parent);
		if (elementDOMCache[elem.id].Path === pPath + '>' + parent.id) {
			return;
		}
		pPath += (pPath === '' ) ? parent.id : '>' + parent.id;
		for (var i in elementDOMCache) {
			if (elementDOMCache[i].Path.match(new RegExp(pFilterRoot.replace('{0}', elem.id)))) {
				pathArray = elementDOMCache[i].Path.split('>');
				if (pathArray[0] != elem.id) {
					pathArray.splice(0, pathArray.indexOf(elem.id));
					elementDOMCache[i].Path = pathArray.join('>');
				}
				elementDOMCache[i].Path = pPath + '>' + elementDOMCache[i].Path;
			}
		}
		elementDOMCache[elem.id].Path = pPath;
	}


	jTi.extend({
		attr : function(elem, name, value) {
			if (!elem) {
				return;
			}
			if (value != undefined) {
				if (value === null) {
					jTi.removeAttr(elem, name);
				} else {
					elem[name] = value;
				}
			} else {
				return elem[name];
			}
		},
		removeAttr : function(elem, name) {
			elem[name] = null;
			delete elem[name];
		},
		destory : function(elem) {
			if (elem.xtype === 'window') {
				elem.close(elem.closeStyle);
				return;
			}
			var pDOM = jTi(elem).parent().get(0);
			if (!pDOM) {
				return;
			}
			var xtype = pDOM.xtype === 'datacontainer' ? pDOM.base : pDOM.xtype;
			switch(xtype) {
				case 'tabgroup':
					pDOM.removeTab(elem);
					break;
				case 'table':
					switch(elem.xtype) {
						case 'tablerow':
							pDOM.deleteRow(elem, elem.deleteStyle);
							break;
						case 'tablesection':
							pDOM.deleteSection(elem, elem.deleteStyle);
							break;
						default:
							pDOM.remove(elem);
							break;
					}
					break;
				case 'list':
					if (elem.xtype === 'listsection') {
						pDOM.deleteSectionAt(pDOM.sections.indexOf(elem), elem.deleteStyle);
					} else {
						pDOM.remove(elem);
					}
					break;
				case 'scrollable':
					pDOM.removeView(elem);
					break;
				default:
					pDOM.remove(elem);
					break;
			}
		}
	});

	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jTi.event = {
		add : function(elem, type, fn) {
			elem.addEventListener(type, fn);
		},
		remove : function(elem, type, fn) {
			elem.removeEventListener(type, fn);
		},
		trigger : function(elem, type, data) {
			if (!data) {
				elem.fireEvent(type);
			} else {
				elem.fireEvent(type, data);
			}
		}
	};

	// bind express method for events
	jTi.each(["click", "dblclick", "longpress", "focus", "swipe", "touchstart", "touchmove", "touchend", "touchcancel"], function(i, method) {
		jTi.fn[method] = function(fn) {
			// shift arguments if data argument was omitted
			if (jTi.isFunction(fn)) {
				return this.on(method, fn);
			} else if (jTi.type(fn) === 'object') {
				return this.trigger(method, fn);
			} else {
				return this.trigger(method);
			}
		};
	});
})($);