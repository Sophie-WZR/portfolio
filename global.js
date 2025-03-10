console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");


// Step 3

let pages = [
    {url: "index.html", title: 'Home'},
    {url: "contact/index.html", title: 'Contact'},
    {url: "projects/index.html", title: "Projects"},
    {url: "resume/index.html", title: "Resume"},
    {url: "meta/", title: "Meta"},
    {url: 'https://github.com/Sophie-WZR', title: 'GitHub'}
  ];
  
  // Create the <nav> element
  let nav = document.createElement('nav');
  document.body.prepend(nav);

  const ARE_WE_HOME = document.documentElement.classList.contains('home');
  
  // Dynamically add links to the navigation
  for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // TODO create link and add it to nav


    console.log('adding to nav');
    if (url.startsWith('https://github.com')) {
        // github page
        url = url
    } else if (!ARE_WE_HOME && !url.startsWith('http')) {
        // non home page
        url = '../' + url;
    } else {
        // github page
        url = 'https://sophie-wzr.github.io/portfolio/' + url
    }

    // home page
    
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

    if (a.host !== location.host){
        a.target = '_blank';
    }

    nav.append(a);
}
// Step 4
document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select id="color-scheme-select">
                <option value="light dark">Automatic</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
          </select>
      </label>`
  );

  const select = document.getElementById('color-scheme-select');


if (localStorage.colorScheme) {
    // if there is already a saved color
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme); // Apply the saved scheme
    select.value = savedScheme; // Update the dropdown to reflect the saved preference
}

select.addEventListener('input', function (event) {
    const selectedScheme = event.target.value;

    console.log('Color scheme changed to', selectedScheme);

    // Save the user's preference to localStorage
    localStorage.colorScheme = selectedScheme;

    console.log('color scheme changed to', event.target.value);
    
    document.documentElement.style.setProperty('color-scheme', selectedScheme);
});  

// Step 5
// Reference the form element
const form = document.querySelector("#contact-form");

// Add a listener to handle form submission
form?.addEventListener("submit", (event) => {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Create a FormData object from the form
  const data = new FormData(form);

  // Start building the mailto URL
  let url = form.action + "?";

  // Iterate over each field in the form data
  for (let [name, value] of data) {
    // Encode each value and append it to the URL
    url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
  }

  // Remove the trailing '&' from the URL
  url = url.slice(0, -1);

  // Open the URL in the user's email client
  location.href = url;
});


select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
  });


export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);

      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      console.log(response)
      
      const data = await response.json();
      return data; 

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  // Your code will go here
  if (!(containerElement instanceof HTMLElement)) {
      console.error('Invalid container element provided.');
      return;
  } // make sure containerElement is a valid DOM

  // Ensure headingLevel is valid (only allow h1-h6)
  if (!/^h[1-6]$/.test(headingLevel)) {
      console.warn(`Invalid heading level "${headingLevel}". Defaulting to h2.`);
      headingLevel = 'h2'; // Default to h2 if input is invalid
  }
 

  containerElement.innerHTML = ''; //outside loop
  // makesure its container empty
  project.forEach(p => {
      const title = p.title || 'Untitled Project';
      const image = p.image || 'https://vis-society.github.io/labs/2/images/empty.svg';
      const year = p.year || 'unknown';
      //image coming
      //image coming
      const description = p.description || 'No description available.';

      const article = document.createElement('article');
      article.innerHTML = `
      <${headingLevel}>${title}</${headingLevel}>
      <img src="${image}" alt="${title}" onerror="this.src='fallback-image.jpg';">
      <div>
          <p>${description}</p>
          <br />
          <p>c. ${year}</p>
      </div>
      `;
      
      containerElement.appendChild(article);
  });
}

export function countProjects(project, titleElement) {
  // Check if projects is an array
  if (Array.isArray(project)) {
      const projectCount = project.length;
      titleElement.textContent = `${projectCount} Projects`;
  } else {
      console.error('Invalid projects data');
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

const profileStats = document.querySelector('#profile-stats');



