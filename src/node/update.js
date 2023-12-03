
import fs, { lstatSync, readdirSync, rmSync } from 'fs';
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
// import '../../patchy-api/scripts/package_import';
const apiPathDest = parseRelitiveFromFunction('../scripts/patchy_api/');
const apiPathCopy = parseRelitiveFromFunction('../../patchy-api/scripts/patchy_api/');
if (!isFolder(apiPathCopy)) new Error('no API to copy');

if (!isFolder(apiPathDest)) rmSync(apiPathDest, { recursive: true, force: true });
copyRecursiveSync(apiPathCopy, apiPathDest);

