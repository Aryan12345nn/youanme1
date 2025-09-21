// Firebase initialization
const firebaseConfig = {
  apiKey: "AIzaSyAyLfQR-k8L45imDdx0N-5pw8P43_pmJ8E",
  authDomain: "youandme12345-d1d17.firebaseapp.com",
  databaseURL: "https://youandme12345-d1d17-default-rtdb.firebaseio.com",
  projectId: "youandme12345-d1d17",
  storageBucket: "youandme12345-d1d17.firebasestorage.app",
  messagingSenderId: "500541583420",
  appId: "1:500541583420:web:ec35f7355884fb6e345339"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Elements
const userSelection = document.getElementById('userSelection');
const chatContainer = document.getElementById('chatContainer');
const statusContainer = document.getElementById('statusContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const typingHeader = document.getElementById('typingHeader');
const clearBtn = document.getElementById('clearBtn');
const replyPreview = document.getElementById('replyPreview');
const replyTextEl = document.getElementById('replyText');
const cancelReplyBtn = document.getElementById('cancelReply');

let username = null;
let otherUser = null;
let replyTo = null;

// User selection buttons
document.querySelectorAll('.user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        username = btn.dataset.user;
        otherUser = username === 'ishu' ? 'billi' : 'ishu';
        userSelection.style.display = 'none';
        chatContainer.style.display = 'flex';
        document.getElementById('chatUser').innerText = 'Chat - ' + username;

        // Set online/offline status
        db.ref('status/' + username).set('online');
        db.ref('status/' + username).onDisconnect().set('offline');

        // Show status of both users
        db.ref('status').on('value', snap => {
            const data = snap.val() || {};
            statusContainer.innerHTML = `
                ${username} (${data[username] === 'online' ? 'online' : 'offline'}) | 
                ${otherUser} (${data[otherUser] === 'online' ? 'online' : 'offline'})
            `;
        });

        initChat();
    });
});

// Initialize chat functions
function initChat() {

    // Send message
    function sendMessage() {
        const msg = messageInput.value.trim();
        if (!msg) return;
        db.ref('messages').push({
            sender: username,
            text: msg,
            timestamp: Date.now(),
            replyTo: replyTo || null
        });
        messageInput.value = '';
        replyTo = null;
        replyPreview.style.display = 'none';
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
        db.ref('typing/' + username).set(true);
        setTimeout(() => db.ref('typing/' + username).set(false), 1000);
    });

    cancelReplyBtn.addEventListener('click', () => {
        replyTo = null;
        replyPreview.style.display = 'none';
    });

    clearBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to clear the chat?")) {
            db.ref('messages').remove();
        }
    });

    // Display messages
    db.ref('messages').on('child_added', snap => {
        const data = snap.val();
        const msgEl = document.createElement('div');
        msgEl.classList.add('message', data.sender === username ? 'self' : 'other');

        if(data.replyTo){
            db.ref('messages/' + data.replyTo).once('value', originalSnap => {
                const original = originalSnap.val();
                const replyDiv = document.createElement('div');
                replyDiv.classList.add('reply');
                replyDiv.textContent = 'Replying: ' + original.text;
                msgEl.appendChild(replyDiv);
                const textDiv = document.createElement('div');
                textDiv.textContent = data.text;
                msgEl.appendChild(textDiv);
                messagesDiv.appendChild(msgEl);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            });
        } else {
            msgEl.textContent = data.text;
            messagesDiv.appendChild(msgEl);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        // Click to reply
        msgEl.addEventListener('click', () => {
            replyTo = snap.key;
            replyTextEl.innerText = data.text;
            replyPreview.style.display = 'block';
        });
    });

    // Typing indicator
    db.ref('typing/' + otherUser).on('value', snap => {
        typingHeader.innerText = snap.val() ? otherUser + " is typing..." : "";
    });

    // Clear messages from UI if DB cleared
    db.ref('messages').on('value', snap => {
        if(!snap.exists()) messagesDiv.innerHTML = '';
    });

    // Basic @ tagging
    messageInput.addEventListener('input', () => {
        const val = messageInput.value;
        if(val.endsWith('@')) {
            messageInput.value += otherUser + ' ';
        }
    });
}
