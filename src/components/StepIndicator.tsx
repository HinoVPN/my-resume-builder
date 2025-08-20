import React from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, Circle } from 'lucide-react';

const steps = [
  { path: '/', label: 'Personal Info', step: 1 },
  { path: '/summary', label: 'Summary', step: 2 },
  { path: '/experience', label: 'Experience', step: 3 },
  { path: '/education', label: 'Education', step: 4 },
  { path: '/skills', label: 'Skills', step: 5 },
  { path: '/optional', label: 'Optional', step: 6 },
  { path: '/preview', label: 'Preview', step: 7 }
];

const StepIndicator: React.FC = () => {
  const location = useLocation();
  const currentStepIndex = steps.findIndex(step => step.path === location.pathname);

  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto">
      {steps.slice(0, -1).map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        
        return (
          <div key={step.path} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isCompleted 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : isCurrent 
                    ? 'border-blue-600 text-blue-600 bg-white' 
                    : 'border-gray-300 text-gray-300 bg-white'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.step}</span>
                )}
              </div>
              <span className={`mt-2 text-xs font-medium ${
                isCurrent ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 2 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                isCompleted ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
