const { env, hasFirebaseAdmin } = require("./env");

module.exports = {
  projectId: env.firebase.projectId,
  clientEmail: env.firebase.clientEmail,
  privateKey: env.firebase.privateKey,
  publicConfig: env.firebase.publicConfig,
  vapidKey: env.firebase.vapidKey,
  isConfigured: hasFirebaseAdmin
};
