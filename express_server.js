const {getUserByEmail, generateRandomString, urlsForUser} = require('./helpers');
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["aj345", "dfh345"],
    // Cookie Options
    //maxAge: 24 * 60 * 60 * 1000 expire 24 hours
  })
);

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};
const pleaseLoginFirst = function() {
  return"<html><body><h3>Sorry, please login first</h3></body></html>\n";
};



const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user2RandomID",
  },
};

app.get("/login", (req, res) => { // getting login page
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  if (user_id) {  // chicking if user logedin or not 
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

app.post("/register", (req, res) => { // submiting registering info
  const email = req.body.email;
  const password = req.body.password;
 
  if (!email || !password) { // checking if email and password is valid or not
    return res.status(400).send("please input valid email and password");
  }
  if (getUserByEmail(email, users)) { //checking if the email is registered or not
    return res.status(400).send(`the  ${email} is already registerd`);
  }
  const salt = bcrypt.genSaltSync(11);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const id = generateRandomString(12);
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword,
  };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/register", (req, res) => { // geting registerin page
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  if (user_id) {
    return res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

app.post("/logout", (req, res) => { // sign out
  req.session = null;
  res.redirect("/login");
});

app.post("/login", (req, res) => {  // sign in
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {   // checking if email and password is valid or not
    return res.status(400).send("please input valid email and password");
  }
  if (!getUserByEmail(email, users)) { //checking if the email is registered or not
    return res.status(403).send("sorry the email does not match");
  }
  const user = getUserByEmail(email, users);
  if (!bcrypt.compareSync(password, user.password)) { // checking if password entered is right
    return res.status(403).send("sorry the password  does not match");
  }
  req.session.user_id = user.id;
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => { // editing urls
  const value = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id].longURL = value;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => { // deleting urls
  const id = req.params.id;
  const user_id = req.session.user_id;
  if (!urlDatabase[id]) { // checking if shorturls is valid or not
   
    res.send("<html><body>please input a valid short URL</body></html>\n");
    return;
  }
  if (!user_id) { // chicking if user logedin or not 
    res.send(pleaseLoginFirst());
    return;
  }
  if (urlDatabase[id].userID !== user_id) { // checking if the user is accesing his data or not
    res.send(
      "<html><body>Sorry, you are not allowed to get this URL</body></html>\n"
    );
    return;
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});
app.get("/urls/:id/delete", (req, res) => { // deleting urls
  const id = req.params.id;
  const user_id = req.session.user_id;
  if (!urlDatabase[id]) { // checking if shorturls is valid or not
   
    res.send("<html><body>please input a valid short URL</body></html>\n");
    return;
  }
  console.log(user_id);
  if (!user_id) { // chicking if user logedin or not 
    res.send(pleaseLoginFirst());
    return;
  }
  if (urlDatabase[id].userID !== user_id) { // checking if the user is accesing his data or not
    res.send(
      "<html><body>Sorry, you are not allowed to get this URL</body></html>\n"
    );
    return;
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => { // acceing url website
  const shortURL = urlDatabase[req.params.id];
  if (!shortURL) { //checking if the shortURL exist or not
    res.send(
      "<html><body>sorry the shortened URL you trying to acces, does not exist  </body></html>\n"
    );
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } 
});

app.post("/urls", (req, res) => { // accesind certain data by shortURL
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user) {   // chicking if user logedin or not 
    res.send(pleaseLoginFirst());
    return;
  }
  const id = generateRandomString(6);
  const value = req.body.longURL;
  urlDatabase[id] = {};
  urlDatabase[id].longURL = value;
  urlDatabase[id].userID = user_id;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => { // adding new data
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  if (!user_id) {  // chicking if user logedin or not 
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { // accesing certain data by shortURL
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user_id) {     // chicking if user logedin or not 
    res.send(pleaseLoginFirst());
    return;
  }
  if (!urlDatabase[req.params.id]) { // checking if short url is exist or not
    res.send("<html><body><h3>please input a valid short URL</h3></body></html>\n");
    return;
  }
  
  const id = req.params.id;
  if (urlDatabase[id].userID !== user_id) { // checking if the user is allow to get this data
    res.send(
      "<html><body><h3>Sorry, you are not allowed to get this URL</h3></body></html>\n"
    );
    return;
  }
  const templateVars = {
    user: user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => { // shwoing user data
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user_id) {  // chicking if user logedin or not 
    res.send(pleaseLoginFirst());
    return;
  }
  const userUrls = urlsForUser(user_id, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: user,
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => { // redirecting to user data
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user_id) {  // chicking if user logedin or not 
    res.redirect("/login");
  }else {
    res.redirect(`/urls`);
  }
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
