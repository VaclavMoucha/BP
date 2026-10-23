 const loginButton = document.querySelector(".admin-btn");
 async function login() {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (data.success) {
          window.location.href = "/admin";
        } else {
          document.getElementById("login-error").textContent =
            "Špatné jméno nebo heslo";
        }
      }
loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  login();
});