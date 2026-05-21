const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginMessage = document.getElementById("adminLoginMessage");

function showAdminLoginMessage(text, type = "error") {
  if (!adminLoginMessage) {
    return;
  }

  adminLoginMessage.textContent = text;
  adminLoginMessage.className = `auth-message is-${type}`;
  adminLoginMessage.hidden = !text;
}

async function checkExistingAdminSession() {
  if (window.location.protocol === "file:") {
    showAdminLoginMessage("Start the Node server and open http://127.0.0.1:3000/admin-login for protected owner access.");
    return;
  }

  try {
    const response = await fetch("/api/admin/session", {
      credentials: "include",
      headers: {
        Accept: "application/json"
      }
    });

    if (response.ok) {
      window.location.href = "/admin";
    }
  } catch {
    showAdminLoginMessage("Unable to reach the backend. Start the local server first.");
  }
}

adminLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(adminLoginForm);
  showAdminLoginMessage("Signing in...", "success");

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || "")
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "Unable to sign in.");
    }

    window.location.href = "/admin";
  } catch (error) {
    showAdminLoginMessage(error.message);
  }
});

checkExistingAdminSession();
