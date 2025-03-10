import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let data = [];
let commits = [];
let brushSelection = null
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
        line: Number(row.line), // or just +row.line
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
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        
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
          totalLines: lines.length
        };

        Object.defineProperty(ret, 'lines', {
            value: lines,
            enumerable: false,
            writable: false,
            configurable: false

          });
        
        return ret;
      });

    console.log('processed commits',commits);
}

function displayStats(filteredCommits) {
    // Process commits first
    // Select the stats container and clear previous content
    const statsContainer = d3.select("#stats");
    statsContainer.selectAll("dl").remove(); // Remove old dl before creating a new one

    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats')

    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // Add total commits
    dl.append('dt').text('Commits');
    dl.append('dd').text(filteredCommits.length);

    const uniqueFiles = new Set(data.map(d => d.file)).size;
    dl.append('dt').text('Files');
    dl.append('dd').text(uniqueFiles);

    // Add maximum depth
    const maxDepth = d3.max(data, d => d.depth);
    dl.append('dt').text('Max depth');
    dl.append('dd').text(maxDepth);

    // Add longest line
    const longestLine = d3.max(data, d => d.length);
    dl.append('dt').text('Longest line');
    dl.append('dd').text(longestLine);
    
  

    // **Most active commit hour**
    let hourFrequency = d3.rollup(
      commits,
      (v) => v.length,
      (d) => Math.floor(d.hourFrac) // Group by hour
    );

    let mostActiveHour = [...hourFrequency.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    dl.append('dt').text('Top hour');
    dl.append('dd').text(mostActiveHour + ":00");

}


  
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();  
});

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
      .domain([0, 24]) // 0 to 24 hours
      .range([usableArea.bottom, usableArea.top]); // Flip y-axis

  const [minLines, maxLines] = d3.extent(filteredCommits, d => d.totalLines);
  const rScale = d3.scaleSqrt()
      .domain([minLines, maxLines])
      .range([5, 35]);

  const sortedCommits = d3.sort(filteredCommits, d => -d.totalLines);

  // Update axes
  let xAxisGroup = svg.select(".x-axis");
  let yAxisGroup = svg.select(".y-axis");

  if (xAxisGroup.empty()) {
      xAxisGroup = svg.append("g").attr("class", "x-axis");
  }
  if (yAxisGroup.empty()) {
      yAxisGroup = svg.append("g").attr("class", "y-axis");
  }

  xAxisGroup
      .attr("transform", `translate(0, ${usableArea.bottom})`)
      .transition().duration(1000)
      .call(d3.axisBottom(xScale));

  yAxisGroup
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .transition().duration(1000)
      .call(d3.axisLeft(yScale).tickFormat(d => `${String(d).padStart(2, "0")}:00`));

  let dots = svg.select(".dots");
  if (dots.empty()) {
      dots = svg.append("g").attr("class", "dots");
  }

  updateTooltipVisibility(false);

  // Bind data and update circles with transitions
  const circles = dots.selectAll("circle")
      .data(sortedCommits, d => d.datetime); // Key by datetime to track updates

  // EXIT: Circles rise up and disappear
  circles.exit()
      .transition()
      .duration(500)
      .attr("cy", usableArea.top - 20) // Move up above the chart
      .attr("r", 0) // Shrink out
      .remove();

  // UPDATE: Smooth transition for circles that remain
  circles
      .transition()
      .duration(1000)
      .attr("cx", d => xScale(d.datetime))
      .attr("cy", d => yScale(d.hourFrac))
      .attr("r", d => rScale(d.totalLines));

  // ENTER: Circles appear from below and move to correct position
  circles.enter()
      .append("circle")
      .attr("cx", d => xScale(d.datetime)) // X position is correct
      .attr("cy", usableArea.bottom + 50) // Start below the chart
      .attr("r", 0) // Start small
      .attr("fill", "steelblue")
      .style("fill-opacity", 0.5)
      .transition()
      .duration(1000)
      .attr("cy", d => yScale(d.hourFrac)) // Move up to correct y position
      .attr("r", d => rScale(d.totalLines)); // Grow to correct size

  // Hover interactions
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



function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}
function updateTooltipContent(commit) {

  //console.log("Hovered commit:", commit);

  const tooltip = document.getElementById('commit-tooltip'); 
  if (!tooltip) return;

  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) {
    return;
  }

  tooltip.innerHTML = `
        <strong>Commit:</strong> ${commit.id}<br>
        <strong>Date:</strong> ${commit.datetime?.toLocaleString('en', { dateStyle: 'full' })}<br>
        <strong>Time:</strong> ${commit.time}<br>
        <strong>Author:</strong> ${commit.author}<br>
        <strong>Lines Edited:</strong> ${commit.totalLines}
    `;

  tooltip.style.display = 'block';
}


