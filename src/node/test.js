import { Player, world } from "@minecraft/server";

const commandPrefix = '?';
const adminTag = 'Admin';
/**
 * @typedef {{name: string, admin?: boolean, aliases?: string[]}} CommandData
 */
/**
 * @typedef {{name: string, admin?: boolean, aliases?: string[], callback: (data: { player: Player, args: string[] }) => void}} CommandDataCallback
 */
export class Command {
	/**
	 * @type {Record<string, CommandData>}
	 */
	static registry = {};
	/**
	 * @type {Record<string, string>}
	 */
	static aliases = {};
	/**
	 * Register a new command!
	 * @param {CommandData} registerInfo Register info for the command
	 * @param {(data: { player: Player, args: string[] }) => void} callback Code to run when the command is called for
	 * @example new Command({
	 * name: 'test',
	 * admin: true,
	 * aliases: ['test1','test2']
	 * }, data => {
	 * console.warn(data.player.name)
	 * })
	 */
	constructor(registerInfo, callback) {
		const { name, aliases = [] } = registerInfo;
		if (typeof name !== 'string') throw new Error('name in registerInfo at params[0] is not of type: string!');
		if (!(callback instanceof Function)) throw new Error('callback at params[1] is not of type: Function!');
		if (aliases && !(aliases instanceof Array)) throw new Error('name in registerInfo at params[0] is not of type: string[]!');
		aliases.forEach((aliase, i) => {
			if (typeof aliase !== 'string') throw new Error(`aliases[${i}] in registerInfo at params[0] is not of type: string[]!`);
			Command.aliases[aliase] = name;
		});
		Command.registry[name] = {
			name: registerInfo.name.toLowerCase(),
			aliases: registerInfo.aliases?.map(a => a.toLowerCase()),
			admin: registerInfo.admin ?? undefined,
			callback
		};
	}
}

world.beforeEvents.chatSend.subscribe(data => {
	if (data.message.startsWith(commandPrefix)) {
		data.sendToTargets = true;
		data.setTargets([]);
		const args = data.message.slice(commandPrefix.length).split(/\s+/g);
		const command = args.shift().toLowerCase();
		let commandData = Command.registry[command];
		if (!commandData) {
			const realCommand = Command.aliases[command];
			commandData = Command.registry[realCommand];
		}
		if (!commandData) return data.sender.sendMessage(`§cInvalid command!`);
		if (commandData.admin && !data.sender.hasTag(adminTag)) return data.sendMessage(`§cYou do not have permission to run that command!`);
		system.run(() => commandData.callback({ player: data.sender, args }));
	}
});