const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const User = require('./models/User');
const Item = require('./models/Item');
const Claim = require('./models/Claim');
const Match = require('./models/Match');
const Notification = require('./models/Notification');
const { generateMatchesForItem } = require('./controllers/matchController');

const seedData = async (exitOnComplete = true) => {
  console.log('--- Seeding Campus Lost & Found Database ---');
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  try {
    // Clean existing collection data
    await Notification.deleteMany({});
    await Claim.deleteMany({});
    await Match.deleteMany({});
    await Item.deleteMany({});
    await User.deleteMany({});

    console.log('[Seed] Cleared existing data');

    // 1. Create Default Users
    const admin = await User.create({
      name: 'Campus Safety Admin',
      email: 'admin@campus.edu',
      password: 'AdminPassword123!',
      role: 'admin',
      campusId: 'ADM-1001',
      department: 'Campus Safety & Facility Operations',
      phone: '+1 (555) 010-0001',
    });

    const student1 = await User.create({
      name: 'Emma Watson',
      email: 'student@campus.edu',
      password: 'StudentPassword123!',
      role: 'student',
      campusId: 'STU-4821',
      department: 'Computer Science & Software Eng.',
      phone: '+1 (555) 012-4821',
    });

    const student2 = await User.create({
      name: 'Liam Chen',
      email: 'liam.chen@campus.edu',
      password: 'StudentPassword123!',
      role: 'student',
      campusId: 'STU-9904',
      department: 'Mechanical Engineering',
      phone: '+1 (555) 019-9904',
    });

    console.log('[Seed] Created default users:');
    console.log('   - Admin:   admin@campus.edu / AdminPassword123!');
    console.log('   - Student: student@campus.edu / StudentPassword123!');
    console.log('   - Student: liam.chen@campus.edu / StudentPassword123!');

    // 2. Create Items
    const itemsData = [
      {
        user: student1._id,
        type: 'lost',
        itemName: 'Space Gray MacBook Air M2',
        category: 'Electronics',
        description:
          'Left on a study table on the 2nd floor near the quiet study cubicles. Has a GitHub Octocat sticker on the front top corner and dark gray neoprene sleeve.',
        location: 'Main University Library (2nd Floor)',
        color: 'Space Gray',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'Lost',
        image: '',
      },
      {
        user: student2._id,
        type: 'found',
        itemName: 'Apple MacBook Air (Space Gray)',
        category: 'Electronics',
        description:
          'Turned into the front security desk. Found on an empty table in the quiet section of the library. Includes a dark padded zipper sleeve.',
        location: 'Main University Library (2nd Floor)',
        color: 'Space Gray',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'Found',
        image: '',
      },
      {
        user: student1._id,
        type: 'lost',
        itemName: 'Blue The North Face Recon Backpack',
        category: 'Bags',
        description:
          'Navy blue backpack with yellow accents containing notebook binders, TI-84 Plus calculator, and laptop charger.',
        location: 'Engineering Building (Room 204)',
        color: 'Navy Blue',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'Lost',
        image: '',
      },
      {
        user: student2._id,
        type: 'found',
        itemName: 'Crimson Lanyard with 3 Campus Dorm Keys',
        category: 'Keys',
        description:
          'Red braided campus lanyard holding two brass door keys, one mailbox key, and an RFID security key fob.',
        location: 'North Campus Quad walkway near Fountain',
        color: 'Red',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        status: 'Found',
        image: '',
      },
      {
        user: admin._id,
        type: 'found',
        itemName: 'Student ID Card & Dining Pass',
        category: 'Documents',
        description:
          'University identification card issued for Academic Year 2025-2026. Handed to Student Center information counter.',
        location: 'Student Center Dining Hall',
        color: 'White',
        date: new Date(Date.now() - 8 * 60 * 60 * 1000),
        status: 'Found',
        image: '',
      },
      {
        user: student2._id,
        type: 'lost',
        itemName: 'Sony WH-1000XM4 Noise Cancelling Headphones',
        category: 'Electronics',
        description:
          'Matte black over-ear wireless headphones inside the original black zipper carrying case.',
        location: 'Campus Fitness Center / Gym Locker Room',
        color: 'Black',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'Lost',
        image: '',
      },
      {
        user: admin._id,
        type: 'found',
        itemName: 'Stainless Steel Hydro Flask (32oz)',
        category: 'Accessories',
        description:
          'Pacific blue wide-mouth water bottle with flex straw lid. Slightly dented bottom rim.',
        location: 'Recreation Center Basketball Courts',
        color: 'Blue',
        date: new Date(Date.now() - 36 * 60 * 60 * 1000),
        status: 'Found',
        image: '',
      },
    ];

    const createdItems = await Item.insertMany(itemsData);
    console.log(`[Seed] Created ${createdItems.length} campus items`);

    // 3. Trigger automatic AI heuristic matching
    for (const item of createdItems) {
      await generateMatchesForItem(item);
    }
    console.log('[Seed] Generated automated matching recommendations');

    // 4. Create a sample claim on the Hydro Flask
    const hydroFlask = createdItems.find((i) => i.itemName.includes('Hydro Flask'));
    if (hydroFlask) {
      const claim = await Claim.create({
        item: hydroFlask._id,
        claimant: student1._id,
        proofDescription:
          'My bottle has a National Parks sticker on the side and a small dent on the lower base from dropping it near the bleachers.',
        status: 'submitted',
      });

      await Notification.create({
        recipient: admin._id,
        title: 'New Ownership Claim',
        message: `${student1.name} submitted an ownership claim for "${hydroFlask.itemName}".`,
        type: 'claim_update',
        relatedItem: hydroFlask._id,
        relatedClaim: claim._id,
      });

      console.log('[Seed] Created demonstration claim & notification');
    }

    console.log('\n===============================================');
    console.log('   Campus Lost & Found Database Seed Complete! ');
    console.log('===============================================\n');
    if (exitOnComplete) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('[Seed Error]:', error);
    if (exitOnComplete) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = { seedData };
