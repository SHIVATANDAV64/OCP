import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
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
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/course/:courseId/lesson/:lessonId" element={<LessonView />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/quiz/:courseId" element={<Quiz />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/certificate/:certificateId" element={<Certificate />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;