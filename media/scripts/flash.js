function playSound(sndFile) {
    $("#beatlab").get(0).playSound(sndFile, 1);
}

$(document).ready(function() {

    $('.player').delegate('.note .note-inner', 'click', function(e) {
        e.preventDefault();
        $(this).addClass('on');
    });

    var flashvars = {};
    var params = {allowscriptaccess: "always"};
    var attributes = {id: "beatlab", name: "beatlab"}
    swfobject.embedSWF("media/flash/BeatLab.swf", "beatlab-cont", "0", "0", "9.0.0", "expressInstall.swf", flashvars, params, attributes);
});
