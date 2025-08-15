const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, code: 401, message: "Unauthorised activity" });
  }

  try {
    const verification = jwt.verify(token, process.env.SECRET_KEY);

    req.user = verification;

    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: true, code: 401, message: "Unauthorised activity" });
    console.log(err);
  }
}

module.exports = auth;

