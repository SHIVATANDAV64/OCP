import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { dbService, COLLECTIONS } from '@/lib/appwrite';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  userName: string;
  completedAt: string;
  instructorName: string;
  certificateNumber: string;
}

export default function Certificate() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadCertificate = useCallback(async () => {
    try {
      if (!certificateId) {
        toast.error('Invalid certificate ID');
        setLoading(false);
        return;
      }
      
      const cert = await dbService.getDocument(COLLECTIONS.CERTIFICATES, certificateId);
      const certData = cert as Record<string, unknown>;
      setCertificate({
        id: cert.$id,
        userId: certData.userId as string,
        courseId: certData.courseId as string,
        courseName: certData.courseName as string,
        userName: certData.userName as string,
        completedAt: new Date(certData.completedAt as string).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        instructorName: certData.instructorName as string,
        certificateNumber: certData.certificateNumber as string,
      });
    } catch (error) {
      console.error('Error loading certificate:', error);
      toast.error('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  }, [certificateId]);

  useEffect(() => {
    loadCertificate();
  }, [loadCertificate]);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      toast.loading('Generating PDF...');
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`certificate-${certificate?.certificateNumber}.pdf`);
      toast.dismiss();
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download certificate');
      console.error('Download error:', error);
    }
  };

  const handleShare = async () => {
    if (!certificate) return;

    const shareText = `I just completed "${certificate.courseName}"! 🎓`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Course Certificate',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading certificate...</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-6">
          <p className="text-gray-600 mb-4">Certificate not found</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6 flex gap-4 justify-end">
          <Button onClick={handleShare} variant="outline" className="border-gray-300">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownload} className="bg-gray-900 hover:bg-gray-800">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Certificate Design */}
        <div
          ref={certificateRef}
          className="bg-white p-16 border-8 border-double border-gray-800 shadow-2xl aspect-a4"
        >
          {/* Decorative corners */}
          <div className="relative h-full flex flex-col items-center justify-between">
            {/* Header */}
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block p-4 bg-gray-100 rounded-full">
                  <svg
                    className="w-16 h-16 text-gray-900"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-5xl font-serif font-bold text-gray-900 mb-2">
                Certificate of Completion
              </h1>
              <p className="text-lg text-gray-600 italic">This is to certify that</p>
            </div>

            {/* Student Name */}
            <div className="text-center my-8">
              <h2 className="text-6xl font-serif font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-4">
                {certificate.userName}
              </h2>
              <p className="text-xl text-gray-600 mb-8">has successfully completed the course</p>
              <h3 className="text-4xl font-semibold text-gray-800 mb-8">{certificate.courseName}</h3>
              <p className="text-lg text-gray-600 mb-4">
                Completed on <span className="font-semibold">{certificate.completedAt}</span>
              </p>
            </div>

            {/* Footer */}
            <div className="w-full flex justify-between items-end">
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 px-8">
                  <p className="font-semibold text-gray-900">{certificate.instructorName}</p>
                  <p className="text-sm text-gray-600">Instructor</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Certificate No.</p>
                <p className="text-sm font-mono text-gray-700">{certificate.certificateNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This certificate verifies successful completion of the course and is valid for verification.
          </p>
        </div>
      </div>
    </div>
  );
}
