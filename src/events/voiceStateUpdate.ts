import { ChannelManager, Client as DiscordClient, Guild, GuildChannelManager, GuildMember, Snowflake, VoiceChannel, VoiceState } from 'discord.js';
import ActionLogRepository from '../repository/actionLog';
import ServerSettingsRepository from '../repository/serverSettings';
import Logger from '../lib/log';
import { ActionType } from '../interfaces/actionTypeEnum';
import { getTextChannel } from '../lib/util';
import guildMemberVoiceChannelHistory  from '../lib/guildMemberVoiceChannelHistory'
import createMessageEmbed from '../wrapper/discord/messageEmbed';

export default async function VoiceStateUpdateEvent(discordClient: DiscordClient, oldState: VoiceState, newState: VoiceState): Promise<void> {
	await moveUserOnSelfDeafen(discordClient, oldState, newState);
	await moveUserOnSelfUnDeafen(discordClient, oldState, newState);
	await logChannelUpdate(discordClient, oldState, newState);
	await voiceActivityLogChannelUpdate(discordClient, oldState, newState);
} 

function getAFKChannelIDForUser(member: GuildMember): string | null {
	const vampireId = '140183470042251264';
	if (member.id === vampireId) {
		return '818050816908328980'; // Garlic Bread Channel
	}

	return '654857900002508800' // AFK;
}

async function logChannelUpdate(discordClient: DiscordClient, oldState: VoiceState, newState: VoiceState) {
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

		const embed = createMessageEmbed({
			color: 0x7CFC00,
			author: `${newState.member?.user?.tag}`,
			footer: `User ID: ${newState.id}`,
			fields: [
				{
					key: 'Has switched voice channel to:',
					value: `${newState.channel?.name}`,
				},
				{
					key: 'Previous voice channel:',
					value: `${oldState.channel?.name}`,
				},
			],
		});

		logchannel.send({embed});
		return;
	}

	if (!newState.channelID) {
		// add action to database
		await ActionLogRepository.Add(serverSettings.id, oldState.member?.id || null, ActionType.VoiceChatLeave, oldState.channelID || null, null);

		const embed = createMessageEmbed({
			color: 0xFF0000,
			author: `${newState.member?.user?.tag}`,
			footer: `User ID: ${newState.id}`,
			fields: [
				{
					key: 'Has left the voice channel:',
					value: `${oldState.channel?.name}`,
					inline: true,
				},
			],
		});

		logchannel.send({embed});
		return;
	}

	if (!oldState.channelID) {
		// add action to database
		await ActionLogRepository.Add(serverSettings.id, oldState.member?.id || null, ActionType.VoiceChatJoin, newState.channelID || null, null);

		const embed = createMessageEmbed({
			color: 0x7CFC00,
			author: `${newState.member?.user?.tag}`,
			footer: `User ID: ${newState.member?.id}`,
			fields: [
				{
					key: 'Has joined the voice channel:',
					value: `${newState.channel?.name}`,
					inline: true,
				},
			],
		});

		logchannel.send({embed});
		return;
	}
}

async function voiceActivityLogChannelUpdate(discordClient: DiscordClient, oldState: VoiceState, newState: VoiceState) {
	if (!newState.member) {
		return;
	}

	const AFKChannelID = getAFKChannelIDForUser(newState.member);

	if (oldState.channelID === newState.channelID) {
		return;
	}

	const guildId = oldState?.guild?.id;
	const serverSettings = await ServerSettingsRepository.GetByGuildId(guildId);
	if (serverSettings === null) {
		Logger.error(`Couldnt get server settings for ${guildId}`);
		return;
	}

	if (!serverSettings.voiceActivityLogChannel) {
		return;
	}

	const logchannel = getTextChannel(discordClient, serverSettings.voiceActivityLogChannel);
	if (logchannel === null) {
		Logger.error(`Couldnt get voice activity log channel for server ${guildId}`);
		return;
	}

	if (oldState.channelID && newState.channelID) {
		if (newState.channelID === AFKChannelID && newState.selfDeaf && !oldState.selfDeaf) {
			const message = `**${newState.member?.displayName}** deafend and was moved from **${oldState.channel?.name}** to **${newState.channel?.name}**`;
			logchannel.send(message);

			return;
		}
		
		if (oldState.channelID === AFKChannelID && oldState.selfDeaf && !newState.selfDeaf) {
			const message = `**${newState.member?.displayName}** undeafend and was moved from **${oldState.channel?.name}** back to **${newState.channel?.name}**`;
			logchannel.send(message);

			return;
		}

		if (!(newState.channelID === AFKChannelID || oldState.channelID === AFKChannelID) && !(newState.selfDeaf || oldState.selfDeaf)) {
			const message = `**${newState.member?.displayName}** has switched from **${oldState.channel?.name}** to **${newState.channel?.name}**`;
			logchannel.send(message);

			return;
		}
	}

	if (!newState.channelID) {
		const message = `**${newState.member?.displayName}** has left **${oldState.channel?.name}**`;
		logchannel.send(message);
		return;
	}

	if (!oldState.channelID) {
		const message = `**${newState.member?.displayName}** has joined **${newState.channel?.name}**`;
		logchannel.send(message);
		return;
	}
}

async function moveUserOnSelfDeafen(discordClient: DiscordClient, oldState: VoiceState, newState: VoiceState) {
	if (!newState.member) {
		return;
	}
	
	const AFKChannelID = getAFKChannelIDForUser(newState.member);

	if (newState.channelID === AFKChannelID) {
		return;
	}

	if (!oldState.selfDeaf && newState.selfDeaf && oldState.channel) {
		guildMemberVoiceChannelHistory.updateHistory(newState.member, oldState.channel)
		await newState.setChannel(AFKChannelID, `${newState.member?.displayName} was muted so was moved to AFK`);
	}
}

async function moveUserOnSelfUnDeafen(discordClient: DiscordClient, oldState: VoiceState, newState: VoiceState) {
	if (!newState.member) {
		return;
	}
	
	const AFKChannelID = getAFKChannelIDForUser(newState.member);

	if (newState.channelID !== AFKChannelID) {
		return;
	}

	if (oldState.selfDeaf && !newState.selfDeaf) {
		let lastChannel = guildMemberVoiceChannelHistory.getLastChannel(newState.member);
		
		if (!lastChannel) {
			return;
		}
		
		await newState.setChannel(lastChannel).then(
			function (guildMember: GuildMember) {
				guildMemberVoiceChannelHistory.cleanHistory(guildMember)
			}
		);
	}
}