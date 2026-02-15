
// import type { Metadata } from 'next';
// import { Poppins } from 'next/font/google';
// import './globals.css';

// const poppins = Poppins({ 
//   subsets: ['latin'],
//   weight: ['300', '400', '500', '600', '700'],
//   variable: '--font-poppins',
//   display: 'swap',
// });

// export const metadata: Metadata = {
//   title: 'IB Transcript Generator',
//   description: 'Generate official transcripts for International Baccalaureate students',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={`${poppins.variable} font-sans antialiased`}>
//         {children}
//       </body>
//     </html>
//   );
// } 


import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts';

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IB Transcript Generator',
  description: 'Generate official transcripts for International Baccalaureate students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}