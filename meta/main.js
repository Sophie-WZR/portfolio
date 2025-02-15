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

    processCommits();  // Process commits after loading data
    console.log(commits);  // Log commits to check the structure
}

// Function to process commits data
function processCommits() {
    commits = d3.groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;
            let ret = {
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

            Object.defineProperty(ret, 'lines', {
                value: lines,
                enumerable: false  // Make 'lines' non-enumerable so it doesn't appear in console.log
            });

            return ret;
        });
}

// Event listener to ensure the script runs after the DOM content has loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});
