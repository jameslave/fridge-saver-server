const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./product_data.json'));
data.forEach(food => console.log(food.name, food.name_subtitle ? `(${food.name_subtitle})` : ''));
