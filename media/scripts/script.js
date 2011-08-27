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
        
        className: 'player'
        
    });
    

    Track = Backbone.Model.extend({
        
    });

    TrackView = Backbone.View.extend({
        className: 'track'
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
        
    });

    Steps = Backbone.Collection.extend({
        model: Step
    });

    app = new App()
    app.start();
})()