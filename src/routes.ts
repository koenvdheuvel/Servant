import ReadyEvent from "./events/ready";
import { Client as DiscordClient } from "discord.js";
import MessageDeleteEvent from "./events/messageDelete";
import MessageUpdateEvent from "./events/messageUpdate";
import GuildCreateEvent from "./events/guildCreate";
import GuildDeleteEvent from "./events/guildDelete";
import ErrorEvent from "./events/error";

const Commands: any[] = [
	
];

const EventBind = {
	'ready': ReadyEvent,
	'messageDelete': MessageDeleteEvent,
	'messageUpdate': MessageUpdateEvent,
	'guildCreate': GuildCreateEvent,
	'guildDelete': GuildDeleteEvent,
	'error': ErrorEvent,
};

export default async function BindRoutes(discordClient: DiscordClient) {

	// Bind events
	for (const key in EventBind) {
		const eventName: any = key;
		const eventFunction = EventBind[eventName];
		discordClient.on(eventName, eventFunction.bind(null, discordClient));
	}

}

