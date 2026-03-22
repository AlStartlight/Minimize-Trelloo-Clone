'use client';
import React from 'react';
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';

const features = [
  {
    icon: "📋",
    title: "Kanban Boards",
    description: "Visualize your workflow with drag-and-drop boards that keep your team aligned."
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    description: "Assign tasks, add comments, and @mention teammates to stay connected."
  },
  {
    icon: "⏰",
    title: "Due Dates & Reminders",
    description: "Never miss a deadline with smart notifications and calendar views."
  },
  {
    icon: "📊",
    title: "Progress Tracking",
    description: "See project status at a glance with visual progress indicators."
  },
  {
    icon: "🔗",
    title: "Integrations",
    description: "Connect with Slack, GitHub, Google Drive, and 100+ other tools."
  },
  {
    icon: "📱",
    title: "Mobile App",
    description: "Manage your projects on the go with our iOS and Android apps."
  }
];

const EventsComponents = () => {
  return (
    <div className='relative bg-gray-900 py-20'>
      <FadeIn>
        <h1 className='text-5xl text-center font-bold text-white mb-6'>
          Features That Teams Love
        </h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <p className='text-gray-400 text-center mb-20 max-w-2xl mx-auto'>
          Everything you need to manage projects, collaborate with your team, and ship faster.
        </p>
      </FadeIn>
      <StaggerContainer staggerDelay={0.1} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4'>
        {features.map((feature, index) => (
          <StaggerItem key={index}>
            <div className="bg-gray-800 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
      <FadeIn delay={0.3}>
        <div className='text-center mt-12'>
          <Link href="/solutions">
            <span className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Explore All Features
            </span>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
};

export default EventsComponents;
