import Database from "../lib/database";
import { ActionType } from "../interfaces/actionTypeEnum";

export default class ActionLogRepository {

	static async Add(serverId: number, userId: string|null, actionType: ActionType, channelId: string|null, data: any) {
		const database = Database.getInstance();

		await database.query("INSERT INTO ActionLog SET ?", [{
			serverId: serverId,
			userId: userId,
			action: actionType,
			channelId: channelId,
			data: JSON.stringify(data),
		}]);
	}

}