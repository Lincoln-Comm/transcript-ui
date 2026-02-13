

'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import Image from 'next/image';
import CoursesTable from './CoursesTable';
import GradingScale from './GradingScale';
import { TranscriptData, TranscriptPreviewProps } from '@/types';
import { gradingScale } from '@/lib/constants';

// School Logo Component - using actual image
const SchoolLogo = () => (
  <div className="flex items-center">
    <Image 
      src="/images/school_logo.png" 
      alt="School Logo"
      width={80}
      height={80}
      className="object-contain"
    />
  </div>
);

// Accreditation Logos Component - using actual image
const AccreditationLogos = () => (
  <div className="flex items-center justify-center mt-4">
    <Image 
      src="/images/IB_partners.png" 
      alt="Accreditation Partners"
      width={400}
      height={60}
      className="object-contain"
    />
  </div>
);

const TranscriptPreview = ({ data, isLoading = false, error = null }: TranscriptPreviewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[600px] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <span>Loading transcript...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[600px] flex flex-col items-center justify-center text-red-500">
        <p className="mb-2">Error loading transcript</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[600px] flex items-center justify-center text-gray-400">
        Select a student to preview transcript
      </div>
    );
  }

  // Generate filename based on student name
  const fileName = `Transcript_${data.student.name.replace(/\s+/g, '_')}.pdf`;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Dynamically import react-pdf only when needed
      const { pdf } = await import('@react-pdf/renderer');
      const { default: TranscriptPDF } = await import('./TranscriptPDF');
      
      // Generate the PDF blob
      const blob = await pdf(
        <TranscriptPDF data={data} gradingScale={gradingScale} />
      ).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Document Preview - Scrollable */}
      <div className="p-4 bg-gray-100 max-h-[700px] overflow-y-auto">
        {/* Official Document Container */}
        <div className="bg-white shadow-md mx-auto" style={{ width: '100%', maxWidth: '650px' }}>
          {/* Document Content */}
          <div className="p-6">
            
            {/* Header Section */}
            <div className="flex items-start justify-between mb-2 pb-4 border-b border-gray-200">
              {/* School Logo */}
              <SchoolLogo />
              
              {/* Title */}
              <div className="text-center flex-1 px-4">
                <h1 className="text-xl font-bold text-gray-900">Official High School Transcript</h1>
              </div>
              
              {/* School Address */}
              <div className="text-right text-[10px] text-blue-700">
                <p>{data.schoolAddress.line1}</p>
                <p>{data.schoolAddress.city}, {data.schoolAddress.country}</p>
                <p>Telephone: {data.schoolAddress.phone}</p>
                <p>Web: {data.schoolAddress.web}</p>
              </div>
            </div>

            {/* Student Info Section */}
            <div className="flex justify-between mb-2 text-xs">
              <div className="space-y-0">
                <p>
                  <span className="text-gray-600">Student name:</span>{' '}
                  <span className="font-semibold text-gray-900">{data.student.name}</span>
                </p>
                <p>
                  <span className="text-gray-600">Gender</span>{' '}
                  <span className="text-gray-600">:</span>{' '}
                  <span className="font-medium text-gray-900">{data.student.gender}</span>
                </p>
                <p>
                  <span className="text-gray-600">Date of graduation :</span>{' '}
                  {/* <span className="font-medium text-gray-900">{data.student.dateOfGraduation}</span> */}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p>
                  <span className="text-gray-600">Date of birth:</span>{' '}
                  <span className="font-semibold text-gray-900">{data.student.dateOfBirth}</span>
                </p>
                <p>
                  <span className="text-gray-600">Nationality</span>{' '}
                  <span className="text-gray-600">:</span>{' '}
                  <span className="font-medium text-gray-900">{data.student.nationality}</span>
                </p>
              </div>
            </div>

            {/* Academic Years - Course Tables */}
            <div className="mb-2">
              {data.academicYears.map((academicYear) => (
                <CoursesTable key={academicYear.id} academicYear={academicYear} />
              ))}
            </div>

            {/* Signature Section */}
            <div className="mb-6 pt-4">
              {/* Signature placeholder */}
              <div className="w-32 h-8 border-b border-gray-400 mb-1">
                <p className="text-xs italic text-gray-400">Signature</p>
              </div>
              <p className="text-xs font-semibold text-gray-900">{data.principalName}</p>
              <p className="text-[10px] text-gray-600">{data.principalTitle}</p>
            </div>

            {/* Grading Scale and Notes Section */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Grading Scale */}
              <GradingScale descriptors={gradingScale} />
              
              {/* Notes */}
              <div className="text-[9px] text-gray-600 space-y-2">
                <p>• All high school students are enrolled in an US college preparatory curriculum in which English is the language of instruction.</p>
                <p>• Students are awarded a US accredited High School Diploma after completing 24 units of credit. Students also have the option of pursuing an IB Diploma.</p>
                <p>• Courses and credits earned from other schools are not reported on this transcript.</p>
                <p>• LCS does not calculate Grade Points Average (GPA) or rank students.</p>
              </div>
            </div>

            {/* Official Statement */}
            <div className="text-center mb-4">
              <p className="text-[9px] text-gray-600 italic">
                This transcript is official when stamped by a school official and received in a sealed envelope or electronically through a secure system.
              </p>
              <p className="text-[9px] text-gray-600 mt-1">
                {data.schoolName} is fully accredited by the Middle States Association of Colleges and Schools, the International Baccalaureate Organization and the Council of International Schools
              </p>
            </div>

            {/* Accreditation Logos */}
            <AccreditationLogos />
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl text-sm font-medium text-white transition-all shadow-lg shadow-blue-600/25"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TranscriptPreview;