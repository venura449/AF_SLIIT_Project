/**
 * seeder.js  –  Seeds dummy data using existing accounts
 *
 * Usage:
 *   node seeder.js          → seed all data
 *   node seeder.js --clear  → wipe seeded data only (users are preserved)
 */

require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/users/User");
const Need = require("./models/donations/Need");
const Donation = require("./models/donations/Donation");
const ItemListing = require("./models/donations/ItemListing");
const Message = require("./models/donations/Message");
const Feedback = require("./models/feedback/Feedback");
const Review = require("./models/feedback/Review");

// ─── helpers ─────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

// ─── seed data definitions ────────────────────────────────────────────────────

const NEED_TEMPLATES = [
    {
        title: "Emergency food supplies for displaced family",
        description:
            "A family of five lost their home in a recent flood and urgently needs food supplies to sustain them while they rebuild.",
        category: "Food",
        urgency: "Critical",
        location: "Colombo",
        goalAmount: 25000,
    },
    {
        title: "School fees for three children",
        description:
            "A single mother cannot afford school fees for her three children. Any contribution will help keep them in education.",
        category: "Education",
        urgency: "High",
        location: "Kandy",
        goalAmount: 45000,
    },
    {
        title: "Post-surgery medication expenses",
        description:
            "Following emergency surgery, this patient requires a three-month course of expensive medication not covered by insurance.",
        category: "Medical",
        urgency: "Critical",
        location: "Gampaha",
        goalAmount: 60000,
    },
    {
        title: "Stationery and books for rural school",
        description:
            "A rural primary school lacks basic stationery and textbooks. We are raising funds to provide a term's worth of supplies.",
        category: "Education",
        urgency: "Medium",
        location: "Matara",
        goalAmount: 15000,
    },
    {
        title: "Monthly grocery pack for elderly couple",
        description:
            "An elderly couple with no income needs monthly grocery support. Goal covers three months of essential food items.",
        category: "Food",
        urgency: "High",
        location: "Negombo",
        goalAmount: 18000,
    },
    {
        title: "Wheelchair for accident survivor",
        description:
            "A young man who lost mobility in an accident needs a wheelchair to regain independence and return to work.",
        category: "Medical",
        urgency: "High",
        location: "Ratnapura",
        goalAmount: 35000,
    },
    {
        title: "University registration fee support",
        description:
            "A first-generation university student needs help covering registration fees and initial semester costs.",
        category: "Education",
        urgency: "Medium",
        location: "Colombo",
        goalAmount: 50000,
    },
    {
        title: "Baby formula and nappies for newborn",
        description:
            "A young mother with no family support needs help with baby formula and nappies for the first six months.",
        category: "Other",
        urgency: "High",
        location: "Kurunegala",
        goalAmount: 20000,
    },
];

const ITEM_TEMPLATES = [
    {
        title: "Barely used laptop – Dell Inspiron 15",
        description:
            "Dell Inspiron 15 (2021), i5, 8 GB RAM, 256 GB SSD. Works perfectly, upgrading to a newer model.",
        category: "Electronics",
        condition: "Like New",
        location: "Colombo 3",
    },
    {
        title: "Children's clothing bundle (ages 5–8)",
        description:
            "Bundle of 15 items – t-shirts, shorts, and school uniforms. All washed and in good condition.",
        category: "Clothing",
        condition: "Good",
        location: "Nugegoda",
    },
    {
        title: "Wooden dining table with four chairs",
        description:
            "Solid wood dining set, seats four comfortably. Minor scratches on table surface, chairs are perfect.",
        category: "Furniture",
        condition: "Good",
        location: "Dehiwala",
    },
    {
        title: "Secondary school textbooks – Grade 10",
        description:
            "Full set of Grade 10 textbooks (Sinhala medium). Lightly used, all pages intact.",
        category: "Books",
        condition: "Good",
        location: "Kandy",
    },
    {
        title: "Electric rice cooker – Panasonic 1.8L",
        description: "Fully functional rice cooker, moving abroad and cannot take it. Includes measuring cup and spatula.",
        category: "Kitchen",
        condition: "Like New",
        location: "Colombo 7",
    },
    {
        title: "LEGO brick set – City series",
        description:
            "Complete LEGO City set (all pieces present). Great for kids aged 6–12.",
        category: "Toys",
        condition: "Good",
        location: "Battaramulla",
    },
];

