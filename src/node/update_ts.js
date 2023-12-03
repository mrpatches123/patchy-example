
import fs, { lstatSync, readdirSync, rmSync } from 'fs';
import puppeteer from 'puppeteer';
import fsExtra from 'fs-extra';
const { copySync } = fsExtra;
import * as pather from 'path';
import callerCallsite from 'caller-callsite';
function isFolder(path) {
	// console.log(path);
	try {
		return lstatSync(path).isDirectory();
	} catch { }
}
export const path = {
	/**
	 * @method resolveRelativeFromAbsolute resolves a relative path from an absolute path
	 * @param {String} relitivePath relative path
	 * @param {String} absolutePath absolute path
	 * @param {String} split default?= '/', the path of the filePath to be split wth 
	 * @param {RegExp} replace default?= /[\/|\\]/g, the regex or string to replace the filePath's splits with 
	 * @returns {String} resolved absolutePath 
	 */
	resolveRelativeFromAbsolute(relitivePath, absolutePath, split = '/', replace = /[\/|\\]/g) {
		relitivePath = relitivePath.replaceAll(replace, split).split(split);
		absolutePath = absolutePath.replaceAll(replace, split).split(split);
		const numberOfBacks = relitivePath.filter(file => file === '..').length;
		const pathReturn = [...absolutePath.slice(0, -(numberOfBacks + 1)), ...relitivePath.filter(file => file !== '..' && file !== '.')].join(split);
		return pathReturn;
	}
};
export function parseRelitiveFromFunction(relitivePath, depth = 1) {

	const absolutePath = callerCallsite({ depth }).getFileName().replaceAll('\\', '/').replaceAll('file:///', '');
	return path.resolveRelativeFromAbsolute(relitivePath, absolutePath);
}
const copyRecursiveSync = function copyRecursiveSync(src, dest) {
	copySync(src, dest);

	readdirSync(src)
		.map((name) => name)
		.filter((dir) => lstatSync(pather.join(src, dir)).isDirectory())
		.forEach((dir) => {
			copyRecursiveSync(pather.join(src, dir), pather.join(dest, dir));
			// console.log(path.join(src, dir), path.join(dest, dir));
		});
};

const apiPathDest = parseRelitiveFromFunction('../patchy_api/');
const apiPathCopy = parseRelitiveFromFunction('../../../patchy-api/src/patchy_api/');
if (!isFolder(apiPathCopy)) new Error('no API to copy');
console.log(apiPathDest);
if (isFolder(apiPathDest)) rmSync(apiPathDest, { recursive: true, force: true });
copyRecursiveSync(apiPathCopy, apiPathDest);
const chestUIPath = parseRelitiveFromFunction('../patchy_api/libraries/classes/chest_ui/class.ts');
const idItemsFolder = parseRelitiveFromFunction('../patchy_api/libraries/classes/chest_ui/type_ids.ts');

const itemsFolder = parseRelitiveFromFunction('../../items/');
//if you have any inconsistencies of expirmental holiday creator features Items as the system is trash.
const identifierIgnores = [];
const ItemsCountOffset = 0;
//gets axal ids
const url = 'https://learn.microsoft.com/en-us/minecraft/creator/reference/content/addonsreference/examples/addonitems?view=minecraft-bedrock-stable';
(async () => {
	//chat gpt start
	const browser = await puppeteer.launch({ headless: 'new' });
	const page = await browser.newPage();

	await page.goto(url, { waitUntil: 'domcontentloaded' });

	// Wait for the table to be rendered (you might need to adjust the selector)
	await page.waitForSelector('table[aria-label="Table 1"].table.table-sm tbody');

	// Use page.evaluate to fetch HTML content directly from the page
	const rowsHTML = await page.evaluate(() => {
		const rows = document.querySelectorAll('table[aria-label="Table 1"].table.table-sm tbody tr');
		return Array.from(rows, row => row.outerHTML);
	});
	//chat gpt end

	// console.log(rowsHTML);

	if (rowsHTML.length > 0) {
		const idIdsInit = rowsHTML.map((rowHTML) => [...rowHTML.toString().match(/(?<=>).+(?=<)/g)]).map((row) => ["minecraft:" + row[1], Number(row[0])]).sort((a, b) => a[1] - b[1]);
		const map = new Map(idIdsInit);
		const itemsCount = (countFilesInDirectory(itemsFolder, (filePath) => {
			if (!filePath.endsWith('.json')) return false;
			const json = JSON.parse(fs.readFileSync(filePath).toString().replaceAll(/\/\/[^\n\r]*|\/\*[\s\S]*?\*\//g, ''));
			const format_version = json.format_version.split('.').map((v) => Number(v));
			const id = json["minecraft:item"].description.identifier;
			if (!id) return false;
			if (identifierIgnores.includes(id)) return false;
			if (map.has(id)) {
				console.log("overwite item: " + filePath);
				return false;
			};
			if (format_version[1] < 16) return false;
			if (format_version[1] === 16 && format_version[2] < 100) return false;
			if (format_version[1] !== 16 && format_version[2] !== 100) console.log(json);
			return true;
		}) ?? 0) - ItemsCountOffset;
		console.log(itemsCount);
		const uiFile = fs.readFileSync(chestUIPath).toString();
		const fileTextNew = uiFile.replace('const number_of_1_16_100_items = 0;', `const number_of_1_16_100_items = ${itemsCount};`);
		fs.writeFileSync(chestUIPath, fileTextNew);
		const test = JSON.stringify(idIdsInit, null, 4);
		// console.log(test);
		fs.writeFileSync(idItemsFolder, `export const typeIdToID = new Map(${test}\n);`);
	} else {
		console.log('No rows found.');
	}

	await browser.close(); //also chat gpt
})();


// fs.writeFileSync();
/**
 * @param {string} path 
 * @param {(filePath: string) => boolean} test
 * @returns {number}
 */
function countFilesInDirectory(path, test) {
	try {
		if (!isFolder(path)) return;
	} catch { return console.log(`${path} not found`); }
	let count = 0;
	function countFolder(path) {
		fs.readdirSync(path).forEach(file => {
			const filePath = pather.join(path, file);
			if (isFolder(filePath)) {
				countFolder(filePath);
			} else if (!test || test(filePath)) {
				count++;
			}
		});
	}
	countFolder(path);
	return count;
}