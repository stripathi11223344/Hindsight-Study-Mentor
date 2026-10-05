// ==================================================
// CONFIGURATION
// ==================================================




// ==================================================
// AUTHENTICATION
// ==================================================

const token = localStorage.getItem("token");
const username = localStorage.getItem("username");


// If user is not logged in,
// send them back to login page.

if (!token) {

    window.location.href = "login.html";

}


// ==================================================
// DOM ELEMENTS
// ==================================================

const form =
    document.getElementById("profile-form");

const messageBox =
    document.getElementById("message");

const saveButton =
    document.getElementById("save-button");

const usernameDisplay =
    document.getElementById("username-display");


// ==================================================
// DISPLAY USERNAME
// ==================================================

if (username) {

    usernameDisplay.textContent =
        username;

}


// ==================================================
// SHOW MESSAGE
// ==================================================

function showMessage(message, type) {

    messageBox.textContent =
        message;

    messageBox.className =
        "message " + type;

}


// ==================================================
// GO TO CHAT
// ==================================================

function goToChat() {

    window.location.href =
        "chat.html";

}


// ==================================================
// LOGOUT
// ==================================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("username");

    localStorage.removeItem("user_id");

    window.location.href =
        "login.html";

}


// ==================================================
// HANDLE UNAUTHORIZED USER
// ==================================================

function handleUnauthorized() {

    localStorage.removeItem("token");

    localStorage.removeItem("username");

    localStorage.removeItem("user_id");

    window.location.href =
        "login.html";

}


// ==================================================
// SET FORM VALUE
// ==================================================

function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.value =
            value || "";

    }

}


// ==================================================
// GET FORM VALUE
// ==================================================

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {

        return "";

    }

    return element.value.trim();

}


// ==================================================
// LOAD PROFILE
// ==================================================

async function loadProfile() {

    try {

        const response =
            await fetch(
                `${API_URL}/profile`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        // ------------------------------------------
        // TOKEN INVALID / EXPIRED
        // ------------------------------------------

        if (response.status === 401) {

            handleUnauthorized();

            return;

        }


        const data =
            await response.json();


        // ------------------------------------------
        // API ERROR
        // ------------------------------------------

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.detail ||
                data.message ||
                "Unable to load profile."
            );

        }


        // ------------------------------------------
        // NO PROFILE YET
        // ------------------------------------------

        if (
            !data.profile_exists ||
            !data.profile
        ) {

            console.log(
                "No student profile found."
            );

            return;

        }


        // ------------------------------------------
        // PROFILE FOUND
        // ------------------------------------------

        const profile =
            data.profile;


        setValue(
            "weak_subjects",
            profile.weak_subjects
        );


        setValue(
            "strong_subjects",
            profile.strong_subjects
        );


        setValue(
            "learning_style",
            profile.learning_style
        );


        setValue(
            "goals",
            profile.goals
        );


        setValue(
            "career_goal",
            profile.career_goal
        );


        setValue(
            "programming_skills",
            profile.programming_skills
        );


        setValue(
            "current_learning",
            profile.current_learning
        );


        setValue(
            "persistent_difficulties",
            profile.persistent_difficulties
        );


        // Change button because
        // profile already exists.

        saveButton.textContent =
            "💾 Update Profile";


        console.log(
            "Profile loaded successfully."
        );


    }

    catch (error) {

        console.error(
            "Profile load error:",
            error
        );


        showMessage(
            "Unable to load your profile. Please try again.",
            "error"
        );

    }

}


// ==================================================
// SAVE / UPDATE PROFILE
// ==================================================

async function saveProfile(event) {

    event.preventDefault();


    // ------------------------------------------
    // DISABLE BUTTON WHILE SAVING
    // ------------------------------------------

    saveButton.disabled =
        true;

    saveButton.textContent =
        "Saving...";


    // ------------------------------------------
    // COLLECT FORM DATA
    // ------------------------------------------

    const profileData = {

        weak_subjects:
            getValue("weak_subjects"),

        strong_subjects:
            getValue("strong_subjects"),

        learning_style:
            getValue("learning_style"),

        goals:
            getValue("goals"),

        career_goal:
            getValue("career_goal"),

        programming_skills:
            getValue("programming_skills"),

        current_learning:
            getValue("current_learning"),

        persistent_difficulties:
            getValue(
                "persistent_difficulties"
            )

    };


    console.log(
        "PROFILE DATA:",
        profileData
    );


    try {


        // ==================================================
        // FIRST CHECK WHETHER PROFILE EXISTS
        // ==================================================

        const checkResponse =
            await fetch(
                `${API_URL}/profile`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        // ------------------------------------------
        // TOKEN INVALID
        // ------------------------------------------

        if (
            checkResponse.status === 401
        ) {

            handleUnauthorized();

            return;

        }


        const checkData =
            await checkResponse.json();


        if (!checkResponse.ok) {

            throw new Error(
                checkData.detail ||
                "Unable to check profile."
            );

        }


        // ==================================================
        // CHOOSE POST OR PUT
        // ==================================================

        const method =
            checkData.profile_exists
                ? "PUT"
                : "POST";


        console.log(
            "PROFILE REQUEST METHOD:",
            method
        );


        // ==================================================
        // SAVE PROFILE
        // ==================================================

        const response =
            await fetch(
                `${API_URL}/profile`,
                {
                    method: method,

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            profileData
                        )
                }
            );


        // ------------------------------------------
        // TOKEN INVALID
        // ------------------------------------------

        if (
            response.status === 401
        ) {

            handleUnauthorized();

            return;

        }


        const data =
            await response.json();


        // ------------------------------------------
        // API ERROR
        // ------------------------------------------

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.detail ||
                data.message ||
                "Unable to save profile."
            );

        }


        // ==================================================
        // SUCCESS
        // ==================================================

        saveButton.textContent =
            "💾 Update Profile";


        if (method === "POST") {

            showMessage(
                "Profile created successfully! 🎉",
                "success"
            );

        }

        else {

            showMessage(
                "Profile updated successfully! ✅",
                "success"
            );

        }


        console.log(
            "PROFILE SAVED SUCCESSFULLY."
        );


    }

    catch (error) {

        console.error(
            "Profile save error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to save profile.",
            "error"
        );


        saveButton.textContent =
            "💾 Save Profile";

    }


    finally {

        saveButton.disabled =
            false;


        if (
            saveButton.textContent ===
            "Saving..."
        ) {

            saveButton.textContent =
                "💾 Save Profile";

        }

    }

}


// ==================================================
// FORM SUBMIT EVENT
// ==================================================

form.addEventListener(
    "submit",
    saveProfile
);


// ==================================================
// LOAD PROFILE WHEN PAGE OPENS
// ==================================================

loadProfile();