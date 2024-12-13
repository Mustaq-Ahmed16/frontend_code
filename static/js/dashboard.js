document.addEventListener("DOMContentLoaded", function () {
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

            const indexCell = document.createElement('td');
            indexCell.textContent = startIndex + index + 1;
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

            tableBody.appendChild(row);
        });

        renderPagination(data.length, page);
    };

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
        fetch('/dash/cryptocurrency')
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
    }, 10000);
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


//
// Fetch the trending cryptocurrencies from the backend
async function fetchTrendingCoins() {
    try {
        const response = await fetch('/dash/trending-cryptocurrency');
        if (!response.ok) {
            throw new Error('Failed to fetch trending cryptocurrencies');
        }
        const trendingCoins = await response.json();
        displayTrendingCoins(trendingCoins);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('trending-coins-list').innerHTML = 'Failed to load trending coins.';
    }
}

// Display the trending coins in the left container
function displayTrendingCoins(coins) {
    const container = document.getElementById('trending-coins-list');
    container.innerHTML = ''; // Clear any existing content

    if (coins && coins.length > 0) {
        coins.forEach(coin => {
            const coinElement = document.createElement('div');
            coinElement.classList.add('coin');

            coinElement.innerHTML = `
                <div class="coin-info">
                    <img src="${coin.logo}" alt="${coin.name}" width="40" height="40">
                    <div class="crypto-name-symbol">
                        <div class="crypto-name">${coin.name}</div>
                        <div class="crypto-symbol">${coin.symbol.toUpperCase()}</div>
                    </div>
                </div>
                <div class="market-rank">Rank: #${coin.market_cap_rank}</div>
            `;
            container.appendChild(coinElement);
        });
    } else {
        container.innerHTML = 'No trending coins available.';
    }
}

// Call the function to fetch and display the trending coins on page load
document.addEventListener('DOMContentLoaded', fetchTrendingCoins);


// Function to fetch the latest crypto news from the backend API
function fetchCryptoNews() {
    // Make a fetch request to the /dash/crypto-news endpoint
    fetch('/dash/crypto-news')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch crypto news');
            }
            return response.json();
        })
        .then(data => {
            // Display the news articles in the #crypto-news-list
            const newsList = document.getElementById('crypto-news-list');
            newsList.innerHTML = ''; // Clear any existing content

            // Loop through the data and create HTML for each article
            data.forEach(article => {
                const articleDiv = document.createElement('div');
                articleDiv.classList.add('news-article');

                const title = document.createElement('h3');
                title.textContent = article.title || 'No title available';

                const description = document.createElement('p');
                description.textContent = article.description || 'No description available';

                const source = document.createElement('span');
                source.textContent = `Source: ${article.source || 'Unknown source'}`;

                const readMore = document.createElement('a');
                readMore.href = article.url || '#';
                readMore.textContent = 'Read more';
                readMore.target = '_blank'; // Open in a new tab

                // Append the elements to the articleDiv
                articleDiv.appendChild(title);
                articleDiv.appendChild(description);
                articleDiv.appendChild(source);
                articleDiv.appendChild(readMore);

                // Append the articleDiv to the news list
                newsList.appendChild(articleDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            document.getElementById('crypto-news-list').innerHTML = 'Failed to load news. Please try again later.';
        });
}

// Call the fetchCryptoNews function when the page loads
document.addEventListener('DOMContentLoaded', fetchCryptoNews);



