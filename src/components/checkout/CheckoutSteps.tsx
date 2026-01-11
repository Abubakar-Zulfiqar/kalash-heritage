interface CheckoutStepsProps {
  currentStep: "shipping" | "review" | "payment";
}

const steps = [
  { id: "shipping", name: "Shipping" },
  { id: "review", name: "Review" },
  { id: "payment", name: "Payment" },
];

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav className="flex justify-center">
      <ol className="flex items-center space-x-4 md:space-x-8">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = step.id === currentStep;

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    isComplete
                      ? "bg-green-600 text-white"
                      : isCurrent
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isComplete ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? "text-primary-600" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`hidden md:block w-12 h-0.5 ml-4 ${
                    isComplete ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
