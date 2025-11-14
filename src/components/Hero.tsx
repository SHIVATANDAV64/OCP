import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const textParent = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const textChild = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.85, ease: [0.23, 1, 0.32, 1] },
  },
};

const statVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] },
  },
};

const stats = [
  { label: 'Courses', value: '60+' },
  { label: 'Students', value: '2,000+' },
  { label: 'Completion Rate', value: '94%' },
];

export default function Hero() {
  const navigate = useNavigate();
  const chips = ['Individual intake calls', 'Small pods (6 people max)', 'Weekly critiques'];

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative w-full min-h-screen bg-gradient-to-br from-[#FAF8F3] via-[#F8F1E8] to-[#F4E8DE] overflow-hidden pt-5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none will-change-auto">
          <div className="absolute inset-0 paper-texture opacity-50"></div>
          <div className="absolute inset-0 watercolor-noise opacity-35"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FBF9F5] to-[#F5F2ED] opacity-30 floating-soft"></div>
        </div>

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28 flex flex-col justify-center will-change-transform">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.618fr] gap-14 items-center">
            <m.div
              className="space-y-8"
              variants={textParent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <m.div className="space-y-4" variants={textChild}>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-[#2C2416] leading-tight">
                  Learn at your own pace. Build something real.
                </h1>
              </m.div>

              <m.div className="space-y-4" variants={textChild}>
                <div className="w-16 h-1 bg-gradient-to-r from-[#D4A574] to-[#8B7355]"></div>
                <p className="text-lg text-[#5C5C5C] max-w-lg leading-relaxed">
                  Online courses taught by people who actually do the work—developers, designers, and strategists who are still in the field.
                </p>
              </m.div>

              <m.div className="flex flex-col sm:flex-row gap-4 pt-4" variants={textChild}>
                <Button
                  onClick={() => navigate('/courses')}
                  className="bg-[#2C2416] hover:bg-[#1a1410] text-white px-8 py-6 text-base rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group"
                >
                  Browse Courses
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-2 border-[#D4A574] text-[#2C2416] hover:bg-[#F5F2ED] px-8 py-6 text-base rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  See How It Works
                </Button>
              </m.div>

              <m.div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#D4C5B5] border-opacity-40" variants={textChild}>
                {stats.map((stat) => (
                  <m.div key={stat.label} variants={statVariant}>
                    <p className="text-2xl font-bold text-[#2C2416]">{stat.value}</p>
                    <p className="text-sm text-[#8B7355]">{stat.label}</p>
                  </m.div>
                ))}
              </m.div>

              <m.div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-[#8B7355]/70" variants={textChild}>
                {chips.map((chip) => (
                  <span key={chip} className="px-4 py-2 rounded-full border border-[#D4C5B5]/60 bg-white/60 backdrop-blur">
                    {chip}
                  </span>
                ))}
              </m.div>
            </m.div>

            <div className="relative h-[32rem] flex items-center justify-center">
              <div className="absolute inset-0 golden-grid-overlay opacity-30 pointer-events-none"></div>
              <div className="absolute -inset-10 bg-gradient-to-br from-[#FDF2E9] via-[#F8E0C9] to-[#F2ECE4] blur-3xl opacity-60"></div>
              <div className="relative w-full max-w-md space-y-6">
                <m.div
                  className="hero-glass-card relative rounded-[32px] border border-white/40 bg-white/70 backdrop-blur-[16px] p-8 shadow-[0_25px_70px_rgba(44,36,22,0.12)] tint-hover"
                  variants={cardVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#8B7355]/70">
                    <span>Current Sprint</span>
                    <span>Week 03</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-[#2C2416]">Research to Prototype</h3>
                  <p className="mt-2 text-sm text-[#5C5C5C]">
                    Work with a small group and a mentor. Build, test, iterate.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-[#2C2416]">
                    <div className="rounded-2xl border border-white/40 bg-white/60 p-4">
                      <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355]/70">Live Sessions</p>
                      <p className="text-2xl font-semibold">Thursday</p>
                      <p className="text-xs text-[#8B7355]">90 min feedback sessions</p>
                    </div>
                    <div className="rounded-2xl border border-white/40 bg-white/60 p-4">
                      <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355]/70">Async Work</p>
                      <p className="text-2xl font-semibold">12 hrs</p>
                      <p className="text-xs text-[#8B7355]">Guided project time</p>
                    </div>
                  </div>
                </m.div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Learner Feedback',
                      value: '4.9/5',
                      body: 'Last sprint average',
                      footer: 'Mentors reviewing work',
                    },
                    {
                      title: 'Mentors Available',
                      value: '14',
                      body: 'Active mentors reviewing work now.',
                      footer: 'Rotating critique roster',
                    },
                  ].map((card) => (
                    <m.div
                      key={card.title}
                      className="hero-glass-card rounded-[28px] border border-white/80 bg-white/80 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(44,36,22,0.08)] flex flex-col gap-4 tint-hover"
                      variants={cardVariant}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355]/70">{card.title}</p>
                      <p className="text-3xl font-semibold text-[#2C2416]">{card.value}</p>
                      <p className="text-sm text-[#5C5C5C] flex-1">{card.body}</p>
                      <p className="text-xs text-[#8B7355]">{card.footer}</p>
                    </m.div>
                  ))}
                </div>

                <m.div
                  className="absolute -left-10 -bottom-6 hidden xl:flex items-center gap-3 rounded-full border border-white/40 bg-white/70 backdrop-blur-xl px-5 py-3 text-sm text-[#2C2416] shadow-[0_15px_40px_rgba(44,36,22,0.08)]"
                  variants={cardVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <div className="h-10 w-10 rounded-full bg-[#2C2416] text-white flex items-center justify-center text-xs font-semibold">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium">Practical projects</p>
                    <p className="text-xs text-[#8B7355]">Build real skills</p>
                  </div>
                </m.div>
              </div>
            </div>
          </div>
        </div>

        <m.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-[#8B7355] font-medium">Scroll to explore</span>
            <div className="w-1 h-6 border-l-2 border-[#8B7355] opacity-60"></div>
          </div>
        </m.div>
      </section>
    </LazyMotion>
  );
}
