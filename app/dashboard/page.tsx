'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header, Breadcrumb } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Calendar,
  Loader2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import {
  getDashboardStats,
  getStudentsByYear,
  getStudentsByProgram,
  getStudentsByGender,
  getCoursesByLevel,
  DashboardStats,
  YearGroupCount,
  ProgramCount,
  GenderCount,
  CourseLevelCount,
} from '@/lib/api';

// =====================================================
// Stat Card Component
// =====================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
  isLoading?: boolean;
}

function StatCard({ title, value, subtitle, icon, color, isLoading }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };

  const iconBgClasses = {
    blue: 'bg-blue-400/30',
    emerald: 'bg-emerald-400/30',
    purple: 'bg-purple-400/30',
    amber: 'bg-amber-400/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          {isLoading ? (
            <div className="mt-2">
              <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
              {subtitle && (
                <p className="text-white/70 text-xs mt-1">{subtitle}</p>
              )}
            </>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Chart Card Component (wrapper)
// =====================================================

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

function ChartCard({ title, children, isLoading }: ChartCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// =====================================================
// Bar Chart Component
// =====================================================

interface BarChartProps {
  data: { label: string; value: number }[];
  maxItems?: number;
  color?: string;
}

function BarChart({ data, maxItems = 10, color = 'bg-blue-500' }: BarChartProps) {
  const displayData = data.slice(0, maxItems);
  const maxValue = Math.max(...displayData.map(d => d.value), 1);

  return (
    <div className="space-y-3">
      {displayData.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-24 text-xs text-gray-600 truncate" title={item.label}>
            {item.label}
          </div>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all duration-500`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-12 text-xs text-gray-700 font-medium text-right">
            {item.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// Pie/Donut Chart Component
// =====================================================

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
}

function DonutChart({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex items-center justify-center gap-8">
      {/* SVG Donut */}
      <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-40 h-40 transform -rotate-90">
        {data.map((item, index) => {
          const percent = item.value / total;
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += percent;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = percent > 0.5 ? 1 : 0;

          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="white"
              strokeWidth="0.04"
            />
          );
        })}
        {/* Inner circle for donut effect */}
        <circle cx="0" cy="0" r="0.6" fill="white" />
        {/* Center text */}
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-900 text-[0.25px] font-bold transform rotate-90"
          style={{ fontSize: '0.25px' }}
        >
          {total.toLocaleString()}
        </text>
      </svg>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-medium text-gray-900">
              {item.value.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">
              ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// Quick Action Card Component
// =====================================================

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function QuickAction({ title, description, href, icon }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
    </Link>
  );
}

// =====================================================
// Main Dashboard Content
// =====================================================

function DashboardContent() {
  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [studentsByYear, setStudentsByYear] = useState<YearGroupCount[]>([]);
  const [studentsByProgram, setStudentsByProgram] = useState<ProgramCount[]>([]);
  const [studentsByGender, setStudentsByGender] = useState<GenderCount[]>([]);
  const [coursesByLevel, setCoursesByLevel] = useState<CourseLevelCount[]>([]);
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);

  // Fetch data
  const fetchDashboardData = useCallback(async () => {
    setIsLoadingStats(true);
    setIsLoadingCharts(true);

    try {
      // Fetch stats
      const statsData = await getDashboardStats();
      setStats(statsData);
      setIsLoadingStats(false);
      console.log('📊 Dashboard stats:', statsData);

      // Fetch chart data in parallel
      const [yearData, programData, genderData, levelData] = await Promise.all([
        getStudentsByYear(),
        getStudentsByProgram(),
        getStudentsByGender(),
        getCoursesByLevel(),
      ]);

      setStudentsByYear(yearData);
      setStudentsByProgram(programData);
      setStudentsByGender(genderData);
      setCoursesByLevel(levelData);
      
      console.log('📈 Chart data loaded');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingCharts(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Prepare chart data
  const programChartData = studentsByProgram.map(item => ({
    label: item.program === 'DP' ? 'Diploma Programme' : 'Middle Years Programme',
    value: item.count,
    color: item.program === 'DP' ? '#3B82F6' : '#10B981',
  }));

  const genderChartData = studentsByGender.map(item => ({
    label: item.gender === 'M' ? 'Male' : item.gender === 'F' ? 'Female' : item.gender,
    value: item.count,
    color: item.gender === 'M' ? '#6366F1' : '#EC4899',
  }));

  const yearChartData = studentsByYear.slice(0, 10).map(item => ({
    label: item.year_group,
    value: item.count,
  }));

  const levelChartData = coursesByLevel.map(item => ({
    label: item.level,
    value: item.count,
  }));

  // Year range subtitle
  const yearRangeText = stats?.yearGroupRange.start && stats?.yearGroupRange.end
    ? `${stats.yearGroupRange.start} to ${stats.yearGroupRange.end}`
    : 'All years';

    // Temporary toggle for gender
    const showChart = false

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
      <Header activeNav="dashboard" />
      
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: null },
            ]}
          />

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Archive data overview and statistics</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Students"
              value={stats?.totalStudents || 0}
              subtitle="All archived records"
              icon={<Users className="w-6 h-6" />}
              color="blue"
              isLoading={isLoadingStats}
            />
            <StatCard
              title="Total Courses"
              value={stats?.totalCourses || 0}
              subtitle="Across all programs"
              icon={<BookOpen className="w-6 h-6" />}
              color="emerald"
              isLoading={isLoadingStats}
            />
            <StatCard
              title="Transcripts Available"
              value={stats?.totalTranscripts || 0}
              subtitle="Students with grades"
              icon={<FileText className="w-6 h-6" />}
              color="purple"
              isLoading={isLoadingStats}
            />
            <StatCard
              title="Year Groups"
              value={studentsByYear.length || 0}
              subtitle={yearRangeText}
              icon={<Calendar className="w-6 h-6" />}
              color="amber"
              isLoading={isLoadingStats}
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickAction
                title="Generate Transcript"
                description="Create official student transcript"
                href="/dashboard/generate-transcript"
                icon={<FileText className="w-5 h-5" />}
              />
              <QuickAction
                title="Manage Students"
                description="View and edit student records"
                href="/dashboard/students"
                icon={<Users className="w-5 h-5" />}
              />
              <QuickAction
                title="Manage Courses"
                description="View and edit course catalog"
                href="/dashboard/courses"
                icon={<BookOpen className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Students by Year */}
            <ChartCard title="Students by Year Group (Top 10)" isLoading={isLoadingCharts}>
              <BarChart data={yearChartData} color="bg-blue-500" />
            </ChartCard>

            {/* Courses by Level */}
            <ChartCard title="Courses by Level" isLoading={isLoadingCharts}>
              <BarChart data={levelChartData} color="bg-emerald-500" />
            </ChartCard>

            {/* Students by Program */}
            <ChartCard title="Students by Program" isLoading={isLoadingCharts}>
              {showChart && programChartData.length > 0 ? (
                <DonutChart data={programChartData} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  No data available
                </div>
              )}
            </ChartCard>

            {/* Students by Gender */}
            <ChartCard title="Students by Gender" isLoading={isLoadingCharts}>
              {showChart && genderChartData.length > 0 ? (
                <DonutChart data={genderChartData} />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  No data available
                </div>
              )}
            </ChartCard>
          </div>

          {/* Footer Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Data Summary</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">Data Range</p>
                <p className="font-semibold text-gray-900">{yearRangeText}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Programs</p>
                <p className="font-semibold text-gray-900">MYP & DP</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Course Levels</p>
                <p className="font-semibold text-gray-900">{coursesByLevel.length} levels</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Coverage</p>
                <p className="font-semibold text-gray-900">
                  {stats?.totalTranscripts && stats?.totalStudents
                    ? `${((stats.totalTranscripts / stats.totalStudents) * 100).toFixed(1)}%`
                    : '-'
                  } with grades
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// =====================================================
// Export with Protected Route
// =====================================================

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}