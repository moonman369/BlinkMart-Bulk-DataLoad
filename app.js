const { testBulkEditSubcategory } = require("./playground.js");
const { loadAllProductsScript } = require("./ProductBulkCreateScript.js");
const { editProductCategories } = require("./ProductBulkEditScript.js");
const {
  loadAllSubcategoriesScript,
} = require("./SubcategoryBulkCreateScript.js");
const {
  editAllSubcategoriesScript,
} = require("./SubcategoryBulkEditScript.js");

const main = async () => {
  // loadAllSubcategoriesScript();
  // editAllSubcategoriesScript();
  // testBulkEditSubcategory();
  // loadAllProductsScript();
  editProductCategories();
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
