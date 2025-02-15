let data = [];
let commits = [];  // Declare commits globally as we will use it extensively

// Function to load data from a CSV file and process commits
async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line),  // Converts the 'line' string to a Number
        depth: Number(row.depth),  // Converts the 'depth' string to a Number
        length: Number(row.length),  // Converts the 'length' string to a Number
        date: new Date(row.date + 'T00:00' + row.timezone),  // Corrects the date format
        datetime: new Date(row.datetime)  // Converts 'datetime' string to Date object
    }));

    displayStats();  // Call displayStats to show the summary
}

// Function to display summary stats
function displayStats() {
    // Process commits first
    processCommits();

    // Create the dl element for displaying stats
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    // Add more stats as needed...
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

// Event listener to ensure the script runs after the DOM content has loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
