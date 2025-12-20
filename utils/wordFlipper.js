import { wait } from "./extra";


export default async function word_flipper(id, duration, ...words) {

    const textEl = document.getElementById(id);
    let currentIndex = words.indexOf(textEl.textContent);
    currentIndex = currentIndex == -1 ? 0 : currentIndex;

    const newText = words[(currentIndex + 1) % words.length];
    textEl.textContent = newText;
    textEl.setAttribute('data-text', newText);

    await wait(duration)
    requestAnimationFrame(() => word_flipper(id, duration, ...words))
}