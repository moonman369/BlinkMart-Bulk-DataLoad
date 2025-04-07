const { default: axios } = require("axios");
const path = require("path");
const mime = require("mime-types");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

const getCookieValue = (response) => {
  const { access, refresh } = response.data.tokens;
  return `accessToken=${access};refreshToken=${refresh}`;
};

const login = async (url, email, password) => {
  console.log(url, email, password);
  const response = await axios.post(url, {
    email: email,
    password: password,
  });
  if (response.status !== 200) {
    throw new Error(response.data.data);
  }
  console.log("Login Successful:\n", response.data);
  return getCookieValue(response);
};

const createSubcategory = async ({
  filePath,
  name,
  categories,
  cookieValue,
  addSubcategoryUrl,
}) => {
  const imageFileStream = fs.createReadStream(filePath);
  const formData = new FormData();
  formData.append("name", originalName);
  formData.append("categories", JSON.stringify(categories));
  formData.append("image", imageFileStream, {
    filename: path.basename(filePath),
    contentType: mime.lookup(filePath),
    knownLength: fs.statSync(filePath).size,
  });

  const response = await axios.post(addSubcategoryUrl, formData, {
    headers: {
      Cookie: cookieValue,
    },
  });
  return response;
};

const editSubcategoryByName = async ({
  filePath,
  originalName,
  cookieValue,
  editSubcategoryUrl,
}) => {
  const imageFileStream = fs.createReadStream(filePath);

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
  return response;
};

const createProduct = async ({
  productDirPath,
  cookieValue,
  addProductUrl,
  name,
  categories,
  subcategories,
  unit,
  stock,
  price,
  discount,
  description,
}) => {
  const imageFiles = fs.readdirSync(productDirPath);
  const formData = new FormData();
  formData.append("name", name);
  formData.append("categories", JSON.stringify(categories));
  formData.append("subcategories", JSON.stringify(subcategories));
  for (let image of imageFiles) {
    const productFilePath = path.join(productDirPath, image);
    const imageFileStream = fs.createReadStream(productFilePath);
    formData.append("images", imageFileStream, {
      filename: path.basename(productFilePath),
      contentType: mime.lookup(productFilePath),
      knownLength: fs.statSync(productFilePath).size,
    });
  }
  formData.append("unit", unit);
  formData.append("stock", stock);
  formData.append("price", price);
  formData.append("discount", discount);
  formData.append("description", description);

  const response = await axios.post(addProductUrl, formData, {
    headers: {
      Cookie: cookieValue,
    },
  });
  return response;
};

const editProductCategory = async ({
  cookieValue,
  editProductUrl,
  name,
  categories,
}) => {
  const response = await axios.put(
    editProductUrl,
    {
      name: name,
      categories: categories,
    },
    {
      headers: {
        Cookie: cookieValue,
      },
    }
  );
  return response;
};

const getRandomPricingData = () => {
  const price = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;
  const discount = Math.floor(Math.random() * 15) + 1;
  const stock = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
  const unitChoices = ["50g", "100g", "250g", "500g", "750g", "1000g"];
  const unit = unitChoices[Math.floor(Math.random() * unitChoices.length)];
  return { price, discount, stock, unit };
};

module.exports = {
  getCookieValue,
  login,
  createSubcategory,
  editSubcategoryByName,
  createProduct,
  editProductCategory,
  getRandomPricingData,
};
