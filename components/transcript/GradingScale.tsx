'use client';

import { GradeDescriptor } from '@/types';

interface GradingScaleProps {
  descriptors: GradeDescriptor[];
}

const GradingScale = ({ descriptors }: GradingScaleProps) => {
  return (
    <div className="border border-gray-300">
      {/* Header Row */}
      <div className="grid grid-cols-12 bg-gray-100 border-b border-gray-300">
        <div className="col-span-1 py-1 px-2 text-[10px] font-semibold text-gray-700 border-r border-gray-300 text-center">
          IB
        </div>
        <div className="col-span-6 py-1 px-2 text-[10px] font-semibold text-gray-700 border-r border-gray-300">
          LCS Descriptor 
        </div>
        <div className="col-span-5 py-1 px-2 text-[10px] font-semibold text-gray-700">
          Descriptor
        </div>
      </div>

      {/* Grade Rows */}
      {descriptors.map((item, index) => (
        <div 
          key={item.grade} 
          className={`grid grid-cols-12 ${index < descriptors.length - 1 ? 'border-b border-gray-200' : ''}`}
        >
          <div className="col-span-1 py-1 px-2 text-[10px] text-gray-800 border-r border-gray-300 text-center font-medium">
            {item.grade}
          </div>
          <div className="col-span-6 py-1 px-2 text-[10px] text-gray-700 border-r border-gray-300 leading-tight">
            {item.lcsDescriptor}
          </div>
          <div className="col-span-5 py-1 px-2 text-[10px] text-gray-700">
            {item.descriptor}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GradingScale;