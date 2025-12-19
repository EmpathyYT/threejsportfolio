import { wait } from "./extra";


export default async function word_flipper(id, duration, ...words) {

    const textEl = document.getElementById(id);
    let currentIndex = words.indexOf(textEl.textContent);
    currentIndex = currentIndex == -1 ? 0 : currentIndex;

    textEl.textContent = words[(currentIndex + 1) % words.length];

    await wait(duration)
    requestAnimationFrame(() => word_flipper(id, duration, ...words))
}