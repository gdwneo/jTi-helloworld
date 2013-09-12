exports.module = function(param) {
	var view = Ti.UI.createView(param), titleView, slideBtn;

	var start = {
		x : 0,
		gx : 0,
		t : 0
	};
	//var slideLimit = 417;
	var t = Ti.UI.create2DMatrix();
	var sl = 0;
	var catchMove = param.catchMove;

	view.addEventListener('touchstart', sliderTouchStart);
	view.addEventListener('touchmove', sliderTouchMove);
	view.addEventListener('touchend', sliderTouchEnd);

	function sliderTouchStart(e) {
		e.globalPoint = e.globalPoint || this.convertPointToView(e, this.targetWin);
		start.x = e.x;
		start.gx = e.globalPoint.x;
		start.t = new Date().getTime();
	}

	function sliderTouchMove(e) {
		e.globalPoint = e.globalPoint || this.convertPointToView(e, this.targetWin);
		var diff = parseInt(e.globalPoint.x - start.x);

		//If the user is sliding the view away from the either edge, deny that.
		if (diff < 0 || diff > this.slideLimit) {
			return;
		}
		if (jTi.isAndroid()) {
			// this.animate({
			// //transform : t,
			// left : diff,
			// duration : 0
			// });
			this.left = diff;
		} else {
			t.setTx(diff);
			this.animate({
				transform : t,
				duration : 0
			});
		}
		sl = diff;
		this.sliding = true;
		diff = null;
	}

	function sliderTouchEnd(e) {
		e.globalPoint = e.globalPoint || this.convertPointToView(e, this.targetWin);
		te = new Date().getTime();
		//if ((sl - start.gx) < 0) {
		console.log('sliderTouchEnd');
		if ((start.gx - e.x - sl) > catchMove) {
			this.slideIn(te - start.t);
			return;
		}
		var diff = e.globalPoint.x - start.x;
		//Very small move? Let's take it back to where it began
		if (diff < catchMove) {
			this.slideIn(te - start.t);
		}
		if (diff >= catchMove) {
			this.slideOut(te - start.t);
		}
		diff = null;
		te = null;
	}


	view.sliderChange = function() {
		if (!this.sliding) {
			this.slideOut(500);
		} else {
			this.slideIn(500);
		}
	};

	view.slideOut = function(time) {
		var scope = this;
		if (jTi.isAndroid()) {
			this.animate({
				left : this.slideLimit,
				duration : ((time != null && time < 500) ? time : 500)
				//curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
			}, function() {
				scope.left = this.slideLimit;
				scope.sliding = true;
				sl = scope.slideLimit;
			});
		} else {
			t.setTx(scope.slideLimit);
			this.animate({
				transform : t,
				duration : ((time != null && time < 500) ? time : 500),
				curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
			}, function() {
				scope.sliding = true;
				sl = scope.slideLimit;
			});
		}
	};

	view.slideIn = function(time) {
		var scope = this;
		if (jTi.isAndroid()) {
			scope.animate({
				//transform : t,
				left : 0,
				duration : ((time != null && time < 500) ? time : 500)
				//curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
			}, function() {
				scope.sliding = false;
				scope.left = 0;
				sl = 0;
			});
		} else {
			t.setTx(0);
			scope.animate({
				transform : t,
				duration : ((time != null && time < 500) ? time : 500),
				curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT
			}, function() {
				scope.sliding = false;
				//scope.left = 0;
				sl = 0;
			});
		}
	};
	return view;
};
