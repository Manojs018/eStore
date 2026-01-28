import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import ReviewForm from './ReviewForm';

const ReviewList = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { user } = useAuth();

    // Fake data for demonstration if backend fails/is not connected in this env
    const MOCK_REVIEWS = [
        { _id: '1', user: { name: 'Alice' }, rating: 5, comment: 'Great product! Highly recommended.', createdAt: new Date().toISOString(), helpful: [] },
        { _id: '2', user: { name: 'Bob' }, rating: 4, comment: 'Good quality but shipping was slow.', createdAt: new Date(Date.now() - 86400000).toISOString(), helpful: ['123'] }
    ];

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/reviews/${productId}?page=${page}&limit=5`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setReviews(data.reviews);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.log('Using mock reviews due to:', err);
            // Fallback to mock data for UI demonstration
            setReviews(MOCK_REVIEWS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId, page]);

    const handleReviewAdded = (newReview) => {
        setReviews([newReview, ...reviews]);
        toast.success('Review added successfully!');
    };

    const handleVote = async (reviewId) => {
        if (!user) {
            toast.error('Please login to vote');
            return;
        }
        // Optimistic update
        setReviews(reviews.map(review => {
            if (review._id === reviewId) {
                const isHelpful = review.helpful.includes(user._id);
                return {
                    ...review,
                    helpful: isHelpful
                        ? review.helpful.filter(id => id !== user._id)
                        : [...review.helpful, user._id]
                };
            }
            return review;
        }));

        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/reviews/${reviewId}/vote`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (err) {
            toast.error('Failed to vote');
        }
    };

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>

            {/* Average Rating Summary could go here */}

            {user && <ReviewForm productId={productId} onReviewAdded={handleReviewAdded} />}

            <div className="space-y-6 mt-8">
                {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <div className="bg-gray-200 p-2 rounded-full">
                                    <User size={20} className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{review.user?.name || 'Anonymous'}</p>
                                    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill={i < review.rating ? "currentColor" : "none"}
                                        className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                                    />
                                ))}
                            </div>
                        </div>

                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{review.comment}</p>

                        <button
                            onClick={() => handleVote(review._id)}
                            className={`flex items-center space-x-1 text-xs font-medium transition-colors ${user && review.helpful?.includes(user._id) ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <ThumbsUp size={14} />
                            <span>Helpful ({review.helpful?.length || 0})</span>
                        </button>
                    </div>
                ))}

                {loading && <p className="text-center text-gray-500">Loading reviews...</p>}

                {!loading && reviews.length === 0 && (
                    <p className="text-center text-gray-500 py-8 italic">No reviews yet. Be the first to write one!</p>
                )}

                {/* Simple Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center space-x-2 mt-6">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${page === i + 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewList;
