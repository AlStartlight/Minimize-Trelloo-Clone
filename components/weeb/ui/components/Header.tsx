'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HeaderComponents = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { href: '/about-us', label: 'About Us' },
    { href: '/solutions', label: 'Solutions' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/resources', label: 'Resources' },
  ];

  return (
    <header className={`fixed top-0 z-30 w-full py-5 transition-all duration-300 ${isScrolling ? "bg-blend-hue bg-gradient-to-br from-blue-950 to-gray-950 shadow-lg" : "bg-gray-950/80 backdrop-blur-sm"}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center py-4 text-2xl font-extrabold text-white">
              Twillo
            </Link>
          </motion.div>
          {/* desktop menu button */}
          <div className="hidden md:flex space-x-4 ml-10 gap-4">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>
          {/* CTA button */}
          <motion.div
            className="hidden md:flex ml-auto gap-6 relative z-50 items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/login" className="px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              <span className="flex flex-inline items-center text-gray-200 pointer-events-auto">
                Log In
              </span>
            </Link>
            <Link href="/register">
              <span className="group text-sm relative inline-flex items-center text-white bg-blue-600 px-4 py-2 rounded-md shadow pointer-events-none group-hover:pointer-events-auto hover:bg-blue-700 transition-colors">
                Get Started
              </span>
            </Link>
          </motion.div>
          {/* mobile menu button */}
          <button className="md:hidden flex items-center px-3 py-2 rounded-full text-gray-400 border-gray-600 hover:text-white hover:border-gray-500" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={20} color='white' /> : <Menu size={20} color='white' />}
          </button>
        </div>
        {/* mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden absolute top-16 left-0 w-full bg-gray-900/95 backdrop-blur-xl border border-gray-800 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col mx-auto items-center p-4">
                <Link href="/" className="text-gray-300 hover:text-white py-2">Home</Link>
                <Link href="/about-us" className="text-gray-300 hover:text-white py-2">About Us</Link>
                <Link href="/solutions" className="text-gray-300 hover:text-white py-2">Solutions</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white py-2">Pricing</Link>
                <Link href="/resources" className="text-gray-300 hover:text-white py-2">Resources</Link>
                {/* CTA button */}
                <div className="flex flex-col gap-2 items-center mt-2">
                  <Link href="/login" className="px-4 py-2 rounded hover:bg-blue-600">
                    <span className="flex flex-inline items-center text-gray-300 pointer-events-auto">
                      Log In
                    </span>
                  </Link>
                  <Link href="/register">
                    <span className="group text-md relative inline-flex items-center border-2 text-white border-gray-600 px-4 py-1 rounded-xl shadow pointer-events-none group-hover:pointer-events-auto">
                      Get Started
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default HeaderComponents;
