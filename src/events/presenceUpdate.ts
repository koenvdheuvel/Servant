import { Client as DiscordClient, Presence, MessageEmbed } from "discord.js";
import ServerSettingsRepository from "../repository/severSettings";
import Logger from "../lib/log";
import { getTextChannel } from "../lib/util";
import config from "../lib/config";
import * as request from "request";

const sleep = waitTimeInMs => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

export default async function PresenceUpdateEvent(discordClient: DiscordClient, oldPresence: Presence|null, newPresence: Presence) {
	const randomColor = "#000000".replace(/0/g, () => (~~(Math.random() * 16)).toString(16));

	const guildId = newPresence.guild?.id;
	const serverSettings = await ServerSettingsRepository.GetByGuildId(guildId);
	if (serverSettings === null) {
		Logger.error(`Couldnt get server settings for ${guildId}`);
		return;
	}

	const guild = newPresence.guild;
	const guildMember = newPresence.member;

	const streamingActivity = newPresence.activities.find(activity => activity.type == "STREAMING");
	const wasStreaming = oldPresence?.activities.some(activity => activity.type == "STREAMING") || false;

	if (!guild || !guildMember) {
		Logger.error('Weird error that shouldnt happen');
		return;
	}

	if (serverSettings.streamLiveRole !== null) {
		const liverole = await guild.roles.fetch(serverSettings.streamLiveRole);

		if (!liverole) {
			Logger.error(`ERR: role with key 'liverole' was not found`);
			return;
		}
		if (guildMember.roles.cache.has(serverSettings.streamLiveRole) && streamingActivity === undefined) {
			await guildMember.roles.remove(liverole)
		} else if (streamingActivity !== undefined) {
			await guildMember.roles.add(liverole)
		}
	}

	if (serverSettings.streamShout !== null) {
		if (!oldPresence || !newPresence || wasStreaming || !streamingActivity || !streamingActivity.url) {
			return;
		}

		const promotionChannel = getTextChannel(discordClient, serverSettings.streamShout);
		if (!promotionChannel) {
			Logger.error(`ERR: channel with key 'streamShout' was not found`);
			return;
		}

		const streamUrl = streamingActivity.url;
		const streamUsername = streamUrl.substr(22);
		const twitchuri = `https://api.twitch.tv/helix/streams?user_login=${streamUsername}`;

		await sleep(2 * 60 * 1000);
		// TODO:
		// Remove request dependency
		request({
			method: 'GET',
			url: twitchuri,
			headers: {
				'Client-ID': config.twitch.clientId,
			}
		}, function (error, res, body) {
			if (error || !body) {
				return;
			}
			const data = JSON.parse(body);
			console.log("streamerData", data);

			const strem = data.data[0];
			const thumb = strem.thumbnail_url.replace('{width}x{height}', '384x216');

			const embed = new MessageEmbed()
				.setColor(randomColor)
				.setImage(thumb)
				.setAuthor(`${guildMember.user.tag}`, `${guildMember.user.avatarURL}`)
				.setDescription(`**Streamer:** ${strem.user_name}`)
				.addField("**Stream Title:**", `${strem.title}`, false)
				.addField("**Stream URL:**", `${streamUrl}`, false);

			promotionChannel.send({embed});
			return;
		});

	}

}
