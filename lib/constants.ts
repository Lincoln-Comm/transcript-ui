import { GradeDescriptor } from '@/types';

export const gradingScale: GradeDescriptor[] = [
  { grade: '7', lcsDescriptor: 'Consistently attained an outstanding level of achievement.', descriptor: 'Excellent' },
  { grade: '6', lcsDescriptor: 'Attained an excellent level of achievement.', descriptor: 'Very Good' },
  { grade: '5', lcsDescriptor: 'Attained a good level of achievement.', descriptor: 'Good' },
  { grade: '4', lcsDescriptor: 'Attained a satisfactory level of achievement.', descriptor: 'Satisfactory' },
  { grade: '3', lcsDescriptor: 'Attained the minimum level of achievement.', descriptor: 'Limited' },
  { grade: '2', lcsDescriptor: 'Has not attained the minimum standard of achievement.', descriptor: 'Poor' },
  { grade: '1', lcsDescriptor: 'Has not met the requirements of the course.', descriptor: 'Very Poor' },
  { grade: 'P', lcsDescriptor: 'A passing mark was earned.', descriptor: 'Pass Mark' },
  { grade: 'F', lcsDescriptor: 'The student failed to meet the passing requirements for the course.', descriptor: 'Failed' },
];

export const schoolInfo = {
  name: 'Lincoln Community School',
  address: {
    line1: 'PMB CT 354, Cantonment',
    city: 'Accra',
    country: 'Ghana',
    phone: '+233 30 221 8100',
    web: 'www.lincoln.edu.gh',
  },
  principal: {
    name: 'Jennifer Hager',
    title: 'Secondary School Principal',
  },
};