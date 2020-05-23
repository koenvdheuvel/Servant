import { Client as DiscordClient, Message, MessageEmbed } from "discord.js";
import ActionLogRepository from "../repository/actionLog";
import ServerSettingsRepository from "../repository/severSettings";
import Logger from "../lib/log";
import { ActionType } from "../interfaces/actionTypeEnum";
import { getTextChannel } from "../lib/util";
import stringArgv from 'string-argv';
import { getCommand } from "../routes";
import { PermissionLevel } from "../commands/base";
import config from "../lib/config";


export default async function MessageEvent(discordClient: DiscordClient, message: Message) {
	if (message.author.bot) return;

	if (message.content.length < 1 || message.content[0] !== ';') {
		return;
	}

	const guildId = message.guild?.id;
	const serverSettings = await ServerSettingsRepository.GetByGuildId(guildId);
	if (serverSettings === null) {
		Logger.error(`Couldnt get server settings for ${guildId}`);
		return;
	}

	let permissionLevel = PermissionLevel.User;
	if (message.author.id === config.botOwnerUserId) {
		permissionLevel = PermissionLevel.BotOwner;
	} else if (message.author.id === message.guild?.ownerID) {
		permissionLevel = PermissionLevel.Administrator;
	} else if (serverSettings.adminRole && message.member?.roles.cache.has(serverSettings.adminRole)) {
		permissionLevel = PermissionLevel.Administrator;
	} else if (serverSettings.moderatorRole && message.member?.roles.cache.has(serverSettings.moderatorRole)) {
		permissionLevel = PermissionLevel.Moderator;
	}

	const full = stringArgv(message.content.slice(1));
	const command = full[0];
	const args = full.slice(1);

	const cmd = await getCommand(command);
	if (cmd == null) {
		return;
	}
	if (!message.guild && cmd.guildOnly) {
		return;
	}
	if (permissionLevel > cmd.permissionLevel) {
		// no permission
		return;
	}
	cmd.run(discordClient, message, args);

	//const guildId = message?.guild?.id;
	//const serverSettings = await ServerSettingsRepository.GetByGuildId(guildId);
	//if (serverSettings === null) {
	//	Logger.error(`Couldnt get server settings for ${guildId}`);
	//	return;
	//}

	//if (!serverSettings.logChannel || oldMessage.content === newMessage.content) {
	//	return;
	//}

	//// add action to database
	//await ActionLogRepository.Add(serverSettings.id, oldMessage.author.id, ActionType.MessageEdit, oldMessage.channel.id, {
	//	from: oldMessage.content,
	//	to: newMessage.content,
	//});

	//const channel = getTextChannel(discordClient, serverSettings.logChannel);
	//if (channel === null) {
	//	Logger.error(`Couldnt get log channel for server ${oldMessage?.guild?.id}`);
	//	return;
	//}

	//const embed = new MessageEmbed()
	//	.setColor(0xFFA500)
	//	.setTimestamp()
	//	.setAuthor("Message Edited")
	//	.addField("User", `${newMessage.author.tag}`, true)
	//	.addField("Channel", `${oldMessage.channel}`, true)
	//	.addField("Before", `${oldMessage.content}`, false)
	//	.addField("After", `${newMessage.content}`, false)
	//	.setFooter(`User ID: ${newMessage.author.id}`);
	//channel.send({embed});
}