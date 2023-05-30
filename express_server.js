const express = require("express");
let cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
const generateRandomString = function() {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.post("/urls/:id/edit", (req, res) => {
  const value = req.body.longURL;
  const id = req.params.id;
  console.log("id", id);
  console.log(req.body);

  urlDatabase[id] = value;
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const value = req.body.username;

  console.log(req.body);
  res
    .cookie("username", value)

    .redirect(`/urls`);
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");

  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const value = req.body.longURL;

  console.log(req.body);

  urlDatabase[id] = value;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const value = req.params.id;

  delete urlDatabase[value];

  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
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

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };

  res.render("urls_new", templateVars);
});
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    console.log("please input a valid short URL");
    res.send("please input a valid short URL");

    return;
  }
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
