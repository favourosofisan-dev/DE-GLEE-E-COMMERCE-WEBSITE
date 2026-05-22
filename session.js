async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The DE GLEE server returned an invalid response. Restart npm start and reload the page.");
  }
}

async function requestAuth(path, payload, fallbackMessage) {
  if (window.location.protocol === "file:") {
    throw new Error("Authentication needs the DE GLEE server. Run npm start and open http://127.0.0.1:3000.");
  }

  let response;
  try {
    response = await fetch(path, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error("Unable to reach the DE GLEE server. Start npm start, then reload http://127.0.0.1:3000.");
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Authentication is not connected to the DE GLEE backend yet. Open the site with npm start at http://127.0.0.1:3000.");
  }

  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.error || data.details || fallbackMessage);
  }

  return data.user;
}

async function getSession() {
  if (window.location.protocol === "file:") {
    return null;
  }

  const response = await fetch("/api/auth/session", {
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = await readJsonResponse(response);
  return data.user || null;
}

async function registerUser(payload) {
  return requestAuth("/api/auth/register", payload, "Unable to create account.");
}

async function loginUser(payload) {
  return requestAuth("/api/auth/login", payload, "Unable to sign in.");
}

async function clearSession() {
  if (window.location.protocol === "file:") {
    return;
  }

  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json"
    }
  });
}
