exports.models = ['MenuItem'];

exports.init = function() {
	var scope = this, sliderViews = [];

	function switchView(type) {
		console.log('loading ' + type);
		for (var i in sliderViews) {
			scope.controller(sliderViews[i]).document.attr('zIndex', 0);
		}
		var currentView = scope.controller(type).document;
		currentView.attr('zIndex', 30);
		//currentView.get(0).sliderChange();
		if (sliderViews.indexOf(type) < 0) {
			sliderViews.push(type);
		}
	}


	$('#main-menu').click(function(e) {
		if (e.source.type) {
			switchView(e.source.type);
		}
	});

	$('#main-menu').get(0).onLoadComplete = function() {
	};

	this.model('MenuItem').load([{
		ID : 1,
		Name : 'Home',
		Type : 'home',
		Image : null,
		Children : [{
			Type : 'latest',
			Name : 'The Latest'
		}, {
			Type : 'announcement',
			Name : 'Corporate Announcement'
		}, {
			Type : 'hello',
			Name : 'Hello'
		}, {
			Type : 'leaderblog',
			Name : 'Senior Leader\'s Blog'
		}]
	}, {
		ID : 2,
		Name : 'News Room',
		Image : null,
		Children : [{
			Type : 'word',
			Name : 'A Word Form Our Leaders'
		}, {
			Type : 'reports',
			Name : 'Media Reports'
		}, {
			Type : 'releases',
			Name : 'News Releases'
		}]
	}, {
		ID : 3,
		Name : 'Share',
		Image : null,
		Children : [{
			Type : 'brewing',
			Name : 'What\'s Brewing'
		}, {
			Type : 'blogs',
			Name : 'Blogs'
		}, {
			Type : 'forums',
			Name : 'Forums'
		}]
	}]);
	this.document.open();
	switchView('home');
};

exports.dispose = function() {
	this.document.remove();
};
