import React from 'react';
import ReactDOM from 'react-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

import DashboardLayout from '../components/DashboardLayout';
import { STRIPE_PUBLIC_KEY } from '../utils/const';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { error, paymentMethod } = await stripe!.createPaymentMethod({
      type: 'card',
      card: elements!.getElement(CardElement)!,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

function PurchaseSubscription(props: AuthenticatedComponentProps) {
  return <DashboardLayout {...props} >
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  </DashboardLayout>
}

export default PurchaseSubscription;
