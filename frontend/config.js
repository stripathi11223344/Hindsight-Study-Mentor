// ==================================================
// STUDY MENTOR AI - ENVIRONMENT CONFIGURATION
// ==================================================

const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000"
        : "https://study-mentor-ai.onrender.com";

console.log("Study Mentor API:", API_URL);