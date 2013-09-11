exports.view = function() {
	return {
		xtype : 'window',
		id : 'container',
		exitOnClose : true,
		navBarHidden : true,
		backgroundColor : '#302631',
		children : [{
			xtype : 'datacontainer',
			id : 'main-menu',
			base : 'scroll',
			width : 263,
			left : 0,
			top : 13,
			bottom : 10,
			layout : 'vertical',
			children : {
				source : 'MenuItem',
				template : {
					xtype : 'view',
					left : 0,
					width : Ti.UI.FILL,
					height : Ti.UI.SIZE,
					layout : 'vertical',
					children : [{
						xtype : 'view',
						top : 15,
						left : 0,
						width : Ti.UI.FILL,
						height : 35,
						children : [{
							xtype : 'label',
							left : 58,
							height : Ti.UI.SIZE,
							type : '{$Type}',
							text : '{$Name}',
							color : '#fff',
							font : {
								fontSize : 22,
								fontFamily : 'Roboto-Light'
							}
						}]
					}, {
						xtype : 'view',
						left : 58,
						height : 0.5,
						width : Ti.UI.FILL,
						backgroundColor : '#3b393f'
					}, {
						xtype : 'datacontainer',
						left : 0,
						width : Ti.UI.FILL,
						height : Ti.UI.SIZE,
						layout : 'vertical',
						children : {
							source : 'MenuItem>Children',
							template : {
								xtype : 'view',
								left : 0,
								top : 5,
								width : Ti.UI.FILL,
								height : 33,
								children : [{
									xtype : 'label',
									left : 58,
									width : Ti.UI.SIZE,
									height : Ti.UI.SIZE,
									type : '{$Type}',
									text : '{$Name}',
									color : '#fff',
									font : {
										fontSize : 15,
										fontFamily : 'Roboto-Thin'
									},
								}]
							}
						}
					}]
				}
			}
		}]
	};
};
