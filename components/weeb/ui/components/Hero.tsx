'use client';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const HeroPages = () => {
  return (
    <div className='mt-28 flex flex-col justify-center items-center'>
      <motion.h1
        className="max-sm:hidden block text-4xl md:text-6xl font-extrabold text-center text-gray-200"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Organize Your Work <br />
        <span className="underline decoration-blue-500">Visually</span> <span className="text-blue-500">&</span> <span className="overline decoration-blue-500">Effortlessly</span>
      </motion.h1>
      <motion.h1
        className="max-sm:block hidden text-5xl md:text-6xl font-extrabold text-center text-gray-200"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Organize Your Work <br /> <span className="text-blue-500">&</span> <span className="overline decoration-blue-500">Stay Focused</span>
      </motion.h1>

      <motion.p
        className='text-gray-300 text-center mt-4 mx-auto max-w-2xl'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Twillo helps teams of all sizes organize, track, and manage their work with intuitive Kanban boards. Create boards, add tasks, collaborate in real-time, and ship projects faster with visual project management that everyone loves.
      </motion.p>

      <motion.div
        className='flex flex-row justify-center items-center gap-4 mt-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Link href="/register">
          <span className="group text-md relative inline-flex items-center text-white bg-blue-600 px-6 py-2 rounded-sm shadow pointer-events-none group-hover:pointer-events-auto">
            Get Started Free
          </span>
        </Link>
        <Link href="/solutions">
          <span className="group text-md relative inline-flex items-center border-2 border-gray-600 text-white px-6 py-2 rounded-xl shadow pointer-events-none group-hover:pointer-events-auto">
            See How It Works
          </span>
        </Link>
      </motion.div>

      <motion.div
        className='flex flex-col justify-center items-center mt-8'
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Image src="/weeb/Desktop.svg" alt="Twillo Kanban Board Preview" width={1000} height={500} className='w-full max-w-4xl h-[59vh]' />
      </motion.div>
    </div>
  );
};

export default HeroPages;
