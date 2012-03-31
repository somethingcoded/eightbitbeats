(function() {
    
    bufferManager = (function() {
        var loopInterval;
        var bufferLimit = 5;
        var buffer = {};
        return {
            fillBuffer: function() {
                var stepIndex;
                var currentStep = app.room.player.get('step');
                for (var i = 1; i <= bufferLimit; i++) {
                    stepIndex = (currentStep + i) % app.room.player.get('length');
                    app.room.player.bufferStep(stepIndex);
                }
            },
            
            addFile: function(index, filename){
                if (!buffer[index]) {
                    buffer[index] = {};
                }
                if (!buffer[index][filename]) {
                    buffer[index][filename] = true;
                }
            },

            playStep: function(index) {
                if (buffer[index]) {
                    _.each(buffer[index], function(derp, filename) {
                        playSound(filename);
                    });
                    delete buffer[index];
                }
            }
        };
    })();

    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    // // underscore template languate settings
    // _.templateSettings = {
    //   interpolate : /\{\{(.+?)\}\}/g, // {{ var }}
    //   evaluate: /\{\%(.+?)\%\}/g // {% expression %}
    // }; 
    Router = Backbone.Router.extend({
        routes: {
            '': 'lobby',
            'lobby': 'lobby',
            'rooms': 'rooms',
            'rooms/:id': 'room'
        },

        index: function() {
            var view = this;
            this.connectIfNot(function() {
                view.checkUsername(function() {
                    if (jsonVars.user.username) {
                        app.router.navigate('lobby', {trigger: true});
                    }
                });
            });
        },

        lobby: function() {
            var view = this;
            console.log('lobby');
            this.connectIfNot(function() {
                view.checkUsername(function() {
                    var lobby = new Lobby({id: 'lobby'})
                    lobby.View = LobbyView
                    app.set('room', lobby);
                });
            });
        },

        rooms: function() {
            console.log('rooms');
        },

        room: function(id) {
            var view = this;
            this.connectIfNot(function() {
                view.checkUsername(function() {
                    app.set('room', new Room({id: id}));
                });
            });
        },
        
        checkUsername: function(callback) {
            var loginView
            if (!app.get('room')) {
                window.socket.on('joined', function(data) {
                    if (loginView) { loginView.remove(); }
                    if(_.isFunction(callback)) { callback(data); }
                });
                
                if (!app.get('user') || !app.get('user').get('username')) {
                    loginView = new LoginView({model: app, callback: callback});
                    appView.insertContent(loginView.render().el);
                } else {
                    socket.emit('join', {user: jsonVars.user, roomID: app.get('roomID'), location: window.location});
                }
            } else {
                if (_.isFunction(callback)) { callback(); }
            }
        },
        
        connectIfNot: function(callback) {
            if (!window.socket) {
                window.socket = io.connect();
                window.socket.on('connect', function(data) {
                    if (_.isFunction(callback)) { callback(data); }
                })
            } else if (_.isFunction(callback)) { callback(); }
        }
    });

    App = Backbone.Model.extend({
        start: function() {  
          
            this.chatLog = new ChatLog();
            new ChatLogView({model: this.chatLog, el: $('.chat-drawer')});

            Backbone.history.start({pushState: true});
        },

        router: new Router,

        defaults: {
            roomID: 'lobby'
        }

    });
    
    AppView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this);
            this.model.bind('error', this.displayError);
            // this.model.bind('change:user', this.loginSuccess);
            // this.model.bind('change:roomID', this.joinRoom);
            this.model.bind('change:room', this.switchRooms);
        },

        events: {
            'keypress': 'keypress',
            'click .about-drawer .tab': 'toggleAbout',
            'click .save': 'saveBeat'
        },

        joinRoom: function(model, roomID) {
            socket.emit('join', {user: jsonVars.user, roomID: roomID, location: window.location});
        },

        switchRooms: function(model, room) {
            if (app.room) { app.room.trigger('leave'); }
            app.room = room;
            if (room.View) {
                var roomView = new room.View({model: room})
            } else {
                var roomView = new RoomView({model: room});
            }
            this.insertContent(roomView.render().el);
        },

        insertContent: function(el) {
            $('.main').append(el);
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
        }
    });

    LoginView = Backbone.View.extend({
        initialize: function(options) {
            
        },
      
        template: _.template($('.login-template').html()),

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

        sendLogin: function(e) {
            e.preventDefault();
            spinOpts = {
                lines: 10,
                width: 1,
                radius: 3,
                color: '#fff',
                length: 5,
            }
            var $submit = this.$('.login-submit').text('connecting...');
            $submit.append(new Spinner(spinOpts).spin().el);
            var username = $('.username-input').val()
            jsonVars.user.username = jsonVars.user.username ? jsonVars.user.username : username;
            appView.joinRoom({}, app.get('roomID'));
        },

        loginSuccess: function() {
            this.$el.remove();
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    Lobby = Backbone.Model.extend({
        initialize: function(attrs, options) {
          this.rooms = new Rooms();
        }
    });

    LobbyView = Backbone.View.extend({

        initialize: function() {
            _.bindAll(this);
            this.model.bind('leave', this.leave);
            this.model.rooms.bind('add', this.insertRoom);
            this.model.rooms.fetch({add: true});
        },

        className: 'lobby',

        template: _.template($('.lobby-template').html()),

        events: {
            'click .create-room': 'createRoom'
        },

        createRoom: function(e) {
            e.preventDefault();
            this.model.rooms.create({title: 'some room'});
        },

        insertRoom: function(room) {
            var roomLinkView = new RoomLinkView({model: room});
            $('.rooms').append(roomLinkView.render().el)
        },
      
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            var $rooms = this.$('.rooms')

            this.model.rooms.each(function(room) {
                this.insertRoom(room)
            });

            return this;
        },

        leave: function() {
            this.model.unbind()
            this.remove();
        }
    });

    Room = Backbone.Model.extend({
    });

    RoomView = Backbone.View.extend({
        initialize: function() {
            view = this;
            this.model.player = new Player();

            _.bindAll(this);
            this.model.bind('leave', this.leave);

            // Start the play loop
            this.model.player.set({ playing: true });
            this.model.loopInterval = setInterval(function(){ view.model.player.play(view.model.player); }, 0);
        },

        className: 'room container',
        
        template: _.template($('.room-template').html()),

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

            // render player
            var playerView = new PlayerView({model: this.model.player});
            this.$el.append(playerView.render().el);

            return this;
        },

        leave: function() {
            this.model.unbind()
            this.remove();
        }

    });
    
    RoomLinkView = Backbone.View.extend({
        template: _.template($('.room-link-template').html()),

        events: {
            'click a': 'goToRoom'
        },

        goToRoom: function(e) {
            e.preventDefault();
            app.router.navigate('rooms/'+ this.model.get('slug'), {trigger: true})
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    Rooms = Backbone.Collection.extend({
        model: Room,
        
        url: 'rooms/'
    });
    
    Player = Backbone.Model.extend({
        initialize: function() {
            this._loopInterval = null;

            this.tracks = new Tracks;
            this.tracks.player = this;
            this.tracks.fetch({add: true})
            
            this.megaMen = new MegaMen;
            this.megaMen.player = this;
            
            this.instruments = new Instruments(instrumentsList);


            this.bind('change:step', this.playStep);
            this.bind('change:playing', this.toggleLoop);
        },

        defaults: {
            tracks: [],
            bpm: 120,
            step: 0,
            length: 64,
            msPerMinute: 60000,
            measures: 4,
            beatsPerMeasure: 4,
            ticksPerBeat: 4,
            playing: false,
        },
       
        toggleLoop: function(player, playing) {
            console.log('toggleLoop (does nothing)');
        },

        syncTracks: function(data) {
            var model = this;
            _.each(data, function(track, id) {
                if (!model.tracks.get(id)) {
                    // Then add this track
                    // model.createTrack(id, track.user, track.timestamp, track.instrument, track.steps);
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

        bufferStep: function(step) {
            var model = this;
            model.tracks.each(function(track) {
                track.bufferStep(step);
            });
        },

        playStep: function(model, step) {
            bufferManager.playStep(this.get('step'));
            model.tracks.each(function(track) {
                track.playStep(step);
            });
        },
        
        play: (function() {
            var nextTick = (new Date).getTime();
            return function(player) {
                //loops = 0;
                while ((new Date).getTime() > nextTick) {
                    // play the sounds
                    if (player.get('playing')) {
                        player.incStep(1);
                    }
                    // Loop business
                    nextTick += ( player.get('msPerMinute') / player.get('ticksPerBeat') )/ player.get('bpm');
                }
                bufferManager.fillBuffer();
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
        },

        template: _.template($('.player-template').html()),
        
        className: 'player',

        events: {
            'click .create-track': 'claimTrack',
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

            // draw mega man
            var state = 1
            var left = 0;
            for (var i = 0; i < 64; i++) {
                state = state ? 0 : 1;
                this.model.megaMen.add({className: 'run'+state, left: left});
                left += 15;
            }
            
            return this;
        },
        
        claimTrack: function(e) {
            e.preventDefault();
            this.model.tracks.create({'instrument': this.model.instruments.at(0), 'user': app.get('user')})
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
            avatar: '/media/images/avatar-' + Math.floor(Math.random() * 7 + 1) + '.png'
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
            this.fillSteps();
            this.bind('change:steps', this.parseSteps);
            // this.bind('change:instrument', this.sendInstrumentChange);
        },

        defaults: {
            instrument: new Instrument,
            timestamp: 0,
            user: null,
            steps: []
        },

        parse: function(attrs) {

            // set track user to app.get('user') if they match
            // otherwise create new user
            if (app.get('user').get('username') == attrs.user.username) {
                user = app.get('user')
            } else {
                user = new User(attrs.user)
            } 
            
            return _.extend(attrs, {
                'instrument': new Instrument(attrs.instrument),
                'user': user
            });
        },

        parseSteps: function() {
            this.steps.reset(this.get('steps'));
        },

        fillSteps: function(stepsList) {
            var i, n;
            var steps = []
            for (i = 0; i < app.room.player.get('length'); i++) {
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

        bufferStep: function(stepIndex) {
            var model = this;
            var step = model.steps.at(stepIndex);
            $.each(step.get('notes'), function(i, note) {
                if (!!note) {
                    bufferManager.addFile(stepIndex, model.get('instrument').get('sounds')[i]['filename']);
                }
            });
        },

        playStep: function(stepIndex) {
            var model = this;
            if (this.lastStep) { 
                this.lastStep.trigger('deactivate'); 
            }
            var step = model.steps.at(stepIndex);
            this.lastStep = step;
            step.trigger('activate');
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
            this.model.save({'instrument': app.room.player.instruments.getByCid(instrumentCid)});
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
            if (this.model.get('user').get('username') == app.get('user').get('username')) {
                $el.addClass('editable '+app.get('user').get('username'));
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
        model: Track,
        
        initialize: function() {

        },

        parse: function(models) {
            if (models.length) {
                return _.each(models, function(attrs) {
                    return _.extend(attrs, {
                        'instrument': new Instrument(attrs.instrument),
                        'user': new User(attrs.user)
                    });
                });
            } else {
                return []
            }
        },

        url: function() {
            return '/tracks/'+ app.get('room').id;
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

    Message = Backbone.Model.extend({
        
    });

    MessageView = Backbone.View.extend({
        initialize: function() {
            
        },

        template: _.template($('.message-template').html()),

        render: function() {
            // For now, if there is no username,
            // use the current user's username.
            // TODO: figure out a more elegant model
            // solution.
            
            if (!this.model.get('username')) {
                this.model.set({'username': app.get('user').get('name')});
            }
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
            // Prevents the client from rebroadcasting a message
            // received from the server.
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
            _.bindAll(this, 'insertMessage'); 
            this.model.messages.bind('add', this.insertMessage)
        },

        className: 'chat-log',

        template: _.template($('.chat-log-template').html()),
        
        events: {
            'click .tab': 'toggleChatDrawer'
        },
        
        toggleChatDrawer: function(e) {
            var $drawer = this.el;
            var newVal = $drawer.css('top') === '0px' ? -226 : 0;
            $drawer.css({'top':newVal});
            $drawer.find('.tab-inner').text(newVal === 0 ? 'hide' : 'chat log');
        },

        insertMessage: function(message) {
            console.log('messages collection', this.model.messages);
            var messageView = new MessageView({model: message});
            var username = message.get('username');
            //TODO: make the UserViews listen to the chatlog
            //and then handle this 
            if (username) {
                var $chatBox = $('<div class="chat-box">'+message.get('content')+'</div>');
                $('.'+username+' .user').append($chatBox);
                setInterval(function() {
                    $chatBox.fadeOut(2000, function(){
                        $chatBox.remove();
                    });
                }, 4000);
            }
 
            // Add message to the chatlog drawer
            $(this.el).find('.pane').append(messageView.render().el).scrollTop($(messageView.el).offset().top + 99999);
            
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    })

    window.app = new App({user: new User(jsonVars.user)});
    window.appView = new AppView({model: app, el: $('body')});
    window.app.start();
})()
