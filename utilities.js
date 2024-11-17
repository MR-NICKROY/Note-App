const jwt = require("jsonwebtoken");

function authToken(req, res, next) {
  // Retrieve the authorization header and extract the token
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // If there's no token, respond with a 401 status
  if (!token) {
    return res.sendStatus(401);
  }

  // Verify the token using the secret from the environment
  jwt.verify(token, process.env.TOKEN, (err, decodedToken) => {
    // If there's an error in verification, respond with a 401 status
    if (err) return res.sendStatus(401);

    // Extract the user object from the decoded token if token includes { user: { _id: ... } }
    req.user = decodedToken.user || decodedToken; // Adjust depending on how token is structured

    // Proceed to the next middleware or route handler
    next();
  });
}

module.exports = { authToken };
