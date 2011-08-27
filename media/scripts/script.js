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
            // pass
        }
    });

    
    Player = Backbone.Model.extend({
        init: function() {
            this.tracks = new Tracks;
            this.tracks.player = this;
        }
    });

    PlayerView = Backbone.View.extend({
        
        className: 'player',

        template: _.template($('.player-template').html())

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
        
    });
    

    Track = Backbone.Model.extend({
        
    });

    TrackView = Backbone.View.extend({
        className: 'track'

        template: _.template($('.track-template').html())

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    Tracks = Backbone.Collection.extend({
        init: function() {
            this.steps = new Steps;
            this.steps.track = this;
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