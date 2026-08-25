module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const JAGOPAY_KEY = 'jp_c49a23ea3d01a837e789c2bdb30b';
  const { action, email } = req.query;

  try {
    if (action === 'create') {
      const response = await fetch(`https://jagopay.my.id/api/qris?api_key=${JAGOPAY_KEY}&amount=1000`);
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (action === 'check') {
      const response = await fetch(`https://jagopay.my.id/api/mutasi?api_key=${JAGOPAY_KEY}`);
      const data = await response.json();
      
      const isPaid = Array.isArray(data.data) && data.data.some(trx => parseInt(trx.amount) === 1000);

      if (isPaid && email) {
        await fetch(`https://api.kyzznekoo.my.id/api/alightmotion/v3/magic-link?email=${encodeURIComponent(email)}`);
        return res.status(200).json({ status: true, paid: true });
      }

      return res.status(200).json({ status: true, paid: false });
    }

    return res.status(400).json({ status: false, message: 'Action tidak valid' });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
