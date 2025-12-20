import { shrinkIcons } from "../hooks/hooks";
import { pageData } from "../src/page_data.js";
import scrambleCode from "../utils/wordScrambler.js";
import flipper from "../utils/wordFlipper.js";
import { wait } from "../utils/extra.js";

//these happen at build time
const HTMLPages = import.meta.glob("/src/pages/*", {
	eager: true,
	query: "?raw",
});

const templatesData = import.meta.glob("/src/*.html", {
	eager: true,
	query: "?raw",
});

const images = import.meta.glob(
	["/src/**/*", "!/src/icons/*", "!/src/icons/**", "!/src/**/*.html", "!/src/**/*.js"],
	{
		eager: true,
	}
);

function slideOverlay() {
	const overlay = document.getElementById("slide");
	if (overlay.classList.contains("translate-y-full")) {
		overlay.classList.remove("translate-y-full");
	} else {
		overlay.classList.add("translate-y-full");
	}
}

function returnHTML(pageId) {
	const pages = Object.entries(HTMLPages);
	let page = pages.find(([key, _]) => {
		const name = key.split("/").at(-1).split(".")[0];
		return name === pageId;
	});
	if (page === undefined) {
		return createPage(pageId);
	}
	return [null, page[1].default];
}

async function setUpScrambler(pageId) {
	if (pageId === "About Me") {
		await wait(450);
		scrambleCode(
			"In a world where everything is locked behind a micro transaction, people yearn for safety and silence. His mission is to bring that back to reality.",
			"bio"
		);
	} else {
		await wait(450);
		scrambleCode("[ SYNOPSIS ]", "synopsis");
		scrambleCode("[ STACK ]", "stack");
	}
}

function setUpFlipper() {
	flipper("redacted", 2500, "CORRUPTED", "UNKNOWN", "0x_ERROR");
}

function createPage(pageName) {
	const data = Object.entries(pageData);
	const item = data.find((x) => x[0] == pageName);
	if (item == undefined) {
		throw Error("Page not found");
	}
	const obj = item[1];
	const templates = Object.entries(templatesData);
	if (obj.redacted) {
		return [obj, templates.find((x) => x[0].includes("redacted"))[1].default];
	} else {
		return [obj, templates.find((x) => x[0].includes("allowed"))[1].default];
	}
}

function setUpImgs(pageId) {
	const imgs = [];
	const imgObject = Object.entries(images);

	imgObject.forEach(([key, val]) => {
		if (key.includes(pageId)) {
			imgs.push(val.default);
		}
	});
	const carousel = document.getElementById('carousel');
	const img = document.getElementById('img');
	img.setAttribute('src', imgs[0]);
	imgs.shift();
	
	for (const [index, imgSrc] of imgs.entries()) {
		const newImg = img.cloneNode();
		newImg.setAttribute('src', imgSrc);
		newImg.setAttribute('id', index);
		carousel.append(newImg);
	};

	setUpImgSlide();
}

function setUpImgSlide() {
	const el = document.getElementById("carousel");
	const imgclose = document.getElementById("closeimg");

	imgclose.onclick = () => {
		const slideEl = document.getElementById("img-slide");
		slideEl.classList.remove("-translate-y-1/2");
		slideEl.classList.add("translate-y-full");
	};

	el.onclick = (event) => {
		const clickedEl = event.target;
		if (event.target.tagName != "IMG") return;
		const slideEl = document.getElementById("img-slide");
		const imgEl = document.getElementById("slide image");
		imgEl.setAttribute("src", clickedEl.getAttribute("src"));
		slideEl.classList.remove("translate-y-full");
		slideEl.classList.add("-translate-y-1/2");
	};
}

function initlaizePage(data) {
	const arrayOfData = Object.entries(data);
	const classifiedP = document.createElement("p");
	classifiedP.className = "font-mono text-xs text-text-muted mb-2 select-none";
	classifiedP.textContent = "[CLASSIFIED]";
	for (const [key, val] of arrayOfData) {
		if (key === "redacted") {
			if (val) setUpFlipper();
			continue;
		}
		if (key === "initialize") {
			if (!val) {
				document.getElementById("initialize").remove();
				document.getElementById("title-container").prepend(classifiedP);
				continue;
			} else {
				document.getElementById("initialize").setAttribute("href", val);
				continue;
			}
		}
		if (!val) continue; // null is false
		if (key === "stack") {
			for (const [idx, stackItem] of val.entries()) {
				document.getElementById(`stack-${idx + 1}`).textContent = stackItem;
			}
			continue;
		}
		if (key == "source_btn") {
			document.getElementById(key).setAttribute("href", val);
			continue;
		}
		document.getElementById(key).textContent = val;
	}
}

export default {
	openPage(pageId) {
		window.isOnSlide = true;
		shrinkIcons();
		const [data, page] = returnHTML(pageId);
		const div = document.getElementById("pageContainer");
		div.innerHTML = page;
		slideOverlay();
		if (data) {
			setUpImgs(pageId)
			initlaizePage(data);
		}
		setUpScrambler(pageId);
	},
	closePage() {
		slideOverlay();
		window.isOnSlide = false;
	},
};
