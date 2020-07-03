import { Client as DiscordClient, Presence, GuildMember, Guild, MessageEmbed } from "discord.js";
import ServerSettingsRepository from "../repository/severSettings";
import WhiteListRepository from "../repository/whiteList";
import StreamTimeoutRepository from "../repository/streamTimeout";
import Logger from "../lib/log";
import TwitchClient from "../lib/twitch";
import { getTextChannel } from "../lib/util";
import createMessageEmbed from "../wrapper/discord/messageEmbed";

export default async function PresenceUpdateEvent(discordClient: DiscordClient, oldPresence: Presence | null, newPresence: Presence) {
	const guildId = newPresence.guild?.id;
	const serverSettings = await ServerSettingsRepository.GetByGuildId(guildId);
	if (serverSettings === null) {
		Logger.error(`Couldnt get server settings for ${guildId}`);
		return;
  }
  
  if (!newPresence.guild || !newPresence.member || !guildId) {
		Logger.error('Weird error that shouldnt happen');
		return;
	}

	const streamingActivity = newPresence.activities.find(activity => activity.type == "STREAMING");
  const stoppedStreaming = oldPresence?.activities.some(activity => activity.type == "STREAMING") && streamingActivity === undefined || false;
	const whiteListed = await CheckIfWhitelisted(guildId, newPresence.member, streamingActivity);
	
	if ((serverSettings.streamLiveRole !== null || serverSettings.streamShout !== null) && whiteListed) {
    const str = StreamTimeoutRepository.getInstance()
    const timedOut = await CheckTimeout(str, newPresence.member.user.id, serverSettings.streamTimeout);
    if (timedOut) { 
      return;
    }
	}

	if (serverSettings.streamLiveRole !== null) {
    SetLiveRole(newPresence.guild, newPresence.member, serverSettings.streamLiveRole, stoppedStreaming, whiteListed);
	}

	if (serverSettings.streamShout !== null && !stoppedStreaming && whiteListed) {
		const promotionChannel = getTextChannel(discordClient, serverSettings.streamShout);
		if (!promotionChannel) {
			Logger.error(`StreamShout channel was not found`);
			return;
		}

    const twitch = TwitchClient.getInstance()
    const embed = await CreateShoutout(newPresence.member, streamingActivity!.url!, twitch);
    if (!embed) { 
      return;
    }
			
    promotionChannel.send({ embed });
  }
}

export async function CheckTimeout(str: StreamTimeoutRepository, userId: string, timeout: number): Promise<boolean> { 
  if (timeout > 0) {
    let current = str.get(userId)

    if (current && current < new Date()) {
      return true;
    } else {
      current = new Date()
      current.setTime(current.getTime() + (timeout*3600000))
      str.set(userId, current)
    }
  }
  return false;
}

export async function SetLiveRole(guild: Guild, guildMember: GuildMember, liveRole: string, stoppedStreaming: boolean, whiteListed: boolean) {
  const liverole = await guild.roles.fetch(liveRole);

  if (!liverole) {
    Logger.error(`Role with key 'liverole' was not found`);
    return;
  }

  if (guildMember.roles.cache.has(liveRole) && stoppedStreaming) {
    await guildMember.roles.remove(liverole)
  } else if (whiteListed) {
    await guildMember.roles.add(liverole)
  }
}

export async function CreateShoutout(guildMember: GuildMember, streamUrl: string, client: TwitchClient): Promise<MessageEmbed|null> { 
  const streamUsername = streamUrl.substr(22);
  const stream = await client.getStreamer(streamUsername);
  if (!stream) { 
    return null;
  }

  const thumbnail = stream.thumbnail_url.replace('{width}x{height}', '384x216');
  const embed = createMessageEmbed({
    color: 'random',
    author: `${guildMember.displayName}`,
    authorIcon: `${guildMember.user.displayAvatarURL()}`,
    description: `**Streamer:** ${stream.user_name}`,
    image: thumbnail,
    fields: [
      {
        key: "**Stream Title:**",
        value: `${stream.title}`,
      },
      {
        key: "**Stream URL:**",
        value: `${streamUrl}`,
      },
    ],
  });
  
  return embed;
}

export async function CheckIfWhitelisted(guildId: string, member: GuildMember, streamingActivity: any): Promise<boolean> {
  if (streamingActivity === undefined || !streamingActivity.url) { 
    return false;
  }

  const streamUrl = streamingActivity.url;
  const streamUsername = streamUrl.substr(22);
  
  const twitch = TwitchClient.getInstance()
  const stream = await twitch.getStreamer(streamUsername);
  if (!stream) { 
    return false;
  }

  const wl = await WhiteListRepository.GetByGuildId(guildId);
  if (!wl) {
    return true;
  }

  const gameWhiteListed = wl.roles.length === 0 || wl.games.find(g => g.id === stream.game_id) === undefined;
  const roleWhiteListed = wl.roles.length === 0 || wl.roles.find(r1 => member.roles.cache.find(r2 => r1.id === r2.id) !== undefined) === undefined;

  return gameWhiteListed && roleWhiteListed;
}
