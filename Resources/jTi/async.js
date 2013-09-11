/*
 * Asynchronous class, use to replace callback in function parameters.
 * Example:
 * var async = jTi.async();
 * setTimeout(function() { async.yield("result"); }, 300);
 * return async;
 */
(function(jTi) {
	jTi.async = function(options) {
		return new jTi.async.fn.operation(options);
	};

	jTi.async.fn = jTi.async.prototype = {
		operation : function(options) {
			options = options || {};
			this.callbackQueue = [];
			this.chain = (options.chain && options.chain === true) ? true : false;
			this.started = false;
			this.innerChain = null;
			this.result = undefined;
			this.state = "running";
			this.completed = false;
			return this;
		},

		wait : function(delay, context) {
			this.next(function(context) {
				return jTi.async.wait(delay, context);
			});
		},

		yield : function(result) {
			var self = this;
			if (!this.chain) {
				self.result = result;
				self.state = "completed";
				self.completed = true;
			} else {
				this.started = true;
				self.result = result;
				self.state = "chain running";
				self.completed = false;
			}
			setTimeout(function() {
				if (!this.innerChain) {
					while (self.callbackQueue.length > 0) {
						var callback = self.callbackQueue.shift();
						if (this.chain) {
							callbackResult = callback(self.result);
							self.result = callbackResult;
							if (callbackResult && callbackResult instanceof jTi.async) {
								self.innerChain = jTi.async.chain();
								while (self.callbackQueue.length > 0) {
									self.innerChain.next(self.callbackQueue.shift());
								}
								self.innerChain.next(function(result) {
									self.result = result;
									self.state = "completed";
									self.completed = true;
									return result;
								});
								callbackResult.run(function(result) {
									self.result = result;
									self.innerChain.go(result);
								});
							}
						} else {
							callback(self.result);
						}
					}
					if (!self.innerChain) {
						self.state = "completed";
						self.completed = true;
					}
				} else {
					while (self.callbackQueue.length > 0) {
						self.innerChain.next(self.callbackQueue.shift());
					}
					self.innerChain.next(function(result) {
						self.result = result;
						self.state = "completed";
						self.completed = true;
						return result;
					});
				}
			}, 1);
			return this;
		},

		go : function(initialArgument) {
			return this.yield(initialArgument);
		},

		run : function(callback) {
			this.callbackQueue.push(callback);
			if (this.completed || (this.chain && this.started)) {
				this.yield(this.result);
			}
			return this;
		},

		next : function(nextFunction) {
			return this.run(nextFunction);
		}
	};
	jTi.async.fn.operation.prototype = jTi.async.fn;

	jTi.extend(jTi.async, {
		chain : function(firstFunction) {
			var chain = jTi.async({
				chain : true
			});
			if (firstFunction) {
				chain.next(firstFunction);
			}
			return chain;
		},

		go : function(initialArgument) {
			return jTi.async.chain().go(initialArgument);
		},

		wait : function(delay, context) {
			var operation = jTi.async();
			setTimeout(function() {
				operation.yield(context);
			}, delay);
			return operation;
		}
	});
})($);
