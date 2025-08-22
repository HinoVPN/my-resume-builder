import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

const getSteps = (t: any) => [
  { path: '/', labelKey: 'steps.personalInfo', step: 1 },
  { path: '/summary', labelKey: 'steps.summary', step: 2 },
  { path: '/experience', labelKey: 'steps.experience', step: 3 },
  { path: '/education', labelKey: 'steps.education', step: 4 },
  { path: '/skills', labelKey: 'steps.skills', step: 5 },
  { path: '/optional', labelKey: 'steps.optional', step: 6 },
  { path: '/preview', labelKey: 'steps.preview', step: 7 }
];

const StepIndicator: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const steps = getSteps(t);
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
                {t(step.labelKey)}
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
