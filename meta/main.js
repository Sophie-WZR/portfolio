// let data = [];
// let commits = [];
// let brushSelection = null;
// let xScale, yScale; // Declare global variables

// async function loadData() {
//   data = await d3.csv('loc.csv', (row) => ({
//     ...row,
//     line: Number(row.line), // or just +row.line
//     depth: Number(row.depth),
//     length: Number(row.length),
//     date: new Date(row.date + 'T00:00' + row.timezone),
//     datetime: new Date(row.datetime),
//   }));

//   displayStats();
//   createScatterplot();
// }

// function processCommits() {
//   commits = d3
//     .groups(data, (d) => d.commit)
//     .map(([commit, lines]) => {
//       let first = lines[0];
//       let { author, date, time, timezone, datetime } = first;
//       let ret = {
//         id: commit,
//         url: 'https://github.com/sophie-wzr/portfolio/commit/' + commit,
//         author,
//         date,
//         time,
//         timezone,
//         datetime,
//         hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
//         totalLines: lines.length,
//       };

//       Object.defineProperty(ret, 'lines', {
//         value: lines,
//         configurable: false,
//         writable: false,
//         enumerable: false,
//       });

//       return ret;
//     });
// }

// function displayStats() {
//   // Process commits first
//   processCommits();

//   // Add the title above the dl element
//   d3.select('#stats').append('h2').text('Summary');

//   // Create the dl element
//   const dl = d3.select('#stats').append('dl').attr('class', 'stats');

//   // Add total commits
//   dl.append('dt').text('Total Commits');
//   dl.append('dd').text(commits.length);

//   // Add total LOC
//   dl.append('dt').html('Total LOC');
//   dl.append('dd').text(data.length);

//   // Add more stats as needed...
//   // Number of files in the codebase
//   const numFiles = d3.rollups(data, (v) => v.length, (d) => d.file).length;
//   dl.append('dt').text('Number of Files');
//   dl.append('dd').text(numFiles);

//   // Maximum file length (in lines)
//   const maxFileLength = d3.max(data, (d) => d.length);
//   dl.append('dt').text('Max File Length');
//   dl.append('dd').text(maxFileLength);

//   // Longest line length
//   const longestLineLength = d3.max(data, (d) => d.line);
//   dl.append('dt').text('Longest Line Length');
//   dl.append('dd').text(longestLineLength);

//   // Day of the week that most work is done
//   const workByDay = d3.rollups(
//     data,
//     (v) => v.length,
//     (d) => new Date(d.datetime).toLocaleString('en', { weekday: 'long' })
//   );
//   const mostWorkDay = d3.max(workByDay, (d) => d[1]);
//   const dayWithMostWork = workByDay.find((d) => d[1] === mostWorkDay)[0];
//   dl.append('dt').text('Day with most work');
//   dl.append('dd').text(dayWithMostWork);
// }

// function createScatterplot() {
//   const width = 1000;
//   const height = 600;
//   const margin = { top: 10, right: 10, bottom: 30, left: 50 };

//   const usableArea = {
//     top: margin.top,
//     right: width - margin.right,
//     bottom: height - margin.bottom,
//     left: margin.left,
//     width: width - margin.left - margin.right,
//     height: height - margin.top - margin.bottom,
//   };

//   // Sort commits by total lines in descending order
//   const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

//   // Calculate the range of edited lines across all commits
//   const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

//   // Create a square root scale for the radius
//   const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([6, 50]);

//   // Create the SVG
//   const svg = d3
//     .select('#chart')
//     .append('svg')
//     .attr('viewBox', `0 0 ${width} ${height}`)
//     .style('overflow', 'visible');

//   // Create scales
//   xScale = d3
//     .scaleTime()
//     .domain(d3.extent(commits, (d) => d.datetime))
//     .range([usableArea.left, usableArea.right])
//     .nice();

//   yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);

//   // Add gridlines BEFORE the axes
//   const gridlines = svg
//     .append('g')
//     .attr('class', 'gridlines')
//     .attr('transform', `translate(${usableArea.left}, 0)`);

//   // Create gridlines as an axis with no labels and full-width ticks
//   gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

//   // Create the axes
//   const xAxis = d3.axisBottom(xScale);
//   const yAxis = d3.axisLeft(yScale).tickFormat(
//     (d) => String(d % 24).padStart(2, '0') + ':00'
//   );

//   // Add X axis
//   svg
//     .append('g')
//     .attr('transform', `translate(0, ${usableArea.bottom})`)
//     .call(xAxis);

//   // Add Y axis
//   svg
//     .append('g')
//     .attr('transform', `translate(${usableArea.left}, 0)`)
//     .call(yAxis);

