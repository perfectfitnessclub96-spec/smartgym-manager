const mongoose = require('mongoose');
require('dotenv').config();

const Member = require('../src/models/Member').default;
const Membership = require('../src/models/Membership').default;
const MembershipPlan = require('../src/models/MembershipPlan').default;
const RenewalRequest = require('../src/models/RenewalRequest').default;

async function createRenewalRequest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const plans = await MembershipPlan.find();
    if (plans.length === 0) {
      console.log('No plans found. Run: npm run seed');
      process.exit(1);
    }
    console.log('Available plans:');
    plans.forEach(p => console.log('  - ' + p.name + ': ₹' + p.price));

    const member = await Member.findOne({ loginId: 'PFC-TEST01' });
    if (!member) {
      console.log('No member found with loginId: PFC-TEST01');
      process.exit(1);
    }
    console.log('\nFound member:', member.name);

    const membership = await Membership.findOne({ memberId: member._id, status: 'ACTIVE' });
    if (!membership) {
      console.log('No active membership found for member');
      process.exit(1);
    }
    console.log('Current membership expires:', membership.expiryDate);

    const selectedPlan = plans[0];
    console.log('\nSelected plan:', selectedPlan.name, '₹' + selectedPlan.price);

    const deleted = await RenewalRequest.deleteMany({ memberId: member._id, status: 'PENDING' });
    console.log('Deleted', deleted.deletedCount, 'existing pending requests');

    const renewalRequest = await RenewalRequest.create({
      memberId: member._id,
      membershipId: membership._id,
      requestedPlanId: selectedPlan._id,
      requestedDate: new Date(),
      status: 'PENDING'
    });

    console.log('\n Renewal request created successfully!');
    console.log('   Request ID:', renewalRequest._id);
    console.log('   Member:', member.name);
    console.log('   Requested Plan:', selectedPlan.name);
    console.log('   Price: ₹' + selectedPlan.price);
    console.log('   Status: PENDING');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createRenewalRequest();