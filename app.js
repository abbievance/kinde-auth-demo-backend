require("dotenv").config();
const express = require("express");
const {
  setupKinde,
  protectRoute,
  getUser,
  GrantType,
} = require("@kinde-oss/kinde-node-express");
const {jwtVerify} = require("@kinde-oss/kinde-node-express");

const verifier = jwtVerify(process.env.KINDE_ISSUER_URL, "http://localhost:4000");
const app = express();
const port = 4000;
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});


app.use(express.static("public"));
const config = {
  grantType: GrantType.AUTHORIZATION_CODE,
  clientId: process.env.KINDE_CLIENT_ID,
  issuerBaseUrl: process.env.KINDE_ISSUER_URL,
  siteUrl: process.env.KINDE_SITE_URL,
  secret: process.env.KINDE_CLIENT_SECRET,
  redirectUrl: process.env.KINDE_REDIRECT_URL,
  unAuthorisedUrl: process.env.KINDE_SITE_URL,
  postLogoutRedirectUrl: process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
};

app.set("view engine", "pug");
const client = setupKinde(config, app);

app.get("/", async (req, res) => {
  if (await client.isAuthenticated(req)) {
    res.redirect("/admin");
  } else {
    res.render("index", {
      title: "Hey",
      message: "Hello there! what would you like to do?",
    });
  }
});

app.get("/admin", protectRoute, getUser, (req, res) => {
  res.render("admin", {
    title: "Admin",
    user: req.user,
  });
});

const log = (req, res, next) =>{
  console.log(req)
  next();
}


app.get("/protected", verifier, (req, res) => {
  console.log(req.user)
  res.send("yay :)")
});

app.get("/unprotected", getUser, (req, res) => {
  console.log(req.user)
  res.send()
});

app.listen(port, function () {
  console.log(`Kinde Express Starter Kit listening on port ${port}!`);
});

app.get('/users', async (req, res) => {
  const data = await fetch(`https://testsitefortesting.kinde.com/oauth2/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      audience: process.env.API_AUDIENCE,
      grant_type: process.env.API_GRANT_TYPE,
      client_id: process.env.API_KINDE_CLIENT_ID ,
      client_secret: process.env.API_KINDE_CLIENT_SECRET ,
    })
  })
  const token = await data.json()
  console.log(token.access_token)
  res.send('yay');
  const headers = {
    'Accept':'application/json',
    'Authorization':`Bearer ${token.access_token}`
  };
  
  fetch('https://testsitefortesting.kinde.com/api/v1/users',
  {
    method: 'GET',
  
    headers: headers
  })
  .then(function(res) {
      return res.json();
  }).then(function(body) {
      console.log(body);
  });
})