//   // Draw the scatter plot
//   const dots = svg.append('g').attr('class', 'dots');

//   dots
//     .selectAll('circle')
//     .data(sortedCommits) // Use sortedCommits in your selection instead of commits
//     .join('circle')
//     .attr('cx', (d) => xScale(d.datetime))
//     .attr('cy', (d) => yScale(d.hourFrac))
//     .attr('r', (d) => rScale(d.totalLines))
//     .style('fill-opacity', 0.7) // Add transparency for overlapping dots
//     .on('mouseenter', function (event, d) {
//       d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
//       updateTooltipContent(d);
//       updateTooltipVisibility(true);
//       updateTooltipPosition(event);
//     })
//     .on('mouseleave', function () {
//       d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
//       updateTooltipContent({});
//       updateTooltipVisibility(false);
//     })
//     .on('mousemove', (event) => {
//       updateTooltipPosition(event);
//     });

//   // Create brush
//   const brush = d3.brush()
//     .extent([[0, 0], [width, height]])
//     .on('start brush end', brushed);

//   svg.append('g')
//     .attr('class', 'brush')
//     .call(brush);

//   // Raise dots and everything after overlay
//   svg.selectAll('.dots, .overlay ~ *').raise();
// }

// function brushed(event) {
//   brushSelection = event.selection;
//   updateSelection();
//   updateSelectionCount();
//   updateLanguageBreakdown();
// }

// function isCommitSelected(commit) {
//   if (!brushSelection) {
//     return false;
//   }
//   const [[x0, y0], [x1, y1]] = brushSelection;
//   const x = xScale(commit.datetime);
//   const y = yScale(commit.hourFrac);
//   return x0 <= x && x <= x1 && y0 <= y && y <= y1;
// }

// function updateSelection() {
//   // Update visual state of dots based on selection
//   d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
// }

// function updateSelectionCount() {
//   const selectedCommits = brushSelection
//     ? commits.filter(isCommitSelected)
//     : [];

//   const countElement = document.getElementById('selection-count');
//   countElement.textContent = `${
//     selectedCommits.length || 'No'
//   } commits selected`;

//   return selectedCommits;
// }

// function updateLanguageBreakdown() {
//   const selectedCommits = brushSelection
//     ? commits.filter(isCommitSelected)
//     : [];
//   const container = document.getElementById('language-breakdown');

//   if (selectedCommits.length === 0) {
//     container.innerHTML = `
//       <dt>Nothing is selected</dt>
//     `;
//     return;
//   }

//   const requiredCommits = selectedCommits.length ? selectedCommits : commits;
//   const lines = requiredCommits.flatMap((d) => d.lines);

//   // Use d3.rollup to count lines per language
//   const breakdown = d3.rollup(
//     lines,
//     (v) => v.length,
//     (d) => d.type
//   );

//   // Update DOM with breakdown
//   container.innerHTML = '';

//   for (const [language, count] of breakdown) {
//     const proportion = count / lines.length;
//     const formatted = d3.format('.1~%')(proportion);

//     container.innerHTML += `
//       <dt>${language}</dt>
//       <dd>${count} lines (${formatted})</dd>
//     `;
//   }

//   return breakdown;
// };


// function updateTooltipContent(commit) {
//   const link = document.getElementById('commit-link');
//   const date = document.getElementById('commit-date');
//   const time = document.getElementById('commit-time');
//   const author = document.getElementById('commit-author');
//   const lines = document.getElementById('commit-lines');

//   if (Object.keys(commit).length === 0) return;

//   link.href = commit.url;
//   link.textContent = commit.id;
//   date.textContent = commit.datetime?.toLocaleString('en', {
//     dateStyle: 'full',
//   });
//   time.textContent = commit.datetime?.toLocaleString('en', {
//     timeStyle: 'short',
//   });
//   author.textContent = commit.author;
//   lines.textContent = commit.totalLines;
// }

// function updateTooltipVisibility(isVisible) {
//   const tooltip = document.getElementById('commit-tooltip');
//   tooltip.hidden = !isVisible;
// }

// function updateTooltipPosition(event) {
//   const tooltip = document.getElementById('commit-tooltip');
//   tooltip.style.left = `${event.clientX + 8}px`;
//   tooltip.style.top = `${event.clientY}px`;
// }

// // Call the loadData function to test it out
// loadData();




import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let data = [];
let commits = [];
let brushSelection = null;
let xScale, yScale;
let selectedCommits = [];

let commitProgress;
let timeScale;
let commitMaxTime;
const slider = document.getElementById("commit_slider");
const selectedTime = d3.select("#commit_time");

let filteredCommits;

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  processCommits();
  updateFileDetails(commits);
  displayStats(commits);
  initializeCommitTime();
  updateScatterplot(commits);
  renderItemsFile(0);
}

