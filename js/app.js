// User Login
const form = document.querySelector(".form");
const login = document.querySelector(".login-form");
const usernameInput = document.querySelector(".input-username");
const passwordInput = document.querySelector(".input-password");
const messageDiv = document.querySelector(".message");

// Top Dashboard
const dashboard = document.querySelector(".user-panel");
const fullName = document.querySelector(".fullName");
const email = document.querySelector(".email");
const balance = document.querySelector(".balance");
const id = document.querySelector(".id");
const joinDate = document.querySelector(".joinDate");

const logout = document.querySelector(".btn-logout");

// Left Dashboard
const tbody = document.querySelector(".tbody");
const total_calc = document.querySelector(".total-calc");
const total_deposit = document.querySelector(".total-deposit");
const total_withdraw = document.querySelector(".total-withdraw");

// Right Dashboard
const input_deposit = document.querySelector(".input-deposit");
const btn_transaction = document.querySelector(".btn-transaction");

// Reset User
let currentUser = null;

// Fetch Data
async function validationUser(username, password) {
  try {
    const response = await fetch("/db.json");

    if (!response.ok) {
      console.error(`HTTP server status: ${response.error}`);
    }

    const data = await response.json();

    const user = data.users.find(
      (u) => u.username === username && u.password === password
    );
    return user || null;
  } catch (error) {
    console.error("error:", error);
    return null;
  }
}

// check User Login
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value;
  const password = passwordInput.value;

  const user = await validationUser(username, password);

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    login.style.display = "none";
    dashboard.style.display = "grid";
    loadDashboard();
  } else {
    messageDiv.style.display = "flex";
    messageDiv.textContent = "Username or password is incorrect!";
  }
});

// Enter User Dashboard
function loadDashboard() {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  // Top Dashboard
  fullName.textContent = user.fullName;
  email.textContent = `(${user.email})`;
  balance.textContent = user.balance;
  id.textContent = user.accountNumber;
  joinDate.textContent = `(${user.joinDate})`;

  // Left Dashboard --- Transactions Table
  tbody.innerHTML = user.transactions
    .map(
      (transaction) => `
      <tr>
          <td>${transaction.type === "deposit" ? "Deposit" : "Withdraw"}</td>
          <td>${
            transaction.type === "deposit" ? "+" : "-"
          }${transaction.amount.toLocaleString()}</td>
          <td>${transaction.date.replace(/-/g, "/")}</td>
          <td>${transaction.description}</td>
          <td>${transaction.status}</td>
      </tr>
  `
    )
    .join("");

  // Calculate Deposit and Withdraw
  total_calc.innerHTML = user.transactions
    .reduce((acc, curr) => {
      if (curr.type === "deposit") {
        return (acc += curr.amount);
      } else {
        return acc - curr.amount;
      }
    }, 0)
    .toLocaleString();

  total_deposit.innerHTML = user.transactions
    .reduce(
      (acc, curr) =>
        (acc +=
          curr.type === "deposit" && curr.status === "Successful"
            ? curr.amount
            : 0),
      0
    )
    .toLocaleString();

  total_withdraw.innerHTML = user.transactions.reduce(
    (acc, curr) =>
      (acc +=
        curr.type === "withdrawal" && curr.status === "Successful"
          ? curr.amount
          : 0),
    0
  );
}

// Logout User
logout.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "/index.html";
});

// Keep User's Status
window.addEventListener("load", () => {
  const user = localStorage.getItem("currentUser");

  if (user) {
    login.style.display = "none";
    dashboard.style.display = "grid";
    loadDashboard();
  }
});
