const express = require("express");
const bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

//7
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

const getUserByEmail = function (email) {
  for (user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};
const getUserByPassword = function (password) {
  for (user in users) {
    if (users[user].password === password) {
      return users[user];
    }
  }
  return null;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  if (user_id) {
   return res.redirect("/urls");
  }
  res.render("urls_login",templateVars);
});
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("please input valid email and password");
  }
  if (getUserByEmail(email)) {
    return res.status(400).send(`the  ${email} is already registerd`);
  }
  const id = generateRandomString(12);
  users[id] = {
    id: id,
    email: email,
    password: password,
  };
  res.cookie("user_id", id).redirect("/urls");
});
//14
app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  if (user_id) {
    return res.redirect("/urls");
   }
  res.render("urls_register",templateVars);
});

//13

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  const templateVars = {
    user: undefined,
  };
 // res.render("urls_login",templateVars);
 res.redirect("/login");
});
// 12

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("please input valid email and password");
  }
  if (!getUserByEmail(email)) {
    return res.status(403).send("sorry the email does not match");
  }
  if (!getUserByPassword(password)) {
    return res.status(403).send("sorry the password  does not match");
  }

  const id = getUserByEmail(email).id;
  users[id] = {
    id: id,
    email: email,
    password: password,
  };
 
  

 
  res
    .cookie("user_id", id)

    .redirect(`/urls`);
});

// 11

app.post("/urls/:id/edit", (req, res) => {
  const value = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id] = value;
  res.redirect(`/urls`);
});

// 10
app.post("/urls/:id/delete", (req, res) => {
  const value = req.params.id;
  delete urlDatabase[value];
  res.redirect("/urls");
});
// 9
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if(!longURL) {
    return res.send("<html><body>sorry the shortened URL you trying to acces, does not exist  </body></html>\n");
  }
  console.log(req.params);

  res.redirect(longURL);
});
//8
app.post("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  console.log(user_id,"eee")
  if (!user_id) {
    return res.send("<html><body>Sorry you cannot shorten URL. splease login first</body></html>\n");
   }
  const id = generateRandomString(6);
  const value = req.body.longURL;
  urlDatabase[id] = value;
  res.redirect(`/urls/${id}`);
});

//6
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    user: user,
  };
 // console.log(user_id,"eee")
  if (!user_id) {
    return res.redirect("/login");
   }
  
  res.render("urls_new", templateVars);
});

//5

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    console.log("please input a valid short URL");
    res.send("please input a valid short URL");
    return;
  }
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    user: user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});
//4
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const user = users[user_id];
  const templateVars = {
    urls: urlDatabase,
    user: user,
  };
  
  res.render("urls_index", templateVars);
});

//3
app.get("/", (req, res) => {
  res.send("Hello!");
});
//2
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//1
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
