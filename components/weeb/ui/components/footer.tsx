'use client';
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/animations';

function Footer() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { href: '/pricing', label: 'Pricing' },
        { href: '/solutions', label: 'Features' },
        { href: '/solutions', label: 'Integrations' },
        { href: '/solutions', label: "What's New" },
      ],
    },
    {
      title: 'Solutions',
      links: [
        { href: '/solutions', label: 'Project Management' },
        { href: '/solutions', label: 'Team Collaboration' },
        { href: '/solutions', label: 'Task Tracking' },
        { href: '/solutions', label: 'Workflow Automation' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { href: '/resources', label: 'Help Center' },
        { href: '/resources', label: 'Blog' },
        { href: '/resources', label: 'Tutorials' },
        { href: '/resources', label: 'Community' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '/about-us', label: 'About Us' },
        { href: '/about-us', label: 'Careers' },
        { href: '/about-us', label: 'Contact' },
        { href: '/about-us', label: 'Press' },
      ],
    },
  ];

  const socialIcons = [
    { Icon: YoutubeIcon, label: 'YouTube' },
    { Icon: FacebookIcon, label: 'Facebook' },
    { Icon: TwitterIcon, label: 'Twitter' },
    { Icon: InstagramIcon, label: 'Instagram' },
    { Icon: LinkedinIcon, label: 'LinkedIn' },
  ];

  return (
    <div className='flex flex-col'>
      <div className='grid grid-cols-1 md:grid-cols-5 gap-10 px-10 py-10 md:px-20 md:py-20 bg-gray-900'>
        <FadeIn>
          <div className='flex justify-center md:justify-start'>
            <Link href="/" className='text-white text-2xl font-bold'>Twillo</Link>
          </div>
        </FadeIn>
        {footerSections.map((section, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <ul className='flex flex-col gap-2 text-gray-300 text-center md:text-left'>
              <li className='font-semibold text-white'>{section.title}</li>
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link href={link.href} className='hover:text-blue-500 transition-colors'>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={0.2}>
        <div className='flex flex-row bg-gray-900 justify-between md:px-20 py-4 border-t border-gray-800'>
          <span className='text-gray-400 text-sm'>
            &copy; 2024 Twillo, Inc. All rights reserved.
          </span>
          <div className='flex flex-row gap-2'>
            {socialIcons.map(({ Icon, label }, index) => (
              <Icon key={index} size={20} className='text-gray-400 hover:text-blue-500 cursor-pointer transition-colors' aria-label={label} />
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

export default Footer;
