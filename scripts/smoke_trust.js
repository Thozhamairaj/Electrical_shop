async function run() {
  const apiUrl = process.env.API_URL || 'http://localhost:5000';
  try {
    const payload = {
      userId: 'user_39r717XIDYKbgcYVOTHXni8Ijea',
      productId: 1,
      rating: 5,
      reviewTitle: 'Smoke test',
      reviewText: 'This is a smoke test for trust pipeline',
    };

    const res = await fetch(`${apiUrl}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': payload.userId },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Request failed', res.status, data);
      process.exit(2);
    }

    if (!data.review || !data.review.trustReason) {
      console.error('Missing trustReason in response', data);
      process.exit(3);
    }

    console.log('OK: trustReason present');
    console.log('trustLevel:', data.review.trustLevel);
    console.log('trustReason:', data.review.trustReason);
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed', err);
    process.exit(1);
  }
}

run();
