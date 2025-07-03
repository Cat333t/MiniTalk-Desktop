import page from "page"
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path'
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const update = await check();
if (update) {
  console.log(
    `found update ${update.version} from ${update.date} with notes ${update.body}`
  );
  let downloaded = 0;
  let contentLength = 0;
  // alternatively we could also call update.download() and update.install() separately
  await update.downloadAndInstall((event) => {
    switch (event.event) {
      case 'Started':
        contentLength = event.data.contentLength;
        console.log(`started downloading ${event.data.contentLength} bytes`);
        break;
      case 'Progress':
        downloaded += event.data.chunkLength;
        console.log(`downloaded ${downloaded} from ${contentLength}`);
        break;
      case 'Finished':
        console.log('download finished');
        break;
    }
  });

  console.log('update installed');
  await relaunch();
}

// сохраняем
async function saveToken(token) {
  const filePath = await appDataDir() + 'token.txt'
  await writeTextFile(filePath, token)
}

// читаем
async function getToken() {
  const filePath = await appDataDir() + 'token.txt'
  try {
    const token = await readTextFile(filePath)
    return token
  } catch (e) {
    return null // если файл не найден
  }
}

const app = document.getElementById("app")

async function load(pagePath) {
    console.log(`Loading page: ${pagePath}`)
    const res = await fetch(pagePath)
    const html = await res.text()
    app.innerHTML = html
}

async function checkUser() {
    const token = await getToken()
    if (token) {
        const res = await fetch("http://localhost:3000/api/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        return res.ok
    } else {
        return false
    }
}

page.base("#")

if(await checkUser()) {
    page("/", async () => await load("/src/pages/home.html"))
    page("/chat", async () => await load("/src/pages/chat.html"))
} else {
    page("/", async () => await load("/src/pages/login.html"))
    page("/login", async () => await load("/src/pages/login.html"))
}


page()

const loader = document.querySelector('.loader');

setTimeout(() => {
  loader.style.display = 'none';
}, 2000);


