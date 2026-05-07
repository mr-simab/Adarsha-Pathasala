const { publicRuntimeConfig } = require("../config/env");

exports.getConfig = (_req, res) => {
  res.json(publicRuntimeConfig());
};
