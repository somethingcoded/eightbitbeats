(function() {
    soundManager = (function () {
        var toPlay = {}; // HashSet stand-in
        return {
            addFile: function(file) {
                if (!toPlay.file) {
                    toPlay[file] = file;
                }
            },
            play: function() {
                _.each(toPlay, function(name) {
                    playSound(name);
                });
                toPlay = {};
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

            // Start the play loop
            setInterval(function(){ player.play(player); }, 0);
        }
    });

    
    Player = Backbone.Model.extend({
        initialize: function() {
            this.tracks = new Tracks;
            this.tracks.player = this;
            this.tracks.comparator = function(track) {
                return track.get('timestamp');
            }
            this.bind('change:step',  this.playStep );
        },

        defaults: {
            tracks: [],
            bpm: 120,
            step: 0,
            length: 64
        },
        
        createTrack: function(trackID, userObj, timestamp, instrument) {
            //TODO user
            var track = new Track({ 
                'id': trackID, 
                'timestamp': timestamp,
                'instrument': new Instrument(instrument)
                //'user': new User(userObj) //don't forget the comma above!
            });

            track.fillSteps();
            this.tracks.add(track);
        },

        incStep: function(inc) {
            this.set({'step': (this.get('step') + 1) % this.get('length')});
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
                    instance.incStep(1);
                    // Loop business
                    nextTick += skipTicks / instance.get('bpm');
                }

                // stuff that we want refreshed a shit load goes here, probably nothing
            };
        })()
    });

    PlayerView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'insertTrack', 'playStep');

            this.model.bind('change:step', this.playStep);
            this.model.tracks.bind('add', this.insertTrack);
            this.model.tracks.add(this.model.get('tracks'));
        },
        
        className: 'player',

        template: _.template($('.player-template').html()),

        events: {
            'click .create-track': 'requestTrack'
        },
        
        playStep: function() {
           // Highlight active step column 
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        
        requestTrack: function(e) {
            e.preventDefault();
            socket.emit('claim', {'user':{}})
        },

        deleteTrack: function(e) {
            e.preventDefault();
            $(this.el).remove();
        },

        insertTrack: function(track) {
            var trackView = new TrackView({model: track, id: track.id});
            $(this.el).find('.tracks').append(trackView.render().el);
        }
    });
    

    Instrument = Backbone.Model.extend({
        initialize: function() {

        },

        defaults: {
            name: 'test',
            filenames: ['dj_throb','dj_swish','hh','hh','tom_high']
        }
    });

    User = Backbone.Model.extend({
        initialize: function() {

        },

        defaults: {

        }
    });

    Track = Backbone.Model.extend({
        initialize: function() {
            this.steps = new Steps;
            this.steps.track = this;
            this.instrument = new Instrument;

            this.bind('change:steps', this.parseSteps);
        },

        defaults: {
            //timestamp: 0,
            instrument: null,
            user: null,
            steps: []
        },

        parseSteps: function(model, steps) {
            this.steps.reset(steps);
        },

        fillSteps: function() {
            var i, n;
            var steps = []
            for (i = 0; i < player.get('length'); i++) {
                var notes = [];
                for (n = 0; n < this.instrument.get('filenames').length; n++) {
                    notes.push(0);
                }
                var step = new Step({notes: notes})
                steps.push(step);
            }
            this.set({steps: steps}, {silent: true});
        },
        
        playStep: function(stepIndex) {
            var model = this;
            var step = model.steps.at(stepIndex);
            $.each(step.get('notes'), function(i, note) {
                if (!!note) {
                    soundManager.addFile(model.instrument.get('filenames')[i]);
                }
            });
        }
    });

    TrackView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'insertStep');
            this.model.steps.bind('add', this.insertStep);
            this.model.bind('change', this.sendChange);
            
            this.model.steps.add(this.model.get('steps'), {silent: true});
        },
        
        className: 'track',

        template: _.template($('.track-template').html()),

        events: {
        },

        sendChange: function(blah, bloop, other) {
            socket.emit('change', this.model.toJSON());
        },
        
        render: function() {
            var view = this;
            $(view.el).html(this.template(this.model.toJSON()));

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
    
        }
        
    });

    
    Step = Backbone.Model.extend({
        initialize: function() {
            this.bind('change:notes', this.sendNoteChange);
        },

        sendNoteChange: function(step, notes) {
            socket.emit('change', {track: step.collection.track.collection.indexOf(step.collection.track), step: step.collection.indexOf(step), step_data: notes})
        }
        
    });

    StepView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
        },

        events: {
            'click .note': 'toggleNote'
        },

        toggleNote: function(e) {
            var $note = $(e.target);
            var notes = this.model.get('notes').slice(0);
            var i = $note.data('index');
            notes[i] = $note.hasClass('on') ? 0 : 1;
            this.model.set({ 'notes': notes });
        },

        className: 'step',
        
        template: _.template($('.step-template').html()),
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON())).attr('data-index', this.model.collection.indexOf(this.model));
            return this;
        }
    });

    Steps = Backbone.Collection.extend({
        model: Step
    });

    app = new App()
    app.start();
})()
