async function sendMessage() {

    let message =
        document.getElementById("message").value;

    let response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        }
    );

    let data = await response.json();

    let chatBox =
        document.getElementById("chat-box");

    chatBox.innerHTML +=
        "<p><b>You:</b> "
        + message +
        "</p>";

    chatBox.innerHTML +=
        "<p><b>Agent:</b> "
        + data.response +
        "</p><hr>";

    document.getElementById("message").value = "";
}