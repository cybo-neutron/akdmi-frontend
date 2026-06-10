import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for individual creators starting their journey.",
      features: [
        "Up to 5 courses",
        "Free subdomain (yours.aiapp.com)",
        "Basic analytics",
        "Email support",
        "10GB storage",
      ],
    },
    {
      name: "Pro",
      price: "$99",
      description: "Everything you need to scale your academy.",
      features: [
        "Unlimited courses",
        "Custom domain connection",
        "Advanced analytics",
        "Priority support",
        "100GB storage",
        "AI Course Assistant",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Advanced features for large organizations.",
      features: [
        "Multi-tenant catalogs",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "Unlimited storage",
      ],
    },
  ];

  return (
    <div className="py-20 px-4 max-w-6xl mx-auto flex flex-col items-center">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Choose the plan that's right for your business. No hidden fees, cancel
          anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${plan.popular ? "border-primary shadow-xl scale-105 z-10" : "border-border"}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 p-2 transform translate-y-[-50%] translate-x-[-10%]">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 items-start text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto pt-6">
              <Button
                className="w-full h-12 text-lg"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => navigate("/signup")}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="text-muted-foreground">
          All plans include 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
