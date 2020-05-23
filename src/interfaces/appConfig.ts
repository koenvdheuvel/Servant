export default interface ApplicationConfig {
	botOwnerUserId: string;
	database: DatabaseConfig;
	discord: DiscordConfig;
}

export interface DatabaseConfig {
	host: string;
	user: string;
	password: string;
	database: string;
}

export interface DiscordConfig {
	clientId: string;
	clientSecret: string;
	botToken: string;
}
