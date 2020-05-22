import { Client as DiscordClient } from "discord.js";
import Logger from "../lib/log";

export default async function ReadyEvent(discordClient: DiscordClient) {
	Logger.info(`Ready to serve`);

	// TODO:
	// Check for any added guilds while offline to create settings objects for
}
