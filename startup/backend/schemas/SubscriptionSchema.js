const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  planId: { 
    type: String, 
    required: true,
    enum: ['free', 'growth_monthly', 'growth_yearly', 'pro_monthly', 'pro_yearly']
  },
  planName: {
    type: String,
    required: true,
    enum: ['Free', 'Growth', 'Pro']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due'],
    default: 'active'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  stripeSubscriptionId: String,
  stripeCustomerId: String,
  paymentMethodId: String,
  lastPaymentDate: Date,
  nextBillingDate: Date,
  trialEnd: Date,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Add indexes for better performance
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);