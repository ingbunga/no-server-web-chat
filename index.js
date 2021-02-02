import SimplePeer from './module/simplepeer.min.js';

// p.on('error', err => console.log('error', err))

// p.on('signal', data => {
//     console.log('SIGNAL', JSON.stringify(data))
//     document.querySelector('#outgoing').textContent = JSON.stringify(data)
// })

// document.querySelector('form').addEventListener('submit', ev => {
//     ev.preventDefault()
//     p.signal(JSON.parse(document.querySelector('#incoming').value))
// })

// p.on('connect', () => {
//     console.log('CONNECT')
//     p.send('whatever' + Math.random())
// })

// p.on('data', data => {
//     console.log('data: ' + data)
// })

let ME;
let nickname = '';
let color = '#000000';

const sendText = document.querySelector('#sendInput');
const chatArea = document.querySelector('article');
const textLog = document.querySelector('#chatting');
const textLogWrapper = document.querySelector('.flexfill');
const dropDownMenu = document.querySelector('#dropDownMenu'); //드롭다운 메뉴

const nickNameField = document.querySelector('#nickname');

const createBtn = document.getElementById('createBtn');
const enterBtn = document.getElementById('enterBtn');
const CodeOutPut = document.getElementById('CodeOutPut');

const sendBtn = document.getElementById('sendBtn');
const menuBtn = document.getElementById('menuBtn');

const config = {
    iceServers: [
        { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
        {url:'stun:stun01.sipphone.com'},
        {url:'stun:stun.ekiga.net'},
        {url:'stun:stun.fwdnet.net'},
        {url:'stun:stun.ideasip.com'},
        {url:'stun:stun.iptel.org'},
        {url:'stun:stun.rixtelecom.se'},
        {url:'stun:stun.schlund.de'},
        {url:'stun:stun.l.google.com:19302'},
        {url:'stun:stun1.l.google.com:19302'},
        {url:'stun:stun2.l.google.com:19302'},
        {url:'stun:stun3.l.google.com:19302'},
        {url:'stun:stun4.l.google.com:19302'},
        {url:'stun:stunserver.org'},
        {url:'stun:stun.softjoys.com'},
        {url:'stun:stun.voiparound.com'},
        {url:'stun:stun.voipbuster.com'},
        {url:'stun:stun.voipstunt.com'},
        {url:'stun:stun.voxgratia.org'},
        {url:'stun:stun.xten.com'},
        {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        },
        {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
        }
    ]
}

// 맨 처음 연결하는 코드
createBtn.onclick = createRoom;
function createRoom() {
    ME = new SimplePeer({
        initiator: true,
        trickle: false,
        config
    })

    nickname = nickNameField.value;
    
    if (nickname === '') {
        alert('닉네임을 입력해주세요!');
        return;
    }

    nickNameField.value = '';
    nickNameField.placeholder = "answer code 입력";
    enterBtn.remove();
    createBtn.innerHTML = 'wait...';
    createBtn.disabled = 'disabled';
    ME.on('signal', data => {
        createBtn.disabled = false;
        createBtn.innerHTML = 'CONNECT';
        console.log('SIGNAL', JSON.stringify(data))
        CodeOutPut.innerHTML = 'init code:'+JSON.stringify(data);
        createBtn.onclick = () => {
            ME.signal(nickNameField.value);
            console.log(ME);
            bind();
        }
    })
}

enterBtn.onclick = enterRoom;
function enterRoom(){
    ME = new SimplePeer({
        trickle: false,
        config
    });

    nickname = nickNameField.value;
    
    if (nickname === '') {
        alert('닉네임을 입력해주세요!');
        return;
    }

    nickNameField.value = '';
    nickNameField.placeholder = "init code 입력";
    enterBtn.remove();
    createBtn.innerHTML = 'CONNECT';
    createBtn.onclick = () => {
        ME.signal(nickNameField.value);
    }

    ME.on('signal', data => {
        CodeOutPut.innerHTML = 'answer code:'+JSON.stringify(data);
        console.log('SIGNAL', JSON.stringify(data))
        bind();
    })
}

function bind(){
    console.log(ME);

    ME.on('connect', () => {
        ME.send(JSON.stringify({
            type: 'announce',
            message: `${nickname}님이 입장하셨습니다.`
        }));
        chatArea.classList.add('using');
    })

    ME.on('data', data => {
        data = JSON.parse(data);
        if(data.type === 'message'){
            appendMsg(data);
        }
        else if(data.type === 'announce'){
            appendMsg(data,true);
        }
    });
}

function appendMsg(data, isAnnounce=false){
    if(isAnnounce){
        textLog.innerHTML += `<li><span style="color:white;background-color:blue">${data.message}</span></li>\n`
        textLog.scrollTop = textLog.scrollHeight - textLog.clientHeight;
    }
    else{
        textLog.innerHTML += `<li><span style="color:${data.color}">${data.nickname}</span> : <span>${data.sendText}</span></li>\n`
        textLogWrapper.scrollTop = textLogWrapper.scrollHeight - textLogWrapper.clientHeight;
    }
}

// // 전송하는 코드
sendBtn.onclick = send;
function send() {
    if (sendText.value === '') {
        alert('빈 메세지는 보낼 수 없습니다!');
        return;
    }
    if (sendText.value === '/clear') {
        textLog.innerHTML = '';
        sendText.value = '';
        return;
    }

    const data = {
        type: 'message',
        nickname: nickname,
        sendText: sendText.value,
        color: color,
    }

    ME.send(JSON.stringify(data));
    appendMsg(data);
    sendText.value = '';
}

// 채팅창 엔터 전송 이벤트
sendText.addEventListener(`keypress`, ({ key }) => {
    if (key === "Enter") {
        event.preventDefault();
        document.querySelector('button.button.submit').click();
    }
});

// 메뉴 클릭 이벤트
document.getElementById('menuBtn').onclick = onMenuClick;
function onMenuClick(e) {
    e.preventDefault()
    dropDownMenu.classList.toggle('fade');
}

// 이름 변경 이벤트
document.getElementById('nickNameChange').onclick = nameChange;
function nameChange(e) {
    const before = nickname;
    nickname = prompt('변경할 닉네임 입력');
    const data = {
        type: 'announce',
        message: `${before}님이 이름을 ${nickname}으로 변경했습니다.`
    }
    ME.send(JSON.stringify(data));
    appendMsg(data,true)
}

document.getElementById('colorChange').onclick = colorChange;
function colorChange(e) {
    color = document.querySelector('#nicknameColor').value;
    const data = {
        type: 'announce',
        message: `${nickname}님이 색깔을 ${color}으로 변경했습니다.`
    }
    ME.send(JSON.stringify(data));
    appendMsg(data, true)
}