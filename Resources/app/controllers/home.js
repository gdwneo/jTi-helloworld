exports.init = function() {
    var scope = this;
    $('#home-switch').click(function(e) {
        scope.document.get(0).sliderChange();
        e.bubbles = false;
    });
    //this.document.open();
    this.document.attr('targetWin', $('#container').get(0));
    $('#container').append(this.document);
    console.log(new Date());
    this.document.animate({
        left : 0,
        duration : 500
    }, function() {
        console.log(new Date());
    });
};
