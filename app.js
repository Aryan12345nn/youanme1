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

// Ask for username
let username = prompt("Enter your name (ishu/billi):");
document.getElementById('chatUser').innerText = 'Chat - ' + username;

// Set online/offline status
const statusEl = document.getElementById('status');
db.ref('status/' + username).set('online');
db.ref('status/' + username).onDisconnect().set('offline');

// Determine the other user
let otherUser = username === 'ishu' ? 'billi' : 'ishu';
db.ref('status/' + otherUser).on('value', snap => {
  statusEl.innerText = snap.val() === 'online' ? 'Online' : 'Offline';
});

// Elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const typingHeader = document.getElementById('typingHeader');
const clearBtn = document.getElementById('clearBtn');

// Send message function
function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  db.ref('messages').push({
    sender: username,
    text: msg,
    timestamp: Date.now()
  });
  messageInput.value = '';
}

// Send message on button click or Enter key
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendMessage();

  // Typing indicator
  db.ref('typing/' + username).set(true);
  setTimeout(() => db.ref('typing/' + username).set(false), 1000);
});

// Display messages
db.ref('messages').on('child_added', snap => {
  const data = snap.val();
  const msgEl = document.createElement('div');
  msgEl.classList.add('message', data.sender === username ? 'self' : 'other');
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
  if (confirm("Are you sure you want to clear the chat?")) {
    db.ref('messages').remove();
  }
});

// Remove messages from UI if cleared
db.ref('messages').on('value', snap => {
  if (!snap.exists()) messagesDiv.innerHTML = '';
});
