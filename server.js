const express = require("express"); // importing a CommonJS module
const helmet = require("helmet");
const morgan = require("morgan");

const hubsRouter = require("./hubs/hubs-router.js");

const server = express();

function greeter(teamName) {
  return (req, res, next) => {
    req.team = teamName;

    next();
  };
}

function moodyGatekeeper(req, res, next) {
  const seconds = new Date().getSeconds();

  if (seconds % 3 === 0) {
    next(new Error("Bad Panda"));
  } else {
    next();
  }
}

// middleware is a function that has access to req res and next
// configure global middleware
server.use(express.json()); // built-in
server.use(helmet()); // 3rd party security for headers. Hides x powered by Express
server.use(morgan("dev")); // 3rd party logger (logs i.e. GET /api/hubs 200 35.336 ms - 470)
server.use(greeter("web XVIII")); // custom middleware with argument
server.use(moodyGatekeeper); // custom middleware without argument, just a function

// configure route handlers/endpoints/request handlers
server.use("/api/hubs", restricted, only("gimli"), hubsRouter);

server.get("/", (req, res) => {
  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome ${req.team} to the Lambda Hubs API</p>
    `);
});

server.use(errorHandler);

// [ m1, em0, m2, m3, em1, m4, m5, em2 ]
// calling next jumps over errorHandlers

function errorHandler(error, req, res, next) {
  res.status(400).send("Bad panda!");
}

function only(name) {
  return (req, res, next) => {
    if (name === req.headers.name) {
      next();
    } else {
      res.status(403).send("You are not gimli");
    }
  };
}

function restricted(req, res, next) {
  const password = req.headers.password;

  if (password === "mellon") {
    next();
  } else {
    res.status(401).send("you shall not pass");
  }
}

module.exports = server;

// we can read data from the body, url params, query string, and the headers

// three types of middleware: built-in, third party, custom
// we can use MW locally or globally

// write middleware that returns a 404 if the clock seconds are a multiple of 3 and continues to the following middleware/router for all other cases
