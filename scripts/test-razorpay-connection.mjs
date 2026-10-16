import fs from 'fs';
import Razorpay from 'razorpay';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = val;
  }
});

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

console.log('Testing Razorpay Client with Key ID:', key_id);

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

async function run() {
  try {
    const order = await razorpay.orders.create({
      amount: 100, // 1 INR (100 paise)
      currency: 'INR',
      receipt: 'test_receipt_001',
      notes: { test: 'connection_test' },
    });
    console.log('SUCCESS: Razorpay Order created successfully! Order ID:', order.id);
  } catch (err) {
    console.error('ERROR creating Razorpay order:', err.error || err);
  }
}

run();
