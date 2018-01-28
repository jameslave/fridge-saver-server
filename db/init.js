const config = require('../config');
const sql = require('mysql2/promise');

let connection;

const createUserTable = `
  CREATE TABLE IF NOT EXISTS user (
    user_id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(255) DEFAULT NULL,
    password varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    google_id varchar(255) DEFAULT NULL,
    facebook_id varchar(255) DEFAULT NULL,
    created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
  ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1
`;

const createFoodTable = `
  CREATE TABLE IF NOT EXISTS food (
    food_id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    icon varchar(255) NOT NULL,
    good_duration_min int(11) unsigned NOT NULL,
    good_duration_max int(11) unsigned NOT NULL,
    PRIMARY KEY (food_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=latin1
`;

const createUserFoodTable = `
  CREATE TABLE IF NOT EXISTS user_food (
    user_food_id int(11) NOT NULL AUTO_INCREMENT,
    user_id int(11) NOT NULL,
    start_date int(10) unsigned NOT NULL,
    expiration_date int(10) unsigned,
    food_id int(10) unsigned NOT NULL,
    PRIMARY KEY (user_food_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=latin1
`;

sql.createConnection(config.DB_OPTIONS)
  .then((conn) => {
    connection = conn;
    return connection.execute(createUserTable);
  })
  .then(() => connection.execute(createFoodTable))
  .then(() => connection.execute(createUserFoodTable));
