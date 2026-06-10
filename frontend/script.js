const username = localStorage.getItem("username");

if (document.getElementById("welcome")) {
    document.getElementById("welcome")
        .innerText = `Welcome, ${username}`;
}

function logout() {

    localStorage.removeItem("username");

    window.location.href = "login.html";
}

async function showMemories() {

    let response = await fetch(
        "http://127.0.0.1:8000/memories",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username
            })
        }
    );

    let data = await response.json();

    let panel =
        document.getElementById("memory-panel");

    panel.style.display = "block";

    panel.innerHTML =
        "<h3>📚 Stored Knowledge</h3>";

    data.memories.forEach(memory => {

        panel.innerHTML +=
            `<p>• ${memory}</p>`;

    });
}

async function sendMessage() {

    let username =
        localStorage.getItem("username");

    if (!username) {
        window.location.href = "login.html";
        return;
    }

    let message =
        document.getElementById("message").value;

    if (!message) {
        return;
    }

    let chatBox =
        document.getElementById("chat-box");

    chatBox.innerHTML += `
        <div class="user-message">
            <b>👤 ${username}</b><br>
            ${message}
        </div>
    `;

    chatBox.scrollTop =
        chatBox.scrollHeight;

    document.getElementById("message").value = "";

    chatBox.innerHTML += `
        <div id="loading" class="agent-message">
            🤖 Thinking...
        </div>
    `;

    chatBox.scrollTop =
        chatBox.scrollHeight;

    let response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                message: message
            })
        }
    );

    let data = await response.json();

    let loading =
        document.getElementById("loading");

    if (loading) {
        loading.remove();
    }

    chatBox.innerHTML += `
        <div class="agent-message">
            <b>🤖 Study Mentor</b><br>
            ${data.response}
        </div>
    `;

    chatBox.scrollTop =
        chatBox.scrollHeight;
}