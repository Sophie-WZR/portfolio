let data = [];
let commits = [];  // Declare commits globally as we will use it extensively

// Dimensions for the scatter plot
const width = 1000;
const height = 600;
const margin = { top: 10, right: 10, bottom: 30, left: 20 };  // Margins for axes

// Function to load data from a CSV file, process commits, and create a scatter plot
async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line),  // Converts the 'line' string to a Number
        depth: Number(row.depth),  // Converts the 'depth' string to a Number
        length: Number(row.length),  // Converts the 'length' string to a Number
        date: new Date(row.date + 'T00:00' + row.timezone),  // Corrects the date format
        datetime: new Date(row.datetime)  // Converts 'datetime' string to Date object
    }));

    processCommits();  // Process commits after loading data
    createScatterplot();  // Create the scatter plot
}

// Function to process commits data
function processCommits() {
    commits = d3.groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;
            return {
                id: commit,
                url: 'https://github.com/vis-society/lab-7/commit/' + commit,
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };
        });
}

// Function to create a scatterplot of commits by time of day
function createScatterplot() {
    const svg = d3.select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    // Scales adjusted for margins
    const xScale = d3.scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([margin.left, width - margin.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([height - margin.bottom, margin.top]);
    

    // Calculate the range of edited lines and create a radius scale
    const rScale = d3.scaleSqrt() // Changed from scaleLinear to scaleSqrt
        .domain([minLines, maxLines])
        .range([2, 30]);

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    // Create gridlines BEFORE the axes for better layering
    const gridlines = svg.append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale)
            .tickSize(-width + margin.left + margin.right)
            .tickFormat(''));

    // Create and add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
        .tickFormat((d) => `${d}:00`); // Format Y-axis ticks as hours

    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(xAxis);

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxis);
    
    d3.select(svg).call(d3.brush());

    svg.selectAll('.dots, .overlay ~ *').raise();

    // Dots for the scatterplot with dynamic radius based on edited lines
    const dots = svg.append('g').attr('class', 'dots');

    dots.selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))  // Use the radius scale for dot size
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7)  // Initial opacity for overlapping dots
        .on('mouseenter', function(event, d) {
            d3.select(event.currentTarget).style('fill-opacity', 1);  // Full opacity on hover
            updateTooltipContent(d);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mouseleave', function() {
            d3.select(event.currentTarget).style('fill-opacity', 0.7);  // Restore opacity on mouse leave
            updateTooltipContent({});
            updateTooltipVisibility(false);
        });
}

// Function to update the tooltip content
function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
}

// Function to control the visibility of the tooltip
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

// Function to set up brushing
function brushSelector() {
    const svg = document.querySelector('svg'); // Ensure the SVG has been created
    d3.select(svg).call(d3.brush()); // Apply the D3 brush
  }  

// Event listener to ensure the script runs after the DOM content has loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
