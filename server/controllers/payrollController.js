// server/controllers/payrollController.js
import { fn, col, literal } from 'sequelize';
import { Shift, User }     from '../models/index.js';

export async function getPayroll(req, res) {
  // e.g. month=2025-07
  const month = req.query.month;
  const rows = await Shift.findAll({
    attributes: [
      'userId',
      [ fn('SUM',
          literal(`TIME_TO_SEC(TIMEDIFF(endTime,startTime))/3600 * \`User\`.\`wageRate\``)
        ), 'payAmount' ]
    ],
    include: [{ model: User, attributes: ['wageRate','name'] }],
    where: {
      date: { [Op.startsWith]: month }  // MySQL: date LIKE '2025-07%'
    },
    group: ['userId']
  });
  res.json(rows.map(r=>r.get()));
}
