import { dbService, ID, Query } from '@/lib/appwrite';
import { config } from '@/lib/config';



export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  userName: string;
  instructorName: string;
  completedAt: string;
  certificateNumber: string;
}

export const certificateService = {
  /**
   * Generate a certificate for a completed course
   */
  async generateCertificate(
    userId: string,
    courseId: string,
    courseName: string,
    userName: string,
    instructorName: string
  ): Promise<Certificate> {
    const certificateData: any = {
      userId,
      courseId,
      courseName,
      userName,
      instructorName,
      completedAt: new Date().toISOString(),
      certificateNumber: `CERT-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    };

    // Create certificate in Appwrite
    const certificate = await dbService.createDocument('certificates', certificateData);
    return certificate as unknown as Certificate;
  },

  /**
   * Get a certificate by ID
   */
  async getCertificate(certificateId: string): Promise<Certificate | null> {
    try {
      const certificate = await dbService.getDocument('certificates', certificateId);
      return certificate as unknown as Certificate;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      return null;
    }
  },

  /**
   * Get all certificates for a user
   */
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      const response = await dbService.listDocuments('certificates', [Query.equal('userId', userId)]);
      return response.documents as unknown as Certificate[];
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      return [];
    }
  },

  /**
   * Check if a certificate exists for a user and course
   */
  async hasCertificate(userId: string, courseId: string): Promise<boolean> {
    try {
      const response = await dbService.listDocuments('certificates', [
        Query.equal('userId', userId),
        Query.equal('courseId', courseId),
      ]);
      return response.documents.length > 0;
    } catch (error) {
      console.error('Error checking certificate:', error);
      return false;
    }
  },

  /**
   * Verify a certificate by certificate number
   */
  async verifyCertificate(certificateNumber: string): Promise<Certificate | null> {
    try {
      const response = await dbService.listDocuments('certificates', [
        Query.equal('certificateNumber', certificateNumber),
      ]);

      if (response.documents.length > 0) {
        return response.documents[0] as unknown as Certificate;
      }

      return null;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return null;
    }
  },
};

export default certificateService;
