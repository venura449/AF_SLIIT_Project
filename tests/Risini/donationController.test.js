const request = require("supertest");
const app = require("../../Server");

const mongoose = require("mongoose");

const Need = require("../../models/donations/Need");
const User = require("../../models/users/User");

describe("Donation Integration Tests", () => {
  let donorToken;
  let adminToken;
  let needId;
  let donationId;

  let donorUser;
  let adminUser;

  beforeAll(async () => {
    // clean old test data
    await User.deleteMany({
      email: { $in: ["donor@test.com", "admin@test.com"] },
    });

    await Need.deleteMany({});

    // create donor
    donorUser = await User.create({
      username: "donor",
      email: "donor@test.com",
      password: "123456",
      role: "Donor",
    });

    const donorLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "donor@test.com", password: "123456" });

    donorToken = donorLogin.body.token;

    // create admin
    adminUser = await User.create({
      username: "admin",
      email: "admin@test.com",
      password: "123456",
      role: "Admin",
    });

    const adminLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.com", password: "123456" });

    adminToken = adminLogin.body.token;

    // IMPORTANT FIX: valid ObjectId recipient (NO string!)
    const need = await Need.create({
      title: "Test Need",
      description: "Help needed",
      category: "Education",
      urgency: "Medium",
      location: "Colombo",
      goalAmount: 1000,
      currentAmount: 0,

      recipient: donorUser._id,

      status: "Pending",
      isVerified: true,
    });

    needId = need._id;
  });

  afterAll(async () => {
    await Need.deleteMany({});
    await User.deleteMany({
      email: { $in: ["donor@test.com", "admin@test.com"] },
    });
  });

  it("should create donation", async () => {
    const res = await request(app)
      .post("/api/v1/donation")
      .set("Authorization", `Bearer ${donorToken}`)
      .send({
        need: needId,
        amount: 500,
        donationType: "Cash",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    donationId = res.body.data._id;
  });

  it("should fail without need", async () => {
    const res = await request(app)
      .post("/api/v1/donation")
      .set("Authorization", `Bearer ${donorToken}`)
      .send({
        amount: 500,
        donationType: "Cash",
      });

    expect(res.statusCode).toBe(400);
  });

  it("should confirm donation", async () => {
    const res = await request(app)
      .patch(`/api/v1/donation/${donationId}/confirm`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ transactionId: "tx123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should fail confirm without transactionId", async () => {
    const res = await request(app)
      .patch(`/api/v1/donation/${donationId}/confirm`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it("should get my donations", async () => {
    const res = await request(app)
      .get("/api/v1/donation/my")
      .set("Authorization", `Bearer ${donorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});