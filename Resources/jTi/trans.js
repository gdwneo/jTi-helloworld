(function(jTi) {
	jTi.trans = function(db, fn) {
		return new jTi.trans.fn.init(db, fn);
	};
	jTi.trans.fn = jTi.trans.prototype = {
		init : function(db,fn) {
			this.db = db;
			if(jTi.isFunction(fn)){
				this.begin(fn);
			}
		},
		state : jTi.trans.init,
		begin : function(fn) {
			if (this.state != jTi.trans.begin) {
				this.db.execute('BEGIN TRANSACTION');
				this.state = jTi.trans.begin;
				
				Ti.API.info('BEGIN TRANSACTION');
				fn.call(this);
				if (this.state == jTi.trans.begin) {
					this.db.execute('END TRANSACTION');
					this.state = jTi.trans.end;
				}
			} else {
				fn.call(this);
			}
		},
		commit : function() {
			if (this.state == jTi.trans.begin) {
				var msg = this.db.execute('COMMIT TRANSACTION');
				Ti.API.info('COMMIT TRANSACTION');
				this.state = jTi.trans.commit;
			} else {
				throw new Error(L('transactionError') + this.state);
			}
		},
		rollback : function() {
			if (this.state == jTi.trans.begin) {
				this.db.execute('ROLLBACK TRANSACTION');
				this.state = jTi.trans.rollback;
				Ti.API.info('ROLLBACK TRANSACTION');
			} else {
				throw new Error(L('transactionError') + this.state);
			}
		}
	};

	jTi.trans.fn.init.prototype = jTi.trans.fn;

	jTi.extend(jTi.trans, {
		init : 0,
		begin : 1,
		end : 2,
		commit : 3,
		rollback : 4
	});
})($);
