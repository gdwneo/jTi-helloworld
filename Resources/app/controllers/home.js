exports.init = function() {
	var scope = this;
	$('#home-switch').click(function(e) {
		scope.document.get(0).sliderChange();
		e.bubbles = false;
	});
	//this.document.open();
	this.document.attr('targetWin', $('#container').get(0));
	$('#container').append(this.document);

	// var test = Ti.UI.createView({
		// xtype : 'view',
		// id : 'home-main',
		// left : 263,
		// slideLimit : 263,
		// catchMove : 50,
		// sliding : true,
		// width : Ti.Platform.getDisplayCaps().platformWidth,
		// height : Ti.UI.FILL,
		// //backgroundImage : '/images/home/bg.png'
		// backgroundColor : '#fff'
	// });
	// $('#container').get(0).add(test);
};
