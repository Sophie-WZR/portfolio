// import { fetchJSON, renderProjects, countProjects } from '../global.js';
// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// const projects = await fetchJSON('../lib/projects.json');

// const projectsContainer = document.querySelector('.projects');
// renderProjects(projects, projectsContainer, 'h2');

// const title = document.querySelector('h1');
// countProjects(projects, title)

// // Assuming 'projects-plot' is the id of the SVG container in your HTML
// const svg = d3.select('#projects-plot')
//   .attr('viewBox', '-50 -50 100 100');

// // Data for the pie chart with labels
// let data = [
//     { value: 1, label: 'Apples' },
//     { value: 2, label: 'Oranges' },
//     { value: 3, label: 'Mangos' },
//     { value: 4, label: 'Pears' },
//     { value: 5, label: 'Limes' },
//     { value: 5, label: 'Cherries' }
//   ];
  
//   // Create an arc generator
//   let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  
//   // Create pie slice generator
//   let sliceGenerator = d3.pie().value(d => d.value);
//   let arcData = sliceGenerator(data);
  
//   // Colors scale
//   let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
//   // Generate and append paths for pie slices
//   arcData.forEach((d, i) => {
//     svg.append('path')
//       .attr('d', arcGenerator(d))
//       .attr('fill', colors(i));
//   });
  
//   // Add legend to the visualization
//   const legend = d3.select('.legend');
//   data.forEach((d, i) => {
//       legend.append('li')
//             .style('color', colors(i))
//             .html(`<span class="swatch" style="background-color:${colors(i)};"></span> ${d.label} (${d.value})`);
//   });


import { fetchJSON, renderProjects, countProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Fetch the project data
const projects = await fetchJSON('../lib/projects.json');

// Calculate the number of projects per year using d3.rollups
let rolledData = d3.rollups(
  projects,
  v => v.length,  // Count the number of projects
  d => d.year     // Group by the 'year' property
);

// Convert the rolled data into a suitable format for the pie chart
let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});

const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const title = document.querySelector('h1');
countProjects(projects, title);

const svg = d3.select('#projects-plot')
  .attr('viewBox', '-50 -50 100 100');

// Create an arc generator
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Create pie slice generator
let sliceGenerator = d3.pie().value(d => d.value);
let arcData = sliceGenerator(data);

// Colors scale
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Generate and append paths for pie slices
arcData.forEach((d, i) => {
  svg.append('path')
    .attr('d', arcGenerator(d))
    .attr('fill', colors(i));
});

// Generate a legend for the pie chart
const legend = d3.select('.legend');
data.forEach((d, i) => {
    legend.append('li')
          .style('color', colors(i))
          .html(`<span class="swatch" style="background-color:${colors(i)};"></span> ${d.label} (${d.value})`);
});
