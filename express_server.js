const {getUserByEmail} = require('./helpers')
const express = require("express");
const bodyParser = require("body-parser");
let cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
app.use(
  cookieSession({
    name: "session",
    keys: ["aj345", "dfh345"],
    // Cookie Options
    //maxAge: 24 * 60 * 60 * 1000 expire 24 hours
  })
);

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

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

const urlsForUser = function (id) {
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

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  if (user_id) {
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).send("please input valid email and password");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send(`the  ${email} is already registerd`);
  }
  const id = generateRandomString(12);
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword,
  };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
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

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("please input valid email and password");
  }
  if (!getUserByEmail(email, users)) {
    return res.status(403).send("sorry the email does not match");
  }
  const user = getUserByEmail(email, users);
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("sorry the password  does not match");
  }
  req.session.user_id = user.id;
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  const value = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id].longURL = value;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  if (!urlDatabase[id]) {
   
    res.send("<html><body>please input a valid short URL</body></html>\n");
    return;
  }
  if (!user_id) {
    res.send("<html><body>Sorry, please login first</body></html>\n");
    return;
  }
  if (urlDatabase[id].userID !== user_id) {
    res.send(
      "<html><body>Sorry, you are not allowed to get this URL</body></html>\n"
    );
    return;
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.send(
      "<html><body>sorry the shortened URL you trying to acces, does not exist  </body></html>\n"
    );
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user_id) {
    res.send(
      "<html><body>Sorry you cannot shorten URL. splease login first</body></html>\n"
    );
    return;
  }
  const id = generateRandomString(6);
  const value = req.body.longURL;
  urlDatabase[id] = {};
  urlDatabase[id].longURL = value;
  urlDatabase[id].userID = user_id;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  if (!user_id) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user_id) {
    res.send("<html><body><h3>Sorry, please login first</h3></body></html>\n");
    return;
  }
  if (!urlDatabase[req.params.id]) {
    console.log("please input a valid short URL");
    res.send("<html><body><h3>please input a valid short URL</h3></body></html>\n");
    return;
  }
  
  const id = req.params.id;
  if (urlDatabase[id].userID !== user_id) {
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

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (!user_id) {
    res.send("<html><body>Sorry, please login first</body></html>\n");
    return;
  }
  const userUrls = urlsForUser(user_id);
  const templateVars = {
    urls: userUrls,
    user: user,
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
