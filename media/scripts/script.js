(function() {
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
        }
    });

    
    Player = Backbone.Model.extend({
        init: function() {
            this.tracks = new Tracks;
            this.tracks.player = this;
        },

        defaults: {
            tracks: []
        }
    });

    PlayerView = Backbone.View.extend({
        init: function() {
            _.bindAll(this, 'insertTrack')
            this.model.tracks.bind('add', this.insertTrack)

            this.model.tracks.add(this.model.get('tracks'))
        },
        
        className: 'player',

        template: _.template($('.player-template').html()),

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },

        createTrack: function(e) {
            e && e.preventDefault();
            this.model.tracks.create();
        },

        insertTrack: function(track) {
            var trackView = new TrackView({model: track, id: track.id});
        }
    });
    

    Track = Backbone.Model.extend({
        init: function() {
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
        init: function() {
            _.bindAll(this, 'insertStep');
            this.model.steps.add(this.model.get('steps'));
        },
        
        className: 'track',

        template: _.template($('.track-template').html()),

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },

        insertStep: function(step) {
            var stepView = new StepView({model: step, id: step.id});
        }
    });

    Tracks = Backbone.Collection.extend({
        init: function() {
        }
        
    });

    
    Step = Backbone.Model.extend({
        
    });

    StepView = Backbone.View.extend({
        init: function() {
            
        },
        
        className: 'step',
        
        template: _.template($('.step-template')),
        
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