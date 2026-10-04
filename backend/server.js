const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, connectDB } = require('./config/db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const userRoutes = require('./routes/userRoutes');
const mcqRoutes = require('./routes/mcqRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mcqs', mcqRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('CodeForge API is running');
});

const PORT = process.env.PORT || 5000;

const User = require('./models/User');
const Setting = require('./models/Setting');
const LoginSession = require('./models/LoginSession');
const AssessmentAttempt = require('./models/AssessmentAttempt');
const bcrypt = require('bcryptjs');

const startServer = async () => {
  await connectDB();
  // Sync database models
  await sequelize.sync({ alter: true })
    .then(async () => {
      console.log('MySQL Database synced');
      
      // Seed / Ensure Admin
      const adminEmail = 'admin@codeforge.com';
      const salt = await bcrypt.genSalt(10);
      const hashedAdminPassword = await bcrypt.hash('Chinni@2105', salt);
      const hashedStudentPassword = await bcrypt.hash('Student@123', salt);

      let adminUser = await User.findOne({ where: { email: adminEmail } });
      if (!adminUser) {
        await User.create({
          name: 'Admin',
          email: adminEmail,
          password: hashedAdminPassword,
          role: 'Admin',
          accountStatus: 'APPROVED',
          isBlocked: false
        });
        console.log('Admin seeded: admin@codeforge.com / Chinni@2105');
      } else {
        // Ensure admin has valid password and is approved
        const isMatch = await bcrypt.compare('Chinni@2105', adminUser.password).catch(() => false);
        if (!isMatch) {
          adminUser.password = hashedAdminPassword;
        }
        adminUser.role = 'Admin';
        adminUser.accountStatus = 'APPROVED';
        adminUser.isBlocked = false;
        await adminUser.save();
        console.log('Admin verified: admin@codeforge.com / Chinni@2105');
      }

      // Seed / Ensure Student Accounts
      const demoStudentEmail = 'student@mbu.asia';
      let demoStudent = await User.findOne({ where: { email: demoStudentEmail } });
      if (!demoStudent) {
        await User.create({
          name: 'Demo Student',
          email: demoStudentEmail,
          rollNumber: 'DEMO001',
          password: hashedStudentPassword,
          role: 'Member',
          branch: 'CSE',
          year: '3',
          mobileNumber: '9876543210',
          accountStatus: 'APPROVED',
          isBlocked: false
        });
        console.log('Demo Student seeded: student@mbu.asia / Student@123');
      } else {
        demoStudent.accountStatus = 'APPROVED';
        demoStudent.isBlocked = false;
        await demoStudent.save();
      }

      // Ensure Tulasi student account is approved with password Student@123
      const tulasiStudent = await User.findOne({ where: { email: '23102a040676@mbu.asia' } });
      if (tulasiStudent) {
        tulasiStudent.password = hashedStudentPassword;
        tulasiStudent.accountStatus = 'APPROVED';
        tulasiStudent.isBlocked = false;
        await tulasiStudent.save();
        console.log('Student account ready: 23102a040676@mbu.asia / Student@123');
      }

      // Seed Settings
      const settingsExist = await Setting.count();
      if (settingsExist === 0) {
        await Setting.bulkCreate([
          { key: 'copyPasteProtection', value: true },
          { key: 'practiceMode', value: true },
          { key: 'registrationsEnabled', value: true },
          { key: 'maxTabSwitches', value: 5 }
        ]);
        console.log('Default settings seeded successfully');
      }
    })
    .catch(err => console.error('Error syncing database:', err));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
