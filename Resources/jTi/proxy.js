(function(jTi) {
	jTi.proxy = function(source) {
		if ( source instanceof jTi.db) {
			return jTi.proxy.db(source);
		} else if ( typeof source === 'string') {
			return jTi.proxy.rest(source);
		}
		return null;
	};
})($);
