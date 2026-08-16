const { prisma } = require('../config/database');

async function createLog({
  sessionId,
  userId,
  promptSummary,
  responseSummary,
  extractedData,
  provider,
}) {
  await prisma.aiInteractionLog.create({
    data: {
      sessionId,
      userId,
      promptSummary,
      responseSummary,
      extractedData,
      provider,
    },
  });
}

module.exports = {
  createLog,
};
