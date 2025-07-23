// server/controllers/feedbackController.js
import Feedback from '../models/Feedback.js';
import Loyalty  from '../models/Loyalty.js';

export async function leaveFeedback(req, res) {
  try {
    const { guestCode, rating, comment } = req.body;
    if (!guestCode) return res.status(400).json({ error:'Missing guestCode' });
    if (!rating || rating<1||rating>5)
      return res.status(400).json({ error:'Rating must be 1–5' });

    await Feedback.create({ guestCode, rating, comment: comment||null });

    // award 5 points
    const [record, created] = await Loyalty.findOrCreate({
      where: { guestCode },
      defaults: { points: 5 }
    });
    if (!created) {
      record.points += 5;
      await record.save();
    }

    return res.json({
      success: true,
      pointsAwarded: 5,
      totalPoints: record.points
    });
  } catch (err) {
    console.error('❌ leaveFeedback error:', err);
    return res.status(500).json({ error:'Server error saving feedback' });
  }
}
