// ============================================================
// STUDY MENTOR AI - script.js
// ============================================================


// ============================================================
// API CONFIGURATION
// ============================================================




// ============================================================
// AUTHENTICATION
// ============================================================

const token = localStorage.getItem("token");

const username = localStorage.getItem("username");


// If there is no token, send user back to login

if (!token) {

    window.location.href = "login.html";

}


// ============================================================
// MARKED.JS CONFIGURATION
// ============================================================

if (typeof marked !== "undefined") {

    marked.setOptions({

        gfm: true,

        breaks: false

    });

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

    if (!text) {

        return "";

    }


    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ============================================================
// PREPARE AI RESPONSE
// ============================================================

function prepareResponse(text) {

    if (!text) {

        return "";

    }


    let result = text;


    // --------------------------------------------------------
    // Remove Markdown hard-break backslashes
    // --------------------------------------------------------

    result = result.replace(
        /\\[ \t]*\r?\n/g,
        "\n"
    );


    // --------------------------------------------------------
    // Convert display MathJax delimiters
    // --------------------------------------------------------

    result = result.replace(
        /\\\[/g,
        "$$"
    );


    result = result.replace(
        /\\\]/g,
        "$$"
    );


    // --------------------------------------------------------
    // Convert inline MathJax delimiters
    // --------------------------------------------------------

    result = result.replace(
        /\\\(/g,
        "$"
    );


    result = result.replace(
        /\\\)/g,
        "$"
    );


    return result;

}


// ============================================================
// RENDER AI RESPONSE
// ============================================================

function renderAIResponse(text) {

    if (!text) {

        return "";

    }


    try {

        // ----------------------------------------------------
        // Prepare Markdown + MathJax
        // ----------------------------------------------------

        const preparedText =
            prepareResponse(text);


        // ----------------------------------------------------
        // Convert Markdown to HTML
        // ----------------------------------------------------

        let html =
            marked.parse(preparedText);


        // ----------------------------------------------------
        // Sanitize HTML
        // ----------------------------------------------------

        if (
            typeof DOMPurify !== "undefined"
        ) {

            html =
                DOMPurify.sanitize(html);

        }


        return html;

    }

    catch (error) {

        console.error(
            "Response rendering error:",
            error
        );


        return escapeHTML(text);

    }

}


// ============================================================
// MATHJAX RENDERING
// ============================================================

function renderMath(element) {

    if (!element) {

        return;

    }


    if (

        window.MathJax &&

        typeof MathJax.typesetPromise ===
        "function"

    ) {

        MathJax.typesetPromise([element])

            .catch(function(error) {

                console.error(
                    "MathJax rendering error:",
                    error
                );

            });


        return;

    }


    if (

        window.MathJax &&

        MathJax.startup &&

        MathJax.startup.promise

    ) {

        MathJax.startup.promise

            .then(function() {

                return MathJax.typesetPromise(
                    [element]
                );

            })

            .catch(function(error) {

                console.error(
                    "MathJax rendering error:",
                    error
                );

            });

    }

}


// ============================================================
// WELCOME TEXT
// ============================================================

if (

    document.getElementById("welcome")

) {

    document.getElementById("welcome").innerText =
        `Welcome, ${username || "Student"}`;

}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

    // Remove authentication information

    localStorage.removeItem("token");

    localStorage.removeItem("username");

    localStorage.removeItem("user_id");


    // Return to login

    window.location.href =
        "login.html";

}


// ============================================================
// SHOW MEMORIES
// ============================================================

