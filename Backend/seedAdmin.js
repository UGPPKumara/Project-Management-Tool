const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // --- Admin User Details ---
    const adminUsername = 'admin-';
    const adminPassword = 'admin';
    const adminName = 'Prasanna';
    const adminEmail = 'prasanna@example.com';

    // This line will DROP ALL TABLES and recreate them.
    // It's the most reliable way to fix schema issues.
    console.log('Synchronizing all models with the database...');
    await sequelize.sync({ force: true });
    console.log('All tables have been re-created successfully.');

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create the admin user in the newly created table
    await User.create({
      username: adminUsername,
      password: hashedPassword,
      role: 'admin',
      name: adminName,
      email: adminEmail,
    });

    console.log(`Admin user '${adminUsername}' was created successfully!`);

  } catch (error) {
    console.error('Error during admin user creation:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

createAdmin();