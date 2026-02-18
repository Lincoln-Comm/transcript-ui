
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
// Register Poppins font from Google Fonts CDN

import { TranscriptData, GradeDescriptor } from '@/types';
import { sign } from 'crypto';


Font.register({
  family: 'Poppins',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrFJA.ttf',
      fontWeight: 400,
      fontStyle: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/poppins/v21/pxiGyp8kv8JHgFVrJJLed3FBGPaTSQ.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    {
      src: 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9V1s.ttf',
      fontWeight: 500,
      fontStyle: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmg1hlEn2IrFE.ttf',
      fontWeight: 500,
      fontStyle: 'italic',
    },
    {
      src: 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6V1s.ttf',
      fontWeight: 600,
      fontStyle: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmr19lEn2IrFE.ttf',
      fontWeight: 600,
      fontStyle: 'italic',
    },
    {
      src: 'https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7V1s.ttf',
      fontWeight: 700,
      fontStyle: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/poppins/v21/pxiDyp8kv8JHgFVrJJLmy15lEn2IrFE.ttf',
      fontWeight: 700,
      fontStyle: 'italic',
    },
  ],
});
// A4 dimensions: 595.28 x 841.89 points // 
const styles = StyleSheet.create({
  page: {
    padding: 5,
    paddingHorizontal: 20,
    fontSize: 8,
    fontFamily: 'Poppins',
    backgroundColor: '#ffffff',
  },
  // Header
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 3,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', 
    paddingBottom: 3

  },
  schoolLogo: {
    flexDirection: 'row',
    alignItems: 'center', 
    gap: 0, 
    height: 'auto', // Let it auto-size
    overflow: 'hidden', // Prevent overflow
  },
  logoImage: {
    width: 100,
    height: 'auto', // Auto height to maintain aspect ratio
    maxHeight: 80, // Cap the height

    objectFit: 'contain',
  },

  schoolNameContainer: {
    marginLeft: 8,
  },
  schoolName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a8a',
   
  
  },
  schoolTagline: {
    fontSize: 7,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10, 
    paddingTop: 10
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  schoolAddress: {
    alignItems: 'flex-end', 
    paddingVertical: 0,
    marginTop: 0,
    marginBottom: 0,
    gap: 0,
  },
  addressText: {
    fontSize: 8,
    fontWeight: '550',
    color: '#1a388bff',
    textAlign: 'right',
    paddingVertical: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  // Student Info
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    paddingVertical: 0,
    marginTop: 3 ,
  },
  studentInfoLeft: {
    gap: 0,
  },
  studentInfoRight: {
    alignItems: 'flex-end',
    gap: 0,
  },
  infoLabel: {
    //fontSize: 9,
    color: '#6b7280',
  },
  infoValue: {
    //fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 4,
  },
  // Academic Year Section
  academicYearSection: {
    marginBottom: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingTop: 1,
    borderWidth: 0.4,
    borderColor: '#d1d5db',
  },
  sectionHeaderText: {
    fontSize: 8,
    fontWeight: 'bold', 
    color: '#374151',
    paddingLeft: 4,
  },

  sectionHeaderSubject: {
    width: '70%',
    paddingBottom: 0,
    paddingTop: 1,
    borderRightWidth: 0.4,
    borderColor: '#d1d5db',
  },

  sectionHeaderGrade: {
    width: '15%',
    alignItems: 'center',
    borderRightWidth: 0.4,
    borderColor: '#d1d5db',
  },

  sectionHeaderGradeLast: {
    width: '15%',
    alignItems: 'center',
  },

  sectionHeaderGradeText: {
    fontSize: 7,
    fontWeight: 'bold',
  },
    
  // Table
  table: {
    borderLeftWidth: 0.4,
    borderRightWidth: 0.4,
    borderColor: '#d1d5db',
    paddingBottom: 0,
    paddingTop: 0,
    fontSize: 7
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.4,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  tableHeaderCell: {
    padding: 0,
    paddingTop: 1,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableHeaderSubject: {
    width: '70%',
    borderRightWidth: 0.4,
    borderColor: '#d1d5db',
    paddingLeft: 4,
  },
  tableHeaderGrade: {
    width: '15%',
    textAlign: 'center',
    borderRightWidth: 0.4,
    borderColor: '#d1d5db',
  },
  tableHeaderGradeLast: {
    width: '15%',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.4,
    borderColor: '#e5e7eb',
  },
  tableCell: {
    padding: 0,
    margin: 0,
    fontSize: 6.5,
    color: '#0a0a0aff',
    lineHeight: 1.3,
    fontWeight: '500',
    paddingTop: 1
  },
  tableCellSubject: {
    width: '70%',
    borderRightWidth: 0.4,
    borderColor: '#d1d5db',
    paddingLeft: 4,
  },
  tableCellGrade: {
    width: '15%',
    textAlign: 'center',
    fontWeight: 'semibold',
    borderRightWidth: 0.4,
    borderColor: '#d1d5db',
  },
  tableCellGradeLast: {
    width: '15%',
    textAlign: 'center',
    fontWeight: 'semibold',
  },
  // Signature
  signatureSection: {
    marginTop: 5,
    marginBottom: 5,
  },
  signatureLine: {
    width: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    marginBottom: 2,
  },
  signatureName: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#111827',
  },
  signatureTitle: {
    fontSize: 7,
    color: '#6b7280',
  },

  signatureImage: {
    width: 50,
    objectFit: 'contain',
    paddingBottom: 0,
      marginBottom: 0,
  },
  // Grading Scale
  bottomSection: {
    flexDirection: 'row',
    marginTop: 5,
    justifyContent: 'space-between', 
    paddingHorizontal: 40,
  },
  gradingScale: {
    flex: 6,
    borderWidth: 0.5,
    borderColor: '#242528',
  },
  gradingScaleHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#242528',
  },
  gradingScaleHeaderCell: {
    padding: 1,
    fontSize: 5,
    fontWeight: 'bold',
    color: '#11151cff',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradingScaleRow: {
    flexDirection: 'row',
  },
  gradingScaleCell: {
    padding: 1,
    fontSize: 5,
    color: '#1a1e25ff',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',

  },
  gradeCol: {
    width: '10%',
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderColor: '#242528',
  },
  descCol: {
    width: '70%',
    borderRightWidth: 0.5,
    borderColor: '#242528',
  },
  shortDescCol: {
    width: '20%',
  },
  // Notes
  notesSection: {
    flex: 4,
    borderWidth: 0.5,
    padding: 4,               
    marginLeft: 6, 
    lineHeight: 1.3,
  },
  noteText: {
    fontSize: 6,
    color: '#07080aff',
    marginBottom: 3,
    lineHeight: 1.3,
    justifyContent: 'center',
    textIndent: -4, 
    paddingLeft: 8,
  },
  // Footer
  footer: {
    marginTop: 3,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 5.5,
    color: '#07080aff',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.5, 
  },
  accreditationLogos: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  accreditationImage: {
    width: 350,
    height: 50,
    objectFit: 'contain',
  },
  accreditationLogo: {
    width: 30,
    height: 30,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
 
});

interface TranscriptPDFProps {
  data: TranscriptData;
  gradingScale: GradeDescriptor[];
}

const TranscriptPDF = ({ data, gradingScale }: TranscriptPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {/* School Logo */}
        <View style={styles.schoolLogo}>
          {/* Use the image from public folder */}
          <Image 
            src="/images/school_logo.png" 
            style={styles.logoImage} 
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Official High School Transcript</Text>
        </View>

        {/* School Address */}
        <View style={styles.schoolAddress}>
          <Text style={styles.addressText}>{data.schoolAddress.line1}</Text>
          <Text style={styles.addressText}>{data.schoolAddress.city}, {data.schoolAddress.country}</Text>
          <Text style={styles.addressText}>Telephone: {data.schoolAddress.phone}</Text>
          <Text style={styles.addressText}>Web: {data.schoolAddress.web}</Text>
        </View>
      </View>

      {/* Student Info */}
      <View style={styles.studentInfo}>
        <View style={styles.studentInfoLeft}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student name:</Text>
            <Text style={styles.infoValue}>{data.student.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender :</Text>
            <Text style={styles.infoValue}>{data.student.gender}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of graduation :</Text>
            {/* <Text style={styles.infoValue}>{data.student.dateOfGraduation}</Text> */}
          </View>
        </View>
        <View style={styles.studentInfoRight}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of birth:</Text>
            <Text style={styles.infoValue}>{data.student.dateOfBirth}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nationality :</Text>
            <Text style={styles.infoValue}>{data.student.nationality}</Text>
          </View>
        </View>
      </View>

      {/* Academic Years */}
      {data.academicYears.map((academicYear) => (
        <View key={academicYear.id} style={styles.academicYearSection}>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderSubject}>
              <Text style={styles.sectionHeaderText}>
                {academicYear.program} - All courses are IB subjects, unless indicated as LCS - {academicYear.gradeLevel} - {academicYear.academicYear}
              </Text>
            </View>

            <View style={styles.sectionHeaderGrade}>
              <Text style={styles.sectionHeaderGradeText}>Semester 1</Text>
            </View>

            <View style={styles.sectionHeaderGradeLast}>
              <Text style={styles.sectionHeaderGradeText}>Semester 2</Text>
            </View>
          </View>


          {/* Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, styles.tableHeaderSubject]}>
                <Text>Subject</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.tableHeaderGrade]}>
                {/* <Text>Semester 1</Text> */}
                <Text style={{ fontWeight: 'bold', fontSize: 7 }}>Final Grade</Text>
              </View>
              <View style={[styles.tableHeaderCell, styles.tableHeaderGradeLast]}>
                {/* <Text>Semester 2</Text> */}
                <Text style={{ fontWeight: 'bold', fontSize: 7 }}>Final Grade</Text>
              </View>
            </View>

            {/* Table Rows */}
            {academicYear.courses.map((course) => (
              <View key={course.id} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.tableCellSubject]}>
                  <Text>{course.description}</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellGrade]}>
                  <Text>{course.semester1Grade ?? '-'}</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellGradeLast]}>
                  <Text>{course.semester2Grade ?? '-'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

    

      {/* Signature */}
      <View style={styles.signatureSection}>
        <Image 
          src="/images/principal_signature.png" 
          style={styles.signatureImage} 
        />
        <View style={styles.signatureLine} />
        <Text style={styles.signatureName}>{data.principalName}</Text>
        <Text style={styles.signatureTitle}>{data.principalTitle}</Text>
      </View>

      {/* Bottom Section: Grading Scale + Notes */}
      <View style={styles.bottomSection}>
        {/* Grading Scale */}
        <View style={styles.gradingScale}>
          <View style={styles.gradingScaleHeader}>
            <View style={[styles.gradingScaleHeaderCell, styles.gradeCol]}>
              <Text>IB</Text>
            </View>
            <View style={[styles.gradingScaleHeaderCell, styles.descCol]}>
              <Text>LCS Descriptor</Text>
            </View>
            <View style={[styles.gradingScaleHeaderCell, styles.shortDescCol]}>
              <Text>Descriptor</Text>
            </View>
          </View>
          {gradingScale.map((item) => (
            <View key={item.grade} style={styles.gradingScaleRow}>
              <View style={[styles.gradingScaleCell, styles.gradeCol]}>
                <Text>{item.grade}</Text>
              </View>
              <View style={[styles.gradingScaleCell, styles.descCol]}>
                <Text>{item.lcsDescriptor}</Text>
              </View>
              <View style={[styles.gradingScaleCell, styles.shortDescCol]}>
                <Text>{item.descriptor}</Text>
              </View>
            </View>
          ))}
        </View>
        

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.noteText}>
            • All high school students are enrolled in an US college preparatory curriculum in which English is the language of instruction.
          </Text>
          <Text style={styles.noteText}>
            • Students are awarded a US accredited High School Diploma after completing 24 units of credit. Students also have the option of pursuing an IB Diploma.
          </Text>
          <Text style={styles.noteText}>
            • Courses and credits earned from other schools are not reported on this transcript.
          </Text>
          <Text style={styles.noteText}>
            • LCS does not calculate Grade Points Average (GPA) or rank students.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This transcript is official when stamped by a school official and received in a sealed envelope or electronically through a secure system.
        </Text>
        <Text style={styles.footerText}>
          {data.schoolName} is fully accredited by the Middle States Association of Colleges and Schools, the International Baccalaureate Organization and the Council of International Schools
        </Text>

        {/* Accreditation Logos*/}
        <View style={styles.accreditationLogos}>
          <Image 
            src="/images/IB_partners.png" 
            style={styles.accreditationImage} 
          />
        </View>
      </View>
    </Page>
  </Document>
);

export default TranscriptPDF;