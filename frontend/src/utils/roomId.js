export const generateRoomId = (userId, agentId) => {
  // Sort IDs to ensure consistent roomId (e.g., "userId_agentId")
  const ids = [userId, agentId].sort();
  return `${ids[0]}_${ids[1]}`;
};
