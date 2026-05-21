const SESSION_KEY = "deglee-session-v1";
const USERS_KEY = "deglee-users-v1";

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      email: user.email,
      name: user.name || user.email.split("@")[0],
      provider: user.provider || "email"
    })
  );
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hashPassword(password) {
  return btoa(unescape(encodeURIComponent(password)));
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return getUsers().find((user) => user.email === normalized);
}

function registerUser({ email, password, name }) {
  const normalized = email.trim().toLowerCase();

  if (!normalized || !password) {
    throw new Error("Email and password are required.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  if (findUserByEmail(normalized)) {
    throw new Error("An account with this email already exists.");
  }

  const users = getUsers();
  const user = {
    email: normalized,
    name: name?.trim() || normalized.split("@")[0],
    passwordHash: hashPassword(password),
    provider: "email",
    createdAt: Date.now()
  };

  users.push(user);
  saveUsers(users);
  return user;
}

function loginUser({ email, password }) {
  const normalized = email.trim().toLowerCase();
  const user = findUserByEmail(normalized);

  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error("Incorrect email or password.");
  }

  return user;
}

function socialSignIn(provider) {
  const email = `${provider}-user@deglee.demo`;
  let user = findUserByEmail(email);

  if (!user) {
    const users = getUsers();
    user = {
      email,
      name: provider === "google" ? "Google User" : "Apple User",
      provider,
      createdAt: Date.now()
    };
    users.push(user);
    saveUsers(users);
  }

  return user;
}
