import fetch from 'node-fetch';
import hasha from 'hasha';
import { Readable } from 'stream';
import { Guild, MessageAttachment, TextChannel } from 'discord.js';
import SquirrelLogRepository from '../repository/squirrelLog';

export default class SquirrelClient {
    private static async getSquirrelList(): Promise<Array<string> | null> {
        const apiUrl = 'https://schnitzel.team/api/Squirrels';
        const imageBaseUrl = 'https://schnitzel.team'
        const userAgent = 'Teamspeak-Compatibility-Layer-Discord-Bot';

        const squirrelListResponse = await fetch(apiUrl, {
            method: 'get',
            headers: {
                'User-Agent': userAgent,
            }
        });

        const responseJson = await squirrelListResponse.json();

        if (responseJson.content.length == 0) {
            return null;
        }

        let squirrelList: Array<string> = [];

        responseJson.content.forEach(element => {
            squirrelList.push(`${imageBaseUrl}${element.path}`);
        });

        return squirrelList;
    }

    public static async getRandomSquirrelUrl(): Promise<string | null> {
        const squirrelList = await this.getSquirrelList();

        if (!squirrelList) {
            return null;
        }

        const random = Math.floor(Math.random() * squirrelList.length);

        return squirrelList[random];
    }

    public static async getSquirrelHash(squirrelUrl: string): Promise<string | null> {
        const userAgent = 'Teamspeak-Compatibility-Layer-Discord-Bot';
        const squirrelResponse = await fetch(squirrelUrl, {
            method: 'get',
            headers: {
                'User-Agent': userAgent,
            }
        });

        const squirrelBuffer = await squirrelResponse.buffer();
        return hasha(squirrelBuffer);
    }

    public static async randomSquirrelHandler(guild: Guild): Promise<void> {
        const channels = guild.channels.cache.filter((channel) => channel.type === 'text' && !channel.deleted).array();

        channels.forEach(async function(channel) {
            if (!((channel): channel is TextChannel => channel.type === 'text')(channel)) return;
            if (channel.id === "656248433073717248") return; // rules channel
            if (await SquirrelLogRepository.hasSquirrelBeenPostedToday(guild.id, channel.id)) return;

            let squirrelTime = new Date();
            let secondsUntilEndOfDate = (24*60*60) - (squirrelTime.getHours()*60*60) - (squirrelTime.getMinutes()*60) - squirrelTime.getSeconds();
            const squirrelDelay = Math.floor(Math.random() * secondsUntilEndOfDate);

            squirrelTime.setSeconds(squirrelTime.getSeconds() + squirrelDelay);
            console.log(`Going to send squirrel to ${channel.name} at ${squirrelTime.toUTCString()}`);
            setTimeout(async function() {
                const squirrelUrl = await SquirrelClient.getRandomSquirrelForChannel(channel.guild.id, channel.id);
                await channel.send(new MessageAttachment(squirrelUrl));
            }, squirrelDelay * 1000);
        });
    }

    public static async getRandomSquirrelForChannel(guildId: string, channelId: string): Promise<string> {
        const squirrelUrl = await this.getRandomSquirrelUrl();
		if (!squirrelUrl) return await this.getRandomSquirrelForChannel(guildId, channelId);
	
		const squirrelHash = await this.getSquirrelHash(squirrelUrl);
		if (!squirrelHash) return await this.getRandomSquirrelForChannel(guildId, channelId);

		if (await SquirrelLogRepository.hasSquirrelBeenPostedAlready(guildId, channelId, squirrelHash)) {
            return await this.getRandomSquirrelForChannel(guildId, channelId);
        }

        SquirrelLogRepository.AddSquirrelLog(guildId, channelId, squirrelHash);
        return squirrelUrl;
    }
}
