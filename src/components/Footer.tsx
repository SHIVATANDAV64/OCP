import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import githubIcon from '@/assets/icons/github.svg';
import instagramIcon from '@/assets/icons/instagram.svg';
import linkedinIcon from '@/assets/icons/linkedin.svg';

const navLinks = [
  { label: 'Courses', href: '/courses' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Support', href: '/auth' },
  { label: 'Updates', href: '/notifications' },
];

const socials = [
  { icon: instagramIcon, label: 'Instagram', url: 'https://www.instagram.com/shiva_tandav_64/' },
  { icon: githubIcon, label: 'GitHub', url: 'https://github.com/SHIVATANDAV64' },
  { icon: linkedinIcon, label: 'LinkedIn', url: 'https://www.linkedin.com/in/venkatreddy64/' },
];

export default function Footer() {
  return (
    <footer className="relative mt-2 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2c2416] via-[#352b1f] to-[#1a1410]"></div>
      <div className="absolute inset-0 golden-grid-overlay opacity-10"></div>
      <div className="absolute inset-0 footer-grid-mask opacity-30"></div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.7fr_0.8fr] items-start">
          <div className="space-y-6">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-white/60">LearnHub</p>
              <h3 className="text-3xl font-semibold">Practical online courses. Taught by people who do the work.</h3>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-white/60 mb-4">Navigation</p>
            <div className="grid grid-cols-2 gap-y-3 text-white/80">
              {navLinks.map((item) => (
                <Link key={item.href} to={item.href} className="flex items-center gap-2 hover:text-white">
                  {item.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold tracking-[0.2em] uppercase text-white/60">Keep in touch</p>
            <div className="space-y-3 text-white/80">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                <span>rudrashiva654@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5" />
                <span>+91 81054 38667</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white/70">Quarterly updates about new cohorts and courses.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input type="email" placeholder="Email" className="bg-white/10 border-white/25 text-white placeholder:text-white/40" />
                <Button className="bg-white text-[#2C2416] hover:bg-[#F5F2ED] rounded-full">Notify me</Button>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              {socials.map(({ icon, label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-10 w-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-all duration-300 hover:scale-110"
                >
                  <img src={icon} alt={label} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-white/15 pt-6 text-sm text-white/70">
          <p>© {new Date().getFullYear()} LearnHub. Built for learners.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/about" className="hover:text-white">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
