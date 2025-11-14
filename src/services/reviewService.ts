import { dbService, ID, COLLECTIONS, Query } from '@/lib/appwrite';

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export const reviewService = {
  /**
   * Create a review for a course
   */
  async createReview(
    userId: string,
    courseId: string,
    userName: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    const reviewData: Omit<Review, 'id'> = {
      userId,
      courseId,
      userName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      helpful: 0,
    };

    const review = await dbService.createDocument(COLLECTIONS.REVIEWS, reviewData);
    
    // Update course average rating
    await this.updateCourseRating(courseId);
    
    return review as unknown as Review;
  },

  /**
   * Get all reviews for a course
   */
  async getCourseReviews(courseId: string, limit = 10, offset = 0): Promise<Review[]> {
    try {
      const response = await dbService.listDocuments(COLLECTIONS.REVIEWS, [
        Query.equal('courseId', [courseId]),
        Query.limit(limit),
        Query.offset(offset),
      ]);
      
      return response.documents as unknown as Review[];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  /**
   * Get user's review for a course
   */
  async getUserReview(userId: string, courseId: string): Promise<Review | null> {
    try {
      const response = await dbService.listDocuments(COLLECTIONS.REVIEWS, [
        Query.equal('userId', [userId]),
        Query.equal('courseId', [courseId]),
      ]);

      return response.documents.length > 0 ? (response.documents[0] as unknown as Review) : null;
    } catch (error) {
      console.error('Error fetching user review:', error);
      return null;
    }
  },

  /**
   * Update a review
   */
  async updateReview(reviewId: string, rating: number, comment: string): Promise<void> {
    try {
      await dbService.updateDocument(COLLECTIONS.REVIEWS, reviewId, {
        rating,
        comment,
      });
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string, courseId: string): Promise<void> {
    try {
      await dbService.deleteDocument(COLLECTIONS.REVIEWS, reviewId);
      
      // Update course average rating
      await this.updateCourseRating(courseId);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<void> {
    try {
      const review = await dbService.getDocument(COLLECTIONS.REVIEWS, reviewId);
      await dbService.updateDocument(COLLECTIONS.REVIEWS, reviewId, {
        helpful: (review.helpful || 0) + 1,
      });
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  },

  /**
   * Calculate and update course average rating
   */
  async updateCourseRating(courseId: string): Promise<void> {
    try {
      const reviews = await this.getCourseReviews(courseId, 1000);
      
      if (reviews.length === 0) {
        return;
      }

      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await dbService.updateDocument(COLLECTIONS.COURSES, courseId, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: reviews.length,
      });
    } catch (error) {
      console.error('Error updating course rating:', error);
    }
  },

  /**
   * Get course rating statistics
   */
  async getCourseRatingStats(courseId: string): Promise<{
    average: number;
    total: number;
    distribution: { [key: number]: number };
  }> {
    try {
      const reviews = await this.getCourseReviews(courseId, 1000);
      
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach((review) => {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      });

      const average = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      return {
        average: Math.round(average * 10) / 10,
        total: reviews.length,
        distribution,
      };
    } catch (error) {
      console.error('Error getting rating stats:', error);
      return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }
  },
};

export default reviewService;
