(function() {

  var actx = new AudioContext();

    /* Prevents duplicate sound plays,
     * and caches future sounds
     * */
    soundManager = (function () {
        var toPlay = {}; // HashSet stand-in
        var cache = {};
        return {
            queueSample: function(sample) {
                if (!cache[sample.get('name')]) {
                    cache[sample.get('name')] = sample;
                }
            },
            play: function() {
                if ( !!_.size(toPlay) ) {
                    _.each(toPlay, function(sample) {
                        sample.play();
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
            var player = this.player = new Player();
            new PlayerView({model: this.player, el: $('.player')});
            this.instruments = new Instruments(instrumentsList);

            this.chatLog = new ChatLog();
            new ChatLogView({model: this.chatLog, el: $('.chat-log')});

            // Start the play loop
            // TODO maybe wrap this in a deferred for post sync
            // and post username dialog, etc
            // $.when(cond1, cond2)
            this.player.set({ playing: true });
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
            'keypress .username-input': 'loginInputKeypress',
            'keypress': 'keypress',
            'click .about-drawer .tab': 'toggleAbout',
            'click .save': 'saveBeat'
        },

        saveBeat: function(e) {
            e.preventDefault();
            socket.emit('save', app.get('user').toJSON());
        },

        toggleAbout: function(e) {
            var $drawer = $(e.target).closest('.about-drawer');
            var newVal = $drawer.css('top') === '0px' ? -390 : 0;
            $drawer.css({'top':newVal});
            $drawer.find('.tab-inner').text(newVal === 0 ? 'hide' : 'about us');
        },

        keypress: function(e) {
            var user = app.get('user');
            if (user && !user.get('chatting') && (e.keyCode != 13)) {
                user.set({'chatting': e});
            }
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

        displayError: function(errorObj) {
            $error = $('.error');
            $errorSpan = $error.find('span.error-text');
            $errorSpan.text(errorObj.msg);
            $error.fadeIn('fast',function() {
                setTimeout(function() {
                    $error.fadeOut('slow', function() {
                        $error.find('span.error-text').text('');
                    });
                }, 6000);
            });
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
            app.instruments.each(function(anInstrument) {
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
            socket.emit('claim', {'instrument': app.instruments.at(0).toJSON(), 'user': app.get('user').toJSON()})
        },

        insertTrack: function(track) {
            var trackView = new TrackView({model: track, id: track.id});
            $(this.el).find('.tracks').append($(trackView.render().el).addClass(track.get('user').get('name')));
        },

        insertMegaMan: function(megaMan) {
            var megaManView = new MegaManView({model: megaMan, className: megaMan.get('className')});
            $(this.el).find('.runner').append($(megaManView.el).css({left: megaMan.get('left')}));
        }
    });


    Instrument = Backbone.Model.extend({
        initialize: function() {
          this.samples = new Samples(this.get('sounds'));
        },

        defaults: {
            name: 'dj',
           'sounds': [
                {'name': 'scr1', 'url': 'dj-scratch-high.mp3'},
                {'name': 'scr2', 'url': 'dj-scratch-medium.mp3'},
                {'name': 'scr3', 'url': 'dj-scratch-low.mp3'},
                {'name': 'swsh', 'url': 'dj-swish.mp3'},
                {'name': 'thrb1', 'url': 'dj-throb.mp3'},
                {'name': 'thrb2', 'url': 'dj-throb2.mp3'}
            ]
        }
    });

    Instruments = Backbone.Collection.extend({
      model: Instrument
    });

    User = Backbone.Model.extend({
        initialize: function() {

        },

        defaults: {
            name: 'eightbit',
            avatar: 'media/images/avatar-' + Math.floor(Math.random() * 7 + 1) + '.png'
        }
    });

    UserView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'handleChat');
            this.model.bind('change:chatting', this.handleChat);
        },

        handleChat: function(model, chatting) {
            var view = this;
            if (!chatting) { return; }

            var $user = $('.editable .user');
            var $chatBox = $('<textarea rows="10" cols="20" class="chat-box"></textarea>');
            $user.append($chatBox);
            $chatBox.focus();
            $chatBox.bind('keypress', function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    var message = new Message({content: $chatBox.val()})
                    app.chatLog.messages.add(message);
                    $chatBox.fadeOut(2000, function() {
                        $chatBox.remove();
                    });
                    view.model.set({'chatting': false});
                }
            })
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
            instrument: null,
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
            for (i = 0; i < app.player.get('length'); i++) {
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
                    soundManager.queueSample(model.get('instrument').samples.at(i));
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

        className: 'track container',

        template: _.template($('.track-template').html()),

        events: {
            'click .meta .leave': 'deleteTrack',
            'click .inst': 'selectInstrument'
        },

        selectInstrument: function(e) {
            if (app.get('user').get('name') != this.model.get('user').get('name')) { return; }

            $button = $(e.target).hasClass('inst') ? $(e.target) : $(e.target).closest('.inst');
            var instrumentCid = $button.attr('data-cid');
            $button.siblings().removeClass('active');
            $button.addClass('active');
            this.model.set({'instrument': app.instruments.getByCid(instrumentCid)});
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
                $el.addClass('editable '+app.get('user').get('name'));
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
                this.model.collection.track.get('instrument').samples.at(i).play();
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

    Message = Backbone.Model.extend({

    });

    MessageView = Backbone.View.extend({
        initialize: function() {

        },

        template: _.template($('.message-template').html()),

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    Messages = Backbone.Collection.extend({
        initialize: function() {
            _.bindAll(this, 'sendMessage');
            this.bind('add', this.sendMessage);

        },

        sendMessage: function(message) {
            if (message.get('username')) { return; }

            socket.emit('chat', message.toJSON());
        }
    });

    ChatLog = Backbone.Model.extend({
        initialize: function() {
            this.messages = new Messages;
            this.messages.chatLog = this;
        }

    });

    ChatLogView = Backbone.View.extend({
        initialize: function() {
            this.model.messages.bind('add', this.insertMessage)
        },

        className: 'chat-log',

        template: _.template($('.chat-log-template').html()),

        insertMessage: function(message) {

            var messageView = new MessageView({model: message});
            var username = message.get('username');
            if (username) {
                var $chatBox = $('<div class="chat-box">'+message.get('content')+'</div>');
                $('.'+username+' .user').append($chatBox);
                setInterval(function() {
                    $chatBox.fadeOut(2000, function(){
                        $chatBox.remove();
                    });
                }, 4000);
            }

            $(this.el).append(messageView.render().el);
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    Sample = Backbone.Model.extend({
      initialize: function (attrs, options) {

        var self = this;
        // in case the attrs doesn't contain a format
        var format = attrs.format || this.get('format');

        this.actx = actx;
        this.output = this.actx.createGain();
        this.output.connect(this.actx.destination);

        if (attrs._id || attrs.url) {
          this.set({'loading': true});
          this.fetchBuffer();
        }

        this.set({'playing': false});

        this.bind('change:loop', this.updateLoop);
        this.bind('change:gain', this.handleGainChange);

        this.bind('remove', this.handleRemove);
      },

      defaults: {
        name: null,
        url: null,
        playing: false,
        loop: false,
        loaded: false,
        format: 'pcm',

        attack: 0,
        decay: 0,
        gain: .2,
        release: 2,
      },

      attrs: function () {
        var attrs = this.toJSON();
        return attrs;
      },

      /**
       * called when the model is removed
       * it will stop the audio if it's playing
       * and it will remove its audiostore
       */
      handleRemove: function () {
        var self = this;
        this.stop();
      },

      handleGainChange: function (model, gain) {
        this.output.gain.value = gain;
      },

      /**
       * used when initiliazing the model
       * it tries to fetch the buffer from idb and if nothing is found
       * it looks for the url
       */
      fetchBuffer: function () {
        var self = this;
        var url = this.get('url');
        var format = self.get('format');
        var headerSize = format == 'wav' ? 44 : 0

        self.fetchRemoteBuffer(url, function (err, buffer) {
          if (err) throw new Error(err);

          // if we have an url, load it from there
          // and then save it locally
          self.loadBuffer(buffer);
        });
      },

      /**
       * used by fetchBuffer to try and read the audio file from idb
       * @param  {String}   url The url of the file
       * @param  {Function} cb  Callback
       */
      fetchRemoteBuffer: function (url, cb) {
        var self = this;

        console.log('FetchRemoteBuffer', this.attributes);

        this.set({'loaded': false});

        return utils.audio.fetchArrayBuffer(url).then(function (arrayBuffer) {
          cb(null, arrayBuffer);
        }).catch(function (err) {
          cb(err);
        });
      },

      /**
       * used when uploading a new file, or reading from idb
       * it sets the buffer attribute on the model
       * @param  {ArrayBuffer}  arrayBuffer
       */
      loadBuffer: function (arrayBuffer) {
        var self = this;
        // firefox seems to have a problem with this
        // we need to make a copy of the array buffer
        if (arrayBuffer.slice) {
          var arrayCopy = arrayBuffer.slice(0);
        } else {
          var arrayCopy = arrayBuffer;
        }

        this.actx.decodeAudioData(arrayCopy).then(function (audioBuffer) {
          self.set({'loaded': true});
          self.buffer = audioBuffer;
        }).catch(function (err) {
          console.error(err);
        });
      },

      /**
       * used to start playing the sound
       * it will create a createBufferSource and connect it further
       */
      play: function () {
        var self = this;

        if (!this.buffer) {
          console.error('This file couldn\'t be played.');
          return;
        }
        this.set({'playing': true});

        this.source = self.actx.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.loop = this.get('loop');

        this.output.gain.value = 0;

        this.source.connect(this.output);

        this.source.onended = function () {
          self.set({'playing': false});
        }

        this.source.start(0);
        this.output.gain.linearRampToValueAtTime(this.get('gain'), this.actx.currentTime + this.get('attack'));
      },

      /**
       * used to stop an audio if it's playing
       * it will fade down over a period of 2 seconds
       */
      stop: function () {
        if (this.get('playing')) {
          var release = this.get('release');
          this.trigger('release', self);
          this.output.gain.linearRampToValueAtTime(0, app.actx.currentTime + release);
          if (this.source) {
            try {
              this.source.stop(app.actx.currentTime + release);
            } catch (err) {
              console.error(err);
            }
          } else {
            this.set({'playing': false});
          }
        }
      },

      _trigger: function () {
        if (this.get('playing')) {
          this.stop();
        } else {
          this.play();
        }
      },

      updateLoop: function (model, loop) {
        if (this.source) {
          this.source.loop = loop;
        }
      },

      connect: function (destination, channel) {
        this.output.connect(destination, channel);
      },

      disconnect: function (arg) {
        this.output.disconnect(arg);
      }
    });

    Samples = Backbone.Collection.extend({
      model: Sample
    });

    app = new App();
    appView = new AppView({model: app, el: $('body')});
    app.start();

})();
