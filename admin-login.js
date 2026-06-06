const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginMessage = document.getElementById("adminLoginMessage");
const localBackendUrl = "http://127.0.0.1:3000/admin-login";

function showAdminLoginMessage(text, type = "error") {
  if (!adminLoginMessage) {
    return;
  }

  adminLoginMessage.textContent = text;
  adminLoginMessage.className = `auth-message is-${type}`;
  adminLoginMessage.hidden = !text;
}

function getLocalAccessWarning() {
  const host = window.location.hostname;
  const isLocalHost = host === "127.0.0.1" || host === "localhost";

  if (window.location.protocol === "file:") {
    return `Start the Node server and open ${localBackendUrl} for protected owner access.`;
  }

  if (isLocalHost && window.location.port && window.location.port !== "3000") {
    return `This page is open on the wrong local server. Use ${localBackendUrl} so the owner login can reach the backend.`;
  }

  return "";
}

async function checkExistingAdminSession() {
  const localAccessWarning = getLocalAccessWarning();
  if (localAccessWarning) {
    showAdminLoginMessage(localAccessWarning);
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

  const localAccessWarning = getLocalAccessWarning();
  if (localAccessWarning) {
    showAdminLoginMessage(localAccessWarning);
    return;
  }

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
