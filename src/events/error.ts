import { Client as DiscordClient } from "discord.js";
import Logger from "../lib/log";

export default async function ErrorEvent(discordClient: DiscordClient, error: Error) {
	Logger.error(`Discord error`, error);
}
