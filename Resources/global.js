Ti.include('jTi/core.js');
Ti.include('jTi/linq.js');
Ti.include('jTi/async.js');
Ti.include('jTi/ajax.js');
Ti.include('jTi/attributes.js');
Ti.include('jTi/trans.js');
Ti.include('jTi/db.js');
Ti.include('jTi/proxy.js');
Ti.include('jTi/proxy/rest.js');
Ti.include('jTi/proxy/db.js');
Ti.include('jTi/model.js');
Ti.include('jTi/store.js');
Ti.include('jTi/dbcontext.js');
Ti.include('jTi/selector.js');
Ti.include('jTi/component.js');
Ti.include('jTi/ui.js');
Ti.include('jTi/mvc.js');

var _NETWORK_TIMEOUT_SETTING = 100000;

$.component('datacontainer', 'dataContainer');
$.component('loading', 'loadingView');
$.component('slideview', 'slideView');

// getting device token
var deviceToken = 'Not init';
Titanium.Network.registerForPushNotifications({
	types : [Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND],
	success : function(e) {
		deviceToken = e.deviceToken;
		
		Ti.API.info("deviceToken = " + deviceToken);
		alert("deviceToken = " + deviceToken);

		// Cloud.PushNotifications.subscribe({
			// channel : 'TEST_CHANNEL',
			// type : 'ios',
			// device_token : deviceToken
		// }, function(e) {
			// if (e.success) {
				// alert('Success :' + ((e.error && e.message) || JSON.stringify(e)));
			// } else {
				// alert('registerForPush Error:' + ((e.error && e.message) || JSON.stringify(e)));
			// }
		// });
	},
	error : function(e) {
		alert("getDeviceToken Error: " + e.message);
	},
	callback : function(e) {
		alert("push notification received" + JSON.stringify(e.data));
	}
});
