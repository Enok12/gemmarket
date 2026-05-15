import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "GGMP – World's Gemstone Marketplace",
  description: 'Buy and sell rare gemstones directly from verified sellers. Browse rubies, sapphires, emeralds and more.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-white border-t border-gray-200 py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} GGMP · World's Gemstone Marketplace</p>
              <div className="flex gap-6 text-sm text-gray-500">
                <a href="https://www.cgt.onl/about" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">About</a>
                <a href="#" className="hover:text-gray-900">Privacy</a>
                <a href="#" className="hover:text-gray-900">Terms</a>
              </div>
            </div>
          </footer>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
