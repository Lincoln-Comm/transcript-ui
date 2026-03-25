'use client';

import { Dropdown, Toggle } from '@/components/ui';
import { TranscriptOptions as TranscriptOptionsType } from '@/types';

interface TranscriptOptionsProps {
  options: TranscriptOptionsType;
  onOptionsChange: (options: TranscriptOptionsType) => void;
  onGenerate: () => void;
  isStudentSelected: boolean;
}

const programOptions = [
  { value: 'DP', label: 'Diploma Programme (DP)' },
  { value: 'MYP', label: 'Middle Years Programme (MYP)' },
];

const schoolYearOptions = [
  { value: '2023/2024', label: '2023 / 2024' },
  { value: '2022/2023', label: '2022 / 2023' },
  { value: '2021/2022', label: '2021 / 2022' },
];

const sessionTypeOptions = [
  { value: 'May Session', label: 'May Session' },
  { value: 'November Session', label: 'November Session' },
];

const transcriptTypeOptions = [
  { value: 'official', label: 'Official Transcript (PDF)' },
  { value: 'unofficial', label: 'Unofficial Transcript (PDF)' },
];

const TranscriptOptions = ({ 
  options, 
  onOptionsChange, 
  onGenerate,
  isStudentSelected 
}: TranscriptOptionsProps) => {
  
  const updateOption = <K extends keyof TranscriptOptionsType>(
    key: K, 
    value: TranscriptOptionsType[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Section Title with Coming Soon Badge */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Transcript Options</h2>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
          
        </span>
      </div>
      
      {/* Options Form - Grayed Out */}
      <div className="space-y-5 relative">
        {/* Overlay to disable interactions */}
        <div className="absolute inset-0 bg-white/60 z-10 cursor-not-allowed rounded-lg" />
        
        {/* Program */}
        <div className="opacity-50">
          <Dropdown
            label="Program"
            options={programOptions}
            value={options.program}
            onChange={(value) => updateOption('program', value as 'DP' | 'MYP')}
            placeholder="Select program..."
          />
        </div>

        {/* School Year and Session Type - Side by Side */}
        <div className="grid grid-cols-2 gap-4 opacity-50">
          <Dropdown
            label="School Year"
            options={schoolYearOptions}
            value={options.schoolYear}
            onChange={(value) => updateOption('schoolYear', value)}
            placeholder="Select year..."
          />
          
          <Dropdown
            label="Session Type"
            options={sessionTypeOptions}
            value={options.sessionType}
            onChange={(value) => updateOption('sessionType', value as 'May Session' | 'November Session')}
            placeholder="Select session..."
          />
        </div>

        {/* Transcript Type */}
        <div className="opacity-50">
          <Dropdown
            label="Transcript Type"
            options={transcriptTypeOptions}
            value={options.transcriptType}
            onChange={(value) => updateOption('transcriptType', value as 'official' | 'unofficial')}
            placeholder="Select type..."
          />
        </div>

        {/* Include Predicted Grades Toggle */}
        <div className="pt-2 opacity-50">
          <Toggle
            label="Include Predicted Grades"
            checked={options.includePredictedGrades}
            onChange={(checked) => updateOption('includePredictedGrades', checked)}
          />
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          .
        </p>
      </div>

      {/* Generate Button - Disabled for Coming Soon */}
      <button
        type="button"
        disabled={true}
        className="w-full py-4 mt-5 rounded-xl text-white font-semibold text-sm bg-gray-300 cursor-not-allowed"
      >
        Preview Transcript
      </button>
    </div>
  );
};

export default TranscriptOptions;

