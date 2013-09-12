exports.init = function() {
    var scope = this;
    $('#announcement-switch').click(function(e) {
        scope.document.get(0).sliderChange();
        e.bubbles = false;
    });
    //this.document.open();
    this.document.attr('targetWin', $('#container').get(0));
    $('#container').append(this.document);
};
