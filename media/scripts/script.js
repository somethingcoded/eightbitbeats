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

    var socket = io.connect('http://localhost:7777');


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

            this.bind('change:step',  this.playStep );
        },

        defaults: {
            tracks: [],
            bpm: 60,
            step: 0,
            length: 64
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
            var loops = 0, skipTicks = 60000 / 4,
                //maxFrameSkip = 10,
                nextTick = (new Date).getTime();
  
            return function(instance) {
                //loops = 0;
                while ((new Date).getTime() > nextTick) {
                    // play the sounds
                    instance.incStep(1);
                    // Loop business
                    nextTick += skipTicks / instance.get('bpm');
                    //loops++;
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
            'click .create-track': 'createTrack'
        },
        
        playStep: function() {
           // Highlight active step column 
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },

        createTrack: function(e) {
            e.preventDefault();
            var track = new Track;
            track.fillSteps();
            this.model.tracks.add(track);
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

    Track = Backbone.Model.extend({
        initialize: function() {
            this.steps = new Steps;
            this.steps.track = this;
            this.instrument = new Instrument;

            this.bind('change:steps', this.parseSteps);
        },

        defaults: {
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
            for (i = 0; i <= player.get('length'); i++) {
                var notes = [];
                for (n = 0; n <= this.instrument.get('filenames').length; n++) {
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
            debugger;
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

        }
    });

    StepView = Backbone.View.extend({
        initialize: function() {

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
