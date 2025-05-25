
import React from 'react';

export const HeroSection = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cvsite-navy/90 to-cvsite-teal/90 z-10"></div>
      <img
        src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=1200&q=80"
        alt="Professional workspace"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 text-white">
        <h1 className="text-5xl font-bold mb-6">Welcome to CVSite</h1>
        <p className="text-xl leading-relaxed mb-8 max-w-md">
          Streamline your HR processes with our comprehensive employee management platform. 
          Manage profiles, track achievements, and build your organization's future.
        </p>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <p className="font-semibold">Human Resources Excellence</p>
            <p className="text-sm opacity-90">Empowering people, driving success</p>
          </div>
        </div>
      </div>
    </div>
  );
};
