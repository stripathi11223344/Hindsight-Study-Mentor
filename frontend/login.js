// ============================================================
// BACKEND URL
// ============================================================




// ============================================================
// ELEMENTS
// ============================================================

const messageElement =
    document.getElementById("message");


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(message, type = "error") {

    messageElement.textContent = message;

    messageElement.className =
        "message " + type;

}


// ============================================================
// CLEAR MESSAGE
// ============================================================

function clearMessage() {

    messageElement.textContent = "";

    messageElement.className =
        "message";

}


// ============================================================
// SHOW LOGIN
// ============================================================

function showLogin() {

    document.getElementById("login-form").style.display =
        "block";

    document.getElementById("register-form").style.display =
        "none";


    document.getElementById("login-tab").classList.add(
        "active"
    );

    document.getElementById("register-tab").classList.remove(
        "active"
    );


    clearMessage();
}


// ============================================================
// SHOW REGISTER
// ============================================================

function showRegister() {

    document.getElementById("login-form").style.display =
        "none";

    document.getElementById("register-form").style.display =
        "block";


    document.getElementById("register-tab").classList.add(
        "active"
    );

    document.getElementById("login-tab").classList.remove(
        "active"
    );


    clearMessage();
}


// ============================================================
// LOGIN
// ============================================================

async function login() {

    clearMessage();


    const username =
        document.getElementById(
            "login-username"
        ).value.trim();


    const password =
        document.getElementById(
            "login-password"
        ).value;


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!username) {

        showMessage(
            "Please enter your username."
        );

        return;
    }


    if (!password) {

        showMessage(
            "Please enter your password."
        );

        return;
    }


    try {

        showMessage(
            "Logging in...",
            "loading"
        );


        // ----------------------------------------------------
        // Send login request
        // ----------------------------------------------------

        const response = await fetch(
            `${API_URL}/login`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    username: username,

                    password: password

                })

            }
        );


        const data =
            await response.json();


        // ----------------------------------------------------
        // Login failed
        // ----------------------------------------------------

        if (!response.ok || !data.success) {

            showMessage(

                data.message ||
                "Invalid username or password."

            );

            return;
        }


        // ----------------------------------------------------
        // Save authentication information
        // ----------------------------------------------------

        localStorage.setItem(
            "token",
            data.token
        );


        localStorage.setItem(
            "username",
            data.username
        );


        localStorage.setItem(
            "user_id",
            data.user_id
        );


        // ----------------------------------------------------
        // Success
        // ----------------------------------------------------

        showMessage(
            "Login successful! Opening Study Mentor...",
            "success"
        );


        setTimeout(
            function() {

                window.location.href =
                    "chat.html";

            },
            500
        );


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            "Cannot connect to Study Mentor server. Make sure the backend is running."
        );

    }

}


// ============================================================
// REGISTER
// ============================================================

async function register() {

    clearMessage();


    const username =
        document.getElementById(
            "register-username"
        ).value.trim();


    const password =
        document.getElementById(
            "register-password"
        ).value;


    const confirmPassword =
        document.getElementById(
            "register-confirm-password"
        ).value;


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!username) {

        showMessage(
            "Please choose a username."
        );

        return;
    }


    if (username.length < 3) {

        showMessage(
            "Username must contain at least 3 characters."
        );

        return;
    }


    if (!password) {

        showMessage(
            "Please create a password."
        );

        return;
    }


    if (password.length < 8) {

        showMessage(
            "Password must contain at least 8 characters."
        );

        return;
    }


    if (password !== confirmPassword) {

        showMessage(
            "Passwords do not match."
        );

        return;
    }


    try {

        showMessage(
            "Creating your account...",
            "loading"
        );


        // ----------------------------------------------------
        // Send registration request
        // ----------------------------------------------------

        const response = await fetch(
            `${API_URL}/register`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    username: username,

                    password: password

                })

            }
        );


        const data =
            await response.json();


        // ----------------------------------------------------
        // Registration failed
        // ----------------------------------------------------

        if (!response.ok || !data.success) {

            showMessage(

                data.message ||
                "Unable to create account."

            );

            return;
        }


        // ----------------------------------------------------
        // Save authentication information
        // ----------------------------------------------------

        localStorage.setItem(
            "token",
            data.token
        );


        localStorage.setItem(
            "username",
            data.username
        );


        localStorage.setItem(
            "user_id",
            data.user_id
        );


        // ----------------------------------------------------
        // Success
        // ----------------------------------------------------

        showMessage(
            "Account created successfully! Opening Study Mentor...",
            "success"
        );


        setTimeout(
            function() {

                window.location.href =
                    "chat.html";

            },
            500
        );


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showMessage(
            "Cannot connect to Study Mentor server. Make sure the backend is running."
        );

    }

}


// ============================================================
// ENTER KEY SUPPORT
// ============================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key !== "Enter") {

            return;
        }


        const loginForm =
            document.getElementById(
                "login-form"
            );


        const registerForm =
            document.getElementById(
                "register-form"
            );


        if (
            loginForm.style.display !== "none"
        ) {

            login();

        } else {

            register();

        }

    }
);