function brushSelector(svg) {

  if (!svg) {
    console.error("Error: SVG is undefined in brushSelector!");
    return;
  }
  const brush = d3.brush()
        .on("start brush end", brushed);

  svg.append("g")
      .attr("class", "brush")
      .call(brush);

  svg.selectAll('.dots, .brush ~ *').raise();
  console.log('commti inside brushSelect:',commits)
}

function brushed(event) {
  let brushSelection = event.selection;

  console.log('commits inside brushed',filteredCommits);

  selectedCommits = !brushSelection
    ? []
    : filteredCommits.filter((commit) => {
      //console.log('current commit:', commit)
        let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        let x = xScale(commit.date);
        let y = yScale(commit.hourFrac);

        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });

  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown()
}

function isCommitSelected(commit) {

  return selectedCommits.includes(commit);
}

function updateSelection() {
  d3.selectAll('circle')
    .classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCircles = d3.selectAll('circle')
    .classed('selected', (d) => isCommitSelected(d));

  //Extract the selected commits from the selected circles' data
  const selectedCommits = selectedCircles.data().filter(isCommitSelected);

  //Update the commit count in the UI
  const countElement = document.getElementById('selection-count');
  if (countElement) {
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  }

  return selectedCommits;
}

function updateLanguageBreakdown() {
  // Get selected circles (visually selected commits)
  const selectedCircles = d3.selectAll('circle').filter('.selected');

  // Extract the selected commits from the selected circles' data
  const selectedCommits = selectedCircles.data();
  

  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}



function initializeCommitTime() {
  commitProgress = 100;
  //console.log('commit at end', commits);
  let minTime = d3.min(commits, d => d.datetime);
  let maxTime = d3.max(commits, d => d.datetime);
  
  console.log('Min Time:', minTime, 'Max Time:', maxTime);

  timeScale = d3.scaleTime()
      .domain([minTime, maxTime])
      .range([0, 100]);

  updateCommitTime();
}

let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);

function updateFileDetails(filteredCommits) {
  // Extract all lines from filtered commits
  let lines = filteredCommits.flatMap(d => d.lines);
  
  // **Group files by commit, then sort by total lines**
  let commitsGrouped = d3.groups(filteredCommits, d => d.datetime)
      .map(([datetime, commits]) => ({
          datetime,
          totalLines: d3.sum(commits, c => c.totalLines), // Sum lines per commit
          files: d3.groups(commits.flatMap(d => d.lines), d => d.file)
              .map(([name, lines]) => ({ name, lines }))
              .sort((a, b) => b.lines.length - a.lines.length) // Sort files by total lines (Descending)
      }))
      .sort((a, b) => b.totalLines - a.totalLines); // **Sort commits by total lines (Most lines first)**

  // **Limit to top 5 commits**
  commitsGrouped = commitsGrouped.slice(0, 5);

  // Select the files container and remove previous entries
  d3.select('.files').selectAll('div').remove();

  // Bind commit groups to the container
  let commitContainers = d3.select('.files')
      .selectAll('div.commit-group')
      .data(commitsGrouped)
      .enter()
      .append('div')
      .attr('class', 'commit-group');

  // Append file list **sorted by total lines**
  let fileRows = commitContainers.append('div')
      .attr('class', 'file-row');

  fileRows.append('p')
      .html(d => d.files.map(f => `<code>${f.name}</code>`).join(" + "));

  // Append unit visualization **sorted by total lines**
  let filesContainer = fileRows.append('div')
      .attr('class', 'file-visualization');

  filesContainer.selectAll('div')
      .data(d => d.files.flatMap(f => f.lines)) // Flatten all file lines into one row
      .enter()
      .append('div')
      .attr('class', 'line-dot') // Apply the 'line-dot' class for circle dots
      .style('background', d => fileTypeColors(d.type)); // Color by technology type

  // Append line count below dots
  fileRows.append('p')
      .attr('class', 'file-line-count')
      .text(d => `${d.totalLines} lines`);
}




function updateCommitTime() {
  commitProgress = +slider.value;
  commitMaxTime = timeScale.invert(commitProgress);

  selectedTime.text(commitMaxTime.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" }));

  // Filter commits that should be shown
  filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);

  // Update scatterplot dynamically
  renderItemsFile(0);

  updateFileDetails(filteredCommits);

  displayStats(filteredCommits)
  
  updateScatterplot(filteredCommits);
}

// Ensure the scatterplot updates smoothly as the slider moves
slider.addEventListener("input", updateCommitTime);


let NUM_ITEMS_FILE = 100; // Ideally, the length of your commit history
let ITEM_HEIGHT_FILE = 70; // Feel free to change
let VISIBLE_COUNT_FILE = 5; // How many items to show at a time
let totalHeightFile = (NUM_ITEMS_FILE - 1) * ITEM_HEIGHT_FILE;

