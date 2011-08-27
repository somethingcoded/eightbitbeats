(function() {
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
            setInterval(player.play, 0);
        }
    });

    
    Player = Backbone.Model.extend({
        initialize: function() {
            this.tracks = new Tracks;
            this.tracks.player = this;
        },

        defaults: {
            tracks: []
        },

        play: (function() {
            var loops = 0, skipTicks = 60000 / (20 * 4),
                maxFrameSkip = 10,
                nextTick = (new Date).getTime();
  
            return function() {
                loops = 0;
    
                while ((new Date).getTime() > nextTick) {
                    // do the stuff
                    console.log('====TICK====');
                    console.log(nextTick);
                    console.log(skipTicks);
                    
                    // Loop business
                    nextTick += skipTicks;
                    loops++;
                }
            };
        })()
    });

    PlayerView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'insertTrack');
            this.model.tracks.bind('add', this.insertTrack);
            
            this.model.tracks.add(this.model.get('tracks'));
        },
        
        className: 'player',

        template: _.template($('.player-template').html()),

        events: {
            'click .create-track': 'createTrack'
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },

        createTrack: function(e) {
            e.preventDefault();
            var track = new Track({steps: [{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]},{notes: [0,0,1,0,0]}]});
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
    

    Track = Backbone.Model.extend({
        initialize: function() {
            this.steps = new Steps;
            this.steps.track = this;
        },
        
        defaults: {
            instrument: null,
            user: null,
            steps: [],
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

        sendChange: function() {
            socket.emit('change', this.model.toJSON());
        },
        
        render: function() {
            var view = this;
            $(view.el).html(this.template(this.model.toJSON()));

            this.model.steps.each(function(step) {
                view.insertStep(step)
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
        
    });

    StepView = Backbone.View.extend({
        initialize: function() {

        },
        
        className: 'step',
        
        template: _.template($('.step-template').html()),
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    Steps = Backbone.Collection.extend({
        model: Step
    });

    app = new App()
    app.start();
})()
