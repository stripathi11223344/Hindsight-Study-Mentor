function login(){

    let username =
        document.getElementById("username").value;

    if(!username){
        alert("Enter your name");
        return;
    }

    localStorage.setItem(
        "username",
        username
    );

    window.location.href =
        "chat.html";
}