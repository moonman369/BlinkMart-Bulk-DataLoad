require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { categoryNameToIdMap } = require("./constants");
const { json } = require("stream/consumers");
const { default: axios } = require("axios");
const { response } = require("express");
const { getCookieValue, login, createSubcategory } = require("./utils");

const loadAllSubcategoriesScript = async () => {
  const subcategoryDirectoryPath = process.env["SUBCATEGORIES_PATH"];
  const baseUrl = process.env["SERVER_BASE_URL"];
  const addSubcategoryEndpoint = process.env["ADD_SUBCATEGORY_ENDPOINT"];
  const loginEndpoint = process.env["LOGIN_ENDPOINT"];
  const email = process.env["ADMIN_EMAIL"];
  const password = process.env["ADMIN_PASSWORD"];

  if (!subcategoryDirectoryPath) {
    throw new Error("Subcategories base directory path not found in .env");
  }
  if (!baseUrl) {
    throw new Error("Server Base URL not found in .env");
  }
  if (!addSubcategoryEndpoint) {
    throw new Error("Add Subcategory Endpoint not found in .env");
  }
  if (!loginEndpoint) {
    throw new Error("Login Endpoint not found in .env");
  }

  try {
    const subDirs = fs.readdirSync(subcategoryDirectoryPath);
    const loginUrl = baseUrl + loginEndpoint;
    const addSubcategoryUrl = baseUrl + addSubcategoryEndpoint;

    // Getting admin access token
    const cookieValue = await login(loginUrl, email, password);

    for (let subDir of subDirs) {
      // Get all category subdirs
      const subDirPath = path.join(subcategoryDirectoryPath, subDir);
      const stats = fs.statSync(subDirPath);
      // Get categoryId from category name to id map
      const categoryId = categoryNameToIdMap[subDir];
      if (!categoryId) {
        console.error("categoryId not found");
      }
      console.log(
        `Starting Batch:::::: ${subDirPath} : ${categoryId} :`,
        stats.isDirectory()
      );

      if (stats.isDirectory()) {
        // Get all subcategory files from category subDir
        const files = fs.readdirSync(subDirPath);
        for (let file of files) {
          try {
            // Extract subcategory name from each fileName
            const subcategoryName = path.basename(file, path.extname(file));
            const filePath = path.join(subDirPath, file);

            const response = createSubcategory({
              filePath: filePath,
              name: subcategoryName,
              categories: [categoryId],
              cookieValue,
              addSubcategoryUrl,
            });
            console.log(response);
            if (response.status === 201) {
              console.log(
                "Successfully added subcategory!\n",
                response.data.data
              );
            } else {
              console.error(
                `Error while adding subcategory: ${file}::::\n`,
                response.data.data
              );
            }
          } catch (error) {
            console.error(
              `Error while adding subcategory: ${file}::::\n`,
              error
            );
          } finally {
            console.log("\n");
          }
        }
      }
      console.log("\n\n\n\n");
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }
};

module.exports = {
  loadAllSubcategoriesScript,
};
