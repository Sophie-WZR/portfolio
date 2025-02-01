// Import functions from global.js
import { fetchJSON, renderProjects } from './global.js';

async function displayLatestProjects() {
    try {
        const projects = await fetchJSON('./lib/projects.json'); // Load all projects
        const latestProjects = projects.slice(0, 3); // Filter out the latest three projects

        // Proceed to render these projects
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

displayLatestProjects();
