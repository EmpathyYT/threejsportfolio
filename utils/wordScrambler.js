import {wait} from './extra';

const symbols = [
		"!",
		"@",
		"#",
		"$",
		"%",
		"^",
		"&",
		"*",
		"(",
		")",
		"-",
		"_",
		"+",
		"=",
		"{",
		"}",
		"[",
		"]",
		"|",
		"\\",
		":",
		";",
		'"',
		"'",
		"<",
		">",
		",",
		".",
		"?",
		"/",
	];

export default async function scrambleCode(finalText, id) {
	const time = 1000 / finalText.length;

	const state = {
		finished: false,
		letters: "",
	}
	
	pasteScrambles(state, id, finalText.length);
    for (let i = 0; i < finalText.length; i++) {
        const letters = finalText.slice(0, i + 1);
        state.letters = letters;
		if (letters == finalText) state.finished = true;
        await wait(time);
    }
}

async function pasteScrambles(state, id, totalLength) {
	const p = document.getElementById(id);
	const text = state.letters;

	let letters = [];
	let index;
	for (let j = 0; j < totalLength - state.letters.length; j++) {
            index = Math.floor(Math.random() * symbols.length);
            letters.push(symbols[index]);
	}
	p.textContent = text + letters.join('');
	if (state.finished) return;
	requestAnimationFrame(() => pasteScrambles(state, id, totalLength));
}