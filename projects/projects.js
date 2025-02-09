import { fetchJSON, renderProjects, countProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// const projects = await fetchJSON('../lib/projects.json');

// const projectsContainer = document.querySelector('.projects');
// renderProjects(projects, projectsContainer, 'h2');

// const title = document.querySelector('h1');
// countProjects(projects, title)
  
// //   Create an arc generator
// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  
// let filteredProjects = projects
// let searchInput = document.querySelector('.searchBar');

// let selectedIndex = -1;

// function renderPieChart(projectsGiven) {
//   // Clear existing paths and legend items before re-rendering
//   let svg = d3.select('svg')
//   svg.selectAll('path').remove(); // Remove old pie slices
//   d3.select('.legend').selectAll('li').remove(); // Remove old legend items

//   // re-calculate rolled data
//   let newRolledData = d3.rollups(
//     projectsGiven,
//     (v) => v.length,
//     (d) => d.year,
//   );
//   // re-calculate data
//   let newData = newRolledData.map(([year, count]) => {
//     return { value: count, label: year };
//   });
//   // re-calculate slice generator, arc data, arc, etc.
//   let newSliceGenerator = d3.pie().value((d) => d.value);
//   let newArcData = newSliceGenerator(newData);
//   let newArcs = newArcData.map((d) => arcGenerator(d));

//   let colors = d3.scaleOrdinal(d3.schemeTableau10);
//   // clear up paths and legends
//   let legend = d3.select('.legend');

//   newArcs.forEach((arc, idx) => {
//     svg
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors(idx)) 
//       .on('click', () => {
//         selectedIndex = selectedIndex === idx ? -1 : idx; // Toggle selection
      
//         // Update classes for all paths
//         svg.selectAll('path')
//           .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

//         // Update legend to highlight selected item
//         d3.select('.legend')
//           .selectAll('li')
//           .attr('class', (_, idx) => (idx === selectedIndex ? 'legend-selected legend-item' : 'legend-item'));
        
//         // re render func
//         filterAndRenderProjects(newData);
//         });
//   })


//   // update paths and legends, refer to steps 1.4 and 2.2
//   newData.forEach((d, idx) => {
//     legend.append('li')
//           .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
//           .attr('class', 'legend-item') // Assign a class for styling
//           .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
// })
// }

// renderPieChart(projects);

// let query = '';


// searchInput.addEventListener('change', (event) => {
// //update query value
//     query = event.target.value.toLowerCase();
// //filter the projects
//     filteredProjects = projects.filter((project) => {
//         let values = Object.values(project).join('\n').toLowerCase();
//         return values.includes(query.toLowerCase());
//     });
// //render updated projects!
    
//     renderProjects(filteredProjects, projectsContainer, 'h2'); // Update the project list
//     renderPieChart(filteredProjects);
    
// });




// function filterAndRenderProjects(newData) {
//   console.log('clicked and updating')

//   filteredProjects = projects.filter((project) => {
//         let values = Object.values(project).join('\n').toLowerCase();
//         return values.includes(query.toLowerCase());
//     });

//   if (selectedIndex === -1) {
//       // If no pie slice is selected, show all projects
//       renderProjects(filteredProjects, projectsContainer, 'h2');
//   } else {
//       // Filter projects based on the selected pie slice's year
//       let selectedYear = newData[selectedIndex].label; // Get the year label of the selected slice
      
//       filteredProjects = filteredProjects.filter((project) => project.year === selectedYear);

//       renderProjects(filteredProjects, projectsContainer, 'h2'); // Update the project list
//   }
// }

// Fetch project data and initialize everything on page load
fetchJSON('../lib/projects.json').then(projects => {
    const projectsContainer = document.querySelector('.projects');
    renderProjects(projects, projectsContainer, 'h2');

    const title = document.querySelector('h1');
    countProjects(projects, title);

    const svg = d3.select('#projects-plot')
        .attr('viewBox', '-50 -50 100 100');

    const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    renderPieChart(projects);

    const searchInput = document.querySelector('.searchBar');
    searchInput.addEventListener('input', event => {
        const query = event.target.value.toLowerCase();
        const filteredProjects = projects.filter(p => 
            Object.values(p).join(' ').toLowerCase().includes(query)
        );
        renderProjects(filteredProjects, projectsContainer, 'h2');
        renderPieChart(filteredProjects);
    });

    function renderPieChart(projectsData) {
        svg.selectAll('*').remove(); // Clear the SVG content

        const rolledData = d3.rollups(
            projectsData,
            v => v.length,
            d => d.year
        );

        const data = rolledData.map(([year, count]) => ({ value: count, label: year }));
        const pie = d3.pie().value(d => d.value)(data);
        const colors = d3.scaleOrdinal(d3.schemeTableau10);

        svg.selectAll('path')
            .data(pie)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('fill', (d, i) => colors(i));

        // Update the legend
        const legend = d3.select('.legend').html('');
        data.forEach((d, i) => {
            legend.append('li')
                .style('--color', colors(i))
                .html(`<span class="swatch" style="background-color:${colors(i)};"></span> ${d.label} (${d.value})`);
        });
    }
});
