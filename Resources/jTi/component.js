(function(jTi) {
	var componentDir = 'components', componentDic = {
		'2dmatrix' : Ti.UI.create2DMatrix,
		'3dmatrix' : Ti.UI.create3DMatrix,
		'loading' : Ti.UI.createActivityIndicator,
		'alert' : Ti.UI.createAlertDialog,
		'animation' : Ti.UI.createAnimation,
		'button' : Ti.UI.createButton,
		'buttonbar' : Ti.UI.createButtonBar,
		'coverflow' : Ti.UI.createCoverFlowView,
		'dashboarditem' : Ti.UI.createDashboardItem,
		'dashboard' : Ti.UI.createDashboardView,
		'email' : Ti.UI.createEmailDialog,
		'image' : Ti.UI.createImageView,
		'label' : Ti.UI.createLabel,
		'listsection' : Ti.UI.createListSection,
		'list' : Ti.UI.createListView,
		'maskedimage' : Ti.UI.createMaskedImage,
		'notification' : Ti.UI.createNotification,
		'option' : Ti.UI.createOptionDialog,
		'picker' : Ti.UI.createPicker,
		'pickercolumn' : Ti.UI.createPickerColumn,
		'pickerrow' : Ti.UI.createPickerRow,
		'progress' : Ti.UI.createProgressBar,
		'scroll' : Ti.UI.createScrollView,
		'scrollable' : Ti.UI.createScrollableView,
		'search' : Ti.UI.createSearchBar,
		'slider' : Ti.UI.createSlider,
		'switch' : Ti.UI.createSwitch,
		'tab' : Ti.UI.createTab,
		'tabgroup' : Ti.UI.createTabGroup,
		'tabbedbar' : Ti.UI.createTabbedBar,
		'table' : Ti.UI.createTableView,
		'tablerow' : Ti.UI.createTableViewRow,
		'tablesection' : Ti.UI.createTableViewSection,
		'textarea' : Ti.UI.createTextArea,
		'textfield' : Ti.UI.createTextField,
		'toolbar' : Ti.UI.createToolbar,
		'view' : Ti.UI.createView,
		'webview' : Ti.UI.createWebView,
		'window' : Ti.UI.createWindow
	};
	jTi.component = function(xtype, moduleId) {
		if ( typeof (xtype) === 'string') {
			if ( typeof (moduleId) === 'string') {
				return jTi.component.register(xtype, moduleId);
			} else {
				return jTi.component.get(xtype);
			}
		} else {
			return this;
		}
	};
	jTi.extend(jTi.component, {
		register : function(xtype, moduleId) {
			var component = require(jTi.fixFolder(componentDir, moduleId));
			componentDic[xtype] = component.module;
		},
		get : function(xtype) {
			if (!componentDic.hasOwnProperty(xtype)) {
				throw new Error(L('componentNotRegister') + xtype);
			} else {
				return componentDic[xtype];
			}
		}
	});
})($);
