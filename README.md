Project Documentation

Setup and Run Instructions

1. Install Dependencies

Ensure you have all necessary dependencies installed by running:

`npm install`

2. Database Migration

To generate a new migration for creating a session table, use:

`npx sequelize-cli migration:generate --name create-session`

Apply the migration to the database with:

`npx sequelize-cli db:migrate`

3. Seeder

To generate seeders for populating data into the database, use the following command:

For the questions table:

`npx sequelize-cli seed:generate --name demo-questions`

After generating the seeders, you can populate the tables by running:

`npx sequelize-cli db:seed:all`

4. Run the Project

Start the application by running:

`npm run start`

5. Additional Notes

Ensure that your database configuration in config/config.js is correctly set up.

If needed, you can rollback the last migration using:

`npx sequelize-cli db:migrate:undo`

For a full reset, use:

`npx sequelize-cli db:migrate:undo:all`

followed by:

`npx sequelize-cli db:migrate`

For further assistance, refer to the Sequelize CLI documentation.


6. Set up permissions for the session folder to avoid errors:

`sudo chown -R $(whoami) /analyzer-backend/.wwebjs_auth`

sudo chown -R $(whoami) /Users/fatkhuljabal/Documents/project/Node/analyzer-backend/.wwebjs_auth
