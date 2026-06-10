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
        "https://study-mentor-ai.onrender.com/memories",
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

    panel.style.display = "block";

    panel.innerHTML =
    "<h3>📚 Stored Knowledge</h3><hr>";

    let uniqueMemories =
        [...new Set(data.memories)];

    uniqueMemories.forEach(memory => {

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
            🤖 Analyzing your learning profile...
        </div>
    `;

    chatBox.scrollTop =
        chatBox.scrollHeight;

    let response = await fetch(
        "https://study-mentor-ai.onrender.com/chat",
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

document.addEventListener(
    "DOMContentLoaded",
    () => {

        let input =
            document.getElementById("message");

        if(input){

            input.addEventListener(
                "keypress",
                function(event){

                    if(event.key === "Enter"){
                        sendMessage();
                    }

                }
            );

        }

    }
);

window.onload = function(){

    let chatBox =
        document.getElementById("chat-box");

    if(chatBox){

        chatBox.innerHTML += `
            <div class="agent-message">
                <b>🤖 Study Mentor</b><br>
                Welcome ${username}!<br><br>
                I can remember your learning preferences,
                goals and weak subjects to help you study
                more effectively.
            </div>
        `;

    }

}