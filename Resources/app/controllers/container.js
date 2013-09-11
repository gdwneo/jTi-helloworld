exports.models = ['MenuItem'];

exports.init = function() {
    var scope = this;
    $('#main-menu').click(function(e) {
        if (e.source.type) {
            console.log('loading ' + e.source.type);
            scope.controller(e.source.type).document.get(0).sliderChange();
        }
    });
    $('#main-menu').get(0).onLoadComplete = function() {
        var home = $("label[type='home']", this);
        $('#main-menu').click({
            source : home.get(0)
        });
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
    //this.controller('home').document.get(0).sliderChange();
};

exports.dispose = function() {
    this.document.remove();
};
