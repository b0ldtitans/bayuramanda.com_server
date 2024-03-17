const request = require("supertest");
const app = require("../index.js"); // Assuming this is your Express app

describe("Category Controller", () => {
  describe("POST /categories", () => {
    it("should create a new category", async () => {
      const response = await request(app)
        .post("/categories")
        .send({ name: "Test Category" });

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.message).toContain(
        "Successfully created new category"
      );
    });

    it("should return an error if category name is missing", async () => {
      const response = await request(app).post("/categories").send({});

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain("Category name is required");
    });

    // Add more test cases for edge cases and error scenarios
  });

  describe("PUT /categories/:id", () => {
    it("should update a category", async () => {
      const response = await request(app)
        .put("/categories/1")
        .send({ name: "Updated Category", description: "Updated description" });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.message).toContain("Category updated successfully");
    });

    it("should return an error if category name already exists", async () => {
      const response = await request(app)
        .put("/categories/1")
        .send({ name: "Existing Category" });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain("Category name already exists");
    });

    // Add more test cases for edge cases and error scenarios
  });

  describe("DELETE /categories/:id", () => {
    it("should delete a category", async () => {
      const response = await request(app).delete("/categories/1");

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.message).toContain("Category deleted successfully");
    });

    // Add more test cases for edge cases and error scenarios
  });

  describe("GET /categories", () => {
    it("should get all categories", async () => {
      const response = await request(app).get("/categories");

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.categories).toBeDefined();
    });

    it("should get a specific category by ID", async () => {
      const response = await request(app).get("/categories/1");

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.category).toBeDefined();
    });

    // Add more test cases for edge cases and error scenarios
  });

  describe("GET /categories/deleted", () => {
    it("should get all deleted categories", async () => {
      const response = await request(app).get("/categories/deleted");

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.categories).toBeDefined();
    });

    // Add more test cases for edge cases and error scenarios
  });

  describe("POST /categories/:id/restore", () => {
    it("should restore a deleted category", async () => {
      const response = await request(app).post("/categories/1/restore");

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.message).toContain("Category restored successfully");
    });

    // Add more test cases for edge cases and error scenarios
  });
});
