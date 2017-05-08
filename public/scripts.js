$(function() {
    var $window = $(window),
    $usernameInput = $('.input-username'),
    $messages = $('.messages'),
    $inputMessage = $('.input-msg'),
    $reciverMsg = $('.input-reciver'),
    $sendBtn = $('.send-msg'),
    $broadcast = $('.broadcast'),
    $loginPage = $('.login'),
    $chatPage = $('.chat'),
    username,
    connected = false,
    $currentInput = $usernameInput.focus(),
    socket = io();

    function setUsername () {
        username = cleanInput($usernameInput.val().trim());
        if (username) {
            $loginPage.fadeOut();
            $chatPage.show();
            $loginPage.off('click');
            $currentInput = $inputMessage.focus();
            socket.emit('add user', username);
        }
    }

    function addMessageElement (el, options) {
        var $el = $(el);

        if (!options) {
            options = {};
        }

        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }

        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        if (options.fade) {
            $el.hide().fadeIn();
        }

        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }

        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    function addChatMessage (data, options) {
        options = options || {};
        var $usernameDiv = $('<span class="username"/>').text(data.username)
        var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
        var $messageDiv = $('<li class="message"/>').data('username', data.username).append($usernameDiv, $messageBodyDiv);
        addMessageElement($messageDiv, options);
    }


    function sendMessage () {
        var message = $inputMessage.val(),
        recepient = $reciverMsg.val();

        message = cleanInput(message);
        recepient = cleanInput(recepient);

        if(recepient === username) {
            log('You can\'t message yourself')
        }

        if (message && recepient && connected) {
            $inputMessage.val('');
            addChatMessage({
                username: username,
                message: message
            });
            socket.emit('private', {message, recepient});
        }
    }

    function sendBroadcast() {
        var message = $inputMessage.val();
        message = cleanInput(message);

        if (message && connected) {
            $inputMessage.val('');
            addChatMessage({
                username: username,
                message: message
            });
            socket.emit('broadcast', message);
        }

    }

    function log (message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

    function cleanInput (input) {
        return $('<div/>').text(input).text();
    }

    $sendBtn.on('click', function(){
        sendMessage();
    });

    $broadcast.on('click', function(){
        sendBroadcast();
    })

    $window.keydown(function (event) {

        if (event.which === 13) {

            if (username) {
                sendMessage();
            }else {
                setUsername();
            }

        }

    });

    $loginPage.click(function () {
        $currentInput.focus();
    });

    $inputMessage.click(function () {
        $inputMessage.focus();
    });

    socket.on('login', function (data) {
        connected = true;
    });

    socket.on('msg', function (data) {
        addChatMessage(data);
    });

    socket.on('broadcast', function(data){
        addChatMessage(data);
    })
    socket.on('user joined', function (data) {
        log(data.username + ' joined');
    });

    socket.on('user left', function (data) {
        log(data.username + ' left');
    });

    socket.on('disconnect', function () {
        log('You have been disconnected');
    });

    socket.on('reconnect', function () {
        log('You have been reconnected');

        if (username) {
            socket.emit('add user', username);
        }
    });

    socket.on('reconnect_error', function () {
        log('Attempt to reconnect has failed');
    });

});
