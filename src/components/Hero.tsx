import { useEffect, useRef } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollTriggerInstance {
  getVelocity(): number;
}

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const decorativeRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial load animations
    const tl = gsap.timeline();

    // Stagger text animation with clip path effect
    if (titleRef.current) {
      tl.from(
        titleRef.current,
        {
          duration: 1.2,
          y: 50,
          opacity: 0,
          ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        0
      );
    }

    if (subtitleRef.current) {
      tl.from(
        subtitleRef.current,
        {
          duration: 1,
          y: 30,
          opacity: 0,
          ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        0.2
      );
    }

    if (ctaContainerRef.current) {
      tl.from(
        ctaContainerRef.current.children,
        {
          duration: 0.8,
          y: 20,
          opacity: 0,
          stagger: 0.15,
          ease: 'power2.out',
        },
        0.4
      );
    }

    // Decorative pattern floating animation
    if (decorativeRef.current) {
      gsap.to(decorativeRef.current, {
        duration: 4,
        y: -20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // Parallax effect on scroll
    const heroSection = heroRef.current;
    if (heroSection) {
      gsap.to(heroSection, {
        scrollTrigger: {
          trigger: heroSection,
          onUpdate: (self: ScrollTriggerInstance) => {
            gsap.to(decorativeRef.current, {
              y: self.getVelocity() * 0.1,
              overwrite: 'auto',
            });
          },
        },
      });
    }

    return () => {
      tl.kill();
    };
  }, []);

  // Card hover animation
  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      duration: 0.3,
      y: -8,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      ease: 'power2.out',
    });
  };

  const handleCardHoverOut = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      duration: 0.3,
      y: 0,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
      ease: 'power2.out',
    });
  };

  // Button hover animation
  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      duration: 0.3,
      scale: 1.05,
      ease: 'power2.out',
    });
  };

  const handleButtonHoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      duration: 0.3,
      scale: 1,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={heroRef}
      className="relative w-full min-h-screen bg-gradient-to-br from-[#FBF9F5] via-[#FAF8F3] to-[#F5F2ED] overflow-hidden"
    >
      {/* Decorative background patterns - Japanese-inspired */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top right circle - inspired by Japanese ensō */}
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full border-2 border-[#D4C5B5] opacity-20 transform rotate-12"></div>

        {/* Bottom left decorative - Indian textile pattern inspired */}
        <div
          ref={decorativeRef}
          className="absolute bottom-0 left-0 w-full h-96 opacity-10 pointer-events-none textile-pattern"
        ></div>

        {/* Floating geometric shapes - Indian mandala inspired */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 border-2 border-[#D4C5B5] opacity-15 transform rotate-45"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 border-2 border-[#D4C5B5] opacity-10 transform -rotate-12"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Main title */}
            <div ref={titleRef} className="space-y-4">
              <p className="text-sm font-medium tracking-widest text-[#8B7355] uppercase opacity-80">
                समग्र शिक्षा • 総合学習
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#2C2416] leading-tight">
                Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#8B7355]">Learning</span> Journey
              </h1>
            </div>

            {/* Subtitle with accent line */}
            <div ref={subtitleRef} className="space-y-4">
              <div className="w-16 h-1 bg-gradient-to-r from-[#D4A574] to-[#8B7355]"></div>
              <p className="text-lg text-[#5C5C5C] max-w-lg leading-relaxed">
                Discover courses inspired by ancient wisdom and modern pedagogy. Learn from master instructors in a seamless, culturally-rich environment.
              </p>
            </div>

            {/* CTA Buttons */}
            <div ref={ctaContainerRef} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonHoverOut}
                className="bg-[#2C2416] hover:bg-[#1a1410] text-white px-8 py-6 text-base rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group"
              >
                Explore Courses
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonHoverOut}
                variant="outline"
                className="border-2 border-[#D4A574] text-[#2C2416] hover:bg-[#F5F2ED] px-8 py-6 text-base rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#D4C5B5] border-opacity-40">
              <div>
                <p className="text-2xl font-bold text-[#2C2416]">500+</p>
                <p className="text-sm text-[#8B7355]">Courses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C2416]">50K+</p>
                <p className="text-sm text-[#8B7355]">Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C2416]">98%</p>
                <p className="text-sm text-[#8B7355]">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Right side - Hero image/cards section */}
          <div ref={cardContainerRef} className="relative h-96 sm:h-full sm:min-h-96">
            {/* Main card - featured course */}
            <div
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardHoverOut}
              className="absolute inset-0 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 sm:p-8 backdrop-blur-sm bg-opacity-95 border border-[#D4C5B5] border-opacity-30"
            >
              {/* Decorative corner accent - Indian inspired */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#D4A574] to-transparent opacity-10 rounded-bl-3xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[#8B7355] to-transparent opacity-10 rounded-tr-3xl"></div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Card header */}
                <div>
                  <div className="inline-block px-4 py-2 rounded-full bg-[#FBF9F5] border border-[#D4A574] border-opacity-50 mb-4">
                    <span className="text-xs font-semibold text-[#8B7355] tracking-wide">FEATURED COURSE</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#2C2416] mb-2">Art of Teaching</h3>
                  <p className="text-[#8B7355] text-sm">Master the timeless techniques of effective instruction</p>
                </div>

                {/* Featured image placeholder with pattern */}
                <div className="my-6 relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-[#F5F2ED] to-[#D4C5B5]">
                  <div className="absolute inset-0 opacity-20 mandala-pattern"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-[#8B7355] border-opacity-30 rounded-full"></div>
                  </div>
                </div>

                {/* Card footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[#D4C5B5] border-opacity-30">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#D4A574] border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-[#8B7355] border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-[#D4C5B5] border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-medium text-[#8B7355]">⭐ 4.9/5</span>
                </div>
              </div>
            </div>

            {/* Floating accent card - bottom right */}
            <div
              onMouseEnter={handleCardHover}
              onMouseLeave={handleCardHoverOut}
              className="absolute bottom-0 right-0 w-40 h-32 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-[#D4C5B5] border-opacity-30 transform translate-y-8 translate-x-4"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <p className="text-xs font-semibold text-[#8B7355] tracking-wide">NEW BATCH</p>
                <div>
                  <p className="text-2xl font-bold text-[#2C2416]">Jan 2025</p>
                  <p className="text-xs text-[#8B7355]">Starting Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-[#8B7355] font-medium">Scroll to explore</span>
          <div className="w-1 h-6 border-l-2 border-[#8B7355] opacity-60"></div>
        </div>
      </div>
    </div>
  );
}
