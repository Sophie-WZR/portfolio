
import { fetchJSON, renderProjects } from '../global.js';

async function loadAndDisplayProjects() {
    try {
        const projects = await fetchJSON('../lib/projects.json'); // Load project data
        const projectsContainer = document.querySelector('.projects'); // Select the container

        if (projects && projects.length > 0) {
            renderProjects(projects, projectsContainer, 'h2'); // Render projects
        } else {
            projectsContainer.innerHTML = '<p>No projects available.</p>'; // Handle empty or invalid data
        }
    } catch (error) {
        console.error('Failed to load projects:', error);
        document.querySelector('.projects').innerHTML = '<p>Error loading projects.</p>'; // Error handling
    }
}

loadAndDisplayProjects();