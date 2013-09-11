(function(jTi) {

	var selector_hasDuplicate, rattrExpr = /(?:([\w-]+)(=|\$=|!=)(.+))/,
	// match selector expression
	rselectorExpr = /^([\w-]+)[\:\[\.]*|\[(.*)\]|\:(.*)/,
	// match selector eg: #id
	rquickExpr = /^(?:#([\w-]*))$/,
	// cache the compiled selector
	selector_sortOrder = function(a, b) {
		// Flag for duplicate removal
		if (a === b) {
			selector_hasDuplicate = true;
			return 0;
		}
		if (jTi.isDOM(a)) {
			if (jTi.contains(a, b)) {
				return 1;
			}
			var aPath = jTi.nodePath(a).split('>'), bPath = jTi.nodePath(b).split('>'), i = 0;
			if (aPath.length > bPath.length) {
				return -1;
			} else if (aPath.length < bPath.length) {
				return 1;
			} else {
				for (; i < aPath.length; i++) {
					if (aPath[i] === bPath[i]) {
						continue;
					}
					return aPath[i] > bPath[i] ? 1 : -1;
				}
			}
		}
		// Not directly comparable, sort on existence of method
		return aPath > bPath ? -1 : 1;
	},
	//support format eg:
	//	*
	//  name
	//	name[attribute]
	//	name[attribute=val]
	//	--name:first
	//	name:empty
	//	#id
	//	parent>children
	//  parent children
	matches = function(selector) {
		if (!jTi.isDOM(this)) {
			return false;
		}
		var elem = [this], path = jTi.nodePath(this), spaceArr = selector.split(' '), i = spaceArr.length, arrowArr, match, expr;
		// loop for parents tree
		for (; i > 0; i--) {
			arrowArr = spaceArr[i - 1].split('>');
			var parents = [], pathMatch = false;
			// loop for one level parent
			for (var t in elem) {
				var current = elem[t], isMatch = false;
				//if (jTi.nodePath(current).split('>').length >= arrowArr.length + i - 2) {
				MATCHPATH: {
					for (var j = arrowArr.length; j > 0; j--) {
						//var isMatch = false;
						if (arrowArr[j - 1] === '*') {
						} else if ( match = rquickExpr.exec(arrowArr[j - 1])) {
							if (current.id != match[1]) {
								//isMatch = true;
								break MATCHPATH;
							}
						} else {
							expr = arrowArr[j - 1];
							var isContinue = true;
							if ( match = rselectorExpr.exec(expr)) {
								if (match[1]) {
									if (match[1] != current.xtype) {
										break MATCHPATH;
									}
									if (match[0] === match[1]) {
										//isMatch = true;
										isContinue = false;
									} else {
										expr = expr.substring(match[1].length);
										match = rselectorExpr.exec(expr);
									}
								}
								if (match && match[2] && isContinue) {
									var attMatch = rattrExpr.exec(match[2]);
									if (attMatch) {
										var tValue = eval(attMatch[3]);
										switch(attMatch[2]) {
											case '!=':
												if (current[attMatch[1]] === tValue) {
													break MATCHPATH;
												}
												break;
											case '$=':
												if (tValue.length === 0 || tValue.length > current[attMatch[1]].length || current[attMatch[1]].substring(current[attMatch[1]].length - tValue.length) != tValue) {
													break MATCHPATH;
												}
												break;
											default:
												if (current[attMatch[1]] != tValue) {
													break MATCHPATH;
												}
												break;
										}
									} else if (!current[match[2]]) {
										break MATCHPATH;
									}
									if (expr === match[2]) {
										//isMatch = true;
										isContinue = false;
									} else {
										expr = expr.replace(match[0], '');
										match = rselectorExpr.exec(expr);
									}
								}
								if (match && match[3] && isContinue) {
									//TODO : $(view:empty)
								}
								//isMatch = true;
							}
						}
						// if (!isMatch) {
						// break;
						// }
						if (j > 1) {
							current = jTi(current).parent().get(0);
							if (!current) {
								break;
							}
						} else {
							isMatch = true;
						}
					}

				}
				if (current && isMatch) {
					pathMatch = true;
					if (i > 1) {
						// search parents
						var p = jTi(current).parents();
						if (p.size() >= i) {
							p.each(function() {
								parents.push(this);
							});
						}
					}
				}
				//}
			}
			if (pathMatch) {
				if (i > 1) {
					if (parents.length === 0) {
						return false;
					}
					elem = parents;
				} else {
					return true;
				}
			}
		}
		return false;
	},

	// find one element's all matched children
	querySelectorAll = function(selector) {
		var elems = this, path = jTi.nodePath(this), children, ret = [];
		if (jTi.type(elems)) {
			elems = [elems];
		}
		for (var item in elems) {
			path += (path === '' ? elems[item].id : '>' + elems[item].id);
			children = jTi.toEnumerable(elementDOMCache).where(function(t) {
				return t.value.Path === path || t.value.Path.indexOf(path + '>') === 0;
			}).select('$.value.DOM').toArray();
			for (var i = 0; i < children.length; i++) {
				if (matches.call(children[i], selector)) {
					ret.push(children[i]);
				}
			}
		}
		return ret;
	};

	// extend for elements query by selector
	jTi.fn.extend({
		parent : function(selector) {
			var ret, elems = [], path, ret = [];
			this.each(function() {
				path = jTi.nodePath(this);
				if (path != '') {
					elems.push(elementDOMCache[path.split('>').pop()].DOM);
				}
			});
			elems = jTi.unique(elems);
			if (selector) {
				jTi(elems).each(function() {
					if (jTi.find.matchesSelector(this, selector)) {
						ret.push(this);
					}
				});
			} else {
				ret = elems;
			}
			return this.pushStack(ret);
		},

		parents : function(selector) {
			var ret = [], elems = [], path, pId;
			this.each(function() {
				path = jTi.nodePath(this);
				if (path != '') {
					pId = path.split('>');
					for (var i = pId.length; i > 0; i--) {
						elems.push(elementDOMCache[pId[i - 1]].DOM);
					}
				}
			});
			elems = jTi.unique(elems);
			if (selector) {
				jTi(elems).each(function() {
					if (jTi.find.matchesSelector(this, selector)) {
						ret.push(this);
					}
				});
			} else {
				ret = elems;
			}
			return this.pushStack(ret);
		},
		children : function(selector) {
			var ret = [], elems = [], path;
			this.each(function() {
				path = jTi.nodePath(this);
				path += (path === '' ? this.id : '>' + this.id);
				jTi.merge(elems, jTi.toEnumerable(elementDOMCache).where(function(t) {
					return t.value.Path === path;
				}).select('$.value.DOM').toArray());
			});
			elems = jTi.unique(elems);
			if (selector) {
				jTi(elems).each(function() {
					if (jTi.find.matchesSelector(this, selector)) {
						ret.push(this);
					}
				});
			} else {
				ret = elems;
			}
			return this.pushStack(ret);
		},

		//filter children elements by selector;
		filter : function(selector) {
			var elems = [];
			if (jTi.isFunction(selector)) {
				return jTi.grep(this, function(elem, i) {
					return !!selector.call(elem, i, elem) !== false;
				});
			}
			this.each(function() {
				if (jTi.find.matchesSelector(this, selector)) {
					elems.push(this);
				}
			});
			return this.pushStack(elems);
		},

		find : function(selector) {
			var i, ret = [], self = this, len = self.length;

			// if selector is element
			if ( typeof selector !== "string") {
				return this.pushStack(jTi(selector).filter(function() {
					for ( i = 0; i < len; i++) {
						if (jTi.contains(self[i], this)) {
							return true;
						}
					}
				}));
			}

			for ( i = 0; i < len; i++) {
				jTi.find(selector, self[i], ret);
			}

			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = this.pushStack(len > 1 ? jTi.unique(ret) : ret);
			ret.selector = this.selector ? this.selector + " " + selector : selector;
			return ret;
		},

		has : function(target) {
			var targets = jTi(target, this), l = targets.length;

			return this.filter(function() {
				var i = 0;
				for (; i < l; i++) {
					if (jTi.contains(this, targets[i])) {
						return true;
					}
				}
			});
		},

		is : function(selector) {
			for (var i = 0; i < this.length; i++) {
				if (jTi.find.matchesSelector(this[i], selector)) {
					return true;
				}
			}
		}
	});

	jTi.extend({
		find : function(selector, context, results, seed) {
			var elem, nodeType, i = 0;

			results = results || [];
			context = context || documentElement;

			// Same basic safeguard as Sizzle
			if (!selector || typeof selector !== "string") {
				return results;
			}

			// Early return if context is not an element or document
			if (!jTi.isDOM(context)) {
				return [];
			}

			if (seed) {
				while (( elem = seed[i++])) {
					if (jTi.find.matchesSelector(elem, selector)) {
						results.push(elem);
					}
				}
			} else {
				jTi.merge(results, querySelectorAll.call(context, selector));
			}

			return results;
		},
		unique : function(results) {
			var elem, duplicates = [], i = 0, j = 0;

			results.sort();

			selector_hasDuplicate = false;
			results.sort(selector_sortOrder);

			if (selector_hasDuplicate) {
				while (( elem = results[i++])) {
					if (elem === results[i]) {
						j = duplicates.push(i);
					}
				}
				while (j--) {
					results.splice(duplicates[j], 1);
				}
			}
			return results;
		},
		contains : function(a, b) {
			var pPath = jTi.nodePath(a);
			pPath += pPath === '' ? a.id : '>' + a.id;
			return jTi.nodePath(b) === pPath || jTi.nodePath(b).indexOf(pPath + '>') > -1;
		}
	});

	jTi.extend(jTi.find, {
		matches : function(expr, elements) {
			return jTi.find(expr, null, null, elements);
		},
		matchesSelector : function(elem, expr) {
			return matches.call(elem, expr);
		}
	});

})($);
