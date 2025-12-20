import { wait } from "./extra";

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
	const p = document.getElementById(id);
	if (!p) return;

	const duration = 1000; // Target duration in ms
	const startTime = Date.now();

	return new Promise((resolve) => {
		function update() {
			const now = Date.now();
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);

			const charsToShow = Math.floor(progress * finalText.length);
			const revealedText = finalText.slice(0, charsToShow);

			if (progress >= 1) {
				p.textContent = finalText;
				resolve();
				return;
			}

			// Generate random chars for the rest
			const remaining = finalText.length - charsToShow;
			let scrambled = "";
			for (let i = 0; i < remaining; i++) {
				scrambled += symbols[Math.floor(Math.random() * symbols.length)];
			}

			p.textContent = revealedText + scrambled;

			requestAnimationFrame(update);
		}

		requestAnimationFrame(update);
	});
}