import ReadyEvent from './events/ready';
import { Client as DiscordClient } from 'discord.js';
import MessageDeleteEvent from './events/messageDelete';
import MessageUpdateEvent from './events/messageUpdate';
import GuildCreateEvent from './events/guildCreate';
import GuildDeleteEvent from './events/guildDelete';
import ChannelCreateEvent from './events/channelCreate';
import VoiceStateUpdateEvent from './events/voiceStateUpdate';
import MessageDeleteBulkEvent from './events/messageDeleteBulk';
import ErrorEvent from './events/error';
import MessageEvent from './events/message';
import { ICommand, PermissionLevel } from './commands/base';
import HelpCommand from './commands/help';
import PurgeCommand from './commands/purge';
import StatsCommand from './commands/stats';
import ConfigCommand from './commands/config';
import LiveResetCommand from './commands/resetlive';
import PresenceUpdateEvent from './events/presenceUpdate';
import MuteCommand from './commands/mute';
import UnmuteCommand from './commands/unmute';
import PollCommand from './commands/poll';
import SquirrelCommand from './commands/squirrel';

const Commands: ICommand[] = [
	HelpCommand,
	PurgeCommand,
	StatsCommand,
	ConfigCommand,
	LiveResetCommand,
	MuteCommand,
	UnmuteCommand,
	PollCommand,
	SquirrelCommand
].map(x => new x());

const EventBind = {
	'ready': ReadyEvent,
	'message': MessageEvent,
	'error': ErrorEvent,
	'messageDelete': MessageDeleteEvent,
	'messageUpdate': MessageUpdateEvent,
	'guildCreate': GuildCreateEvent,
	'guildDelete': GuildDeleteEvent,
	'channelCreate': ChannelCreateEvent,
	'voiceStateUpdate': VoiceStateUpdateEvent,
	'messageDeleteBulk': MessageDeleteBulkEvent,
	'presenceUpdate': PresenceUpdateEvent,
};

export async function BindRoutes(discordClient: DiscordClient): Promise<void> {
	// Bind events
	for (const key in EventBind) {
		/* eslint-disable @typescript-eslint/no-explicit-any */
		const eventName: any = key;
		/* eslint-enable */
		const eventFunction = EventBind[eventName];
		discordClient.on(eventName, eventFunction.bind(null, discordClient));
	}
}

export async function getCommand(commandStr: string): Promise<ICommand | null> {
	for (const command of Commands) {
		if (command.commandName == commandStr || (command.aliases && command.aliases.includes(commandStr))) {
			return command;
		}
	}
	return null;
}

export async function getCommands(permissionLevel: PermissionLevel): Promise<ICommand[]> {
	const commands: ICommand[] = [];
	for (const command of Commands) {
		if (permissionLevel <= command.permissionLevel) {
			commands.push(command);
		}
	}
	return commands;
}

