import page from "page"

const app = document.getElementById("app")

async function load(pagePath) {
    console.log(`Loading page: ${pagePath}`)
    const res = await fetch(pagePath)
    const html = await res.text()
    app.innerHTML = html
}

page.base("#")

page("/", async () => await load("/src/pages/home.html"))
page("/login", async () => await load("/src/pages/login.html"))
page("/chat", async () => await load("/src/pages/chat.html"))
 
page()

const loader = document.querySelector('.loader');

setTimeout(() => {
  loader.style.display = 'none';
}, 2000); 

 