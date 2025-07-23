// server/controllers/loyaltyController.js
import Loyalty from '../models/Loyalty.js';

export async function getLoyalty(req, res) {
  try {
    const guestCode = req.query.guestCode;
    if (!guestCode) return res.status(400).json({ error:'Missing guestCode' });

    const rec = await Loyalty.findOne({ where:{ guestCode }});
    return res.json({ points: rec?.points||0 });
  } catch (err) {
    console.error('❌ getLoyalty error:', err);
    return res.status(500).json({ error:'Could not fetch points' });
  }
}

export async function redeemLoyalty(req, res) {
  try {
    const { guestCode, pointsToRedeem } = req.body;
    if (!guestCode) return res.status(400).json({ error:'Missing guestCode' });
    if (!pointsToRedeem || pointsToRedeem%10!==0)
      return res.status(400).json({ error:'Redeem in multiples of 10' });

    const rec = await Loyalty.findOne({ where:{ guestCode }});
    if (!rec || rec.points < pointsToRedeem)
      return res.status(400).json({ error:'Not enough points' });

    rec.points -= pointsToRedeem;
    await rec.save();
    const discount = (pointsToRedeem/10)*50;
    return res.json({ success:true, discount, remaining: rec.points });
  } catch (err) {
    console.error('❌ redeemLoyalty error:', err);
    return res.status(500).json({ error:'Could not redeem points' });
  }
}
