const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
function generateRandomString() {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const value = req.body.longURL;

  console.log(req.body);
  
  urlDatabase[id] = value;
 
  console.log(urlDatabase)
  res.redirect(`/urls/${id}`)
  //res.render("urls_show", templateVars);
  
});
app.post("/urls/:id/delete" ,(req,res) =>{
  const value = req.params.id;
  //console.log(req.params)
  delete urlDatabase[value];
 //console.log(urlDatabase);
  const templateVars = {urls: urlDatabase}
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    console.log('please input a valid short URL');
    res.send("please input a valid short URL");
   
    return;
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});
app.get("/u/:id", (req, res) => {
   const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
