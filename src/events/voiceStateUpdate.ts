import { Client as DiscordClient, VoiceState, MessageEmbed } from "discord.js";
import ActionLogRepository from "../repository/actionLog";
import ServerSettingsRepository from "../repository/severSettings";
import Logger from "../lib/log";
import { ActionType } from "../interfaces/actionTypeEnum";
import { getTextChannel } from "../lib/util";

export default async function VoiceStateUpdateEvent(discordClient: DiscordClient, oldState: VoiceState, newState: VoiceState) {
	if (oldState.channelID === newState.channelID) {
		return;
	}

	const guildId = oldState?.guild?.id;
	const serverSettings = await ServerSettingsRepository.GetByGuildId(guildId);
	if (serverSettings === null) {
		Logger.error(`Couldnt get server settings for ${guildId}`);
		return;
	}

	if (!serverSettings.logChannel) {
		return;
	}

	const logchannel = getTextChannel(discordClient, serverSettings.logChannel);
	if (logchannel === null) {
		Logger.error(`Couldnt get log channel for server ${guildId}`);
		return;
	}

	if (oldState.channelID && newState.channelID) {
		// add action to database
		await ActionLogRepository.Add(serverSettings.id, oldState.member?.id || null, ActionType.VoiceChatMove, newState.channelID || null, {
			from: oldState.channelID,
			to: newState.channelID,
		});

		const embed = new MessageEmbed()
			.setColor(0x7CFC00)
			.setAuthor(`${newState.member?.user?.tag}`)
			.setTimestamp()
			.setFooter(`User ID: ${newState.id}`)
			.addField("Has switched voice channel to:", `${newState.channel?.name}`, false)
			.addField("Previous voice channel:", `${oldState.channel?.name}`, false);

		logchannel.send({embed});
		return;
	}

	if (!newState.channelID) {
		// add action to database
		await ActionLogRepository.Add(serverSettings.id, oldState.member?.id || null, ActionType.VoiceChatLeave, oldState.channelID || null, null);

		const embed = new MessageEmbed()
			.setColor(0xFF0000)
			.setAuthor(`${newState.member?.user?.tag}`)
			.setTimestamp()
			.setFooter(`User ID: ${newState.member?.id}`)
			.addField("Has left the voice channel:", `${oldState.channel?.name}`, true);

		logchannel.send({embed});
		return;
	}

	if (!oldState.channelID) {
		// add action to database
		await ActionLogRepository.Add(serverSettings.id, oldState.member?.id || null, ActionType.VoiceChatJoin, newState.channelID || null, null);

		const embed = new MessageEmbed()
			.setColor(0x7CFC00)
			.setAuthor(`${newState.member?.user?.tag}`)
			.setTimestamp()
			.setFooter(`User ID: ${newState.member?.id}`)
			.addField("Has joined the voice channel:", `${newState.channel?.name}`, true);

		logchannel.send({embed});
		return;
	}
}