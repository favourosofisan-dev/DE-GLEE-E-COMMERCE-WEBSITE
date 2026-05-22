const signInPanel = document.getElementById("signInPanel");
const signUpPanel = document.getElementById("signUpPanel");
const authTabs = document.querySelectorAll("[data-auth-tab]");
const authMessage = document.getElementById("authMessage");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const googleBtn = document.getElementById("googleSignIn");
const appleBtn = document.getElementById("appleSignIn");
const enterShopBtn = document.getElementById("enterShopBtn");
const guestShopLink = document.getElementById("guestShopLink");

function goToShop() {
  window.location.href = "shop.html";
}

function showMessage(text, type = "error") {
  if (!authMessage) {
    return;
  }

  authMessage.textContent = text;
  authMessage.className = `auth-message is-${type}`;
  authMessage.hidden = !text;
}

function setActiveTab(tab) {
  authTabs.forEach((button) => {
    const isActive = button.dataset.authTab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  signInPanel?.classList.toggle("is-active", tab === "sign-in");
  signUpPanel?.classList.toggle("is-active", tab === "sign-up");
  showMessage("");
}

function completeAuth(user, provider) {
  goToShop();
}

authTabs.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.authTab);
  });
});

signInForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(signInForm);

  try {
    const user = await loginUser({
      email: data.get("email"),
      password: data.get("password")
    });
    completeAuth(user);
  } catch (error) {
    showMessage(error.message);
  }
});

signUpForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(signUpForm);
  const password = String(data.get("password") || "");
  const confirm = String(data.get("confirmPassword") || "");

  if (password !== confirm) {
    showMessage("Passwords do not match.");
    return;
  }

  try {
    const user = await registerUser({
      name: data.get("name"),
      email: data.get("email"),
      password
    });
    completeAuth(user);
  } catch (error) {
    showMessage(error.message);
  }
});

googleBtn?.addEventListener("click", () => {
  showMessage("Google sign-in is not connected yet. Use email sign-in for now.", "info");
});

appleBtn?.addEventListener("click", () => {
  showMessage("Apple sign-in is not connected yet. Use email sign-in for now.", "info");
});

enterShopBtn?.addEventListener("click", goToShop);
guestShopLink?.addEventListener("click", (event) => {
  event.preventDefault();
  goToShop();
});

async function initializeAuthPage() {
  setActiveTab("sign-in");

  if (window.location.protocol === "file:") {
    showMessage("Run the DE GLEE server with npm start before using account authentication.", "info");
    return;
  }

  const session = await getSession();
  if (session) {
    goToShop();
  }
}

initializeAuthPage();
