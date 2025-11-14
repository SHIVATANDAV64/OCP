import { Button } from '@/components/ui/button';
import { ArrowUpRight, Award, Feather, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Hero from '../components/Hero';

const featuredCourses = [
  {
    id: 1,
    title: 'Modern Frontend Systems',
    instructor: 'Aditi Raman',
    students: 1280,
    rating: 4.9,
    price: '$58',
    description: 'Pair code architecture reviews with live build sessions every week. No templates, just practical craft.',
    duration: '6-week sprint',
    level: 'Advanced',
    palette: 'from-[#FDF2E9] via-[#F8E0C9] to-[#F7D3B0]',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Data Narratives with Python',
    instructor: 'Kenji Morita',
    students: 940,
    rating: 4.8,
    price: '$64',
    description: 'Craft evidence-backed stories by blending statistics, notebooks, and editorial thinking.',
    duration: '4-week studio',
    level: 'Intermediate',
    palette: 'from-[#F6F1FF] via-[#E5DAFF] to-[#D7C2FF]',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Human-centered Product Strategy',
    instructor: 'Rhea Gupta',
    students: 760,
    rating: 4.95,
    price: '$72',
    description: 'Weekly salons dissect working PM docs, interview clips, and playbooks from live products.',
    duration: '5-week lab',
    level: 'All levels',
    palette: 'from-[#E8F6F2] via-[#CFEDE3] to-[#B8E6D5]',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&auto=format&fit=crop',
  },
];

const whyChoose = [
  {
    title: 'Taught by practitioners',
    description: 'Every course is built and taught by people actively working in the field—not outdated curriculum.',
    meta: 'Real-world expertise',
    icon: Feather,
  },
  {
    title: 'Small cohorts',
    description: 'We cap sessions at 24 students so you get real feedback, not generic comments.',
    meta: 'Personalized attention',
    icon: Users,
  },
  {
    title: 'Real outcomes',
    description: 'Students finish with portfolio work, case studies, and mentor introductions—tracked transparently.',
    meta: 'Verified results',
    icon: Award,
  },
  {
    title: 'Sustainable pacing',
    description: 'Courses are designed with rest built in. Deep work, then breaks—no hustle culture.',
    meta: 'Balanced learning',
    icon: TrendingUp,
  },
];

const guidePosts = [
  'Guided lines mirror the 1.618 grid we sketch with every syllabus.',
  'Glass cards keep the interface quiet so the content stays front-and-center.',
  'Copy is conversational—written by the same editors who craft the programs.',
];

const storyBeats = [
  {
    label: 'Intake',
    title: 'Start with a conversation.',
    description:
      'We ask what you want to build and where you\'re stuck. No automated emails—just real conversations.',
    artifact: 'Individual intake calls',
    deliverable: 'Personalized learning plan within 48 hours',
  },
  {
    label: 'Studio Weeks',
    title: 'Join a small group. Build together.',
    description:
      'Work in pods of 6 with a dedicated mentor. Weekly check-ins, live feedback, and real accountability.',
    artifact: 'Small pods (6 people max)',
    deliverable: 'Weekly critiques and walkthroughs',
  },
  {
    label: 'Progress Updates',
    title: 'Track what matters.',
    description:
      'Every week, we share progress updates—what you shipped, what you learned, what\'s next.',
    artifact: 'Weekly progress notes',
    deliverable: 'Real work, not vanity metrics',
  },
  {
    label: 'Ship Your Work',
    title: 'Launch with support.',
    description:
      'Finish with a portfolio piece, personalized feedback, and warm introductions to the right people.',
    artifact: 'Portfolio-ready projects',
    deliverable: 'Mentor-backed recommendations',
  },
];

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8F3] via-[#F8F1E8] to-[#F5ECDE] will-change-auto">
      <Hero />

      {/* Narrative arc */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none golden-grid-overlay opacity-10"></div>
        <div className="absolute inset-6 rounded-[48px] border border-white/40 bg-white/30 backdrop-blur-xl opacity-30"></div>
        <div className="relative max-w-6xl mx-auto grid gap-12 lg:grid-cols-[0.85fr,1.15fr] items-start">
          <div className="space-y-6">
            <p className="text-xs tracking-[0.3em] text-[#8B7355] uppercase">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-semibold text-[#2C2416] leading-tight">
              How it works—from start to finish.
            </h2>
            <p className="text-base text-[#5C5C5C] max-w-xl">
              Every cohort follows a clear path: understand the problem, build solutions, get feedback, ship your work.
            </p>
            <div className="rounded-[32px] border border-white/50 bg-white/60 backdrop-blur p-6 shadow-[0_20px_50px_rgba(44,36,22,0.08)] space-y-4">
              <p className="text-lg text-[#2C2416]">“It feels like stepping into a studio documentary. You see the beats, the pauses, the tiny wins—and that story keeps you moving.”</p>
              <p className="text-sm text-[#8B7355]">— Amrita, Product strategist & cohort alum</p>
            </div>
          </div>
          <div className="space-y-6">
            {storyBeats.map((beat, index) => (
              <div
                key={beat.label}
                className="group relative rounded-[28px] border border-white/70 bg-white/70 backdrop-blur-2xl p-6 lg:p-7 shadow-[0_20px_60px_rgba(44,36,22,0.08)] tint-hover"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-[#8B7355]/70 mb-4">
                  <span>{beat.label}</span>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-2xl font-semibold text-[#2C2416] mb-3">{beat.title}</h3>
                <p className="text-sm text-[#5C5C5C] leading-relaxed">{beat.description}</p>
                <div className="flex flex-wrap gap-3 pt-5 text-xs uppercase tracking-[0.3em] text-[#8B7355]/70">
                  <span className="px-4 py-2 rounded-full border border-white/50 bg-white/40">{beat.artifact}</span>
                  <span className="px-4 py-2 rounded-full border border-white/50 bg-white/40">{beat.deliverable}</span>
                </div>
                <div className="absolute inset-0 border border-transparent group-hover:border-[#D4A574]/40 rounded-[28px] pointer-events-none transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses, glass cards, golden ratio grid */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-50 pointer-events-none golden-grid-overlay"></div>
        <div className="relative max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs tracking-[0.3em] text-[#8B7355] uppercase">Featured Courses</p>
              <h2 className="text-4xl md:text-5xl font-semibold text-[#2C2416] leading-tight">
                Courses built for real outcomes.
              </h2>
              <p className="text-base text-[#5C5C5C]">
                Taught by working professionals. Small cohorts. Practical projects you can ship.
              </p>
            </div>
            <div className="flex gap-8 text-sm text-[#5C5C5C]">
              <div className="text-right">
                <p className="text-4xl font-semibold text-[#2C2416]">92%</p>
                <p>complete every cohort they start.</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-semibold text-[#2C2416]">38 hrs</p>
                <p>average time to first project handoff.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <article
                key={course.id}
                className="group relative rounded-[32px] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_25px_70px_rgba(44,36,22,0.08)] overflow-hidden tint-hover hover:border-white/80 transition-all"
              >
                {/* Image section with better overlay */}
                <div className="relative aspect-[1.618/1] w-full overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content section with improved spacing */}
                <div className="p-7 flex flex-col gap-5">
                  {/* Duration and level badges */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-3 py-1.5 rounded-full bg-[#FBF9F5]/80 text-xs uppercase tracking-[0.3em] text-[#8B7355] font-semibold border border-[#D4A574]/30">
                      {course.duration}
                    </span>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#8B7355]/70 font-medium">{course.level}</span>
                  </div>

                  {/* Title and description */}
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-semibold text-[#2C2416] leading-tight group-hover:text-[#D4A574] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-[#5C5C5C] leading-relaxed line-clamp-2">{course.description}</p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-[#D4A574]/40 via-[#D4A574]/20 to-transparent"></div>

                  {/* Footer with instructor and price */}
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#8B7355] uppercase tracking-[0.2em] mb-1">Instructor</p>
                      <p className="text-sm font-medium text-[#2C2416] mb-1.5">{course.instructor}</p>
                      <div className="flex items-center gap-3 text-xs text-[#8B7355]">
                        <span>👥 {course.students}</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="rounded-full bg-[#2C2416] text-white hover:bg-[#1a1410] px-6 py-2.5 font-medium"
                    >
                      {course.price}
                    </Button>
                  </div>
                </div>

                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-700 pointer-events-none"></div>
              </article>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-white/40 rounded-[32px] bg-white/30 backdrop-blur-xl p-8 tint-hover">
            <div>
              <p className="text-xs tracking-[0.3em] text-[#8B7355] uppercase">Program Guide</p>
              <p className="text-lg text-[#2C2416]">Weekly welcome calls help you pick the cohort that matches your energy and calendar.</p>
            </div>
            <Button
              onClick={() => navigate('/courses')}
              className="px-8 py-6 bg-[#D4A574] hover:bg-[#8B7355] text-white rounded-full shadow-lg"
            >
              View full catalog
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us – human curated copy with glass tiles */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-[#FBF9F5] via-[#F8F0E8] to-[#F5E8DE] overflow-hidden">
        <div className="absolute inset-6 rounded-[48px] border border-white/40 bg-white/10 backdrop-blur-[2px] pointer-events-none golden-grid-overlay"></div>
        <div className="relative max-w-7xl mx-auto grid gap-12 lg:grid-cols-[0.618fr,1fr] items-start">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs tracking-[0.3em] text-[#8B7355] uppercase">Why choose us</p>
              <h2 className="text-4xl md:text-5xl font-semibold text-[#2C2416] leading-tight">
                Real teachers. Small groups. Honest feedback.
              </h2>
              <p className="text-base text-[#5C5C5C] max-w-xl">
                We interview past students, update course content regularly, and keep cohorts small so everyone gets attention.
              </p>
            </div>
            <div className="space-y-4">
              {guidePosts.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#D4A574]"></div>
                  <p className="text-sm text-[#5C5C5C]">{item}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div>
                <p className="text-3xl font-semibold text-[#2C2416]">48</p>
                <p className="text-sm text-[#8B7355]">Editors + instructors on retainer.</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#2C2416]">312</p>
                <p className="text-sm text-[#8B7355]">Documented playbooks shared with learners.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {whyChoose.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-2xl overflow-hidden shadow-[0_20px_60px_rgba(44,36,22,0.08)] tint-hover hover:border-[#D4A574]/50 transition-all"
                >
                  {/* Icon section with accent background */}
                  <div className="p-8 pb-6 bg-gradient-to-br from-[#FBF9F5] to-[#F5F0E8] border-b border-white/40 group-hover:from-[#F8F1E8] group-hover:to-[#EDE3D8] transition-all">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-4 rounded-2xl bg-[#2C2416] text-white group-hover:shadow-[0_10px_30px_rgba(44,36,22,0.25)] transition-shadow">
                        <Icon className="w-6 h-6" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-[#D4A574] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </div>
                    <h3 className="text-2xl font-semibold text-[#2C2416] leading-tight">{item.title}</h3>
                  </div>

                  {/* Content section */}
                  <div className="p-8 pt-6 flex flex-col gap-4">
                    <p className="text-base text-[#5C5C5C] leading-relaxed">{item.description}</p>
                    <p className="text-xs tracking-[0.35em] uppercase text-[#8B7355]/70 font-semibold pt-2 border-t border-white/40">{item.meta}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-4 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C2416] via-[#3d342a] to-[#2C2416] border border-white/20 rounded-[25px]"></div>
        <div className="absolute inset-0 opacity-40 golden-grid-overlay"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-semibold">Ready to start?</h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Join students building real skills, not chasing certificates. We'll send you a personal welcome—no automated drip campaigns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/courses')}
              size="lg"
              className="bg-white text-[#2C2416] hover:bg-[#F5F2ED] px-10 py-6 rounded-full"
            >
              Explore Courses
            </Button>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              variant="outline"
              className="border-2 border-white text-black hover:bg-white/10 hover:text-white px-10 py-6 rounded-full"
            >
              Talk to Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}