function processCommits() {
  commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
    let first = lines[0];
    let { author, date, time, timezone, datetime } = first;

    let ret = {
      id: commit,
      url: 'https://github.com/YOUR_REPO/commit/' + commit,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };

    Object.defineProperty(ret, 'lines', {
      value: lines,
      enumerable: false,
      writable: false,
      configurable: false,
    });

    return ret;
  });
}

function displayStats(filteredCommits) {
  const statsContainer = d3.select("#stats");
  statsContainer.selectAll("dl").remove();

  const dl = statsContainer.append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Commits');
  dl.append('dd').text(filteredCommits.length);

  const uniqueFiles = new Set(data.map(d => d.file)).size;
  dl.append('dt').text('Files');
  dl.append('dd').text(uniqueFiles);

  const maxDepth = d3.max(data, d => d.depth);
  dl.append('dt').text('Max depth');
  dl.append('dd').text(maxDepth);

  const longestLine = d3.max(data, d => d.length);
  dl.append('dt').text('Longest line');
  dl.append('dd').text(longestLine);

  let hourFrequency = d3.rollup(
    commits,
    (v) => v.length,
    (d) => Math.floor(d.hourFrac)
  );

  let mostActiveHour = [...hourFrequency.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  dl.append('dt').text('Top hour');
  dl.append('dd').text(mostActiveHour + ":00");
}

const width = 1000;
const height = 600;
function updateScatterplot(filteredCommits) {
  if (!filteredCommits.length) return;

  let svg = d3.select("#chart").select("svg");

  if (svg.empty()) {
    svg = d3.select("#chart")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");
    brushSelector(svg);
  }

  const margin = { top: 10, right: 10, bottom: 20, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  xScale = d3.scaleTime()
    .domain(d3.extent(filteredCommits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  const [minLines, maxLines] = d3.extent(filteredCommits, d => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([5, 35]);

  const sortedCommits = d3.sort(filteredCommits, d => -d.totalLines);

  let dots = svg.select(".dots");
  if (dots.empty()) {
    dots = svg.append("g").attr("class", "dots");
  }

  updateTooltipVisibility(false);

  const circles = dots.selectAll("circle")
    .data(sortedCommits, d => d.datetime);

  circles.exit()
    .transition()
    .duration(500)
    .attr("cy", usableArea.top - 20)
    .attr("r", 0)
    .remove();

  circles.transition()
    .duration(1000)
    .attr("cx", d => xScale(d.datetime))
    .attr("cy", d => yScale(d.hourFrac))
    .attr("r", d => rScale(d.totalLines));

  circles.enter()
    .append("circle")
    .attr("cx", d => xScale(d.datetime))
    .attr("cy", usableArea.bottom + 50)
    .attr("r", 0)
    .attr("fill", "steelblue")
    .style("fill-opacity", 0.5)
    .transition()
    .duration(1000)
    .attr("cy", d => yScale(d.hourFrac))
    .attr("r", d => rScale(d.totalLines));

  dots.selectAll("circle")
    .on("mouseenter", function (event, d) {
      d3.select(event.currentTarget)
        .style("fill-opacity", 1)
        .classed("selected", isCommitSelected(d));
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on("mouseleave", function (event, d) {
      d3.select(event.currentTarget)
        .style("fill-opacity", 0.7)
        .classed("selected", isCommitSelected(d));
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });
}

function initializeCommitTime() {
  commitProgress = 100;
  let minTime = d3.min(commits, d => d.datetime);
  let maxTime = d3.max(commits, d => d.datetime);

  timeScale = d3.scaleTime()
    .domain([minTime, maxTime])
    .range([0, 100]);

  updateCommitTime();
}

function updateCommitTime() {
  commitProgress = +slider.value;
  commitMaxTime = timeScale.invert(commitProgress);

  selectedTime.text(commitMaxTime.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" }));

  filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);

  updateFileDetails(filteredCommits);
  displayStats(filteredCommits);
  updateScatterplot(filteredCommits);
}

slider.addEventListener("input", updateCommitTime);

function updateTooltipContent(commit) {
  const tooltip = document.getElementById('commit-tooltip');
  if (!tooltip) return;

  tooltip.innerHTML = `
        <strong>Commit:</strong> ${commit.id}<br>
        <strong>Date:</strong> ${commit.datetime?.toLocaleString('en', { dateStyle: 'full' })}<br>
        <strong>Time:</strong> ${commit.time}<br>
        <strong>Author:</strong> ${commit.author}<br>
        <strong>Lines Edited:</strong> ${commit.totalLines}
    `;

  tooltip.style.display = 'block';
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

loadData();
