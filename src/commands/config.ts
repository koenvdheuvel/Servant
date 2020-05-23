import { ICommand, PermissionLevel } from "./base";
import { Message, Client, MessageEmbed } from "discord.js";
import ServerSettingsRepository from "../repository/severSettings";
import { Server } from "http";

export default class ConfigCommand implements ICommand {

	commandName = 'config';
	aliases = null;
	permissionLevel = PermissionLevel.Administrator;
	guildOnly = false;

	usageText = ";config [set] [key] [value]";
	helpText = "Shows bot stats";

	async run(discordClient: Client, message: Message, args: string[]) {
		const guildId = message.guild?.id;
		const ss = await ServerSettingsRepository.GetByGuildId(guildId);
		if (!ss || !message.guild) {
			return;
		}

		const guild = message.guild;

		if (args.length == 0) {

			let logChannelString = 'Off';
			if (ss.logChannel) {
				const logChannel = guild.channels.resolve(ss.logChannel);
				logChannelString = `${logChannel?.name || 'ERR-404'} (${ss.logChannel})`;
			}

			let streamLiveRoleString = 'Off';
			if (ss.streamLiveRole) {
				const liveRole = guild.roles.resolve(ss.streamLiveRole)
				streamLiveRoleString = `${liveRole?.name || 'ERR-404'} (${ss.streamLiveRole})`;
			}

			let streamShoutString = 'Off';
			if (ss.streamShout) {
				const shoutChannel = guild.channels.resolve(ss.streamShout)
				streamShoutString = `${shoutChannel?.name || 'ERR-404'} (${ss.streamShout})`;
			}

			let adminRoleString = 'Off';
			if (ss.adminRole) {
				const adminRole = guild.roles.resolve(ss.adminRole)
				adminRoleString = `${adminRole?.name || 'ERR-404'} (${ss.adminRole})`;
			}

			let modRoleString = 'Off';
			if (ss.moderatorRole) {
				const modRole = guild.roles.resolve(ss.moderatorRole)
				modRoleString = `${modRole?.name || 'ERR-404'} (${ss.moderatorRole})`;
			}

			const embed = new MessageEmbed()
				.setColor(0x33CC33)
				.setTimestamp()
				.setAuthor("Bot Config")
				.addField("logChannel", logChannelString)
				.addField("systemNotice", ss.systemNotice ? 'true' : 'false')
				.addField("streamLiveRole", streamLiveRoleString)
				.addField("streamShout", streamShoutString)
				.addField("adminRole", adminRoleString)
				.addField("moderatorRole", modRoleString)
				.setFooter(`ServerID: ${ss.id}`);
			message.reply({embed});
			return;
		}

		if (args.length != 3) {
			return;
		}

		if (args.length == 3 && args[0] == 'set') {
			const key = args[1];
			const value = args[2];

			if (key == 'logChannel') {
				if (value == 'null') {
					ss.logChannel = null;
				} else {
					const logChannel = guild.channels.cache.find(x => x.id == value || x.name == value);
					if (!logChannel) {
						message.reply('Couldnt find channel');
						return;
					}
					ss.logChannel = logChannel.id;
				}
			} else if (key == 'systemNotice') {
				ss.systemNotice = Boolean(value);
			} else if (key == 'streamLiveRole') {
				if (value == 'null') {
					ss.streamLiveRole = null;
				} else {
					const liveRole = guild.roles.cache.find(x => x.id == value || x.name == value);
					if (!liveRole) {
						message.reply('Couldnt find role');
						return;
					}
					ss.streamLiveRole = liveRole.id;
				}
			} else if (key == 'streamShout') {
				if (value == 'null') {
					ss.streamShout = null;
				} else {
					const promotionChannel = guild.channels.cache.find(x => x.id == value || x.name == value);
					if (!promotionChannel) {
						message.reply('Couldnt find channel');
						return;
					}
					ss.streamShout = promotionChannel.id;
				}
			} else if (key == 'adminRole') {
				if (value == 'null') {
					ss.adminRole = null;
				} else {
					const adminRole = guild.roles.cache.find(x => x.id == value || x.name == value);
					if (!adminRole) {
						message.reply('Couldnt find role');
						return;
					}
					ss.adminRole = adminRole.id;
				}
				
			} else if (key == 'moderatorRole') {
				if (value == 'null') {
					ss.moderatorRole = null;
				} else {
					const modRole = guild.roles.cache.find(x => x.id == value || x.name == value);
					if (!modRole) {
						message.reply('Couldnt find role');
						return;
					}
					ss.moderatorRole = modRole.id;
				}
			}

			if (await ServerSettingsRepository.Save(ss)) {
				message.reply('Done');
			} else {
				message.reply('Unkown error');
			}
		}

	}

}