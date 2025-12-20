import { wait } from "./extra";

export async function flippingDots(dotCount, id, reverse) {
    const element = document.getElementById(id);
    if (!element) return;
    const currentDotCount = element.textContent.split('').filter(x => x == '.').length;
    await wait(500);
    if (currentDotCount === dotCount || (reverse && currentDotCount != 0)) {
        element.textContent = element.textContent.replace('.', '');
        flippingDots(dotCount, id, true);
        return;
    }
    element.textContent = element.textContent + '.';
    flippingDots(dotCount, id);
}