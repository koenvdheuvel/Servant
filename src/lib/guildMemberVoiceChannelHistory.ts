import { Guild, GuildMember, Snowflake, VoiceChannel } from "discord.js";

interface Storage {
    [key: string]: Array<{ date: Date, voiceChannel: VoiceChannel }> | undefined
}

class guildMemberVoiceChannelHistory {
    private storage: Storage;

    public constructor() {
        this.storage = {};
    }

    public updateHistory(guildMember: GuildMember, voiceChannel: VoiceChannel) {
        const date = new Date();
        
        if (this.storage[guildMember.id]) {
            this.storage[guildMember.id]?.push({ date, voiceChannel });
            return;
        }
        
        this.storage[guildMember.id] = new Array({ date, voiceChannel });
    }

    public getLastChannel(guildMember: GuildMember): VoiceChannel|null {
        const lastChannel = this.storage[guildMember.id]?.slice().sort((a, b) => b.date.getTime() - a.date.getTime())[0].voiceChannel;
    
        return lastChannel || null;
    }

    public cleanHistory(guildMember: GuildMember): void {
        console.log(`Cleaning history for ${guildMember.displayName}`);
        this.storage[guildMember.id] = undefined;
    }
}

const history = new guildMemberVoiceChannelHistory();

export default history;