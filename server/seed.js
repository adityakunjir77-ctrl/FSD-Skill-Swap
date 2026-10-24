const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Models
const User = require('./models/User');
const Skill = require('./models/Skill');
const ExchangeRequest = require('./models/ExchangeRequest');
const Session = require('./models/Session');
const Message = require('./models/Message');
const Review = require('./models/Review');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillswap';

const seedDatabase = async (clearFirst = true) => {
  try {
    if (clearFirst) {
      console.log('[SkillSwap Seeder] Clearing existing records...');
      await Promise.all([
        User.deleteMany({}),
        Skill.deleteMany({}),
        ExchangeRequest.deleteMany({}),
        Session.deleteMany({}),
        Message.deleteMany({}),
        Review.deleteMany({}),
        Notification.deleteMany({}),
      ]);
      console.log('[SkillSwap Seeder] Database cleaned.');
    }

    // 2. Predefined Skill Taxonomy
    console.log('[SkillSwap Seeder] Seeding Skill Catalog...');
    const skillsList = [
      { name: 'React.js', category: 'Web Development', description: 'Modern declarative UI library for web development' },
      { name: 'Node.js', category: 'Programming', description: 'Server-side JavaScript runtime environment' },
      { name: 'Python', category: 'Programming', description: 'Versatile language for backend, automation, and AI' },
      { name: 'Machine Learning', category: 'Programming', description: 'Supervised learning, neural networks, and model training' },
      { name: 'TypeScript', category: 'Web Development', description: 'Typed superset of JavaScript for large applications' },
      { name: 'UI/UX Design', category: 'UI/UX Design', description: 'User-centered product design, personas, and usability' },
      { name: 'Figma', category: 'UI/UX Design', description: 'Collaborative vector design and interactive prototyping' },
      { name: 'Wireframing', category: 'UI/UX Design', description: 'Low-fidelity layout drafting and user flows' },
      { name: 'Spanish', category: 'Languages', description: 'Conversational and grammatical Spanish' },
      { name: 'French', category: 'Languages', description: 'French pronunciation, syntax, and vocabulary' },
      { name: 'Photography', category: 'Photography', description: 'DSLR composition, lighting, and shutter technique' },
      { name: 'Video Editing', category: 'Video Editing', description: 'Timeline editing, color grading, and audio syncing' },
      { name: 'Adobe Premiere', category: 'Video Editing', description: 'Professional video production and transitions' },
      { name: 'SEO & Content Strategy', category: 'Marketing', description: 'Search optimization and keyword ranking growth' },
      { name: 'Acoustic Guitar', category: 'Music', description: 'Chords, rhythm strumming, and fingerpicking' },
      { name: 'Public Speaking', category: 'Business', description: 'Pitch delivery, stage presence, and executive communication' },
    ];

    const insertedSkills = await Skill.insertMany(skillsList);
    const skillMap = {};
    insertedSkills.forEach((s) => {
      skillMap[s.name] = s._id;
    });
    console.log(`[SkillSwap Seeder] Inserted ${insertedSkills.length} skills.`);

    // 3. Seed Users
    console.log('[SkillSwap Seeder] Seeding Users with complementary skills...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('password123', salt);

    const usersData = [
      {
        name: 'Platform Admin',
        email: 'admin@skillswap.com',
        password: adminPassword,
        role: 'admin',
        bio: 'SkillSwap Platform Administrator managing community moderation, skills taxonomy, and quality assurance.',
        location: 'San Francisco, CA',
        experienceLevel: 'Expert',
        availability: 'Full Time',
        averageRating: 5.0,
        totalReviews: 0,
        completedExchanges: 12,
        isActive: true,
      },
      {
        name: 'Alex Chen',
        email: 'alex@example.com',
        password: userPassword,
        role: 'user',
        bio: 'Senior Full-Stack Engineer passionate about React, Node.js, and TypeScript. Looking to expand into Machine Learning and learn Spanish for travel!',
        location: 'Seattle, WA',
        experienceLevel: 'Advanced',
        availability: 'Weekends & Evenings',
        skillsOffered: [skillMap['React.js'], skillMap['Node.js'], skillMap['TypeScript']],
        skillsWanted: [skillMap['Python'], skillMap['Machine Learning'], skillMap['Spanish']],
        averageRating: 4.9,
        totalReviews: 8,
        completedExchanges: 5,
        isActive: true,
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: userPassword,
        role: 'user',
        bio: 'Data Scientist & AI Researcher. I love training neural nets with Python and scikit-learn. Eager to master React.js to deploy interactive AI web applications!',
        location: 'Austin, TX',
        experienceLevel: 'Expert',
        availability: 'Weekday Evenings',
        skillsOffered: [skillMap['Python'], skillMap['Machine Learning']],
        skillsWanted: [skillMap['React.js'], skillMap['Node.js']],
        averageRating: 5.0,
        totalReviews: 10,
        completedExchanges: 6,
        isActive: true,
      },
      {
        name: 'Marcus Johnson',
        email: 'marcus@example.com',
        password: userPassword,
        role: 'user',
        bio: 'Product Designer with 4+ years of experience in Figma design systems and user research. Excited to learn Frontend JavaScript and Node.js.',
        location: 'New York, NY',
        experienceLevel: 'Advanced',
        availability: 'Flexible',
        skillsOffered: [skillMap['UI/UX Design'], skillMap['Figma'], skillMap['Wireframing']],
        skillsWanted: [skillMap['React.js'], skillMap['Node.js']],
        averageRating: 4.8,
        totalReviews: 4,
        completedExchanges: 3,
        isActive: true,
      },
      {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        password: userPassword,
        role: 'user',
        bio: 'Polyglot and language tutor fluent in Spanish and French. Passionate about storytelling, photography, and video editing for cultural documentaries.',
        location: 'Miami, FL',
        experienceLevel: 'Expert',
        availability: 'Mornings & Weekends',
        skillsOffered: [skillMap['Spanish'], skillMap['French']],
        skillsWanted: [skillMap['Photography'], skillMap['Video Editing']],
        averageRating: 5.0,
        totalReviews: 7,
        completedExchanges: 4,
        isActive: true,
      },
      {
        name: 'David Kim',
        email: 'david@example.com',
        password: userPassword,
        role: 'user',
        bio: 'Professional freelance videographer and camera operator. Want to learn conversational Spanish before shooting a South American travel documentary.',
        location: 'Los Angeles, CA',
        experienceLevel: 'Advanced',
        availability: 'Weekends',
        skillsOffered: [skillMap['Photography'], skillMap['Video Editing'], skillMap['Adobe Premiere']],
        skillsWanted: [skillMap['Spanish']],
        averageRating: 4.9,
        totalReviews: 5,
        completedExchanges: 4,
        isActive: true,
      },
    ];

    const insertedUsers = await User.insertMany(usersData);
    const userMap = {};
    insertedUsers.forEach((u) => {
      userMap[u.name] = u._id;
    });
    console.log(`[SkillSwap Seeder] Inserted ${insertedUsers.length} users (including Admin).`);

    // 4. Seed Exchanges
    console.log('[SkillSwap Seeder] Seeding Exchange Requests across statuses...');
    const exchangesData = [
      {
        sender: userMap['Alex Chen'],
        receiver: userMap['Priya Sharma'],
        offeredSkill: 'React.js',
        wantedSkill: 'Python',
        message: 'Hi Priya! I would love to teach you React component architecture and state management in exchange for deep-dive Python and ML fundamentals.',
        status: 'Accepted',
      },
      {
        sender: userMap['Elena Rostova'],
        receiver: userMap['David Kim'],
        offeredSkill: 'Spanish',
        wantedSkill: 'Photography',
        message: 'Hey David, I can guide you through conversational Spanish drills in exchange for learning DSLR aperture, shutter speed, and lighting composition.',
        status: 'Completed',
      },
      {
        sender: userMap['Marcus Johnson'],
        receiver: userMap['Alex Chen'],
        offeredSkill: 'Figma',
        wantedSkill: 'Node.js',
        message: 'Hello Alex! Interested in trading interactive Figma UI design systems for Node.js REST API and database modeling guidance?',
        status: 'Pending',
      },
      {
        sender: userMap['Priya Sharma'],
        receiver: userMap['Marcus Johnson'],
        offeredSkill: 'Machine Learning',
        wantedSkill: 'UI/UX Design',
        message: 'Hi Marcus, would love to learn user empathy mapping and UX prototyping in exchange for an introduction to machine learning concepts!',
        status: 'In Progress',
      },
    ];

    const insertedExchanges = await ExchangeRequest.insertMany(exchangesData);
    console.log(`[SkillSwap Seeder] Inserted ${insertedExchanges.length} exchange requests.`);

    const alexPriyaExchange = insertedExchanges[0];
    const elenaDavidExchange = insertedExchanges[1];

    // 5. Seed Scheduled Session
    console.log('[SkillSwap Seeder] Seeding Scheduled Session...');
    await Session.create({
      exchange: alexPriyaExchange._id,
      proposer: userMap['Alex Chen'],
      partner: userMap['Priya Sharma'],
      topic: 'React Hooks, useEffect & Custom Hooks Mastery',
      date: '2026-10-22',
      time: '18:00 EST',
      message: 'We will review React useState, useEffect pitfalls, and build a custom hook together.',
      status: 'Accepted',
    });

    // 6. Seed Chat Messages
    console.log('[SkillSwap Seeder] Seeding Real-Time Chat History...');
    await Message.insertMany([
      {
        exchange: alexPriyaExchange._id,
        sender: userMap['Alex Chen'],
        receiver: userMap['Priya Sharma'],
        content: 'Hi Priya! Super excited to get our skill exchange started.',
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        exchange: alexPriyaExchange._id,
        sender: userMap['Priya Sharma'],
        receiver: userMap['Alex Chen'],
        content: 'Hey Alex! Same here! I prepared some interactive Jupyter notebook exercises for our Python session.',
        createdAt: new Date(Date.now() - 3600000 * 20),
      },
      {
        exchange: alexPriyaExchange._id,
        sender: userMap['Alex Chen'],
        receiver: userMap['Priya Sharma'],
        content: 'That sounds perfect! I scheduled our first session for Thursday 6 PM. Check out the Sessions tab.',
        createdAt: new Date(Date.now() - 3600000 * 15),
      },
      {
        exchange: alexPriyaExchange._id,
        sender: userMap['Priya Sharma'],
        receiver: userMap['Alex Chen'],
        content: 'Awesome, just accepted the session invitation. Looking forward to it!',
        createdAt: new Date(Date.now() - 3600000 * 10),
      },
    ]);

    // 7. Seed Reviews
    console.log('[SkillSwap Seeder] Seeding Verified Peer Reviews...');
    await Review.insertMany([
      {
        exchange: elenaDavidExchange._id,
        reviewer: userMap['Elena Rostova'],
        reviewee: userMap['David Kim'],
        rating: 5,
        feedback: 'David is a brilliant photography mentor. His breakdown of manual exposure and camera lenses made complex concepts instantly graspable!',
      },
      {
        exchange: elenaDavidExchange._id,
        reviewer: userMap['David Kim'],
        reviewee: userMap['Elena Rostova'],
        rating: 5,
        feedback: 'Elena was phenomenal! Her interactive conversation exercises had me speaking practical conversational Spanish in just a few sessions.',
      },
    ]);

    // 8. Seed Notifications
    console.log('[SkillSwap Seeder] Seeding In-App Notifications...');
    await Notification.insertMany([
      {
        recipient: userMap['Alex Chen'],
        sender: userMap['Priya Sharma'],
        type: 'request_accepted',
        title: 'Exchange Accepted!',
        message: 'Priya Sharma accepted your skill exchange request for React.js <-> Python.',
        link: '/requests',
      },
      {
        recipient: userMap['Alex Chen'],
        sender: userMap['Marcus Johnson'],
        type: 'request_sent',
        title: 'New Exchange Invitation',
        message: 'Marcus Johnson wants to swap Figma for Node.js.',
        link: '/requests',
      },
    ]);

    console.log('\n======================================================');
    console.log('🎉 SkillSwap Database Seeded Successfully!');
    console.log('======================================================');
    console.log('Admin Account:');
    console.log('  Email:    admin@skillswap.com');
    console.log('  Password: admin123');
    console.log('------------------------------------------------------');
    console.log('Demo Users:');
    console.log('  1. alex@example.com     (Password: password123)');
    console.log('  2. priya@example.com    (Password: password123)');
    console.log('  3. marcus@example.com   (Password: password123)');
    console.log('  4. elena@example.com    (Password: password123)');
    console.log('  5. david@example.com    (Password: password123)');
    console.log('======================================================\n');

    return true;
  } catch (error) {
    console.error('[SkillSwap Seeder] Error during seeding:', error);
    throw error;
  }
};

if (require.main === module) {
  (async () => {
    try {
      console.log('[SkillSwap Seeder] Connecting to MongoDB at:', MONGO_URI);
      await mongoose.connect(MONGO_URI);
      console.log('[SkillSwap Seeder] Connected successfully.');
      await seedDatabase(true);
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

module.exports = seedDatabase;

