import { ICommand, PermissionLevel } from './base';
import { Message, Client, MessageAttachment } from 'discord.js';
import SquirrelClient from '../lib/squirrel';

export default class SquirrelCommand implements ICommand {
	commandName = 'squirrel';
	aliases = null;
	permissionLevel = PermissionLevel.User;
	guildOnly = false;

	usageText = ';squirrel';
	helpText = 'Displays a random squirrel';

	async run(discordClient: Client, message: Message, args: string[]): Promise<void> {
		if (args.length > 0) {
			return;
		}

		const squirrelUrl = await SquirrelClient.getRandomSquirrelUrl();

		if (squirrelUrl) {
			await message.channel.send(new MessageAttachment(squirrelUrl));
			await message.delete();
		} else {
			await message.channel.send('Failed to retrieve a random squirrel :sadge:');
		}

		return;
	}
}
