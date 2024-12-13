document.addEventListener("DOMContentLoaded", function () {
    const budgetSection = document.getElementById("budget-section");
    const expenseSection = document.getElementById("expense-section");
    const budgetsList = document.getElementById("budgets-list");
    const expensesList = document.getElementById("expense-table-body");
    const addBudgetBtn = document.getElementById("add-budget-btn");
    const addExpenseBtn = document.getElementById("add-expense-btn");
    const backToBudgetsBtn = document.getElementById("back-to-budgets-btn");
    const budgetModal = document.getElementById("budget-modal");
    const expenseModal = document.getElementById("expense-modal");
    const modalBackdrop = document.getElementById("modal-backdrop");
    const saveBudgetBtn = document.getElementById("save-budget-btn");
    const closeBudgetModalBtn = document.getElementById("close-budget-modal");
    const saveExpenseBtn = document.getElementById("save-expense-btn");
    const closeExpenseModalBtn = document.getElementById("close-expense-modal");

    const API_BASE_URL = "http://localhost:8080";
    let currentBudgetId = null;

    // Helper functions
    function toggleModal(modal, show) {
        modal.classList.toggle("show", show);
        modalBackdrop.classList.toggle("show", show);
    }

    function clearList(list) {
        list.innerHTML = "";
    }

    async function fetchBudgets() {
        clearList(budgetsList);
        const response = await fetch(`${API_BASE_URL}/budgets`);
        const budgets = await response.json();

        budgets.forEach((budget) => {
            const budgetCard = document.createElement("div");
            budgetCard.classList.add("budget-card");

            const progressPercentage = (budget.expenses / budget.amount) * 100;
            const progressColor = progressPercentage >= 90 ? "red" : "blue";
             
			
			budgetCard.innerHTML = `
			    <h3>${budget.name}</h3>
			    <p>${budget.description}</p>
			    <p>Total Amount: ₹${budget.amount}</p>
			    <p>Expenses: ₹${budget.expenses}</p>
			    <div class="progress-container">
			        <div class="progress-bar" style="width: ${progressPercentage}%; background-color: ${progressColor};"></div>
			    </div>
			    <br>
			    <button class="view-expenses-btn" data-id="${budget.id}">View Expenses</button>
			    <button class="delete-budget-btn" data-id="${budget.id}">Delete Budget</button>
			`;


            budgetsList.appendChild(budgetCard);
        });

        // Attach event listeners to view expense buttons
        document.querySelectorAll(".view-expenses-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const budgetId = e.target.getAttribute("data-id");
                showExpenses(budgetId);
            });
        });
    }

    async function fetchExpenses(budgetId) {
        clearList(expensesList);
        const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}/expenses`);
        const expenses = await response.json();

        expenses.forEach((expense, index) => {
            const row = document.createElement("tr");
            const dateTime = new Date(expense.timestamp);
            const formattedDate = dateTime.toLocaleDateString();
            const formattedTime = dateTime.toLocaleTimeString();

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${expense.description}</td>
                <td>₹${expense.amount}</td>
                <td>${expense.budgetName}</td>
                <td>${formattedDate} ${formattedTime}</td>
            `;

            expensesList.appendChild(row);
        });
    }

    function showExpenses(budgetId) {
        currentBudgetId = budgetId;
        budgetSection.style.display = "none";
        expenseSection.style.display = "block";
        fetchExpenses(budgetId);
    }

    async function addBudget() {
        const name = document.getElementById("budget-name").value.trim();
        const description = document.getElementById("budget-description").value.trim();
        const amount = parseFloat(document.getElementById("budget-amount").value);

        if (!name || !description || isNaN(amount) || amount <= 0) {
            alert("Please fill all fields correctly!");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/budgets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, amount }),
            });

            if (response.ok) {
                toggleModal(budgetModal, false);
                fetchBudgets();
            } else {
                alert("Failed to add budget!");
            }
        } catch (error) {
            console.error("Error adding budget:", error);
        }
    }

    async function addExpense() {
        const name = document.getElementById("expense-name").value.trim();
        const amount = parseFloat(document.getElementById("expense-amount").value);

        if (!name || isNaN(amount) || amount <= 0) {
            alert("Please fill all fields correctly!");
            return;
        }

        try {
            const budgetResponse = await fetch(`${API_BASE_URL}/budgets/${currentBudgetId}`);
            if (!budgetResponse.ok) throw new Error("Failed to fetch budget details");

            const budget = await budgetResponse.json();
            const newTotalExpenses = budget.expenses + amount;

            if (newTotalExpenses > budget.amount) {
                alert(
                    `Out of Budget: Adding this expense will exceed the budget limit of ₹${budget.amount}. Current expenses: ₹${budget.expenses}, trying to add ₹${amount}.`
                );
                return;
            }

            const response = await fetch(`${API_BASE_URL}/budgets/${currentBudgetId}/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: name, amount }),
            });

            if (response.ok) {
                toggleModal(expenseModal, false);
                fetchExpenses(currentBudgetId);
                fetchBudgets();
            } else {
                alert("Failed to add expense!");
            }
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    }

    // Event Listeners
    addBudgetBtn.addEventListener("click", () => toggleModal(budgetModal, true));
    saveBudgetBtn.addEventListener("click", addBudget);
    closeBudgetModalBtn.addEventListener("click", () => toggleModal(budgetModal, false));
    addExpenseBtn.addEventListener("click", () => toggleModal(expenseModal, true));
    saveExpenseBtn.addEventListener("click", addExpense);
    closeExpenseModalBtn.addEventListener("click", () => toggleModal(expenseModal, false));
    modalBackdrop.addEventListener("click", () => {
        toggleModal(budgetModal, false);
        toggleModal(expenseModal, false);
    });

    backToBudgetsBtn.addEventListener("click", () => {
        expenseSection.style.display = "none";
        budgetSection.style.display = "block";
    });

    // Initial fetch
    fetchBudgets();
});

// Function to handle budget deletion
function deleteBudget(budgetId) {
    fetch(`http://localhost:8080/budgets/${budgetId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            alert('Budget deleted successfully!');
            
			location.reload();
			// Remove the budget card from the DOM
            document.querySelector(`.budget-card[data-id="${budgetId}"]`).remove();
			
			
			    } else {
            alert('Failed to delete budget. Please try again.');
        }
    })
    
}

// Add event listener to the delete button
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-budget-btn')) {
        const budgetId = event.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this budget?')) {
            deleteBudget(budgetId);
        }
    }
});





// Select the logout button
const logoutButton = document.getElementById('logout-btn');

// Add click event listener to the logout button
if (logoutButton) {
    logoutButton.addEventListener('click', function () {
        fetch('/logout', {
            method: 'POST', // Logout requires a POST request
            credentials: 'include', // Include cookies for session management
        })
        .then(response => {
            if (response.ok) {
                // Redirect to the login page with a logout message
                window.location.href = '/login?logout';
            } else {
                console.error('Logout failed');
                alert('Logout failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during logout. Please try again.');
        });
    });
} else {
    console.error('Logout button not found in the DOM.');
}




