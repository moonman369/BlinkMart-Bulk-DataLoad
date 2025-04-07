const { default: axios } = require("axios");
const fs = require("fs");
const { login, editSubcategoryByName } = require("./utils");
const path = require("path");
const mime = require("mime-types");
const FormData = require("form-data");
const { response } = require("express");
require("dotenv").config();

const subcategoryDirectoryPath = process.env["SUBCATEGORIES_PATH"];
const baseUrl = process.env["SERVER_BASE_URL"];
const editSubcategoryEndpoint = process.env["EDIT_SUBCATEGORY_ENDPOINT"];
const loginEndpoint = process.env["LOGIN_ENDPOINT"];
const email = process.env["ADMIN_EMAIL"];
const password = process.env["ADMIN_PASSWORD"];

const loginUrl = baseUrl + loginEndpoint;
const editSubcategoryUrl = baseUrl + editSubcategoryEndpoint;

const testBulkEditSubcategory = async () => {
  const originalName = "Hot Chocolate";
  const filePath =
    "E:\\Git\\Misc\\sub category\\Tea, Coffee & Health Drink\\Hot Chocolate.webp";
  const imageFileStream = fs.createReadStream(filePath);
  console.log(loginUrl, email, password);
  const cookieValue = await login(loginUrl, email, password);

  const formData = new FormData();
  formData.append("originalName", originalName);
  formData.append("image", imageFileStream, {
    filename: path.basename(filePath),
    contentType: mime.lookup(filePath),
    knownLength: fs.statSync(filePath).size,
  });
  console.log(`Request body:\n`, formData);

  const response = await axios.put(editSubcategoryUrl, formData, {
    headers: {
      Cookie: cookieValue,
    },
  });
  console.log(`Response:\n`, response.data);
  if (response.status !== 200) {
    console.error(`Error:\n`, response.data);
    throw new Error(response.data.data);
  }
};

const runTest = async () => {
  try {
    const cookieValue = await login(loginUrl, email, password);
    const response = await editSubcategoryByName({
      filePath:
        "E:\\Git\\Misc\\sub category\\Tea, Coffee & Health Drink\\Hot Chocolate.webp",
      originalName: "Hot Chocolate",
      cookieValue,
      editSubcategoryUrl,
    });
    console.log(response);
  } catch (error) {
    console.error("Error during test execution:", error);
  }
};

module.exports = {
  testBulkEditSubcategory,
};
