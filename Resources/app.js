Ti.include('global.js');

if (Ti.version < 1.8) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

(function() {
	$.mvc('app').controller('container');
})(); 