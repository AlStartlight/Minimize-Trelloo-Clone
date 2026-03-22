import LandingWrapper from '@/components/landing/layout/LandingWrapper';
import PricingHero from '@/components/landing/sections/PricingHero';
import PricingCard from '@/components/landing/cards/PricingCard';
import FeatureComparison from '@/components/landing/sections/FeatureComparison';
import PricingFAQ from '@/components/landing/sections/PricingFAQ';

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "Free",
      description: "Perfect for individuals and small teams getting started",
      features: [
        "Unlimited boards",
        "Unlimited cards",
        "Unlimited lists",
        "10MB file attachments",
        "Basic integrations"
      ],
      buttonText: "Get Started Free"
    },
    {
      name: "Standard",
      price: "$5",
      description: "For growing teams that need more features",
      features: [
        "Everything in Free",
        "Unlimited file attachments",
        "Custom backgrounds",
        "Stickers",
        "Advanced checklists",
        "Board collections"
      ],
      popular: true,
      buttonText: "Start Free Trial"
    },
    {
      name: "Premium",
      price: "$10",
      description: "For teams that need advanced features",
      features: [
        "Everything in Standard",
        "Custom fields",
        "Priority support",
        "Admin & security features",
        "Unlimited automations",
        "Board & organization insights"
      ],
      buttonText: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with specific needs",
      features: [
        "Everything in Premium",
        "Dedicated account manager",
        "Custom integrations",
        "SSO & SAML",
        "Advanced security",
        "24/7 support"
      ],
      buttonText: "Contact Sales"
    }
  ];

  return (
    <LandingWrapper>
      <PricingHero />
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          </div>
        </div>
      </section>
      <FeatureComparison />
      <PricingFAQ />
    </LandingWrapper>
  );
}