package {
    import flash.display.Sprite;
    import flash.media.*;
    import flash.net.URLRequest;
    import flash.external.ExternalInterface;
    import flash.system.Security;

    public class BeatLab extends Sprite {
        public var soundMap:Object;

        //--- BASS ---

        [Embed (source = "sfx/bass/bass_A#1.mp3")] public var embed_bass_AS1:Class;
        [Embed (source = "sfx/bass/bass_A1.mp3")] public var embed_bass_A1:Class;
        [Embed (source = "sfx/bass/bass_A#2.mp3")] public var embed_bass_AS2:Class;
        [Embed (source = "sfx/bass/bass_A2.mp3")] public var embed_bass_A2:Class;
        [Embed (source = "sfx/bass/bass_B1.mp3")] public var embed_bass_B1:Class;
        [Embed (source = "sfx/bass/bass_B2.mp3")] public var embed_bass_B2:Class;
        [Embed (source = "sfx/bass/bass_C#1.mp3")] public var embed_bass_CS1:Class;
        [Embed (source = "sfx/bass/bass_C1.mp3")] public var embed_bass_C1:Class;
        [Embed (source = "sfx/bass/bass_C#2.mp3")] public var embed_bass_CS2:Class;
        [Embed (source = "sfx/bass/bass_C2.mp3")] public var embed_bass_C2:Class;
        [Embed (source = "sfx/bass/bass_C3.mp3")] public var embed_bass_C3:Class;
        [Embed (source = "sfx/bass/bass_D#1.mp3")] public var embed_bass_DS1:Class;
        [Embed (source = "sfx/bass/bass_D1.mp3")] public var embed_bass_D1:Class;
        [Embed (source = "sfx/bass/bass_D#2.mp3")] public var embed_bass_DS2:Class;
        [Embed (source = "sfx/bass/bass_D2.mp3")] public var embed_bass_D2:Class;
        [Embed (source = "sfx/bass/bass_E1.mp3")] public var embed_bass_E1:Class;
        [Embed (source = "sfx/bass/bass_E2.mp3")] public var embed_bass_E2:Class;
        [Embed (source = "sfx/bass/bass_F#1.mp3")] public var embed_bass_FS1:Class;
        [Embed (source = "sfx/bass/bass_F1.mp3")] public var embed_bass_F1:Class;
        [Embed (source = "sfx/bass/bass_F#2.mp3")] public var embed_bass_FS2:Class;
        [Embed (source = "sfx/bass/bass_F2.mp3")] public var embed_bass_F2:Class;
        [Embed (source = "sfx/bass/bass_G#1.mp3")] public var embed_bass_GS1:Class;
        [Embed (source = "sfx/bass/bass_G1.mp3")] public var embed_bass_G1:Class;
        [Embed (source = "sfx/bass/bass_G#2.mp3")] public var embed_bass_GS2:Class;
        [Embed (source = "sfx/bass/bass_G2.mp3")] public var embed_bass_G2:Class;

        public var bass_AS1:Sound;
        public var bass_A1:Sound;
        public var bass_AS2:Sound;
        public var bass_A2:Sound;
        public var bass_B1:Sound;
        public var bass_B2:Sound;
        public var bass_CS1:Sound;
        public var bass_C1:Sound;
        public var bass_CS2:Sound;
        public var bass_C2:Sound;
        public var bass_C3:Sound;
        public var bass_DS1:Sound;
        public var bass_D1:Sound;
        public var bass_DS2:Sound;
        public var bass_D2:Sound;
        public var bass_E1:Sound;
        public var bass_E2:Sound;
        public var bass_FS1:Sound;
        public var bass_F1:Sound;
        public var bass_FS2:Sound;
        public var bass_F2:Sound;
        public var bass_GS1:Sound;
        public var bass_G1:Sound;
        public var bass_GS2:Sound;
        public var bass_G2:Sound;

        //--- DJ ---

        [Embed (source = "sfx/dj/dj-scratch-high.mp3")] public var embed_dj_scratch_high:Class;
        [Embed (source = "sfx/dj/dj-scratch-low.mp3")] public var embed_dj_scratch_low:Class;
        [Embed (source = "sfx/dj/dj-scratch-medium.mp3")] public var embed_dj_scratch_medium:Class;
        [Embed (source = "sfx/dj/dj-swish.mp3")] public var embed_dj_swish:Class;
        [Embed (source = "sfx/dj/dj-throb2.mp3")] public var embed_dj_throb2:Class;
        [Embed (source = "sfx/dj/dj-throb.mp3")] public var embed_dj_throb:Class;

        public var dj_scratch_high:Sound;
        public var dj_scratch_low:Sound;
        public var dj_scratch_medium:Sound;
        public var dj_swish:Sound;
        public var dj_throb2:Sound;
        public var dj_throb:Sound;

        //--- DRUM KIT ---

        [Embed (source = "sfx/drumkit/crash.mp3")] public var embed_crash:Class;
        [Embed (source = "sfx/drumkit/crash-mute.mp3")] public var embed_crash_mute:Class;
        [Embed (source = "sfx/drumkit/hihat.mp3")] public var embed_hihat:Class;
        [Embed (source = "sfx/drumkit/hihat-open.mp3")] public var embed_hihat_open:Class;
        [Embed (source = "sfx/drumkit/kick.mp3")] public var embed_kick:Class;
        [Embed (source = "sfx/drumkit/rimshot.mp3")] public var embed_rimshot:Class;
        [Embed (source = "sfx/drumkit/snare.mp3")] public var embed_snare:Class;
        [Embed (source = "sfx/drumkit/tom-high.mp3")] public var embed_tom_high:Class;
        [Embed (source = "sfx/drumkit/tom-low.mp3")] public var embed_tom_low:Class;
        [Embed (source = "sfx/drumkit/tom-med.mp3")] public var embed_tom_med:Class;

        public var crash:Sound;
        public var crash_mute:Sound;
        public var hihat:Sound;
        public var hihat_open:Sound;
        public var kick:Sound;
        public var rimshot:Sound;
        public var snare:Sound;
        public var tom_high:Sound;
        public var tom_low:Sound;
        public var tom_med:Sound;

        //--- FX ---
        [Embed (source = "sfx/fx/alert.mp3")] public var embed_alert:Class;
        [Embed (source = "sfx/fx/machine-high.mp3")] public var embed_machine_high:Class;
        [Embed (source = "sfx/fx/machine-low.mp3")] public var embed_machine_low:Class;
        [Embed (source = "sfx/fx/machine-med.mp3")] public var embed_machine_med:Class;
        [Embed (source = "sfx/fx/noise-high.mp3")] public var embed_noise_high:Class;
        [Embed (source = "sfx/fx/noise-low.mp3")] public var embed_noise_low:Class;
        [Embed (source = "sfx/fx/pulse.mp3")] public var embed_pulse:Class;
        [Embed (source = "sfx/fx/raygun2.mp3")] public var embed_raygun2:Class;
        [Embed (source = "sfx/fx/raygun3.mp3")] public var embed_raygun3:Class;
        [Embed (source = "sfx/fx/raygun.mp3")] public var embed_raygun:Class;
        [Embed (source = "sfx/fx/swish.mp3")] public var embed_swish:Class;

        public var alert:Sound;
        public var machine_high:Sound;
        public var machine_low:Sound;
        public var machine_med:Sound;
        public var noise_high:Sound;
        public var noise_low:Sound;
        public var pulse:Sound;
        public var raygun2:Sound;
        public var raygun3:Sound;
        public var raygun:Sound;
        public var swish:Sound;

        //--- LEAD ---
        [Embed (source = "sfx/lead/A#2.mp3")] public var embed_lead_AS2:Class;
        [Embed (source = "sfx/lead/A2.mp3")] public var embed_lead_A2:Class;
        [Embed (source = "sfx/lead/A#3.mp3")] public var embed_lead_AS3:Class;
        [Embed (source = "sfx/lead/A3.mp3")] public var embed_lead_A3:Class;
        [Embed (source = "sfx/lead/B2.mp3")] public var embed_lead_B2:Class;
        [Embed (source = "sfx/lead/B3.mp3")] public var embed_lead_B3:Class;
        [Embed (source = "sfx/lead/C#2.mp3")] public var embed_lead_CS2:Class;
        [Embed (source = "sfx/lead/C2.mp3")] public var embed_lead_C2:Class;
        [Embed (source = "sfx/lead/C#3.mp3")] public var embed_lead_CS3:Class;
        [Embed (source = "sfx/lead/C3.mp3")] public var embed_lead_C3:Class;
        [Embed (source = "sfx/lead/C4.mp3")] public var embed_lead_C4:Class;
        [Embed (source = "sfx/lead/D#2.mp3")] public var embed_lead_DS2:Class;
        [Embed (source = "sfx/lead/D2.mp3")] public var embed_lead_D2:Class;
        [Embed (source = "sfx/lead/D#3.mp3")] public var embed_lead_DS3:Class;
        [Embed (source = "sfx/lead/D3.mp3")] public var embed_lead_D3:Class;
        [Embed (source = "sfx/lead/E2.mp3")] public var embed_lead_E2:Class;
        [Embed (source = "sfx/lead/E3.mp3")] public var embed_lead_E3:Class;
        [Embed (source = "sfx/lead/F#2.mp3")] public var embed_lead_FS2:Class;
        [Embed (source = "sfx/lead/F2.mp3")] public var embed_lead_F2:Class;
        [Embed (source = "sfx/lead/F#3.mp3")] public var embed_lead_FS3:Class;
        [Embed (source = "sfx/lead/F3.mp3")] public var embed_lead_F3:Class;
        [Embed (source = "sfx/lead/G#2.mp3")] public var embed_lead_GS2:Class;
        [Embed (source = "sfx/lead/G2.mp3")] public var embed_lead_G2:Class;
        [Embed (source = "sfx/lead/G#3.mp3")] public var embed_lead_GS3:Class;
        [Embed (source = "sfx/lead/G3.mp3")] public var embed_lead_G3:Class;

        public var lead_AS2:Sound;
        public var lead_A2:Sound;
        public var lead_AS3:Sound;
        public var lead_A3:Sound;
        public var lead_B2:Sound;
        public var lead_B3:Sound;
        public var lead_CS2:Sound;
        public var lead_C2:Sound;
        public var lead_CS3:Sound;
        public var lead_C3:Sound;
        public var lead_C4:Sound;
        public var lead_DS2:Sound;
        public var lead_D2:Sound;
        public var lead_DS3:Sound;
        public var lead_D3:Sound;
        public var lead_E2:Sound;
        public var lead_E3:Sound;
        public var lead_FS2:Sound;
        public var lead_F2:Sound;
        public var lead_FS3:Sound;
        public var lead_F3:Sound;
        public var lead_GS2:Sound;
        public var lead_G2:Sound;
        public var lead_GS3:Sound;
        public var lead_G3:Sound;

        //--- PERCS ---
        [Embed (source = "sfx/percs/bell1.mp3")] public var embed_bell1:Class;
        [Embed (source = "sfx/percs/bell2.mp3")] public var embed_bell2:Class;
        [Embed (source = "sfx/percs/clap.mp3")] public var embed_clap:Class;
        [Embed (source = "sfx/percs/hand1.mp3")] public var embed_hand1:Class;
        [Embed (source = "sfx/percs/hand2.mp3")] public var embed_hand2:Class;

        public var bell1:Sound;
        public var bell2:Sound;
        public var clap:Sound;
        public var hand1:Sound;
        public var hand2:Sound;

        //--- SINE ----
        [Embed (source = "sfx/sine/sine_short_A#4.mp3")] public var embed_sine_short_AS4:Class;
        [Embed (source = "sfx/sine/sine_short_A4.mp3")] public var embed_sine_short_A4:Class;
        [Embed (source = "sfx/sine/sine_short_A#5.mp3")] public var embed_sine_short_AS5:Class;
        [Embed (source = "sfx/sine/sine_short_A5.mp3")] public var embed_sine_short_A5:Class;
        [Embed (source = "sfx/sine/sine_short_B4.mp3")] public var embed_sine_short_B4:Class;
        [Embed (source = "sfx/sine/sine_short_B5.mp3")] public var embed_sine_short_B5:Class;
        [Embed (source = "sfx/sine/sine_short_C#4.mp3")] public var embed_sine_short_CS4:Class;
        [Embed (source = "sfx/sine/sine_short_C4.mp3")] public var embed_sine_short_C4:Class;
        [Embed (source = "sfx/sine/sine_short_C#5.mp3")] public var embed_sine_short_CS5:Class;
        [Embed (source = "sfx/sine/sine_short_C5.mp3")] public var embed_sine_short_C5:Class;
        [Embed (source = "sfx/sine/sine_short_C6.mp3")] public var embed_sine_short_C6:Class;
        [Embed (source = "sfx/sine/sine_short_D#4.mp3")] public var embed_sine_short_DS4:Class;
        [Embed (source = "sfx/sine/sine_short_D4.mp3")] public var embed_sine_short_D4:Class;
        [Embed (source = "sfx/sine/sine_short_D#5.mp3")] public var embed_sine_short_DS5:Class;
        [Embed (source = "sfx/sine/sine_short_D5.mp3")] public var embed_sine_short_D5:Class;
        [Embed (source = "sfx/sine/sine_short_E4.mp3")] public var embed_sine_short_E4:Class;
        [Embed (source = "sfx/sine/sine_short_E5.mp3")] public var embed_sine_short_E5:Class;
        [Embed (source = "sfx/sine/sine_short_F#4.mp3")] public var embed_sine_short_FS4:Class;
        [Embed (source = "sfx/sine/sine_short_F4.mp3")] public var embed_sine_short_F4:Class;
        [Embed (source = "sfx/sine/sine_short_F#5.mp3")] public var embed_sine_short_FS5:Class;
        [Embed (source = "sfx/sine/sine_short_F5.mp3")] public var embed_sine_short_F5:Class;
        [Embed (source = "sfx/sine/sine_short_G#4.mp3")] public var embed_sine_short_GS4:Class;
        [Embed (source = "sfx/sine/sine_short_G4.mp3")] public var embed_sine_short_G4:Class;
        [Embed (source = "sfx/sine/sine_short_G#5.mp3")] public var embed_sine_short_GS5:Class;
        [Embed (source = "sfx/sine/sine_short_G5.mp3")] public var embed_sine_short_G5:Class;

        public var sine_short_AS4:Sound;
        public var sine_short_A4:Sound;
        public var sine_short_AS5:Sound;
        public var sine_short_A5:Sound;
        public var sine_short_B4:Sound;
        public var sine_short_B5:Sound;
        public var sine_short_CS4:Sound;
        public var sine_short_C4:Sound;
        public var sine_short_CS5:Sound;
        public var sine_short_C5:Sound;
        public var sine_short_C6:Sound;
        public var sine_short_DS4:Sound;
        public var sine_short_D4:Sound;
        public var sine_short_DS5:Sound;
        public var sine_short_D5:Sound;
        public var sine_short_E4:Sound;
        public var sine_short_E5:Sound;
        public var sine_short_FS4:Sound;
        public var sine_short_F4:Sound;
        public var sine_short_FS5:Sound;
        public var sine_short_F5:Sound;
        public var sine_short_GS4:Sound;
        public var sine_short_G4:Sound;
        public var sine_short_GS5:Sound;
        public var sine_short_G5:Sound;

        public function BeatLab() {
            Security.allowDomain("*");

            soundMap = new Object();

            // BASS
            bass_AS1 = new embed_bass_AS1() as Sound; soundMap["bass_A#1.mp3"] = bass_AS1;
            bass_A1 = new embed_bass_A1() as Sound; soundMap["bass_A1.mp3"] = bass_A1;
            bass_AS2 = new embed_bass_AS2() as Sound; soundMap["bass_A#2.mp3"] = bass_AS2;
            bass_A2 = new embed_bass_A2() as Sound; soundMap["bass_A2.mp3"] = bass_A2;
            bass_B1 = new embed_bass_B1() as Sound; soundMap["bass_B1.mp3"] = bass_B1;
            bass_B2 = new embed_bass_B2() as Sound; soundMap["bass_B2.mp3"] = bass_B2;
            bass_CS1 = new embed_bass_CS1() as Sound; soundMap["bass_C#1.mp3"] = bass_CS1;
            bass_C1 = new embed_bass_C1() as Sound; soundMap["bass_C1.mp3"] = bass_C1;
            bass_CS2 = new embed_bass_CS2() as Sound; soundMap["bass_C#2.mp3"] = bass_CS2;
            bass_C2 = new embed_bass_C2() as Sound; soundMap["bass_C2.mp3"] = bass_C2;
            bass_C3 = new embed_bass_C3() as Sound; soundMap["bass_C3.mp3"] = bass_C3;
            bass_DS1 = new embed_bass_DS1() as Sound; soundMap["bass_D#1.mp3"] = bass_DS1;
            bass_D1 = new embed_bass_D1() as Sound; soundMap["bass_D1.mp3"] = bass_D1;
            bass_DS2 = new embed_bass_DS2() as Sound; soundMap["bass_D#2.mp3"] = bass_DS2;
            bass_D2 = new embed_bass_D2() as Sound; soundMap["bass_D2.mp3"] = bass_D2;
            bass_E1 = new embed_bass_E1() as Sound; soundMap["bass_E1.mp3"] = bass_E1;
            bass_E2 = new embed_bass_E2() as Sound; soundMap["bass_E2.mp3"] = bass_E2;
            bass_FS1 = new embed_bass_FS1() as Sound; soundMap["bass_F#1.mp3"] = bass_FS1;
            bass_F1 = new embed_bass_F1() as Sound; soundMap["bass_F1.mp3"] = bass_F1;
            bass_FS2 = new embed_bass_FS2() as Sound; soundMap["bass_F#2.mp3"] = bass_FS2;
            bass_F2 = new embed_bass_F2() as Sound; soundMap["bass_F2.mp3"] = bass_F2;
            bass_GS1 = new embed_bass_GS1() as Sound; soundMap["bass_G#1.mp3"] = bass_GS1;
            bass_G1 = new embed_bass_G1() as Sound; soundMap["bass_G1.mp3"] = bass_G1;
            bass_GS2 = new embed_bass_GS2() as Sound; soundMap["bass_G#2.mp3"] = bass_GS2;
            bass_G2 = new embed_bass_G2() as Sound; soundMap["bass_G2.mp3"] = bass_G2;

            // DJ
            dj_scratch_high = new embed_dj_scratch_high() as Sound; soundMap["dj-scratch-high.mp3"] = dj_scratch_high;
            dj_scratch_low = new embed_dj_scratch_low() as Sound; soundMap["dj-scratch-low.mp3"] = dj_scratch_low;
            dj_scratch_medium = new embed_dj_scratch_medium() as Sound; soundMap["dj-scratch-medium.mp3"] = dj_scratch_medium;
            dj_swish = new embed_dj_swish() as Sound; soundMap["dj-swish.mp3"] = dj_swish;
            dj_throb2 = new embed_dj_throb2() as Sound; soundMap["dj-throb2.mp3"] = dj_throb2;
            dj_throb = new embed_dj_throb() as Sound; soundMap["dj-throb.mp3"] = dj_throb;

            // DRUMKIT
            crash = new embed_crash() as Sound; soundMap["crash.mp3"] = crash;
            crash_mute = new embed_crash_mute() as Sound; soundMap["crash-mute.mp3"] = crash_mute;
            hihat = new embed_hihat() as Sound; soundMap["hihat.mp3"] = hihat;
            hihat_open = new embed_hihat_open() as Sound; soundMap["hihat-open.mp3"] = hihat_open;
            kick = new embed_kick() as Sound; soundMap["kick.mp3"] = kick;
            rimshot = new embed_rimshot() as Sound; soundMap["rimshot.mp3"] = rimshot;
            snare = new embed_snare() as Sound; soundMap["snare.mp3"] = snare;
            tom_high = new embed_tom_high() as Sound; soundMap["tom-high.mp3"] = tom_high;
            tom_low = new embed_tom_low() as Sound; soundMap["tom-low.mp3"] = tom_low;
            tom_med = new embed_tom_med() as Sound; soundMap["tom-med.mp3"] = tom_med;

            // FX
            alert = new embed_alert() as Sound; soundMap["alert.mp3"] = alert;
            machine_high = new embed_machine_high() as Sound; soundMap["machine-high.mp3"] = machine_high;
            machine_low = new embed_machine_low() as Sound; soundMap["machine-low.mp3"] = machine_low;
            machine_med = new embed_machine_med() as Sound; soundMap["machine-med.mp3"] = machine_med;
            noise_high = new embed_noise_high() as Sound; soundMap["noise-high.mp3"] = noise_high;
            noise_low = new embed_noise_low() as Sound; soundMap["noise-low.mp3"] = noise_low;
            pulse = new embed_pulse() as Sound; soundMap["pulse.mp3"] = pulse;
            raygun2 = new embed_raygun2() as Sound; soundMap["raygun2.mp3"] = raygun2;
            raygun3 = new embed_raygun3() as Sound; soundMap["raygun3.mp3"] = raygun3;
            raygun = new embed_raygun() as Sound; soundMap["raygun.mp3"] = raygun;
            swish = new embed_swish() as Sound; soundMap["swish.mp3"] = swish;

            // LEAD
            lead_AS2 = new embed_lead_AS2() as Sound; soundMap["A#2.mp3"] = lead_AS2;
            lead_A2 = new embed_lead_A2() as Sound; soundMap["A2.mp3"] = lead_A2;
            lead_AS3 = new embed_lead_AS3() as Sound; soundMap["A#3.mp3"] = lead_AS3;
            lead_A3 = new embed_lead_A3() as Sound; soundMap["A3.mp3"] = lead_A3;
            lead_B2 = new embed_lead_B2() as Sound; soundMap["B2.mp3"] = lead_B2;
            lead_B3 = new embed_lead_B3() as Sound; soundMap["B3.mp3"] = lead_B3;
            lead_CS2 = new embed_lead_CS2() as Sound; soundMap["C#2.mp3"] = lead_CS2;
            lead_C2 = new embed_lead_C2() as Sound; soundMap["C2.mp3"] = lead_C2;
            lead_CS3 = new embed_lead_CS3() as Sound; soundMap["C#3.mp3"] = lead_CS3;
            lead_C3 = new embed_lead_C3() as Sound; soundMap["C3.mp3"] = lead_C3;
            lead_C4 = new embed_lead_C4() as Sound; soundMap["C4.mp3"] = lead_C4;
            lead_DS2 = new embed_lead_DS2() as Sound; soundMap["D#2.mp3"] = lead_DS2;
            lead_D2 = new embed_lead_D2() as Sound; soundMap["D2.mp3"] = lead_D2;
            lead_DS3 = new embed_lead_DS3() as Sound; soundMap["D#3.mp3"] = lead_DS3;
            lead_D3 = new embed_lead_D3() as Sound; soundMap["D3.mp3"] = lead_D3;
            lead_E2 = new embed_lead_E2() as Sound; soundMap["E2.mp3"] = lead_E2;
            lead_E3 = new embed_lead_E3() as Sound; soundMap["E3.mp3"] = lead_E3;
            lead_FS2 = new embed_lead_FS2() as Sound; soundMap["F#2.mp3"] = lead_FS2;
            lead_F2 = new embed_lead_F2() as Sound; soundMap["F2.mp3"] = lead_F2;
            lead_FS3 = new embed_lead_FS3() as Sound; soundMap["F#3.mp3"] = lead_FS3;
            lead_F3 = new embed_lead_F3() as Sound; soundMap["F3.mp3"] = lead_F3;
            lead_GS2 = new embed_lead_GS2() as Sound; soundMap["G#2.mp3"] = lead_GS2;
            lead_G2 = new embed_lead_G2() as Sound; soundMap["G2.mp3"] = lead_G2;
            lead_GS3 = new embed_lead_GS3() as Sound; soundMap["G#3.mp3"] = lead_GS3;
            lead_G3 = new embed_lead_G3() as Sound; soundMap["G3.mp3"] = lead_G3;

            // PERCS
            bell1 = new embed_bell1() as Sound; soundMap["bell1.mp3"] = bell1;
            bell2 = new embed_bell2() as Sound; soundMap["bell2.mp3"] = bell2;
            clap = new embed_clap() as Sound; soundMap["clap.mp3"] = clap;
            hand1 = new embed_hand1() as Sound; soundMap["hand1.mp3"] = hand1;
            hand2 = new embed_hand2() as Sound; soundMap["hand2.mp3"] = hand2;

            // SINE
            sine_short_AS4 = new embed_sine_short_AS4() as Sound; soundMap["sine_short_A#4.mp3"] = sine_short_AS4;
            sine_short_A4 = new embed_sine_short_A4() as Sound; soundMap["sine_short_A4.mp3"] = sine_short_A4;
            sine_short_AS5 = new embed_sine_short_AS5() as Sound; soundMap["sine_short_A#5.mp3"] = sine_short_AS5;
            sine_short_A5 = new embed_sine_short_A5() as Sound; soundMap["sine_short_A5.mp3"] = sine_short_A5;
            sine_short_B4 = new embed_sine_short_B4() as Sound; soundMap["sine_short_B4.mp3"] = sine_short_B4;
            sine_short_B5 = new embed_sine_short_B5() as Sound; soundMap["sine_short_B5.mp3"] = sine_short_B5;
            sine_short_CS4 = new embed_sine_short_CS4() as Sound; soundMap["sine_short_C#4.mp3"] = sine_short_CS4;
            sine_short_C4 = new embed_sine_short_C4() as Sound; soundMap["sine_short_C4.mp3"] = sine_short_C4;
            sine_short_CS5 = new embed_sine_short_CS5() as Sound; soundMap["sine_short_C#5.mp3"] = sine_short_CS5;
            sine_short_C5 = new embed_sine_short_C5() as Sound; soundMap["sine_short_C5.mp3"] = sine_short_C5;
            sine_short_C6 = new embed_sine_short_C6() as Sound; soundMap["sine_short_C6.mp3"] = sine_short_C6;
            sine_short_DS4 = new embed_sine_short_DS4() as Sound; soundMap["sine_short_D#4.mp3"] = sine_short_DS4;
            sine_short_D4 = new embed_sine_short_D4() as Sound; soundMap["sine_short_D4.mp3"] = sine_short_D4;
            sine_short_DS5 = new embed_sine_short_DS5() as Sound; soundMap["sine_short_D#5.mp3"] = sine_short_DS5;
            sine_short_D5 = new embed_sine_short_D5() as Sound; soundMap["sine_short_D5.mp3"] = sine_short_D5;
            sine_short_E4 = new embed_sine_short_E4() as Sound; soundMap["sine_short_E4.mp3"] = sine_short_E4;
            sine_short_E5 = new embed_sine_short_E5() as Sound; soundMap["sine_short_E5.mp3"] = sine_short_E5;
            sine_short_FS4 = new embed_sine_short_FS4() as Sound; soundMap["sine_short_F#4.mp3"] = sine_short_FS4;
            sine_short_F4 = new embed_sine_short_F4() as Sound; soundMap["sine_short_F4.mp3"] = sine_short_F4;
            sine_short_FS5 = new embed_sine_short_FS5() as Sound; soundMap["sine_short_F#5.mp3"] = sine_short_FS5;
            sine_short_F5 = new embed_sine_short_F5() as Sound; soundMap["sine_short_F5.mp3"] = sine_short_F5;
            sine_short_GS4 = new embed_sine_short_GS4() as Sound; soundMap["sine_short_G#4.mp3"] = sine_short_GS4;
            sine_short_G4 = new embed_sine_short_G4() as Sound; soundMap["sine_short_G4.mp3"] = sine_short_G4;
            sine_short_GS5 = new embed_sine_short_GS5() as Sound; soundMap["sine_short_G#5.mp3"] = sine_short_GS5;
            sine_short_G5 = new embed_sine_short_G5() as Sound; soundMap["sine_short_G5.mp3"] = sine_short_G5;

            ExternalInterface.addCallback("playSound", playSound);
            /*
            if (ExternalInterface.available) {
                ExternalInterface.call("say_txt", "YEAAH DONE LOADING SOUNDS!");
            }
            */
        }

        public function playSound(snd:String, vol:Number):void {

            // Worst switch statement in human history
            if(soundMap.hasOwnProperty(snd)) {
                soundMap[snd].play();
            }
        }
    }
}
