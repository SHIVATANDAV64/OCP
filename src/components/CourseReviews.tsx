import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Star, ThumbsUp } from 'lucide-react';
import { reviewService, Review } from '@/services/reviewService';
import { authService } from '@/lib/appwrite';
import { toast } from 'sonner';

interface CourseReviewsProps {
  courseId: string;
}

export default function CourseReviews({ courseId }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      const courseReviews = await reviewService.getCourseReviews(courseId);
      setReviews(courseReviews);

      const ratingStats = await reviewService.getCourseRatingStats(courseId);
      setStats(ratingStats);

      if (user) {
        const existingReview = await reviewService.getUserReview(user.$id, courseId);
        if (existingReview) {
          setUserReview(existingReview);
          setRating(existingReview.rating);
          setComment(existingReview.comment);
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please login to leave a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      if (userReview) {
        await reviewService.updateReview(userReview.id, rating, comment);
        toast.success('Review updated successfully');
      } else {
        await reviewService.createReview(currentUser.$id, courseId, currentUser.name, rating, comment);
        toast.success('Review submitted successfully');
      }

      loadData();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewService.markHelpful(reviewId);
      loadData();
      toast.success('Marked as helpful');
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${interactive ? 'cursor-pointer' : ''} ${
              star <= (interactive ? (hoveredRating || rating) : count)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Course Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">{stats.average.toFixed(1)}</div>
              <div className="flex justify-center mb-2">{renderStars(Math.round(stats.average))}</div>
              <p className="text-sm text-gray-600">{stats.total} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-12">{star} stars</span>
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write/Edit Review */}
      {currentUser && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">
              {userReview ? 'Edit Your Review' : 'Write a Review'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                {renderStars(rating, true)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this course..."
                  rows={4}
                  minLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{comment.length} characters (minimum 10)</p>
              </div>

              <Button type="submit" disabled={isSubmitting} className="bg-gray-900 hover:bg-gray-800">
                {isSubmitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Student Reviews</h3>
        {reviews.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{review.userName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                <div className="flex items-center gap-4 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkHelpful(review.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful ({review.helpful})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
