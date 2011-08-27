package {
    import flash.display.Sprite;
    import flash.media.*;
    import flash.net.URLRequest;
    import flash.external.ExternalInterface;
    import flash.system.Security;

    public class BeatLab extends Sprite {
        [Embed (source = "sfx2/dj2/dj-throb.mp3")] public var DJThrob:Class;
        [Embed (source = "sfx2/dj2/dj-swish.mp3")] public var DJSwish:Class;
        [Embed (source = "sfx2/drumkit2/crash.mp3")] public var Crash:Class;
        [Embed (source = "sfx2/drumkit2/hh.mp3")] public var HH:Class;
        [Embed (source = "sfx2/drumkit2/tom-high.mp3")] public var TomHigh:Class;

        public var dj_throb:Sound;
        public var dj_swish:Sound;
        public var crash:Sound;
        public var hh:Sound;
        public var tom_high:Sound;
 
        public function BeatLab() {
            Security.allowDomain("*");

            dj_throb = new DJThrob() as Sound;
            dj_swish= new DJSwish() as Sound;
            crash = new Crash() as Sound;
            hh = new HH() as Sound;
            tom_high = new TomHigh() as Sound;

            ExternalInterface.addCallback("playSound", playSound);
            /*
            if (ExternalInterface.available) {
                ExternalInterface.call("say_txt", "YEAAH DONE LOADING SOUNDS!");
            }
            */
        }

        public function playSound(snd:String, vol:Number):void {
            var newChannel:SoundChannel = new SoundChannel();
            var newTransform:SoundTransform = new SoundTransform();
            newTransform.volume = vol;

            switch(snd) {
                case "dj_throb":
                    newChannel = dj_throb.play();
                    break;
                case "dj_swish":
                    newChannel = dj_swish.play();
                    break;
                case "crash":
                    newChannel = crash.play();
                    break;
                case "hh":
                    newChannel = hh.play();
                    break;
                case "tom_high":
                    newChannel = tom_high.play();
                    break;
            }
            newChannel.soundTransform = newTransform;
        }
    }
}
