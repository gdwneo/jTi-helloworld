console.log('app start');
Ti.include('global.js');

if (Ti.version < 1.8) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}
(function() {
	$.mvc('app').controller('container');
})();
// var win = Ti.UI.createWindow({
// backgroundColor : 'red'
// });
// win.hello = function() {
// alert(this.backgroundColor);
// };
// var btn = Ti.UI.createButton({
// height : 50,
// title : 'click'
// });
// win.add(btn);
// btn.addEventListener('click', function(e) {
// win.hello.call(win);
// });
// win.open();
