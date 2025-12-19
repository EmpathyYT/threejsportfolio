import { shrinkIcons } from "../hooks/hooks";
import scrambleCode from '../utils/wordScrambler.js';

const pagesData = import.meta.glob("/src/pages/*", {
    eager: true,
	query: "?raw",
});

function slideOverlay() {
	const overlay = document.getElementById("slide");
	if (overlay.classList.contains("translate-y-full")) {
		overlay.classList.remove("translate-y-full");
	} else {
		overlay.classList.add("translate-y-full");
	}
}

function returnHTML(pageId) {
	const pages = Object.entries(pagesData);
	let page = pages.find(([key, _]) => {
		const name = key.split("/").at(-1).split(".")[0];
        console.log([pageId, name])
		return name === pageId;
	});
	if (page === undefined) {
		throw Error("Page not found");
	}
    return page[1].default;
}

function setUpScrambler(pageId) {
	if (pageId === 'About Me') {
		scrambleCode('In a world where everything is locked behind a micro transaction, people yearn for safety and silence. My mission is to bring that back to reality.', 'bio')
	}
}

export default {
	openPage(pageId) {
        window.isOnSlide = true;
        shrinkIcons();
        const page = returnHTML(pageId);
        const div = document.getElementById('pageContainer');
        div.innerHTML = page;
		slideOverlay();
		setUpScrambler(pageId)
	},
    closePage() {
        slideOverlay();
        window.isOnSlide = false;
    }
};
