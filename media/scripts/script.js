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
        initialize: function() {
            this.tracks = new Tracks;
            this.tracks.player = this;
        },

        defaults: {
            tracks: []
        }
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
            debugger;
            e.preventDefault();
            this.model.tracks.create();
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
            $(this.el).append(stepView.render().el);
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