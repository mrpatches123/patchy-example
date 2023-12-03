import fs, { lstatSync, readdirSync, rmSync } from 'fs';
import fsExtra from 'fs-extra';
const { copySync } = fsExtra;
import * as pather from 'path';
import callerCallsite from 'caller-callsite';
import crypto from 'crypto';
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
const devPacksPath = parseRelitiveFromFunction('../../../');
const devPackPath = parseRelitiveFromFunction('../../');
const packName = devPackPath.replace(`${devPacksPath}`, '').replace('/', '');

const packPathDest = pather.join(parseRelitiveFromFunction('../../../../behavior_packs'), packName);
const ingores = ['src', 'node_modules', '.git', '.gitignore', 'tsconfig.json', 'package.json', 'bridge', 'package-lock.json', '.VSCodeCounter', '.vscode'];

const devmanifest = JSON.parse(fs.readFileSync(pather.join(devPackPath, 'manifest.json')).toString());
const packNameHeader = devmanifest.header.name;

let uuidHeader = crypto.randomUUID();
let uuidScripts = crypto.randomUUID();
let uuidData = crypto.randomUUID();
let headerVersion = [0, 0, 1];
if (isFolder(packPathDest)) {
	try {
		const manifest = JSON.parse(fs.readFileSync(pather.join(packPathDest, 'manifest.json')).toString());
		const { uuid, version } = manifest.header;
		uuidHeader = uuid;
		headerVersion = version;
		headerVersion[2]++;
		manifest.modules.forEach((module) => {
			switch (module.type) {
				case 'data':
					uuidData = module.uuid;
					break;
				case 'scripts':
					uuidScripts = module.uuid;
					break;
			}
		});
	} catch (err) {
		console.log(err);
	}
} else {
	fs.mkdirSync(packPathDest);
}

fs.readdirSync(devPackPath).forEach((file) => {
	if (ingores.includes(file)) return;
	const pathRoot = pather.join(devPackPath, file);
	const pathDest = pather.join(packPathDest, file);
	if (fs.lstatSync(pathRoot).isDirectory()) {
		if (fs.existsSync(pathDest)) {
			rmSync(pathDest, { recursive: true });
		}
		fs.mkdirSync(pathDest);
		copyRecursiveSync(pathRoot, pathDest);
	} else fs.copyFileSync(pathRoot, pathDest);
});
const manifest = JSON.parse(fs.readFileSync(pather.join(packPathDest, 'manifest.json')).toString());
// console.warn(manifest);
manifest.header.uuid = uuidHeader;
manifest.header.version = headerVersion;
manifest.header.name = `${packNameHeader} (Realm)`;
manifest.description = `${headerVersion[0]}.${headerVersion[1]}.${headerVersion[2]}`;
manifest.modules.forEach((module, i) => {
	switch (module.type) {
		case 'data':
			manifest.modules[i].uuid = uuidData;
			break;
		case 'scripts':
			manifest.modules[i].uuid = uuidScripts;
			break;
	}
});
fs.writeFileSync(pather.join(packPathDest, 'manifest.json'), JSON.stringify(manifest, null, 4));

