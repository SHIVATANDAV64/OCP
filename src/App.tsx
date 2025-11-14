import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageSurface from './components/PageSurface';
import Index from './pages/Index';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import CreateCourse from './pages/CreateCourse';
import LessonView from './pages/LessonView';
import PaymentSuccess from './pages/PaymentSuccess';
import Certificate from '@/pages/Certificate';
import Profile from '@/pages/Profile';
import InstructorAnalytics from '@/pages/InstructorAnalytics';
import Notifications from '@/pages/Notifications';
import NotFound from './pages/NotFound';
import '@/styles/hero.css';

const queryClient = new QueryClient();

const withSurface = (node: React.ReactNode) => <PageSurface>{node}</PageSurface>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Navbar />
      <Routes className="pt-24">
        <Route path="/" element={<Index />} />
        <Route path="/courses" element={withSurface(<Courses />)} />
        <Route path="/course/:id" element={withSurface(<CourseDetail />)} />
        <Route path="/course/:courseId/lesson/:lessonId" element={withSurface(<LessonView />)} />
        <Route path="/auth" element={withSurface(<Auth />)} />
        <Route path="/dashboard" element={withSurface(<Dashboard />)} />
        <Route path="/create-course" element={withSurface(<CreateCourse />)} />
        <Route path="/quiz/:courseId" element={withSurface(<Quiz />)} />
        <Route path="/payment-success" element={withSurface(<PaymentSuccess />)} />
        <Route path="/certificate/:certificateId" element={withSurface(<Certificate />)} />
        <Route path="/profile" element={withSurface(<Profile />)} />
        <Route path="/notifications" element={withSurface(<Notifications />)} />
        <Route path="/instructor/analytics" element={withSurface(<InstructorAnalytics />)} />
        <Route path="*" element={withSurface(<NotFound />)} />
      </Routes>
      <Footer />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;