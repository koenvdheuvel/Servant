import { Client as DiscordClient, Guild } from "discord.js";
import Logger from "../lib/log";
import ServerSettingsRepository from "../repository/severSettings";

export default async function GuildCreateEvent(discordClient: DiscordClient, guild: Guild) {
	ServerSettingsRepository.Save({
		id: 0,
		guildId: guild.id,
		deleted: null,
		prefix: ';',
		logChannel: null,
		modLogChannel: null,
		systemNotice: true,
		streamLiveRole: null,
		streamShout: null,
		adminRole: null, 
		moderatorRole: null,
	});
	Logger.info(`Created guild ${guild.id}`);
}
