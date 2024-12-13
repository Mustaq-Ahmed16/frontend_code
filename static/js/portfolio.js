document.addEventListener('DOMContentLoaded', async () => {
    const portfolioList = document.getElementById('portfolio-list');
    const stockList = document.getElementById('assets-table-body');
    const currentBalanceElement = document.getElementById('current-balance');
    const profitLossElement = document.getElementById('profit-loss');

    try {
        // Fetch and display portfolios
        const portfolioResponse = await fetch(`/portfolios/user`);
        if (!portfolioResponse.ok) {
            throw new Error('Failed to fetch portfolio data');
        }

        const portfolios = await portfolioResponse.json();
        if (portfolios.length > 0) {
            portfolios.forEach((portfolio) => {
                const portfolioCard = document.createElement('div');
                portfolioCard.classList.add('portfolio-card');

				portfolioCard.innerHTML = `
				    <div class="card-actions">
				        <button class="edit-portfolio" data-portfolio-id="${portfolio.portfolioId}">📝</button>
				        <button class="delete-portfolio" data-portfolio-id="${portfolio.portfolioId}">🗑️</button>
				    </div>
				    <h3 class="portfolio-name">${portfolio.portfolioName}</h3>
				    <p class="investment-agenda">${portfolio.investmentAgenda}</p>
				    <p class="portfolio-id">Portfolio ID: <strong>${portfolio.portfolioId}</strong></p>
				    <button class="view-stocks" data-portfolio-id="${portfolio.portfolioId}">View Stocks</button>
				`;

                portfolioList.appendChild(portfolioCard);
            });

            // Add event listeners for viewing stocks
            document.querySelectorAll('.view-stocks').forEach((button) => {
                button.addEventListener('click', async (e) => {
                    const portfolioId = e.target.getAttribute('data-portfolio-id');
                    await fetchStocksByPortfolio(portfolioId);
                    await fetchPortfolioSummary(portfolioId);
                });
            });

            // Add event listeners for editing portfolios
            document.querySelectorAll('.edit-portfolio').forEach((button) => {
                button.addEventListener('click', async (e) => {
                    const portfolioId = e.target.getAttribute('data-portfolio-id');
                    const editUrl = `/portfolios/${portfolioId}`;

                    const updatedData = {
                        // Add modal or form logic here to get updated data
                        portfolioName: prompt("Enter the updated portfolio name: ", "Updated Portfolio Name"),
                        investmentAgenda: prompt("Enter the updated investment agenda: ", "Updated Investment Agenda"),
                    };

                    try {
                        const response = await fetch(editUrl, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(updatedData),
                        });

                        if (response.ok) {
                            alert('Portfolio updated successfully!');
                            location.reload(); // Reload the page to reflect changes
                        } else {
                            alert('Failed to update portfolio.');
                        }
                    } catch (error) {
                        console.error('Error updating portfolio:', error);
                    }
                });
            });

            // Add event listeners for deleting portfolios
            document.querySelectorAll('.delete-portfolio').forEach((button) => {
                button.addEventListener('click', async (e) => {
                    const portfolioId = e.target.getAttribute('data-portfolio-id');
                    const deleteUrl = `/portfolios/${portfolioId}`;

                    if (confirm('Are you sure you want to delete this portfolio?')) {
                        try {
                            const response = await fetch(deleteUrl, {
                                method: 'DELETE',
                            });

                            if (response.ok) {
                                alert('Portfolio deleted successfully!');
                                // Remove the portfolio card from the UI
                                e.target.closest('.portfolio-card').remove();
                            } else {
                                alert('Failed to delete portfolio.');
                            }
                        } catch (error) {
                            console.error('Error deleting portfolio:', error);
                        }
                    }
                });
            });
        } 
		
		
		
		else {
            portfolioList.innerHTML = '<li>No portfolios found</li>';
        }
    } catch (error) {
        console.error('Error fetching portfolios:', error);
        alert('An error occurred while loading your portfolios. Please try again later.');
    }

    // Fetch and display stocks for a specific portfolio
    async function fetchStocksByPortfolio(portfolioId) {
        try {
            const stockResponse = await fetch(`/stock/${portfolioId}`);
            if (!stockResponse.ok) {
                throw new Error(`Failed to fetch stocks: ${stockResponse.status}`);
            }

            const stocks = await stockResponse.json();
            stockList.innerHTML = ''; // Clear existing rows

            if (stocks.length > 0) {
                stocks.forEach((stock, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${stock.stockName}</td>
                        <td>${stock.currentPrice}</td>
                        <td class="${stock.percentChange24h >= 0 ? 'positive' : 'negative'}">${stock.percentChange24h}%</td>
                        <td>${stock.holdings}</td>
                        <td>${stock.avgBuyPrice}</td>
                        <td class="${stock.profitLoss >= 0 ? 'positive' : 'negative'}">${stock.profitLoss}</td>
                        <td><button class="sell-stock" data-stock-id="${stock.id}">Sell</button></td>
                    `;
                    stockList.appendChild(row);
                });
            } else {
                stockList.innerHTML = '<tr><td colspan="8">No stocks found</td></tr>';
            }
        } catch (error) {
            console.error('Error fetching stocks:', error);
            alert('An error occurred while loading stocks. Please try again later.');
        }
    }

    // Fetch portfolio summary (current balance and profit/loss)
    async function fetchPortfolioSummary(portfolioId) {
        try {
            const response = await fetch(`/portfolios/${portfolioId}/summary`);
            if (!response.ok) {
                throw new Error('Failed to fetch portfolio summary');
            }

            const summary = await response.json();
            const { totalValue, totalProfitLoss } = summary;

            currentBalanceElement.textContent = `₹${totalValue.toFixed(2)}`;
            profitLossElement.textContent = `${totalProfitLoss >= 0 ? '+' : ''}₹${totalProfitLoss.toFixed(2)}`;

            profitLossElement.classList.toggle('positive', totalProfitLoss >= 0);
            profitLossElement.classList.toggle('negative', totalProfitLoss < 0);
        } catch (error) {
            console.error('Error fetching portfolio summary:', error);
            alert('An error occurred while loading portfolio summary.');
        }
    }
});

// Logout functionality
const logoutButton = document.getElementById('logout-btn');

if (logoutButton) {
    logoutButton.addEventListener('click', function () {
        fetch('/logout', {
            method: 'POST',
            credentials: 'include',
        })
        .then(response => {
            if (response.ok) {
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
