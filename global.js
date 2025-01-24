console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");

// Step 2
// let currentLink = Array.from(navLinks).find(
//     (a) => a.host === location.host && a.pathname === location.pathname
// );
  

// console.log("Current Link:", currentLink);

// if (currentLink) {
//     // or if (currentLink !== undefined)
//     currentLink.classList.add('current');
// }

// Step 3

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/Sophie-WZR', title: 'GitHub', external: true }
  ];
  
  // Create the <nav> element
  let nav = document.createElement('nav');
  document.body.prepend(nav);
  
  // Dynamically add links to the navigation
  for (let p of pages) {
    let url = p.url;
    let title = p.title;
    if (url.startsWith('https://github.com')) {
        nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
        continue;
    }
    url = 'https://sophie-wzr.github.io/portfolio/' + url;
    nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
}
  
