// client/js/checkout.js

import { authedFetch } from './api.js';

// 1) Initialize Stripe
const stripe = Stripe(
  document.querySelector('meta[name="stripe-publishable-key"]').content
);

async function setupPayment() {
  // 2) Pull stored order from localStorage
  const rawItems  = localStorage.getItem('pendingOrderItems');
  const rawAmount = localStorage.getItem('cartTotalPaisa');
  const items     = rawItems  ? JSON.parse(rawItems)  : [];
  const amount    = rawAmount ? Number(rawAmount)     : 0;

  // 2a) Display the total (if you add an element with id="checkout-total")
  const totalEl = document.getElementById('checkout-total');
  if (totalEl) {
    totalEl.textContent = `NPR ${(amount / 100).toFixed(2)}`;
  }

  try {
    // 3) Create PaymentIntent (and underlying Order) on your server
    const resp = await authedFetch('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency: 'npr', items })
    });
    if (!resp.ok) {
      const { error } = await resp.json();
      throw new Error(error || 'Unknown error');
    }
    const { clientSecret } = await resp.json();

    // 4) Mount Stripe’s Payment Element
    const elements = stripe.elements({
      clientSecret,
      appearance: {
        theme: 'flat',
        variables: {
          colorPrimary:   '#0d6efd',
          colorBackground:'#ffffff',
          colorText:      '#212529',
          fontFamily:     'Segoe UI, sans-serif'
        },
        rules: {
          '.Label': { fontWeight: '600' }
        }
      }
    });
    elements.create('payment').mount('#payment-element');

    // 5) Handle the form submit
    document
      .getElementById('payment-form')
      .addEventListener('submit', async e => {
        e.preventDefault();
        document.getElementById('submit').disabled = true;

        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/success.html'
          }
        });

        if (error) {
          document.getElementById('error-message').textContent = error.message;
          document.getElementById('submit').disabled = false;
        }
      });

  } catch (err) {
    document.getElementById('error-message').textContent =
      'Error setting up payment: ' + err.message;
    console.error('⚠️ checkout setup failed:', err);
  }
}

// run on load
setupPayment();
