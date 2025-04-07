require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { categoryNameToIdMap } = require("./constants");
const { default: axios } = require("axios");
const {
  getCookieValue,
  login,
  editSubcategoryByName,
  createProduct,
  getRandomPricingData,
} = require("./utils");

const loadAllProductsScript = async () => {
  const productDirectoryBasePath = process.env["PRODUCTS_PATH"];
  const baseUrl = process.env["SERVER_BASE_URL"];
  const productDataloadEndpoint = process.env["PRODUCT_DATALOAD_ENDPOINT"];
  const loginEndpoint = process.env["LOGIN_ENDPOINT"];
  const email = process.env["ADMIN_EMAIL"];
  const password = process.env["ADMIN_PASSWORD"];

  if (!productDirectoryBasePath) {
    throw new Error("Product base directory path not found in .env");
  }
  if (!baseUrl) {
    throw new Error("Server Base URL not found in .env");
  }
  if (!productDataloadEndpoint) {
    throw new Error("Product Dataload Endpoint not found in .env");
  }
  if (!loginEndpoint) {
    throw new Error("Login Endpoint not found in .env");
  }

  try {
    const productDirs = fs.readdirSync(productDirectoryBasePath);
    const loginUrl = baseUrl + loginEndpoint;
    const productDataloadUrl = baseUrl + productDataloadEndpoint;

    // Getting admin access token
    const cookieValue = await login(loginUrl, email, password);

    for (let categorySubDir of productDirs) {
      // Get all category subdirs
      const categorySubDirPath = path.join(
        productDirectoryBasePath,
        categorySubDir
      );
      const stats = fs.statSync(categorySubDirPath);

      // Get categoryName
      const categoryName = categorySubDir;

      console.log(
        `Starting Category Batch:::::: ${categorySubDirPath}:`,
        stats.isDirectory()
      );

      if (stats.isDirectory()) {
        // Get all subcategory files from category subDir
        const subcategoryDirs = fs.readdirSync(categorySubDirPath);
        for (let subcategoryDir of subcategoryDirs) {
          const productDirPath = path.join(categorySubDirPath, subcategoryDir);

          // Get subcategoryName
          const subcategoryName = subcategoryDir;
          console.log(
            `Starting Subcategory Batch:::::: ${productDirPath}`,
            stats.isDirectory(),
            "\n\n"
          );

          const productSubDirs = fs.readdirSync(productDirPath);
          for (let productFile of productSubDirs) {
            try {
              // Extract product name from each fileName
              const productName = path.basename(
                productFile,
                path.extname(productFile)
              );
              const filePath = path.join(productDirPath, productFile);
              console.log(filePath);

              // Get random pricing data for the product
              const pricingData = getRandomPricingData();

              //   Create product using the createProduct function
              const response = await createProduct({
                productDirPath: filePath,
                categories: [categoryName],
                subcategories: [subcategoryName],
                cookieValue,
                addProductUrl: productDataloadUrl,
                name: productName,
                description: productName,
                ...pricingData,
              });
              if (response.status === 201) {
                console.log(
                  `Product created successfully: ${productName} in ${subcategoryName}`
                );
              } else {
                console.error(
                  `Failed to create product: ${productName} in ${subcategoryName}`
                );
              }
            } catch (error) {
              console.error("Error creating product:", error);
            }
          }

          console.log("\n\n\n\n");
        }
      }
    }
  } catch (error) {
    console.error("Error reading directory:", error);
  }
};

module.exports = {
  loadAllProductsScript,
};
