var socketIo = io('https://video-call-chung-pham.herokuapp.com');
function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
};
function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}
//openStream().then(stream => playStream('localStream', stream));
$('.first').show();
$('.box').hide();
$(document).ready(function() {
    var txtSignup;
    $('.first').show();
    $('.box').hide();
    const peer = new Peer({key: 'lwjd5qra8257b9'});
    peer.on('open', function(id) {
        $('#id_').append(id);
        $('.btnSignup').click(function() {
            txtSignup = $('.txtSignup').val();
            txtSignup = txtSignup.trim();
            if(txtSignup == "") {
                alert('Sign up name is required ...');
                $('.txtSignup').val("");
            } else {
                socketIo.emit('client-signup', {
                    idStream: id,
                    nameSignup: txtSignup
                });
            }
        });
        $('.btnLogout').click(function() {
            socketIo.emit('client-logout');
        });
    });
    $('.btnCall').click(function() {
        const idCall = $('.txtIdCall').val();
        openStream()
            .then(stream => {
                playStream('localStream', stream);
                const call = peer.call(idCall, stream);
                call.on('stream', remoteStream => playStream('remoteStream', stream));
            });
    });

    peer.on('call', call => {
        openStream()
            .then(stream => {
                call.answer(stream);
                playStream('localStream', stream);
                call.on('stream', remoteStream => playStream('remoteStream', stream));
            });
    });
    socketIo.on('server-send-listFriend', function(data) {
        const dataFilter = data.filter(item => item.nameSignup != $('.titleName').text());
        $('.listFriend').html('');
        dataFilter.forEach((friend, index) => {
            $('.listFriend').append(`
                <div class="friendItem">
                    <span class="span1">${index+1}</span>
                    <span class="span2">${friend.nameSignup}</span>
                    <button class="btn btn-outline-primary" id="${friend.idStream}">Call</button>
                </div>
            `);
        });
    });
    socketIo.on('client-signup-1user', function(data) {
        $('.first').hide(1000);
        $('.box').show(1000);
        $('.titleName').html(txtSignup);
        const dataFilter = data.filter(item => item.nameSignup != $('.titleName').text());
        $('.listFriend').html('');
        dataFilter.forEach((friend, index) => {
            $('.listFriend').append(`
                <div class="friendItem">
                    <span class="span1">${index+1}</span>
                    <span class="span2">${friend.nameSignup}</span>
                    <button class="btn btn-outline-primary" id="${friend.idStream}">Call</button>
                </div>
            `);
        });
    });
    socketIo.on('existed-user', function() {
        alert('Existed name, You submit a new name ...');
        $('.txtSignup').val('');
    });
    socketIo.on('1-user-logout', function() {
        $('.first').show(1000);
        $('.box').hide(1000);
        $('.txtSignup').val('');
    });
    $('.listFriend').on('click', 'button', function() {
        const idCall = $(this).attr('id');
        openStream()
            .then(stream => {
                playStream('localStream', stream);
                const call = peer.call(idCall, stream);
                call.on('stream', remoteStream => playStream('remoteStream', stream));
            });
    });
});
