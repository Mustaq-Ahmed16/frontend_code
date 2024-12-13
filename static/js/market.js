document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.querySelector('#crypto-table tbody');
    const errorMessage = document.getElementById('error-message');

    const paginationContainer = document.getElementById('pagination-container');
    const rowsPerPage = 25; // Number of rows to display per page
    let currentPage = 1; // Initialize current page
    let cryptoData = []; // Store crypto data globally

    
    const renderTable = (data, page) => {
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        tableBody.innerHTML = ''; // Clear the table
        const pageData = data.slice(startIndex, endIndex);

        pageData.forEach((crypto, index) => {
            const row = document.createElement('tr');

                    // Create and append each cell
                    const indexCell = document.createElement('td');
                    indexCell.textContent = index + 1;
                    row.appendChild(indexCell);

                    const nameCell = document.createElement('td');
            nameCell.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <img src="${crypto.icon}" alt="${crypto.name}" width="40" height="40" style="border-radius: 50%; margin-right: 10px;">
                    <div class="crypto-name-symbol">
                        <div class="crypto-name">${crypto.name}</div>
                        <div class="crypto-symbol">${crypto.symbol.toUpperCase()}</div>
                    </div>
                </div>
            `;
            row.appendChild(nameCell);

                    const priceCell = document.createElement('td');
                    priceCell.textContent = `$${crypto.price.toFixed(2)}`;
                    row.appendChild(priceCell);

                    const change24hCell = document.createElement('td');
                    change24hCell.classList.add(crypto.percent_change_24h > 0 ? 'price-up' : 'price-down');
                    change24hCell.textContent = `${crypto.percent_change_24h.toFixed(2)}%`;
                    row.appendChild(change24hCell);

                    const change7dCell = document.createElement('td');
                    change7dCell.classList.add(crypto.percent_change_7d > 0 ? 'price-up' : 'price-down');
                    change7dCell.textContent = `${crypto.percent_change_7d.toFixed(2)}%`;
                    row.appendChild(change7dCell);

                    const marketCapCell = document.createElement('td');
                    marketCapCell.textContent = `$${crypto.market_cap.toLocaleString()}`;
                    row.appendChild(marketCapCell);

                    const volumeCell = document.createElement('td');
                    volumeCell.textContent = `$${crypto.total_volume.toLocaleString()}`;
                    row.appendChild(volumeCell);

                    const supplyCell = document.createElement('td');
                    supplyCell.textContent = `${crypto.circulating_supply.toLocaleString()} ${crypto.name}`;
                    row.appendChild(supplyCell);

                    // Append the row to the table body
                    tableBody.appendChild(row);
                });
                renderPagination(data.length, page);
            }
            const renderPagination = (totalItems, page) => {
                paginationContainer.innerHTML = ''; // Clear pagination
        
                const totalPages = Math.ceil(totalItems / rowsPerPage);
        
                for (let i = 1; i <= totalPages; i++) {
                    const pageButton = document.createElement('button');
                    pageButton.textContent = i;
                    pageButton.classList.add('pagination-button');
                    if (i === page) {
                        pageButton.classList.add('active');
                    }
        
                    pageButton.addEventListener('click', () => {
                        currentPage = i; // Update the current page
                        renderTable(cryptoData, currentPage); // Render for the selected page
                    });
        
                    paginationContainer.appendChild(pageButton);
                }
    };

    const fetchAndUpdateData = () => {
        fetch('/cryptocurrency')
            .then(response => response.json())
            .then(data => {
                cryptoData = data; // Update the data globally
                errorMessage.style.display = 'none'; // Hide error message

                // Re-render the table for the current page only
                renderTable(cryptoData, currentPage);
            })
            .catch(error => {
                console.error('Error fetching cryptocurrency data:', error);
                errorMessage.textContent = 'Failed to load cryptocurrency data. Please try again later.';
                errorMessage.style.display = 'block';
            });
    };

    // Load initial data
    fetchAndUpdateData();

    // Keep the current page after data refresh
    setInterval(() => {
        fetchAndUpdateData();
    }, 5000);
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


