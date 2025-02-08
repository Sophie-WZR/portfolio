import { fetchJSON, renderProjects, countProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const title = document.querySelector('h1');
countProjects(projects, title)

// Assuming 'projects-plot' is the id of the SVG container in your HTML
const svg = d3.select('#projects-plot')
  .attr('viewBox', '-50 -50 100 100');

// Create an arc generator
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Create a full circle path
let pathData = arcGenerator({
  startAngle: 0,
  endAngle: 2 * Math.PI
});

// Append path to the SVG
svg.append('path')
  .attr('d', pathData)
  .attr('fill', 'red');
