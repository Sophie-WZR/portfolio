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

    // Dots for the scatterplot
    const dots = svg.append('g').attr('class', 'dots');

    dots.selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue');
}

// Event listener to ensure the script runs after the DOM content has loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
