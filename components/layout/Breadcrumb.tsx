import Link from 'next/link';
import { BreadcrumbProps } from '@/types';

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const breadcrumbItems = items || [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Generate Transcript', href: null },
  ];

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      {breadcrumbItems.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumb;