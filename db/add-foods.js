const config = require('../config');
const fs = require('fs');
const sql = require('mysql2/promise');

const foodData = JSON.parse(fs.readFileSync('./product_data.json'));
let connection;

function convertRangeStrToSeconds(rangeStr) {
  if (!rangeStr) {
    return ['NULL', 'NULL'];
  } else if (rangeStr === 'Indefinitely') {
    return [-1, -1];
  } else if (rangeStr === 'Not Recommended') {
    return [-2, -2];
  } else if (rangeStr === 'Package use-by date') {
    return ['NULL', 'NULL'];
  }
  const SECONDS_IN_HOUR = 3600;
  const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;
  const SECONDS_IN_WEEK = SECONDS_IN_DAY * 7;
  const SECONDS_IN_MONTH = (SECONDS_IN_WEEK * 52) / 12;
  const SECONDS_IN_YEAR = SECONDS_IN_DAY * 365;
  const matches = rangeStr.match(/^(\d+)-?(\d*)\s(\w+)/);
  const unit = matches[3];
  let conversionFactor;
  switch (unit) {
    case 'Hours':
      conversionFactor = SECONDS_IN_HOUR;
      break;
    case 'Days':
      conversionFactor = SECONDS_IN_DAY;
      break;
    case 'Weeks':
      conversionFactor = SECONDS_IN_WEEK;
      break;
    case 'Months':
      conversionFactor = SECONDS_IN_MONTH;
      break;
    case 'Year':
    case 'Years':
      conversionFactor = SECONDS_IN_YEAR;
      break;
    default:
      break;
  }
  const convertedRangeArray = [
    matches[1] * conversionFactor,
    matches[2] * conversionFactor || matches[1] * conversionFactor,
  ];
  return convertedRangeArray;
}

function insertFood(food) {
  return new Promise(async (resolve) => {
    const category = `\'${food.category_name_display_only}\'`;
    const subcategory = food.subcategory_name_display_only ? `\'${food.subcategory_name_display_only}\'` : 'NULL';
    const name = `\'${food.name}\'`;
    const subtitle = food.name_subtitle ? `\'${food.name_subtitle}\'` : 'NULL';
    const [pantry_open_min, pantry_open_max] = convertRangeStrToSeconds(food.pantry_after_opening_output_display_only);
    const [pantry_new_min, pantry_new_max] = convertRangeStrToSeconds(food.from_date_of_purchase_pantry_output_display_only);
    const [fridge_open_min, fridge_open_max] = convertRangeStrToSeconds(food.refrigerate_after_opening_output_display_only);
    const [fridge_new_min, fridge_new_max] = convertRangeStrToSeconds(food.from_date_of_purchase_refrigerate_output_display_only);
    const [freeze_min, freeze_max] = convertRangeStrToSeconds(food.from_date_of_purchase_freeze_output_display_only);

    const query = `INSERT INTO food (
      \`category\`,
      \`subcategory\`,
      \`name\`,
      \`subtitle\`,
      \`pantry_open_min\`,
      \`pantry_open_max\`,
      \`pantry_new_min\`,
      \`pantry_new_max\`,
      \`fridge_open_min\`,
      \`fridge_open_max\`,
      \`fridge_new_min\`,
      \`fridge_new_max\`,
      \`freeze_min\`,
      \`freeze_max\`
    ) VALUES (
      ${category},
      ${subcategory},
      ${name},
      ${subtitle},
      ${pantry_open_min},
      ${pantry_open_max},
      ${pantry_new_min},
      ${pantry_new_max},
      ${fridge_open_min},
      ${fridge_open_max},
      ${fridge_new_min},
      ${fridge_new_max},
      ${freeze_min},
      ${freeze_max}
    );`;

    console.log(query);
    await connection.execute(query);
    resolve();
  });
}

(async function main() {
  connection = await sql.createConnection(config.DB_OPTIONS);
  for (const food of foodData) {
    await insertFood(food);
  }
  connection.close();
}());
