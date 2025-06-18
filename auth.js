
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// ========================= Sign Up =========================
function signUpUser(event) {
  event.preventDefault();

  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const email = document.getElementById("signup-email").value.trim().toLowerCase();

  if (!username || !password || !email) {
    alert("Please fill in all fields.");
    return;
  }

  const users = getUsers();

  if (users.some(u => u.username === username)) {
    alert("Username already exists!");
    return;
  }

  if (users.some(u => u.email === email)) {
    alert("Email is already registered!");
    return;
  }

  users.push({ username, password, email });

  saveUsers(users);

  alert("Account created successfully! Please login.");
  window.location.href = "login.html";
}

// ========================= Login =========================
function loginUser(event) {
  event.preventDefault();

  const input = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!input || !password) {
    alert("Please fill in all fields.");
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.username === input || u.email === input);

  if (!user) {
    alert("User not found.");
    return;
  }

  if (user.password !== password) {
    alert("Incorrect password.");
    return;
  }

  sessionStorage.setItem("loggedInUser", JSON.stringify(user));

  alert("Login successful!");
  window.location.href = "home.html";

if (!checkLoginStatus()) {
} else {
  const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));
  console.log("Welcome " + loggedInUser.username);
}

}

// ========================= Logout =========================
function logoutUser() {
  sessionStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

// ========================= ตรวจสอบสถานะ login =========================
function checkLoginStatus() {
  const user = sessionStorage.getItem("loggedInUser");
  if (!user) {
    alert("You must login first.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// ========================= Forgot Password =========================
function forgotPassword(event) {
  event.preventDefault();

  const email = document.getElementById("forgot-email").value.trim().toLowerCase();

  if (!email) {
    alert("Please enter your email.");
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    alert("Email not found. Please try again or sign up.");
    return;
  }

  alert("We have sent you an email to reset your password.");
  
  window.location.href = "check_email.html";
}

// ========================= Reset Password =========================
function resetPassword(event) {
  event.preventDefault();

  const newPassword = document.getElementById("new-password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  if (!newPassword || !confirmPassword) {
    alert("Please fill in all fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }
  const userData = sessionStorage.getItem("passwordResetUser");
  if (!userData) {
    alert("No user to reset password for. Please try forgot password again.");
    window.location.href = "forgot.html";
    return;
  }

  const users = getUsers();
  const resetUser = JSON.parse(userData);


  const userIndex = users.findIndex(u => u.email === resetUser.email);

  if (userIndex === -1) {
    alert("User not found.");
    window.location.href = "forgot.html";
    return;
  }

  users[userIndex].password = newPassword;

  saveUsers(users);

  sessionStorage.removeItem("passwordResetUser");

  alert("Password reset successfully! Please login.");
  window.location.href = "login.html";
}

// ========================= reset-password.html =========================
function prepareResetPassword(email) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (user) {
    sessionStorage.setItem("passwordResetUser", JSON.stringify(user));
  } else {
    alert("User not found")

    window.location.href = "forgot.html";
  }
}


