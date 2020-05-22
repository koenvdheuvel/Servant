import ServerSettings from "../interfaces/serverSettings";
import Database from "../lib/database";

export default class ServerSettingsRepository {

	static async GetByGuildId(guildId: string|undefined): Promise<ServerSettings|null> {
		if (!guildId) {
			return null;
		}
		const database = Database.getInstance()

		const result = await database.query<ServerSettings[]>("SELECT * FROM ServerSettings WHERE guildId = ?", [ guildId ]);
		if (result.length == 1) {
			return result[0];
		}
		return null;
	}

	static async Save(serverSettings: ServerSettings): Promise<boolean> {
		const database = Database.getInstance()

		try {
			await database.query("INSERT INTO ServerSettings SET ?", [ serverSettings ]);
			return true;
		} catch(e) {
			return false;
		}
	}

}