const FEEDBACK_TEMPLATES = [
    {
        content:
            "BridgeConnect made it incredibly easy to find and support people in need. The verification process gives me confidence that my donation actually reaches the right person.",
        rating: 5,
    },
    {
        content:
            "A wonderful platform. I was able to donate towards a child's education within minutes. Highly recommended to anyone who wants to make a real difference.",
        rating: 5,
    },
    {
        content:
            "Good experience overall. The item listing feature is a great way to donate goods you no longer need. Would love a mobile app.",
        rating: 4,
    },
    {
        content:
            "Very transparent. You can see exactly how much of a need has been funded and where the money will go. That trust factor is what keeps me coming back.",
        rating: 5,
    },
    {
        content:
            "Setting up my need request was straightforward. Admin approved it quickly and donations started coming in the same day.",
        rating: 4,
    },
];

const REVIEW_REPLIES = [
    "Thank you so much for your kind words! Your support means the world to us.",
    "We really appreciate your feedback. It motivates us to keep improving the platform.",
    "Glad the process was smooth for you. We are working on more features to make it even better.",
    "Your generosity makes a direct impact. Thank you for being part of the BridgeConnect community.",
];

const DONATION_MESSAGES = [
    "Stay strong – we are with you!",
    "Happy to help. Hope things get better soon.",
    "A small contribution, but given with a full heart.",
    "Wishing your family all the best.",
    "Keep going – you are not alone.",
    "",
];

