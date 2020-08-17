import { ICommand, PermissionLevel } from "./base";
import { Message, Client, TextChannel } from "discord.js";



export default class LockdownCommand implements ICommand {

	commandName = 'lockdown';
	aliases = null;
	permissionLevel = PermissionLevel.Moderator;
	guildOnly = true;

	usageText = ";lockdown";
	helpText = "Temporarily revoke member's permission to type in a channel";
	
	// TODO: Use a database table to store cache
	lockdownCache: Map<string,string[]> = new Map();

	async run(discordClient: Client, message: Message, args: string[]) {
		const guild = message.guild;

		const SEND_MESSAGE = 0x800;

		if (guild == null) {
			message.reply("This command can only be run inside a guild");
			return;
		}
		
		const targetChannel = message.channel;
		const cacheKey = guild.id + '#' + targetChannel.id;
		if (targetChannel.type != 'text') {
			message.reply("This channel type is unsupported for lockdown");
			return;
		}

		if (this.lockdownCache.has(cacheKey)) {
			const restoreCache = this.lockdownCache.get(cacheKey);
			if (!restoreCache) {
				console.log("Failed getting restorecache");
				return;
			}
			for (const id of restoreCache) {
				targetChannel.createOverwrite(id, {
					SEND_MESSAGES: true,
				}, "Lockdown removed");
			}
			message.reply("Lockdown removed");
			return;
		}

		const restoreCache: string[] = [];
		
		const everyoneId = guild.roles.everyone.id;
		const everyoneCanType = this.checkPermissionsForRole(targetChannel, everyoneId, SEND_MESSAGE);
		if (everyoneCanType) {
			restoreCache.push(everyoneId);
		}
		
		for (const [id] of targetChannel.permissionOverwrites) {
			const canType = this.checkPermissionsForRole(targetChannel, id, SEND_MESSAGE);
			if (canType && restoreCache.indexOf(id) == -1) {
				restoreCache.push(id);
			}
		}

		for (const id of restoreCache) {
			targetChannel.createOverwrite(id, {
				SEND_MESSAGES: false,
			}, "Lockdown");
		}

		this.lockdownCache.set(cacheKey, restoreCache);
		message.reply("Lockdown");
	}
	
	checkPermissionsForRole(channel: TextChannel, roleId: string, permission: number): boolean {
		const permissionSettings = channel.permissionsFor(roleId);
		if (!permissionSettings) {
			console.log('unable to fetch')
			return false;
		}
		return (permissionSettings.bitfield & permission) == permission;
	}

}

