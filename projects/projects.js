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

async function main() {
    const projects = await fetchJSON('../lib/projects.json');
    const projectsContainer = document.querySelector('.projects');
    renderProjects(projects, projectsContainer, 'h2');

    const title = document.querySelector('h1');
    countProjects(projects, title);

    const svg = d3.select('#projects-plot')
        .attr('viewBox', '-50 -50 100 100');

    // Create an arc generator
    const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    // Initial rendering of the pie chart
    renderPieChart(projects);

    // Search functionality
    const searchInput = document.querySelector('.searchBar');
    searchInput.addEventListener('input', event => {
        const query = event.target.value.toLowerCase();
        const filteredProjects = projects.filter(p => {
            return Object.values(p).join(' ').toLowerCase().includes(query);
        });
        renderProjects(filteredProjects, projectsContainer, 'h2');
        renderPieChart(filteredProjects);
    });

    function renderPieChart(projectsData) {
        svg.selectAll('*').remove(); // Clear existing SVG content

        const rolledData = d3.rollups(
            projectsData,
            v => v.length,
            d => d.year
        );

        const data = rolledData.map(([year, count]) => ({ value: count, label: year }));
        const pie = d3.pie().value(d => d.value)(data);
        const colors = d3.scaleOrdinal(d3.schemeTableau10);

        const paths = svg.selectAll('path')
            .data(pie)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('fill', (d, i) => colors(i))
            .attr('stroke', 'white')
            .on('mouseover', function() {
                d3.select(this).transition().duration(300).attr('opacity', 0.5);
            })
            .on('mouseout', function() {
                d3.select(this).transition().duration(300).attr('opacity', 1);
            })
            .on('click', function(event, d) {
                const year = d.data.label;
                const isSelected = d3.select(this).classed('selected');
                svg.selectAll('path').classed('selected', false);
                if (!isSelected) {
                    d3.select(this).classed('selected', true);
                    const filteredProjects = projects.filter(p => p.year === year);
                    renderProjects(filteredProjects, projectsContainer, 'h2');
                } else {
                    renderProjects(projects, projectsContainer, 'h2');
                }
            });

        // Update the legend
        const legend = d3.select('.legend').html('');
        data.forEach((d, i) => {
            legend.append('li')
                .style('--color', colors(i))
                .html(`<span class="swatch" style="background-color:${colors(i)};"></span> ${d.label} (${d.value})`);
        });
    }
}

main();
