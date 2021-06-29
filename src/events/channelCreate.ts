import { Client as DiscordClient, GuildChannel, MessageAttachment, TextChannel } from 'discord.js';
import ServerSettingsRepository from '../repository/serverSettings';
import { SetMutedPermissionsForChannel } from '../lib/mutedRole';
import SquirrelLogRepository from '../repository/squirrelLog';
import SquirrelClient from '../lib/squirrel';

export default async function ChannelCreateEvent(discordClient: DiscordClient, channel: GuildChannel): Promise<void> {
	const serverSettings = await ServerSettingsRepository.GetByGuildId(channel.guild.id);
	if (serverSettings != null && serverSettings?.muteRole !== null) {
		const muteRole = channel.guild.roles.resolve(serverSettings.muteRole);
		if (muteRole !== null) {
			SetMutedPermissionsForChannel(muteRole, channel, null);
		}
	}

	if (!((channel): channel is TextChannel => channel.type === 'text')(channel)) return;
	if (await SquirrelLogRepository.hasSquirrelBeenPostedToday(channel.guild.id, channel.id)) return;

	let squirrelTime = new Date();
	let secondsUntilEndOfDate = (24*60*60) - (squirrelTime.getHours()*60*60) - (squirrelTime.getMinutes()*60) - squirrelTime.getSeconds();
	const squirrelDelay = Math.floor(Math.random() * secondsUntilEndOfDate);

	squirrelTime.setSeconds(squirrelTime.getSeconds() + squirrelDelay);
	console.log(`Going to send squirrel to ${channel.name} at ${squirrelTime.toUTCString()}`);
	setTimeout(async function() {
		const squirrelUrl = await SquirrelClient.getRandomSquirrelForChannel(channel.guild.id, channel.id);
		await channel.send(new MessageAttachment(squirrelUrl));
	}, squirrelDelay * 1000);
}