// ─── main seeder ──────────────────────────────────────────────────────────────

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    // ── 1. Load existing accounts ─────────────────────────────────────────────
    const donor = await User.findOne({ role: "Donor" });
    const recipient = await User.findOne({ role: "Recipient" });
    const admin = await User.findOne({ role: "Admin" });

    if (!donor || !recipient || !admin) {
        console.error(
            "Could not find all three required accounts (Donor, Recipient, Admin).\n" +
            "Please make sure donor@gmail.com, recipient@gmail.com and admin@gmail.com exist."
        );
        process.exit(1);
    }

    console.log(`Using accounts:`);
    console.log(`  Donor     : ${donor.username} (${donor.email})`);
    console.log(`  Recipient : ${recipient.username} (${recipient.email})`);
    console.log(`  Admin     : ${admin.username} (${admin.email})\n`);

    // ── 2. Needs ──────────────────────────────────────────────────────────────
    console.log("Seeding needs…");
    const createdNeeds = [];

    for (let i = 0; i < NEED_TEMPLATES.length; i++) {
        const tmpl = NEED_TEMPLATES[i];
        const isVerified = i < 6; // first 6 are verified, last 2 are pending
        const currentAmount = isVerified ? rand(0, Math.floor(tmpl.goalAmount * 0.8)) : 0;

        let status = "Pending";
        if (isVerified) {
            if (currentAmount >= tmpl.goalAmount) status = "Fulfilled";
            else if (currentAmount > 0) status = "Partially Funded";
            else status = "Pending";
        }

        const need = await Need.create({
            recipient: recipient._id,
            title: tmpl.title,
            description: tmpl.description,
            category: tmpl.category,
            urgency: tmpl.urgency,
            location: tmpl.location,
            goalAmount: tmpl.goalAmount,
            currentAmount,
            status,
            isVerified,
            verifiedBy: isVerified ? admin._id : undefined,
            createdAt: daysAgo(rand(5, 60)),
        });

        createdNeeds.push(need);
        console.log(`  ✓ Need: "${need.title}" [${isVerified ? "Verified" : "Pending"}]`);
    }

    // ── 3. Donations ──────────────────────────────────────────────────────────
    console.log("\nSeeding donations…");
    const verifiedNeeds = createdNeeds.filter((n) => n.isVerified);
    const createdDonations = [];

    for (const need of verifiedNeeds) {
        const numDonations = rand(1, 3);
        for (let d = 0; d < numDonations; d++) {
            const donationType = pick(["Cash", "Cash", "Goods"]);
            const amount = donationType === "Goods" ? 0 : rand(500, 5000);
            const isConfirmed = Math.random() > 0.3;

            const donation = await Donation.create({
                donor: donor._id,
                need: need._id,
                amount,
                donationType,
                goodsDescription:
                    donationType === "Goods" ? "Rice (5 kg), lentils, cooking oil" : undefined,
                phoneNumber: donationType !== "Goods" ? "0771234567" : undefined,
                message: pick(DONATION_MESSAGES) || undefined,
                paymentStatus: isConfirmed ? "Completed" : "Pending",
                transactionId: isConfirmed ? `TXN${Date.now()}${d}` : undefined,
                isAnonymous: Math.random() < 0.2,
                createdAt: daysAgo(rand(1, 30)),
            });

            createdDonations.push(donation);
            console.log(
                `  ✓ Donation LKR ${amount} (${donationType}) → "${need.title.slice(0, 40)}…"`
            );
        }
    }

    // ── 4. Item Listings ──────────────────────────────────────────────────────
    console.log("\nSeeding item listings…");
    const createdItems = [];

    for (const tmpl of ITEM_TEMPLATES) {
        const status = pick(["Available", "Available", "Reserved", "Claimed"]);
        const item = await ItemListing.create({
            donor: donor._id,
            title: tmpl.title,
            description: tmpl.description,
            category: tmpl.category,
            condition: tmpl.condition,
            location: tmpl.location,
            status,
            createdAt: daysAgo(rand(1, 45)),
        });
        createdItems.push(item);
        console.log(`  ✓ Item: "${item.title}" [${status}]`);
    }

    // ── 5. Messages (on Available/Reserved items) ─────────────────────────────
    console.log("\nSeeding messages…");
    const messageable = createdItems.filter(
        (i) => i.status === "Available" || i.status === "Reserved"
    );

    const msgPairs = [
        { content: "Hello, is this item still available?" },
        { content: "Yes it is! When would you like to collect it?" },
        { content: "I can come this weekend if that works for you." },
        { content: "That is perfect. I will message you the address." },
    ];

    for (const item of messageable.slice(0, 3)) {
        for (let m = 0; m < msgPairs.length; m++) {
            const isEven = m % 2 === 0;
            await Message.create({
                itemListing: item._id,
                sender: isEven ? recipient._id : donor._id,
                receiver: isEven ? donor._id : recipient._id,
                content: msgPairs[m].content,
                createdAt: daysAgo(rand(0, 10)),
            });
        }
        console.log(`  ✓ 4 messages on "${item.title.slice(0, 45)}…"`);
    }

    // ── 6. Feedback (platform reviews by donor & recipient) ───────────────────
    console.log("\nSeeding feedback…");
    const createdFeedback = [];

    for (let i = 0; i < FEEDBACK_TEMPLATES.length; i++) {
        const tmpl = FEEDBACK_TEMPLATES[i];
        const author = i % 2 === 0 ? donor : recipient;
        const relatedNeed =
            i < verifiedNeeds.length ? verifiedNeeds[i] : undefined;

        const fb = await Feedback.create({
            user: author._id,
            need: relatedNeed?._id,
            content: tmpl.content,
            rating: tmpl.rating,
            createdAt: daysAgo(rand(1, 30)),
        });

        createdFeedback.push(fb);
        console.log(
            `  ✓ Feedback (${tmpl.rating}★) by ${author.username}`
        );
    }

    // ── 7. Reviews (admin replies to feedback) ────────────────────────────────
    console.log("\nSeeding reviews…");
    for (let i = 0; i < Math.min(4, createdFeedback.length); i++) {
        const fb = createdFeedback[i];
        await Review.create({
            feedback: fb._id,
            user: admin._id,
            description: REVIEW_REPLIES[i],
            rating: rand(4, 5),
            createdAt: daysAgo(rand(0, fb.createdAt ? 2 : 5)),
        });
        console.log(`  ✓ Review reply by Admin to feedback ${i + 1}`);
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("\n─────────────────────────────────────");
    console.log("Seeding complete!");
    console.log(`  Needs      : ${createdNeeds.length}`);
    console.log(`  Donations  : ${createdDonations.length}`);
    console.log(`  Items      : ${createdItems.length}`);
    console.log(`  Messages   : ${messageable.slice(0, 3).length * 4}`);
    console.log(`  Feedback   : ${createdFeedback.length}`);
    console.log(`  Reviews    : ${Math.min(4, createdFeedback.length)}`);
    console.log("─────────────────────────────────────\n");

    await mongoose.disconnect();
}

// ─── clear mode ───────────────────────────────────────────────────────────────

async function clear() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected – clearing seeded data (users are preserved)…\n");

    const counts = {
        needs: (await Need.deleteMany({})).deletedCount,
        donations: (await Donation.deleteMany({})).deletedCount,
        items: (await ItemListing.deleteMany({})).deletedCount,
        messages: (await Message.deleteMany({})).deletedCount,
        feedback: (await Feedback.deleteMany({})).deletedCount,
        reviews: (await Review.deleteMany({})).deletedCount,
    };

    console.log("Cleared:");
    for (const [col, n] of Object.entries(counts)) {
        console.log(`  ${col.padEnd(10)}: ${n} documents removed`);
    }

    await mongoose.disconnect();
    console.log("\nDone.\n");
}

// ─── entry point ──────────────────────────────────────────────────────────────

const mode = process.argv[2];
if (mode === "--clear") {
    clear().catch((err) => {
        console.error(err);
        process.exit(1);
    });
} else {
    seed().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
