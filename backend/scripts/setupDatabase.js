const { runMigrations } = require("../services/migrations");

runMigrations({ force: true })
  .then((result) => {
    console.log(result.message);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
