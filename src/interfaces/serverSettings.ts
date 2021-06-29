export interface ServerSettings {
	id: number;
	guildId: string;
	deleted: Date|null;

	prefix: string;

	logChannel: string|null;
	modLogChannel: string|null;
	voiceActivityLogChannel: string|null;

	systemNotice: boolean;

	streamLiveRole: string|null;
	streamShout: string|null;
	streamTimeout: number;

	adminRole: string|null;
	moderatorRole: string|null;

	muteRole: string|null;
	muteChannel: string|null;
}

