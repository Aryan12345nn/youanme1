// Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Ask for username
let username = prompt("Enter your name (ishu/billi):");
document.getElementById('chatUser').innerText = 'Chat - ' + username;

// Set user online status
const statusEl = document.getElementById('status');
db.ref('status/' + username).set('online');
db.ref('status/' + username).onDisconnect().set('offline');

// Determine other user
let otherUser = username === 'ishu' ? 'billi' : 'ishu';
db.ref('status/' + otherUser).on('value', snap => {
    statusEl.innerText = snap.val() === 'online' ? 'Online' : 'Offline';
});

// Sending message
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const typingHeader = document.getElementById('typingHeader');
const clearBtn = document.getElementById('clearBtn');

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function(e){
    if(e.key === 'Enter') sendMessage();
    // typing indicator
    db.ref('typing/' + username).set(true);
    setTimeout(() => db.ref('typing/' + username).set(false), 1000);
});

function sendMessage() {
    const msg = messageInput.value.trim();
    if(!msg) return;

    db.ref('messages').push({
        sender: username,
        text: msg,
        timestamp: Date.now()
    });
    messageInput.value = '';
}

// Display messages
db.ref('messages').on('child_added', snap => {
    const data = snap.val();
    const msgEl = document.createElement('div');
    msgEl.classList.add('message');
    msgEl.classList.add(data.sender === username ? 'self' : 'other');
    msgEl.textContent = data.text;
    messagesDiv.appendChild(msgEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Typing indicator in header
db.ref('typing/' + otherUser).on('value', snap => {
    typingHeader.innerText = snap.val() ? otherUser + " is typing..." : "";
});

// Clear chat
clearBtn.addEventListener('click', () => {
    if(confirm("Are you sure you want to clear the chat?")) {
        db.ref('messages').remove();
    }
});

// Remove messages from UI if deleted
db.ref('messages').on('value', snap => {
    if(!snap.exists()) messagesDiv.innerHTML = '';
});
