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
      {/* Section Title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Transcript Options</h2>
      
      {/* Options Form */}
      <div className="space-y-5">
        {/* Program */}
        <Dropdown
          label="Program"
          options={programOptions}
          value={options.program}
          onChange={(value) => updateOption('program', value as 'DP' | 'MYP')}
          placeholder="Select program..."
        />

        {/* School Year and Session Type - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
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
        <Dropdown
          label="Transcript Type"
          options={transcriptTypeOptions}
          value={options.transcriptType}
          onChange={(value) => updateOption('transcriptType', value as 'official' | 'unofficial')}
          placeholder="Select type..."
        />

        {/* Include Predicted Grades Toggle */}
        <div className="pt-2">
          <Toggle
            label="Include Predicted Grades"
            checked={options.includePredictedGrades}
            onChange={(checked) => updateOption('includePredictedGrades', checked)}
          />
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={!isStudentSelected}
          className={`w-full py-4 rounded-xl text-white font-semibold text-sm transition-all
            ${isStudentSelected 
              ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30' 
              : 'bg-gray-300 cursor-not-allowed'
            }`}
        >
          Generate Transcript
        </button>
      </div>
    </div>
  );
};

export default TranscriptOptions;