async function showMemories() {

    const panel =
        document.getElementById(
            "memory-panel"
        );


    if (!panel) {

        console.error(
            "Memory panel not found."
        );

        return;

    }


    // --------------------------------------------------------
    // Show loading
    // --------------------------------------------------------

    panel.style.display = "block";


    panel.innerHTML = `

        <h3>📚 Stored Knowledge</h3>

        <hr>

        <p>Loading memories...</p>

    `;


    try {

        // ----------------------------------------------------
        // Get JWT
        // ----------------------------------------------------

        const currentToken =
            localStorage.getItem("token");


        if (!currentToken) {

            panel.innerHTML = `

                <h3>📚 Stored Knowledge</h3>

                <hr>

                <p>❌ Please login first.</p>

            `;


            window.location.href =
                "login.html";


            return;

        }


        // ----------------------------------------------------
        // Request memories
        // ----------------------------------------------------

        const response =
            await fetch(

                `${API_URL}/memories`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${currentToken}`

                    }

                }

            );


        // ----------------------------------------------------
        // Handle unauthorized user
        // ----------------------------------------------------

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "username"
            );

            localStorage.removeItem(
                "user_id"
            );


            window.location.href =
                "login.html";


            return;

        }


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(

                `Memory request failed: ${response.status} ${errorText}`

            );

        }


        const data =
            await response.json();


        // ----------------------------------------------------
        // Clear panel
        // ----------------------------------------------------

        panel.innerHTML = `

            <h3>📚 Stored Knowledge</h3>

            <hr>

        `;


        const memories =
            Array.isArray(data.memories)
                ? data.memories
                : [];


        // ----------------------------------------------------
        // Remove duplicate memories
        // ----------------------------------------------------

        const uniqueMemories =
            [...new Set(memories)];


        if (
            uniqueMemories.length === 0
        ) {

            panel.innerHTML += `

                <p>No memories stored yet.</p>

            `;


            return;

        }


        // ----------------------------------------------------
        // Display memories
        // ----------------------------------------------------

        uniqueMemories.forEach(

            function(memory) {

                const memoryElement =
                    document.createElement("p");


                memoryElement.textContent =
                    `• ${memory}`;


                panel.appendChild(
                    memoryElement
                );

            }

        );

    }


    catch (error) {

        console.error(
            "Memory error:",
            error
        );


        panel.innerHTML = `

            <h3>📚 Stored Knowledge</h3>

            <hr>

            <p>
                ❌ Unable to load memories.
            </p>

        `;

    }

}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage() {

    const currentUsername =
        localStorage.getItem(
            "username"
        );


    const currentToken =
        localStorage.getItem(
            "token"
        );


    // --------------------------------------------------------
    // Authentication check
    // --------------------------------------------------------

    if (
        !currentUsername ||
        !currentToken
    ) {

        window.location.href =
            "login.html";


        return;

    }


    const messageInput =
        document.getElementById(
            "message"
        );


    if (!messageInput) {

        console.error(
            "Message input not found."
        );

        return;

    }


    const message =
        messageInput.value.trim();


    if (!message) {

        return;

    }


    const chatBox =
        document.getElementById(
            "chat-box"
        );


    if (!chatBox) {

        console.error(
            "Chat box not found."
        );

        return;

    }


    // ========================================================
    // USER MESSAGE
    // ========================================================

    const userMessage =
        document.createElement(
            "div"
        );


    userMessage.className =
        "user-message";


    userMessage.innerHTML = `

        <b>👤 ${escapeHTML(currentUsername)}</b>

        <br>

        ${escapeHTML(message)}

    `;


    chatBox.appendChild(
        userMessage
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;


    messageInput.value = "";


    // ========================================================
    // LOADING MESSAGE
    // ========================================================

    const loading =
        document.createElement(
            "div"
        );


    loading.id =
        "loading";


    loading.className =
        "agent-message";


    loading.innerHTML = `

        <div class="agent-name">

            🤖 Study Mentor

        </div>

        <div class="ai-content">

            Thinking...

        </div>

    `;


    chatBox.appendChild(
        loading
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;


    // ========================================================
    // SEND REQUEST TO BACKEND
    // ========================================================

    try {

        console.log(
            "Sending authenticated request to:",
            `${API_URL}/chat`
        );


        const response =
            await fetch(

                `${API_URL}/chat`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${currentToken}`

                    },

                    body: JSON.stringify({

                        message:
                            message

                    })

                }

            );


        console.log(
            "Backend status:",
            response.status
        );


        // ----------------------------------------------------
        // Token expired / invalid
        // ----------------------------------------------------

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "username"
            );

            localStorage.removeItem(
                "user_id"
            );


            window.location.href =
                "login.html";


            return;

        }


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(

                `Backend returned ${response.status}: ${errorText}`

            );

        }


        const data =
            await response.json();


        console.log(
            "AI response:",
            data
        );


        if (

            !data ||

            typeof data.response !==
            "string"

        ) {

            throw new Error(
                "Invalid response received from backend."
            );

        }


        // ====================================================
        // REMOVE LOADING MESSAGE
        // ====================================================

        if (loading) {

            loading.remove();

        }


        // ====================================================
        // CREATE AI MESSAGE
        // ====================================================

        const agentMessage =
            document.createElement(
                "div"
            );


        agentMessage.className =
            "agent-message";


        // ----------------------------------------------------
        // Render Markdown
        // ----------------------------------------------------

        const renderedResponse =
            renderAIResponse(
                data.response
            );


        agentMessage.innerHTML = `

            <div class="agent-name">

                🤖 Study Mentor

            </div>

            <div class="ai-content">

                ${renderedResponse}

            </div>

        `;


        chatBox.appendChild(
            agentMessage
        );


        chatBox.scrollTop =
            chatBox.scrollHeight;


        // ====================================================
        // RENDER MATH
        // ====================================================

        renderMath(
            agentMessage
        );

    }


    catch (error) {

        console.error(
            "Chat error:",
            error
        );


        if (loading) {

            loading.remove();

        }


        const errorMessage =
            document.createElement(
                "div"
            );


        errorMessage.className =
            "agent-message";


        errorMessage.innerHTML = `

            <div class="agent-name">

                ❌ Study Mentor

            </div>

            <div class="ai-content">

                Unable to connect to the
                Study Mentor backend.

                <br><br>

                Please check that FastAPI
                is running.

            </div>

        `;


        chatBox.appendChild(
            errorMessage
        );


        chatBox.scrollTop =
            chatBox.scrollHeight;

    }

}


// ============================================================
// ENTER KEY
// ============================================================

document.addEventListener(

    "DOMContentLoaded",

    function() {

        const input =
            document.getElementById(
                "message"
            );


        if (!input) {

            return;

        }


        input.addEventListener(

            "keydown",

            function(event) {

                if (

                    event.key === "Enter" &&

                    !event.shiftKey

                ) {

                    event.preventDefault();


                    sendMessage();

                }

            }

        );

    }

);


// ============================================================
// INITIAL WELCOME MESSAGE
// ============================================================

window.addEventListener(

    "load",

    function() {

        const chatBox =
            document.getElementById(
                "chat-box"
            );


        if (

            !chatBox ||

            !username

        ) {

            return;

        }


        const welcome =
            document.createElement(
                "div"
            );


        welcome.className =
            "agent-message";


        welcome.innerHTML = `

            <div class="agent-name">

                🤖 Study Mentor

            </div>

            <div class="ai-content">

                Welcome
                ${escapeHTML(username)}! 👋

                <br><br>

                I can remember your learning
                preferences, goals and weak
                subjects to help you study
                more effectively.

            </div>

        `;


        chatBox.appendChild(
            welcome
        );

    }

);