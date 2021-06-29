import { Guild, Client as DiscordClient, Channel, GuildChannel, Message, TextChannel, MessageAttachment } from 'discord.js';
import Logger from '../lib/log';
import { SetMutedPermissions, CheckExpires } from '../lib/mutedRole';
import ServerSettingsRepository from '../repository/serverSettings';
import schedule from 'node-schedule';
import SquirrelClient from '../lib/squirrel';
import SquirrelLogRepository from '../repository/squirrelLog';

export default async function ReadyEvent(discordClient: DiscordClient): Promise<void> {
	Logger.info(`Ready to serve, found ${discordClient.guilds.cache.size} guilds`);

	await Promise.all(discordClient.guilds.cache.map(guild => CheckGuild(guild)));
	async function CheckGuild(guild: Guild) {
		Logger.info(`Checking for guild ${guild.id}`);

		let serverSettings = await ServerSettingsRepository.GetByGuildId(guild.id);
		if (serverSettings === null) {
			await ServerSettingsRepository.Create(guild.id);
			serverSettings = await ServerSettingsRepository.GetByGuildId(guild.id);
			Logger.info(`Created guild ${guild.id}`);
		}

		if (serverSettings?.muteRole != null) {
			const muteRole = guild.roles.resolve(serverSettings.muteRole);
			if (muteRole === null) {
				return;
			}

			SetMutedPermissions(muteRole);
			CheckExpires(guild, muteRole);
		}
		
		schedule.scheduleJob('squirrel', '0 0 * * *', function() {
			SquirrelClient.randomSquirrelHandler(guild);
		});

		SquirrelClient.randomSquirrelHandler(guild);
	}
}
