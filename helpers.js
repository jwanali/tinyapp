const getUserByEmail = function (email,database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

const generateRandomString = function (length) {
  //generate random alphanumeric string
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const urlsForUser = function (id,urlDatabase) {
  const newUrlDatabase = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      newUrlDatabase[urlId] = {};
      newUrlDatabase[urlId].longURL = urlDatabase[urlId].longURL;
      newUrlDatabase[urlId].userID = urlDatabase[urlId].userID;
    }
  }
  return newUrlDatabase;
};



module.exports = {getUserByEmail, generateRandomString,urlsForUser};