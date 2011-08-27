function playSound(sndFile) {
    $("#beatlab").get(0).playSound(sndFile, 1);
}

$(document).ready(function() {
    var flashvars = {};
    var params = {allowscriptaccess: "always"};
    var attributes = {id: "beatlab", name: "beatlab"}
    swfobject.embedSWF("media/flash/BeatLab.swf", "beatlab-cont", "0", "0", "9.0.0", "expressInstall.swf", flashvars, params, attributes);
});
