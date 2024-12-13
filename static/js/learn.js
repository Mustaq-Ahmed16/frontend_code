const BASE_URL = 'http://localhost:8080/api'; // Update with your backend base URL
const articlesList = document.getElementById('articles');
const categoryFilters = document.querySelectorAll('#category-filters input[type="checkbox"]');

// Fetch articles from the backend
async function fetchArticles() {
    try {
        const response = await fetch(`${BASE_URL}/articles`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
    }
}

// Filter articles based on the selected category
function filterArticles(articles, selectedCategory) {
    return articles.filter(article => article.category.toLowerCase() === selectedCategory);
}

// Render articles to the DOM
function renderArticles(articles) {
    articlesList.innerHTML = ''; // Clear existing articles
    if (articles.length === 0) {
        articlesList.innerHTML = '<li>Please select a category to get Articles.</li>';
        return;
    }
	articles.forEach(article => {
	      const listItem = document.createElement('li');
	      listItem.innerHTML = `
	          <h4>${article.title}</h4>
	       
			  <p><strong></strong> 
			                 <a href="${article.link}" target="_blank" rel="noopener noreferrer">
			                     Click here to read more
			                 </a>
			             </p>
	          
	      `;
	      articlesList.appendChild(listItem);
	  });
}

// Add event listeners to checkboxes
async function initialize() {
    const articles = await fetchArticles();

    // Add change listener to checkboxes
    categoryFilters.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Uncheck all other checkboxes
            categoryFilters.forEach(cb => cb !== checkbox && (cb.checked = false));

            // If the current checkbox is checked, filter articles
            const selectedCategory = checkbox.checked ? checkbox.value.toLowerCase() : '';
            const filteredArticles = selectedCategory
                ? filterArticles(articles, selectedCategory)
                : []; // If no category is selected, display no articles

            renderArticles(filteredArticles);
        });
    });

    // Render all articles initially (optional, or keep it empty)
    renderArticles([]);
}

initialize();


async function fetchVideos() {
    try {
        const response = await fetch(`${BASE_URL}/videos`);
        const videos = await response.json();

        renderVideos(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
    }
}

function renderVideos(videos) {
    const videosList = document.getElementById('videos');
    videosList.innerHTML = ''; // Clear any existing content

    if (videos.length === 0) {
        videosList.innerHTML = '<li>No videos available.</li>';
        return;
    }

    videos.forEach(video => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="video-card">
                <a href="${video.url}" target="_blank" rel="noopener noreferrer">
                    <img src="https://img.youtube.com/vi/${getYoutubeVideoId(video.url)}/0.jpg" alt="${video.title}">
                    <p>${video.title}</p>
                </a>
            </div>
        `;
        videosList.appendChild(listItem);
    });
}

function getYoutubeVideoId(url) {
    const urlParams = new URL(url).searchParams;
    return urlParams.get('v');
}

// Call the function to fetch videos when the page loads
fetchVideos();



let quizzes = [];
let currentQuizIndex = 0;

async function fetchQuiz() {
    try {
        const response = await fetch(`${BASE_URL}/quiz`);
        quizzes = await response.json();
        displayQuiz(currentQuizIndex);
    } catch (error) {
        console.error("Error fetching quiz data:", error);
    }
}

function displayQuiz(index) {
    if (index >= quizzes.length) {
        document.getElementById("quiz-container").innerHTML = `
            <p>Congratulations! You've completed the quiz.</p>
        `;
        return;
    }

    const quiz = quizzes[index];
    document.getElementById("question").innerText = `Question ${index + 1}/${quizzes.length}: ${quiz.question}`;
    document.getElementById("answer").value = "";
    document.getElementById("feedback").innerText = "";
}

function checkAnswer() {
    const userAnswer = document.getElementById("answer").value.trim().toLowerCase();
    const correctAnswer = quizzes[currentQuizIndex].answer.toLowerCase();

    if (userAnswer === correctAnswer) {
        document.getElementById("feedback").innerText = "Correct! 🎉";
        document.getElementById("feedback").style.color = "green";
        setTimeout(() => {
            currentQuizIndex++;
            displayQuiz(currentQuizIndex);
        }, 1000);
    } else {
        document.getElementById("feedback").innerText = "Incorrect. Try again!";
        document.getElementById("feedback").style.color = "red";
    }
}

// Fetch and display the first quiz on page load
fetchQuiz();


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

