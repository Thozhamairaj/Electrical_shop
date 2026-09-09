const { predictTrust } = require('../services/trustPipeline');

(async () => {
  try {
    const payload = {
      rating: 4,
      reviewTitle: 'Smoke test',
      reviewText: 'This is a smoke test for trust pipeline integration.',
      productPayload: {
        product: {
          id: 1,
          name: 'Smoke Product',
          category: 'test',
          description: 'Used in CI smoke tests',
          specs: { voltage: '220V' },
        },
      },
    };

    const res = await predictTrust(payload);
    console.log('PREDICT', JSON.stringify(res, null, 2));

    const pred = res && res.trust_level ? res : (res && res.prediction ? res.prediction : res);
    const trustLevel = pred?.trust_level || pred?.trustLevel || pred?.trust_level;
    const trustReason = pred?.trust_reason || pred?.trustReason || pred?.trust_reason;

    if (!trustLevel || !trustReason) {
      console.error('Missing trustLevel or trustReason');
      process.exit(2);
    }

    console.log('Smoke test passed');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
