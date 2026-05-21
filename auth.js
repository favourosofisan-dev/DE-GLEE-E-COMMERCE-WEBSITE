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
  setSession({
    email: user.email,
    name: user.name,
    provider: provider || user.provider || "email"
  });
  goToShop();
}

authTabs.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.authTab);
  });
});

signInForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(signInForm);

  try {
    const user = loginUser({
      email: data.get("email"),
      password: data.get("password")
    });
    completeAuth(user);
  } catch (error) {
    showMessage(error.message);
  }
});

signUpForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(signUpForm);
  const password = String(data.get("password") || "");
  const confirm = String(data.get("confirmPassword") || "");

  if (password !== confirm) {
    showMessage("Passwords do not match.");
    return;
  }

  try {
    const user = registerUser({
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
  completeAuth(socialSignIn("google"), "google");
});

appleBtn?.addEventListener("click", () => {
  completeAuth(socialSignIn("apple"), "apple");
});

enterShopBtn?.addEventListener("click", goToShop);
guestShopLink?.addEventListener("click", (event) => {
  event.preventDefault();
  goToShop();
});

if (getSession()) {
  goToShop();
}

setActiveTab("sign-in");