const scrollContainerFile = d3.select("#scroll-container-file");
const spacerFile = d3.select("#spacer-file");
const itemsContainerFile = d3.select("#items-container-file");

spacerFile.style("height", `${totalHeightFile}px`);

scrollContainerFile.on("scroll", () => {
    const scrollTop = scrollContainerFile.property("scrollTop");
    let startIndexFile = Math.floor(scrollTop / ITEM_HEIGHT_FILE);
    startIndexFile = Math.max(0, Math.min(startIndexFile, commits.length - VISIBLE_COUNT_FILE));
    renderItemsFile(startIndexFile);
});

function renderItemsFile(startIndexFile) {
  // **Sort commits by totalLines in descending order**
  let sortedCommitsFile = filteredCommits.slice().sort((a, b) => b.totalLines - a.totalLines);

  // **Ensure scrolling does not run out of content**
  const maxIndex = Math.max(0, sortedCommitsFile.length - VISIBLE_COUNT_FILE);
  startIndexFile = Math.min(startIndexFile, maxIndex);

  // Define the slice of commits to render
  const endIndexFile = Math.min(startIndexFile + VISIBLE_COUNT_FILE, sortedCommitsFile.length);
  let newCommitSliceFile = sortedCommitsFile.slice(startIndexFile, endIndexFile);

  console.log('New slice (sorted by totalLines)', newCommitSliceFile);

  // **Update file details visualization**
  updateFileDetails(newCommitSliceFile);

  // **Ensure items are evenly spaced inside scroll container**
  itemsContainerFile.selectAll('.commit-item-file')
      .data(newCommitSliceFile, d => d.totalLines)
      .join(
          enter => enter.append('div')
              .attr('class', 'commit-item-file')
              .style('position', 'absolute')
              .style('width', '100%')
              .style('top', (_, idx) => `${(startIndexFile + idx) * ITEM_HEIGHT_FILE}px`) // Ensures even spacing
              .call(div => {
                  div.append('p').html((commit, index) => `
                      On ${commit.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}, I made
                      <a href="${commit.url}" target="_blank">
                          ${index > 0 ? 'another commit' : 'my first commit'}
                      </a>.<br>
                      I edited <strong>${commit.totalLines}</strong> lines across 
                      ${d3.rollups(commit.lines, D => D.length, d => d.file).length} files.
                      I'm glad I made progress.
                  `);
              }),
          update => update
              .style('top', (_, idx) => `${(startIndexFile + idx) * ITEM_HEIGHT_FILE}px`), // Ensure updates are spaced evenly
          exit => exit.remove()
      );

  // **Correct spacer height calculation**
  let totalHeightFile = sortedCommitsFile.length * ITEM_HEIGHT_FILE;
  spacerFile.style('height', `${totalHeightFile}px`);
}







let NUM_ITEMS = 100; // Ideally, let this value be the length of your commit history
let ITEM_HEIGHT = 70; // Feel free to change
let VISIBLE_COUNT = 5; // Feel free to change as well
let totalHeight = (NUM_ITEMS - 1) * ITEM_HEIGHT;
const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
spacer.style('height', `${totalHeight}px`);
const itemsContainer = d3.select('#items-container');
scrollContainer.on('scroll', () => {
  const scrollTop = scrollContainer.property('scrollTop');
  let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
  renderItems(startIndex);
});

function renderItems(startIndex) {
  // **Sort commits by datetime in desc order**
  let sortedCommits = filteredCommits.slice().sort((a, b) => b.datetime - a.datetime);

  // Define the slice of commits to render
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, sortedCommits.length);
  let newCommitSlice = sortedCommits.slice(startIndex, endIndex);
  updateScatterplot(newCommitSlice);

  // **Bind data and update commit items**
  let commitDivs = itemsContainer.selectAll('.commit-item')
      .data(newCommitSlice, d => d.datetime) // Use datetime as key for tracking updates
      .join(
          enter => enter.append('div')
              .attr('class', 'commit-item')
              .style('position', 'absolute')
              .style('width', '100%')
              .style('top', (_, idx) => `${(startIndex + idx) * ITEM_HEIGHT}px`)
              .call(div => {
                  div.append('p').html((commit, index) => `
                      On ${commit.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}, I made
                      <a href="${commit.url}" target="_blank">
                          ${index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}
                      </a>.
                      I edited ${commit.totalLines} lines across 
                      ${d3.rollups(commit.lines, D => D.length, d => d.file).length} files. 
                      Then I looked over all I had made, and I saw that it was very good.
                  `);
              }),
          update => update
              .style('top', (_, idx) => `${(startIndex + idx) * ITEM_HEIGHT}px`),
          exit => exit.remove()
      );

  // **Update total scroll height dynamically**
  let totalHeight = sortedCommits.length * ITEM_HEIGHT;
  spacer.style('height', `${totalHeight}px`);
}