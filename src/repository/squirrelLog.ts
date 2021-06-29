import Database from '../lib/database';

export default class SquirrelLogRepository {
	static async hasSquirrelBeenPostedAlready(guildId: string, channelId: string, squirrelHash: string): Promise<boolean> {
		const database = Database.getInstance();
		const squirrels = await database.query<Array<string>>('SELECT * FROM SquirrelLog WHERE guildId = ? AND channelId = ? and squirrelHash = ?', [guildId, channelId, squirrelHash]);

		return squirrels.length > 0;
	}

	static async hasSquirrelBeenPostedToday(guildId: string, channelId: string): Promise<boolean> {
		const database = Database.getInstance();
		const squirrels = await database.query<Array<string>>('SELECT * FROM SquirrelLog WHERE guildID = ? AND channelID = ? AND date >= CURDATE() AND date < CURDATE() + INTERVAL 1 DAY', [guildId, channelId]);

		return squirrels.length > 0;
	}

	static async AddSquirrelLog(guildId: string, channelId: string, squirrelHash: string): Promise<void> {
		const database = Database.getInstance();

		await database.query('INSERT INTO SquirrelLog SET ?', [{
			guildId: guildId,
			channelId: channelId,
			date: new Date(),
			squirrelHash: squirrelHash,
		}]);
	}
}

