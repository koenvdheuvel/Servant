// Preventing nickname changes
// It's a shame this is needed, but it seems necessary to prevent inappropriate names

module.exports = async (client, oldMember, newMember) => {
    if (oldMember.user.id === client.user.id && newMember.nickname !== null) {
        client.logger.log(`[WARN] Prevented nickname change`, "warn");
        newMember.setNickname(null);
    }
};
