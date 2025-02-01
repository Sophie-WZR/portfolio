// Import functions from global.js
import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

async function displayLatestProjects() {
    try {
        const projects = await fetchJSON('./lib/projects.json');
        const latestProjects = projects.slice(0, 3);

        const projectsContainer = document.querySelector('.projects');
        if (projectsContainer) {
            renderProjects(latestProjects, projectsContainer, 'h2');
        } else {
            console.error('Projects container not found on the homepage.');
        }
    } catch (error) {
        console.error('Error loading or rendering projects:', error);
    }
}

async function displayGitHubProfileStats() {
    try {
        const githubData = await fetchGitHubData('giorgianicolaou');
        const profileStats = document.querySelector('#profile-stats');

        if (profileStats && githubData) {
            profileStats.innerHTML = `
                <dl>
                    <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
                    <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
                    <dt>Followers:</dt><dd>${githubData.followers}</dd>
                    <dt>Following:</dt><dd>${githubData.following}</dd>
                </dl>
            `;
        } else {
            console.error('Profile stats container or GitHub data not found.');
        }
    } catch (error) {
        console.error('Error fetching GitHub profile stats:', error);
    }
}

displayLatestProjects();
displayGitHubProfileStats();
