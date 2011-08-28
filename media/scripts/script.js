(function() {
    
    /* Prevents duplicate sound plays, 
     * and caches future sounds 
     * */
    soundManager = (function () {
        var toPlay = {}; // HashSet stand-in
        var cache = {};
        return {
            addFile: function(file) {
                if (!cache.file) {
                    cache[file] = file;
                }
            },
            play: function() {
                if ( !!_.size(toPlay) ) {
                    _.each(toPlay, function(name) {
                        playSound(name);
                    });
                }
                toPlay = $.extend({}, cache);
                cache = {};
            }
        };
    })();

    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    // underscore template languate settings
    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g, // {{ var }}
      evaluate: /\{\%(.+?)\%\}/g // {% expression %}
    }; 


    App = Backbone.Model.extend({
        start: function() {
            player = new Player();
            playerView = new PlayerView({model: player, el: $('.player')});
            instruments = new Instruments(instrumentsList);
            
            // Start the play loop
            // TODO maybe wrap this in a deferred for post sync
            // and post username dialog, etc
            // $.when(cond1, cond2)
            player.set({ playing: true });
            this.loopInterval = setInterval(function(){ player.play(player); }, 0);
        }
    });

    AppView = Backbone.View.extend({
        initialize: function() {
            this.model.bind('error', this.displayError);
            this.model.bind('change:user', this.loginSuccess);
        },

        events: {
            'click .login-submit': 'sendLogin',
            'keypress .username-input': 'loginInputKeypress'
        },

        loginInputKeypress: function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                this.sendLogin(e);
            }
        },

        loginSuccess: function() {
            $('.modal-screen').remove();
        },

        displayError: function(some, args, blah) {
            console.log(some, args, blah);
        },

        sendLogin: function(e) {
            e.preventDefault();
            var username = $('.username-input').val()
            socket.emit('login', new User({name: username}).toJSON());
        }
    });

    
    Player = Backbone.Model.extend({
        initialize: function() {
            this._loopInterval = null;
            this.tracks = new Tracks;
            this.tracks.player = this;
            this.megaMen = new MegaMen;
            this.megaMen.player = this;


            this.bind('change:step', this.playStep);
            this.bind('change:playing', this.toggleLoop);
        },

        defaults: {
            tracks: [],
            bpm: 120,
            step: 0,
            length: 64,
            playing: false,
        },
       
        toggleLoop: function(player, playing) {
            if (playing) {
                this._loopInterval = setInterval(function(){ player.play(player); }, 0);
            } else {
                clearInterval(this._loopInterval);
            }
        },

        syncTracks: function(data) {
            var model = this;
            _.each(data, function(track, id) {
                if (!model.tracks.get(id)) {
                    // Then add this track
                    model.createTrack(id, track.user, track.timestamp, track.instrument, track.steps);
                }
            });
        },

        createTrack: function(trackID, userObj, timestamp, instrument, steps) {
            var instrumentModel;
            instruments.each(function(anInstrument) {
                if (anInstrument.get('name') == instrument.name) {
                    instrumentModel = anInstrument;
                }
            });
            
            var track = new Track({ 
                'id': trackID, 
                'timestamp': timestamp,
                'instrument': instrumentModel,
                'user': new User(userObj)
            });

            track.fillSteps(steps);
            this.tracks.add(track);
        },

        incStep: function(inc) {
            this.set({'step': (this.get('step') + 1) % this.get('length')});
        },
        
        incBPM: function() {
            bpm = this.get('bpm');
            if (bpm == 300)
                return;
            this.set({'bpm': bpm + 5});
        },

        decBPM: function() {
            bpm = this.get('bpm');
            if (bpm == 5)
                return;
            this.set({'bpm': bpm - 5});
        },

        playStep: function() {
            var step = this.get('step');
            var model = this;
            model.tracks.each(function(track) {
                track.playStep(step);
            });
            soundManager.play()
        },
        
        play: (function() {
            var skipTicks = 60000 / 4,
                nextTick = (new Date).getTime(); // 60000ms per min / 4ticks per beat

            return function(instance) {
                //loops = 0;
                while ((new Date).getTime() > nextTick) {
                    // play the sounds
                    if (instance.get('playing')) {
                        instance.incStep(1);
                    }
                    // Loop business
                    nextTick += skipTicks / instance.get('bpm');
                }

                // stuff that we want refreshed a shit load goes here, probably nothing
            };
        })(),
    });

    PlayerView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'insertTrack', 'playStep', 'insertMegaMan', 'updateTransport', 'updateBPM');
            
            this.model.bind('change:bpm', this.updateBPM);
            this.model.bind('change:step', this.playStep);
            this.model.bind('change:playing', this.updateTransport);
            this.model.tracks.bind('add', this.insertTrack);
            this.model.tracks.add(this.model.get('tracks'));
            this.model.megaMen.bind('add', this.insertMegaMan);
            
            // draw mega man
            var state = 1
            var left = 0;
            for (var i = 0; i < 64; i++) {
                state = state ? 0 : 1;
                this.model.megaMen.add({className: 'run'+state, left: left});
                left += 15;
            }
        },
        
        className: 'player',

        template: _.template($('.player-template').html()),

        events: {
            'click .create-track': 'requestTrack',
            'click .transport': 'transport',
            'click .bpm .dial .up': 'upBPM',
            'click .bpm .dial .down': 'downBPM'
        },
      
        upBPM: function(e) {
            this.model.incBPM();
        },

        downBPM: function(e) {
            this.model.decBPM();
        },

        updateBPM: function(model, bpm) {
           $(this.el).find('.bpm .readout span').text(bpm);
        },

        playStep: function(model, stepIndex) {
            if (this.lastStep) { 
                this.lastStep.trigger('deactivate'); 
            }
            var step = this.model.megaMen.at(stepIndex);
            this.lastStep = step;
            step.trigger('activate');
        },

        transport: function(e) {
            this.model.set({ 'playing': $(e.target).closest('.transport').children(':first-child').hasClass('play') });
        },
        
        updateTransport: function(model, playing) {
            $(this.el).find('.transport').html('<div class="'+ (playing ? 'pause' : 'play') + '"></div>');
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        
        requestTrack: function(e) {
            e.preventDefault();
            socket.emit('claim', {'instrument': instruments.at(0).toJSON(), 'user': app.get('user').toJSON()})
        },

        insertTrack: function(track) {
            var trackView = new TrackView({model: track, id: track.id});
            $(this.el).find('.tracks').append(trackView.render().el);
        },

        insertMegaMan: function(megaMan) {
            var megaManView = new MegaManView({model: megaMan, className: megaMan.get('className')});
            $(this.el).find('.runner').append($(megaManView.el).css({left: megaMan.get('left')}));
        }
    });
    

    Instrument = Backbone.Model.extend({
        initialize: function() {

        },

        defaults: {
            name: 'dj',
           'sounds': [
                {'name': 'scr1', 'filename': 'dj-scratch-high.mp3'},
                {'name': 'scr2', 'filename': 'dj-scratch-medium.mp3'},
                {'name': 'scr3', 'filename': 'dj-scratch-low.mp3'},
                {'name': 'swsh', 'filename': 'dj-swish.mp3'},
                {'name': 'thrb1', 'filename': 'dj-throb.mp3'},
                {'name': 'thrb2', 'filename': 'dj-throb2.mp3'}
            ]
        }
    });

    Instruments = Backbone.Collection.extend({
        
    });

    User = Backbone.Model.extend({
        initialize: function() {

        },

        defaults: {
            name: 'eightbit',
            avatar: 'media/images/avatar-' + Math.floor(Math.random() * 7 + 1) + '.png'
        }
    });

    Track = Backbone.Model.extend({
        initialize: function() {
            this.steps = new Steps;
            this.steps.track = this;
            this.bind('change:steps', this.parseSteps);
            this.bind('change:instrument', this.sendInstrumentChange);
        },

        defaults: {
            instrument: new Instrument,
            timestamp: 0,
            user: null,
            steps: []
        },

        parseSteps: function() {
            this.steps.reset(this.get('steps'));
        },

        fillSteps: function(stepsList) {
            var i, n;
            var steps = []
            for (i = 0; i < player.get('length'); i++) {
                var notes = [];
                for (n = 0; n < this.get('instrument').get('sounds').length; n++) {
                    notes.push(!!stepsList ? stepsList[i].notes[n] : 0);
                }
                var step = new Step({notes: notes})
                steps.push(step);
            }
            this.set({steps: steps}, {silent: true});
        },

        sendInstrumentChange: function() {
            socket.emit('instrument', {trackID: this.id, instrument: this.get('instrument').toJSON()});
        },
        
        playStep: function(stepIndex) {
            var model = this;
            if (this.lastStep) { 
                this.lastStep.trigger('deactivate'); 
            }
            var step = model.steps.at(stepIndex);
            this.lastStep = step;
            var nextStep = model.steps.at((stepIndex+1)%64);
            step.trigger('activate');
            $.each(nextStep.get('notes'), function(i, note) {
                if (!!note) {
                    soundManager.addFile(model.get('instrument').get('sounds')[i]['filename']);
                }
            });
        }
    });

    TrackView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'render','insertStep', 'removeView', 'changeInstrument');
            this.model.steps.bind('add', this.insertStep);
            this.model.bind('change:instrument', this.changeInstrument);
            this.model.bind('change:steps', this.render);
            this.model.bind('remove', this.removeView);            
            this.model.steps.add(this.model.get('steps'), {silent: true});
        },
        
        className: 'track',

        template: _.template($('.track-template').html()),

        events: {
            'click .avatar': 'deleteTrack',
            'click .inst': 'selectInstrument'
        },

        selectInstrument: function(e) {
            if (app.get('user').get('name') != this.model.get('user').get('name')) { return; }

            $button = $(e.target).hasClass('inst') ? $(e.target) : $(e.target).closest('.inst');
            var instrumentCid = $button.attr('data-cid');
            $button.siblings().removeClass('active');
            $button.addClass('active');
            this.model.set({'instrument': instruments.getByCid(instrumentCid)});
        },

        deleteTrack: function() {
            if (app.get('user').get('name') != this.model.get('user').get('name')) { return; }

            socket.emit('release', { 'trackID': this.model.id });
            this.model.collection.remove(this.model);
        },
        
        removeView: function() {
            this.remove();
        },

        changeInstrument: function(track, instrument) {
            $el = $(this.el);
            $el.find('.inst').removeClass('active');
            $el.find('[data-name='+instrument.get('name')+']').addClass('active');

            if (instrument.get('sounds').length != this.model.steps.at(0).get('notes').length) {
                this.model.fillSteps();
            }
            this.model.trigger('change:steps');
        },
        
        render: function() {
            var view = this;
            var $el = $(view.el).html(this.template(this.model.toJSON()));
            if (this.model.get('user').get('name') == app.get('user').get('name')) {
                $el.addClass('editable')
            }
            this.model.steps.each(function(step) {
                view.insertStep(step);
            });
            return this;
        },

        insertStep: function(step) {
            var stepView = new StepView({model: step, id: step.id});
            $(this.el).find('.steps').append(stepView.render().el);
        }
    });

    Tracks = Backbone.Collection.extend({
        initialize: function() {
    
        },

        comparator: function(track) {
            return track.get('timestamp');
        }
        
    });

    
    Step = Backbone.Model.extend({
        initialize: function() {
            this.bind('change:notes', this.sendNoteChange);
        },

        sendNoteChange: function(step, notes) {
            socket.emit('change', {track: step.collection.track.id, step: step.collection.indexOf(step), notes: notes})
        }
        
    });

    StepView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'render', 'activate', 'deactivate');
            this.model.bind('change', this.render);
            this.model.bind('activate', this.activate);
            this.model.bind('deactivate', this.deactivate);
        },

        events: {
            'click .note': 'toggleNote'
        },

        toggleNote: function(e) {
            if (app.get('user').get('name') != this.model.collection.track.get('user').get('name')) { return; }

            var $note = $(e.target);
            var notes = this.model.get('notes').slice(0);
            var i = $note.data('index');
            var newValue = $note.hasClass('on') ? 0 : 1;
            notes[i] = newValue;
            this.model.set({ 'notes': notes });
            if (!!newValue) {
                playSound(this.model.collection.track.get('instrument').get('sounds')[i]['filename']);
            }
        },

        className: 'step',
        
        template: _.template($('.step-template').html()),
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON())).attr('data-index', this.model.collection.indexOf(this.model));
            return this;
        },

        activate: function() {
            $(this.el).addClass('active');
        },

        deactivate: function() {
            $(this.el).removeClass('active');
        }
    });

    Steps = Backbone.Collection.extend({
        model: Step
    });

    MegaMan = Backbone.Model.extend({
        
    });

    MegaManView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'activate', 'deactivate');
            this.model.bind('activate', this.activate);
            this.model.bind('deactivate', this.deactivate);
        },

        activate: function() {
            $(this.el).addClass('on');
        },

        deactivate: function() {
            $(this.el).removeClass('on');
        }
    });

    MegaMen = Backbone.Collection.extend({
        
    });

    app = new App();
    appView = new AppView({model: app, el: $('body')});
    app.start();
})()
