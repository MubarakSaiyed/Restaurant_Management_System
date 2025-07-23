// server/middleware/requireGuest.js
export function requireGuest(req, res, next) {
  // try body → query → URL param
  const code = req.body.guestCode 
            || req.query.guestCode 
            || req.params.guestCode;
  if (!code) {
    return res.status(400).json({ error: 'Missing guestCode' });
  }
  req.guestCode = code;
  next();
}
