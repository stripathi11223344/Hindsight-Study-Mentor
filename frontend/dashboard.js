/* =========================================================
   STUDY MENTOR AI — DASHBOARD JAVASCRIPT
   ========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */



const token =
    localStorage.getItem("token");

const username =
    localStorage.getItem("username");


/* =========================================================
   AUTHENTICATION
========================================================= */

if (!token) {

    window.location.href =
        "login.html";

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const usernameElement =
    document.getElementById(
        "username"
    );

const welcomeNameElement =
    document.getElementById(
        "welcome-name"
    );

const avatarElement =
    document.getElementById(
        "user-avatar"
    );

const currentLearningContent =
    document.getElementById(
        "current-learning-content"
    );

const learningStyleElement =
    document.getElementById(
        "learning-style"
    );

const careerGoalElement =
    document.getElementById(
        "career-goal"
    );

const programmingSkillsElement =
    document.getElementById(
        "programming-skills"
    );

const weakSubjectsElement =
    document.getElementById(
        "weak-subjects"
    );

const subjectListElement =
    document.getElementById(
        "subject-list"
    );

const memoryCountElement =
    document.getElementById(
        "memory-count"
    );

const goalsCountElement =
    document.getElementById(
        "goals-count"
    );

const topicsCountElement =
    document.getElementById(
        "topics-count"
    );


/* =========================================================
   DISPLAY USER
========================================================= */

function displayUser() {

    if (!username) {
        return;
    }


    if (usernameElement) {

        usernameElement.textContent =
            username;

    }


    if (welcomeNameElement) {

        welcomeNameElement.textContent =
            username;

    }


    if (avatarElement) {

        avatarElement.textContent =
            username
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

    try {

        const response =
            await fetch(
                `${API_URL}/dashboard`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        /* ---------------------------------------------
           Authentication failure
        --------------------------------------------- */

        if (response.status === 401) {

            handleUnauthorized();

            return;

        }


        if (!response.ok) {

            throw new Error(
                `Dashboard request failed: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!data.success) {

            console.error(
                "Dashboard API error:",
                data
            );

            return;

        }


        console.log(
            "DASHBOARD DATA:",
            data
        );


        /* ---------------------------------------------
           Render all dashboard sections
        --------------------------------------------- */

        renderDashboard(
            data
        );


    }

    catch (error) {

        console.error(
            "DASHBOARD LOAD ERROR:",
            error
        );

    }

}


/* =========================================================
   RENDER DASHBOARD
========================================================= */

function renderDashboard(
    data
) {

    const user =
        data.user || {};

    const profile =
        data.profile || {};

    const memories =
        Array.isArray(
            data.memories
        )
            ? data.memories
            : [];


    /* =====================================================
       USER
    ===================================================== */

    renderUser(
        user
    );


    /* =====================================================
       PROFILE
    ===================================================== */

    renderProfile(
        profile
    );


    /* =====================================================
       MEMORY COUNT
    ===================================================== */

    if (memoryCountElement) {

        memoryCountElement.textContent =
            data.memory_count ??
            memories.length;

    }


    /* =====================================================
       GOALS
    ===================================================== */

    renderGoals(
        profile.goals
    );


    /* =====================================================
       TOPICS
    ===================================================== */

    renderTopics(
        profile
    );


    /* =====================================================
       CURRENT LEARNING
    ===================================================== */

    renderCurrentLearning(
        profile.current_learning
    );


    /* =====================================================
       WEAK SUBJECTS
    ===================================================== */

    renderWeakSubjects(
        profile.weak_subjects
    );


    /* =====================================================
       SUBJECT LIST
    ===================================================== */

    renderSubjectProgress(
        profile
    );


    /* =====================================================
       MEMORIES
    ===================================================== */

    renderRecentMemories(
        memories
    );

}


/* =========================================================
   RENDER USER
========================================================= */

function renderUser(
    user
) {

    const currentUsername =
        user.username ||
        username ||
        "Student";


    if (usernameElement) {

        usernameElement.textContent =
            currentUsername;

    }


    if (welcomeNameElement) {

        welcomeNameElement.textContent =
            currentUsername;

    }


    if (avatarElement) {

        avatarElement.textContent =
            currentUsername
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================================================
   RENDER PROFILE
========================================================= */

function renderProfile(
    profile
) {


    /* ---------------------------------------------
       Learning style
    --------------------------------------------- */

    if (learningStyleElement) {

        learningStyleElement.textContent =
            profile.learning_style ||
            "Not set";

    }


    /* ---------------------------------------------
       Career goal
    --------------------------------------------- */

    if (careerGoalElement) {

        careerGoalElement.textContent =
            profile.career_goal ||
            "Not set";

    }


    /* ---------------------------------------------
       Programming skills
    --------------------------------------------- */

    if (programmingSkillsElement) {

        programmingSkillsElement.textContent =
            profile.programming_skills ||
            "Not set";

    }

}


/* =========================================================
   RENDER GOALS
========================================================= */

function renderGoals(
    goals
) {

    if (!goalsCountElement) {
        return;
    }


    if (
        !goals ||
        !String(goals).trim()
    ) {

        goalsCountElement.textContent =
            "0";

        return;

    }


    const goalItems =
        splitProfileValues(
            goals
        );


    goalsCountElement.textContent =
        goalItems.length;

}


/* =========================================================
   RENDER TOPICS
========================================================= */

function renderTopics(
    profile
) {

    if (!topicsCountElement) {
        return;
    }


    const topics = [];


    addSubjects(
        topics,
        profile.current_learning
    );


    addSubjects(
        topics,
        profile.weak_subjects
    );


    addSubjects(
        topics,
        profile.strong_subjects
    );


    topicsCountElement.textContent =
        topics.length;

}


/* =========================================================
   CURRENT LEARNING
========================================================= */

function renderCurrentLearning(
    currentLearning
) {

    if (!currentLearningContent) {
        return;
    }


    if (
        !currentLearning ||
        !String(currentLearning).trim()
    ) {

        currentLearningContent.innerHTML = `

            <div class="empty-learning">

                <div>
                    📖
                </div>

                <h4>
                    Your learning journey
                </h4>

                <p>
                    Add your current learning
                    topics in your profile.
                </p>

                <a href="profile.html">
                    Update Profile →
                </a>

            </div>

        `;

        return;

    }


    const topics =
        splitProfileValues(
            currentLearning
        );


    let html = `

        <div class="learning-topics">

    `;


    topics.forEach(
        (
            topic,
            index
        ) => {

            html += `

                <div
                    class="learning-topic"
                >

                    <div
                        class="learning-topic-number"
                    >
                        ${index + 1}
                    </div>

                    <div
                        class="learning-topic-content"
                    >

                        <strong>
                            ${escapeHTML(topic)}
                        </strong>

                        <span>
                            Currently learning
                        </span>

                    </div>

                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    currentLearningContent.innerHTML =
        html;

}


/* =========================================================
   WEAK SUBJECTS
========================================================= */

function renderWeakSubjects(
    weakSubjects
) {

    if (!weakSubjectsElement) {
        return;
    }


    if (
        !weakSubjects ||
        !String(weakSubjects).trim()
    ) {

        weakSubjectsElement.innerHTML = `

            <div class="weak-empty">

                <span>
                    🌱
                </span>

                <p>
                    Add your weak subjects in
                    your profile to get
                    personalized guidance.
                </p>

            </div>

        `;

        return;

    }


    const subjects =
        splitProfileValues(
            weakSubjects
        );


    weakSubjectsElement.innerHTML =
        subjects
            .map(
                subject => `

                    <span class="weak-tag">
                        ${escapeHTML(subject)}
                    </span>

                `
            )
            .join("");

}


/* =========================================================
   SUBJECT PROGRESS
=========================================================

   IMPORTANT:

   Your current database does not yet contain actual
   subject progress percentages.

   Therefore this function does NOT invent percentages.

   We will connect real progress tracking later.
========================================================= */

function renderSubjectProgress(
    profile
) {

    if (!subjectListElement) {
        return;
    }


    const subjects = [];


    addSubjects(
        subjects,
        profile.weak_subjects
    );


    addSubjects(
        subjects,
        profile.strong_subjects
    );


    addSubjects(
        subjects,
        profile.current_learning
    );


    const uniqueSubjects = [];


    subjects.forEach(
        subject => {

            const exists =
                uniqueSubjects.some(
                    existing =>
                        existing.toLowerCase() ===
                        subject.toLowerCase()
                );


            if (!exists) {

                uniqueSubjects.push(
                    subject
                );

            }

        }
    );


    if (!uniqueSubjects.length) {

        subjectListElement.innerHTML = `

            <div class="progress-empty">

                <span>
                    📊
                </span>

                <p>
                    Add subjects to your profile
                    to see them here.
                </p>

            </div>

        `;

        return;

    }


    subjectListElement.innerHTML =
        uniqueSubjects
            .slice(0, 8)
            .map(
                subject => `

                    <div
                        class="subject-row"
                    >

                        <div
                            class="subject-header"
                        >

                            <span
                                class="subject-name"
                            >
                                ${escapeHTML(subject)}
                            </span>

                            <span
                                class="subject-percent"
                            >
                                Tracking soon
                            </span>

                        </div>

                        <div
                            class="progress-track"
                        >

                            <div
                                class="progress-bar"
                                style="width: 0%;"
                            ></div>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   RECENT MEMORIES
========================================================= */

function renderRecentMemories(
    memories
) {

    const activityList =
        document.getElementById(
            "activity-list"
        );


    if (!activityList) {
        return;
    }


    if (!memories.length) {

        activityList.innerHTML = `

            <div class="activity-empty">

                <div class="activity-empty-icon">
                    📖
                </div>

                <div>

                    <strong>
                        Your learning activity will
                        appear here
                    </strong>

                    <p>
                        Continue chatting with your
                        AI mentor to build your
                        learning history.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    /*
     * The /dashboard endpoint currently gives us
     * long-term memories, not timestamped activity.
     *
     * Therefore we display them as learning facts
     * instead of pretending they are dated activities.
     */

    const visibleMemories =
        memories.slice(
            0,
            5
        );


    activityList.innerHTML =
        visibleMemories
            .map(
                memory => `

                    <div
                        class="activity-item"
                    >

                        <div
                            class="activity-icon"
                        >
                            🧠
                        </div>

                        <div
                            class="activity-content"
                        >

                            <strong>
                                Learning memory
                            </strong>

                            <span>
                                ${escapeHTML(memory)}
                            </span>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   ADD SUBJECTS
========================================================= */

function addSubjects(
    array,
    value
) {

    if (
        !value ||
        !String(value).trim()
    ) {

        return;

    }


    const subjects =
        splitProfileValues(
            value
        );


    subjects.forEach(
        subject => {

            const exists =
                array.some(
                    existing =>
                        existing.toLowerCase() ===
                        subject.toLowerCase()
                );


            if (!exists) {

                array.push(
                    subject
                );

            }

        }
    );

}


/* =========================================================
   SPLIT PROFILE VALUES
========================================================= */

function splitProfileValues(
    value
) {

    if (!value) {

        return [];

    }


    return String(value)

        .split(
            /[,;\n]+/
        )

        .map(
            item =>
                item.trim()
        )

        .filter(
            item =>
                item.length > 0
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebar-overlay"
        );


    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle(
        "mobile-open"
    );


    if (overlay) {

        overlay.classList.toggle(
            "show"
        );

    }

}


/* =========================================================
   OPEN MEMORIES
========================================================= */

function openMemoriesFromDashboard(
    event
) {

    event.preventDefault();


    localStorage.setItem(
        "openMemories",
        "true"
    );


    window.location.href =
        "chat.html";

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "openMemories"
    );


    window.location.href =
        "login.html";

}


/* =========================================================
   HANDLE UNAUTHORIZED
========================================================= */

function handleUnauthorized() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "openMemories"
    );


    window.location.href =
        "login.html";

}


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

async function initializeDashboard() {

    displayUser();

    await loadDashboard();

}


/* =========================================================
   START DASHBOARD
========================================================= */

initializeDashboard();