exports.module = function(param) {
	var View = Ti.UI.createView(param);
	//View.backgroundColor = 'black';
	var displayView = Ti.UI.createView({
		height : Ti.UI.SIZE,
		width : Ti.UI.SIZE,
		backgroundColor : 'black',
		borderRadius : 10
	});
	var loading = Ti.UI.createActivityIndicator({
		left : 20,
		top : 20,
		right : 20,
		bottom : 20,
		height : Ti.UI.SIZE,
		width : Ti.UI.SIZE,
		style : Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
		message : param.message,
		font : {
			fontSize : 20
		},
		color : 'white'
	});
	loading.show();
	displayView.add(loading);
	View.add(displayView);
	View.display = displayView;
	View.loading = loading;
	return View;
};
