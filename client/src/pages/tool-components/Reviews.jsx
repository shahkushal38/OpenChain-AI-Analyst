import React, { useCallback, useState } from 'react';
import { CustomButton } from '../../components';
import VerificationModal from '../tool-components/ansmodal';
import { createAttestion } from '../../eas/easCreate';
import { getAttestation } from '../../eas/getAttestation';
import { Link } from 'react-router-dom';

const Reviews = ({ reviews: reviewsFromProps, address }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [reviews, setReviews] = useState(reviewsFromProps);
  const [reviewToVerify, setReviewToVerify] = useState(null);

  const [newReview, setNewReview] = useState({
    text: '',
    rating: '',
    githubLink: '',
  });

  const verificationSteps = [
    {
      title: 'Review Attestation',
      description: 'AI Based validation of Review',
      icon: null,
    },
    {
      title: 'Final Approval',
      description: 'Complete transaction for Review Submission',
      icon: null,
    },
  ];

  const handleAddReview = async () => {
    // Existing validation logic
    if (!newReview.text.trim()) {
      alert('Please enter a review text');
      return;
    }

    const ratingNum = parseFloat(newReview.rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
      alert('Please enter a valid rating between 0 and 10');
      return;
    }

    if (
      newReview.githubLink &&
      !newReview.githubLink.startsWith('https://github.com/')
    ) {
      alert('Please enter a valid GitHub URL');
      return;
    }

    const reviewToAdd = {
      address: address || '0x000...000',
      toolName: 'Node',
      githubURL: newReview.githubLink,
      text: newReview.text,
      rating: newReview.rating,
    };

    setReviewToVerify(reviewToAdd);
    setShowVerificationModal(true);
  };

  const handleSaveReview = (review) => {
    // In a real app, you would save the review to your backend/contract
    console.log('Review saved:', review);

    // Close the modal
    setShowVerificationModal(false);
  };

  const handleRatingChange = (e) => {
    const value = e.target.value;
    // Allow empty string or numbers with up to 1 decimal place
    if (value === '' || /^\d*\.?\d{0,1}$/.test(value)) {
      setNewReview((prev) => ({ ...prev, rating: value }));
    }
  };

  const handleCLoseVerificationModal = useCallback((transaction) => {
    console.log('Transaction - ', transaction);

    setReviews((curr) => [reviewToVerify, ...curr]); //based on transaction
    setShowVerificationModal(false);
    setNewReview({ text: '', rating: '', githubLink: '' });
    setShowReviewForm(false);
  });

  const handleGetAttestation = useCallback(async (ev, attestUID) => {
    ev.preventDefault();
    const attestation = await getAttestation(attestUID);

    if (attestation) {
      console.log('attestation-', attestation);
    }
  }, []);

  return (
    <div className="bg-[#1c1c24] p-6 rounded-[10px]">
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={handleCLoseVerificationModal}
        // onSave={handleSaveReview}
        verificationSteps={verificationSteps}
        reviewData={reviewToVerify}
      />

      <div className="flex justify-between items-center mb-6">
        <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">
          User Reviews
        </h4>
        <CustomButton
          btnType="button"
          title="Add Review"
          styles="bg-[#8c6dfd] text-white py-2 px-4"
          handleClick={() => setShowReviewForm(!showReviewForm)}
        />
      </div>

      {showReviewForm && (
        <div className="bg-[#13131a] rounded-[10px] p-6 mb-6 shadow-lg">
          <textarea
            className="w-full bg-[#1c1c24] text-white p-4 rounded-[10px] mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#8c6dfd]"
            placeholder="Write your review here..."
            value={newReview.text}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, text: e.target.value }))
            }
            rows="4"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 text-[14px]">
                Rating
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  className="bg-[#1c1c24] text-white p-2 rounded-lg w-24"
                  placeholder="rating"
                  value={newReview.rating}
                  onChange={handleRatingChange}
                />
                <span className="ml-2 text-[#4acd8d]">/10</span>
              </div>
            </div>
            <div>
              <label className="block text-white mb-2 text-[14px]">
                GitHub Link
              </label>
              <input
                type="url"
                className="w-full bg-[#1c1c24] text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c6dfd]"
                placeholder="https://github.com/username/repo"
                value={newReview.githubLink}
                onChange={(e) =>
                  setNewReview((prev) => ({
                    ...prev,
                    githubLink: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <CustomButton
            btnType="button"
            title="Submit Review"
            styles="w-full mt-4 bg-[#8c6dfd] text-white py-3"
            handleClick={handleAddReview}
          />
        </div>
      )}

      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-[#13131a] rounded-[10px] p-6 border border-[#3a3a43]"
          >
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={review.userLogo}
                alt="user"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#8c6dfd]"
              />
              <div>
                <h5 className="font-epilogue font-semibold text-[16px] text-white">
                  {review.userId}
                </h5>
                {review.githubLink && (
                  <a
                    href={review.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4acd8d] hover:underline text-[14px]"
                  >
                    View GitHub
                  </a>
                )}
              </div>
            </div>
            <p className="text-[#808191] mb-4">{review.text}</p>
            <div className="flex justify-between items-center border-t border-[#3a3a43] pt-4">
              <div className="flex space-x-4">
                <div>
                  <span className="text-white mr-2 text-[14px]">Rating:</span>
                  <span className="text-[#4acd8d]">{review.rating}/5.0</span>
                </div>
                <div>
                  <span className="text-white mr-2 text-[14px]">
                    Attestation:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-[12px] ${
                      review.attestation
                        ? 'bg-[#4acd8d] text-white'
                        : 'bg-[#3a3a43] text-[#808191]'
                    }`}
                  >
                    <Link
                      onClick={(ev) =>
                        handleGetAttestation(ev, review.attestation)
                      }
                    >
                      {review.attestation}
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
