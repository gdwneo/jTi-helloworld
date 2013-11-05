exports.init = function() {
	var scope = this;
	$('#home-switch').click(function(e) {
		scope.document.get(0).sliderChange();
		e.bubbles = false;
	});

	$('#home-refresh').click(function(e) {
		$('#device-token').val(deviceToken);
	});
	//this.document.open();
	this.document.attr('targetWin', $('#container').get(0));
	$('#container').append(this.document);
};
