exports.view = function() {
	return {
		xtype : 'slideview',
		id : 'home-main',
		left : 263,
		slideLimit : 263,
		catchMove : 50,
		sliding : true,
		width : Ti.Platform.getDisplayCaps().platformWidth,
		height : Ti.UI.FILL,
		backgroundImage : '/images/home/bg.png',

		//backgroundColor : '#fff',
		children : [{
			xtype : 'view',
			top : 0,
			width : Ti.UI.FILL,
			height : 49,
			backgroundColor : '#552c87',
			opacity : 0.9,
			children : [{
				xtype : 'button',
				id : 'home-switch',
				left : 9,
				width : 27,
				height : 27,
				bubbleParent : false,
				style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
				backgroundImage : '/images/icon/menuleft.png'
			}, {
				xtype : 'button',
				id : 'home-refresh',
				right : 9,
				width : 27,
				height : 27,
				style : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
				backgroundImage : '/images/icon/refresh.png'
			}, {
				xtype : 'label',
				//width : Ti.Platform.getDisplayCaps().width,
				width : Ti.UI.SIZE,
				height : Ti.UI.SIZE,
				text : 'Home',
				//textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
				color : '#fff',
				font : {
					fontSize : 16,
					fontFamily : 'Roboto-Regular'
				}
			}]
		},{
			xtype : 'view',
			top:49,
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			children:[{
				xtype : 'label',
				id:'device-token',
				width : Ti.UI.SIZE,
				height : Ti.UI.SIZE,
				text : deviceToken,
				color : '#fff',
				font : {
					fontSize : 16,
					fontFamily : 'Roboto-Regular'
				}
			}]
		}]
	};
};
