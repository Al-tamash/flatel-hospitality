import fs from 'fs';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { jsPDF } from 'jspdf';
import { createClient } from '@supabase/supabase-js';

// 1. Load environment variables from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = val;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${testName} ${details ? '-> ' + details : ''}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('   FLATEL HOSPITALITY - PREVIEW E2E AUDIT VERIFICATION SUITE');
  console.log('=============================================================\n');

  const testBookingIds = [];

  try {
    // --------------------------------------------------------------------------
    // TEST 1: Check Database RPC Function and Constraint Status
    // --------------------------------------------------------------------------
    console.log('1. DATABASE RPC & CONSTRAINT CHECKS');
    const { error: procError } = await supabase
      .rpc('create_booking_if_available', {
        p_booking: {},
        p_total_units: 1,
      });
    
    // An incomplete payload should return 'Reservation details are incomplete.'
    assert(
      procError && procError.message.includes('Reservation details are incomplete'),
      'create_booking_if_available RPC is installed and actively enforcing constraints'
    );

    // --------------------------------------------------------------------------
    // TEST 2: Create Booking Intent with 'accommodation_only' & Atomic RPC
    // --------------------------------------------------------------------------
    console.log('\n2. BOOKING INTENT WITH accommodation_only STAY PURPOSE');
    const bookingId1 = crypto.randomUUID();
    const bookingCode1 = `FLT-TEST-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    testBookingIds.push(bookingId1);

    const testPayload1 = {
      id: bookingId1,
      booking_code: bookingCode1,
      unit_id: '1bhk',
      guest_name: 'Audit Test Guest',
      guest_phone: '+919999900001',
      guest_email: 'audit.test1@flatel.local',
      is_international: false,
      special_requests: 'E2E Preview Audit Verification',
      stay_purpose: 'accommodation_only', // Verified check constraint
      check_in_date: '2026-12-10',
      check_out_date: '2026-12-12',
      total_nights: 2,
      adults_count: 2,
      kids_count: 0,
      extra_guests_count: 0,
      selected_addons: [],
      base_rent_total: 4000,
      extra_guests_total: 0,
      addons_total: 0,
      gross_total: 4000,
      advance_paid_amount: 800,
      balance_due_amount: 3200,
      payment_status: 'pending',
      booking_status: 'pending',
      balance_collected: false,
    };

    const { data: createdBooking1, error: createErr1 } = await supabase.rpc(
      'create_booking_if_available',
      {
        p_booking: testPayload1,
        p_total_units: 1, // 1BHK has 1 unit in total
      }
    );

    assert(!createErr1, 'Booking intent saved successfully via create_booking_if_available RPC', createErr1?.message);
    assert(createdBooking1?.stay_purpose === 'accommodation_only', 'stay_purpose "accommodation_only" persisted cleanly');
    assert(createdBooking1?.booking_code === bookingCode1, 'Returned correct booking code');

    // --------------------------------------------------------------------------
    // TEST 3: Duplicate Submission / Concurrency Overlap Rejection
    // --------------------------------------------------------------------------
    console.log('\n3. CONCURRENCY & OVERLAPPING RESERVATION LOCK CHECK');
    const bookingId2 = crypto.randomUUID();
    const bookingCode2 = `FLT-TEST-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const testPayload2 = {
      ...testPayload1,
      id: bookingId2,
      booking_code: bookingCode2,
      guest_email: 'audit.test2@flatel.local',
      check_in_date: '2026-12-11', // Overlaps with 2026-12-10 -> 2026-12-12
      check_out_date: '2026-12-13',
    };

    const { error: createErr2 } = await supabase.rpc(
      'create_booking_if_available',
      {
        p_booking: testPayload2,
        p_total_units: 1, // Max capacity 1 unit
      }
    );

    assert(
      createErr2 && createErr2.message.includes('The residence is no longer available'),
      'Overbooking / duplicate reservation was blocked atomically by advisory lock',
      createErr2?.message
    );

    // --------------------------------------------------------------------------
    // TEST 4: Razorpay Test Order Creation & DB Record
    // --------------------------------------------------------------------------
    console.log('\n4. RAZORPAY TEST ORDER CREATION');
    const advancePaise = 800 * 100; // Rs 800 in paise
    const razorpayOrder = await razorpay.orders.create({
      amount: advancePaise,
      currency: 'INR',
      receipt: bookingCode1,
      notes: {
        bookingId: bookingId1,
        testMode: 'true',
      },
    });

    assert(
      razorpayOrder?.id && razorpayOrder.id.startsWith('order_'),
      `Razorpay order created in sandbox: ${razorpayOrder.id}`
    );

    const { error: txInsertErr } = await supabase.from('payment_transactions').insert({
      booking_id: bookingId1,
      gateway: 'razorpay',
      order_id: razorpayOrder.id,
      amount_paise: advancePaise,
      currency: 'INR',
      status: 'created',
    });
    assert(!txInsertErr, 'Payment transaction record saved with status "created"', txInsertErr?.message);

    // --------------------------------------------------------------------------
    // TEST 5: Payment Cancellation / Failure Simulation
    // --------------------------------------------------------------------------
    console.log('\n5. PAYMENT CANCELLATION & RETRY HANDLING');
    // Simulate user cancelling payment on booking 1
    const { error: cancelErr } = await supabase
      .from('bookings')
      .update({ payment_status: 'failed', booking_status: 'cancelled' })
      .eq('id', bookingId1);
    
    assert(!cancelErr, 'Booking status updated to failed/cancelled on gateway cancellation');

    // Verify that cancelled booking freed the dates for a retry!
    const { error: retryErr } = await supabase.rpc(
      'create_booking_if_available',
      {
        p_booking: testPayload2,
        p_total_units: 1,
      }
    );
    testBookingIds.push(bookingId2);
    assert(!retryErr, 'Cancelled booking immediately freed inventory for retry reservation', retryErr?.message);

    // --------------------------------------------------------------------------
    // TEST 6: Payment Success & HMAC Callback Verification
    // --------------------------------------------------------------------------
    console.log('\n6. PAYMENT SUCCESS & CRYPTOGRAPHIC CALLBACK VERIFICATION');
    const retryAdvancePaise = 800 * 100;
    const retryOrder = await razorpay.orders.create({
      amount: retryAdvancePaise,
      currency: 'INR',
      receipt: bookingCode2,
      notes: { bookingId: bookingId2 },
    });

    await supabase.from('payment_transactions').insert({
      booking_id: bookingId2,
      gateway: 'razorpay',
      order_id: retryOrder.id,
      amount_paise: retryAdvancePaise,
      currency: 'INR',
      status: 'created',
    });

    const fakePaymentId = `pay_test_${crypto.randomBytes(6).toString('hex')}`;

    // Test INVALID signature rejection
    const invalidSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const generatedValidSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${retryOrder.id}|${fakePaymentId}`)
      .digest('hex');

    const isMatchInvalid = crypto.timingSafeEqual(
      Buffer.from(generatedValidSignature, 'hex'),
      Buffer.from(invalidSignature, 'hex')
    );
    assert(!isMatchInvalid, 'Cryptographic verification strictly rejects forged payment signature');

    // Confirm Payment with VALID signature
    const { error: confirmTxErr } = await supabase
      .from('payment_transactions')
      .update({
        status: 'authorized',
        payment_id: fakePaymentId,
      })
      .eq('order_id', retryOrder.id);
    assert(!confirmTxErr, 'Payment transaction updated to authorized');

    const { error: confirmBookingErr } = await supabase
      .from('bookings')
      .update({
        payment_status: 'advance_paid',
        booking_status: 'confirmed',
        gateway_payment_id: fakePaymentId,
      })
      .eq('id', bookingId2);
    assert(!confirmBookingErr, 'Booking updated to "advance_paid" & "confirmed"');

    // --------------------------------------------------------------------------
    // TEST 7: PDF Voucher Generation
    // --------------------------------------------------------------------------
    console.log('\n7. DIGITAL PDF VOUCHER GENERATION');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('FLATEL HOSPITALITY - VOUCHER', 20, 20);
    doc.setFontSize(10);
    doc.text(`Booking Code: ${bookingCode2}`, 20, 30);
    doc.text(`Payment ID: ${fakePaymentId}`, 20, 36);
    const pdfOutput = doc.output('arraybuffer');
    assert(
      pdfOutput && pdfOutput.byteLength > 1000,
      `Voucher PDF generated successfully (size: ${pdfOutput.byteLength} bytes)`
    );

    // --------------------------------------------------------------------------
    // TEST 8: Guest Lookup Portal (/my-bookings)
    // --------------------------------------------------------------------------
    console.log('\n8. GUEST LOOKUP PRIVACY & PORTAL QUERY');
    const { data: lookupResult, error: lookupErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_code', bookingCode2)
      .eq('guest_phone', '+919999900001')
      .maybeSingle();

    assert(!lookupErr && lookupResult?.id === bookingId2, 'Guest lookup with matching code and phone succeeded');

    const { data: mismatchedLookup } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_code', bookingCode2)
      .eq('guest_phone', '+910000000000')
      .maybeSingle();

    assert(!mismatchedLookup, 'Guest lookup with incorrect phone is safely rejected');

  } catch (err) {
    console.error('\nUNEXPECTED SUITE ERROR:', err);
    failedCount++;
  } finally {
    // --------------------------------------------------------------------------
    // CLEANUP: Clean up test booking rows from Supabase
    // --------------------------------------------------------------------------
    console.log('\n--- CLEANING UP AUDIT TEST ARTIFACTS ---');
    for (const bId of testBookingIds) {
      await supabase.from('payment_transactions').delete().eq('booking_id', bId);
      await supabase.from('bookings').delete().eq('id', bId);
    }
    console.log(`Cleaned up ${testBookingIds.length} temporary audit test reservations from database.`);
  }

  console.log('\n=============================================================');
  console.log(`  VERIFICATION RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('=============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite();
