import { icdService } from "@/services/icd.service";

// Test the ICD service
async function testICDService() {
  try {
    console.log("Testing ICD service...");
    const results = await icdService.getAll({ page: 1, limit: 10 });
    console.log("ICD service results:", results);
    console.log("Data type:", typeof results.data);
    console.log("Is array:", Array.isArray(results.data));
    console.log("Data length:", results.data?.length);
  } catch (error) {
    console.error("Error testing ICD service:", error);
  }
}

testICDService();