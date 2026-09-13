import { useState } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { useSubmitRating } from '../../services/api/onboarding';
import { useToast } from '../../components/ui/ToastContext';

interface AppRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppRatingModal({ isOpen, onClose }: AppRatingModalProps) {
  const { showToast } = useToast();
  const submitRatingMutation = useSubmitRating();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitRatingMutation.mutateAsync({ rating, feedback });
      setIsSubmitted(true);
      showToast('Thank you for your rating! Feedback achievement unlocked.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      showToast('Failed to submit rating.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-amber-500 fill-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Rate Y-CHAP</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={28} />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Feedback Submitted</h4>
            <p className="text-xs text-slate-500">
              Your response helps us advance student cardiovascular longevity research.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="text-center">
              <p className="text-xs text-slate-600">
                How would you rate your experience with clinical tracking and Move challenges?
              </p>

              {/* 5-Star Row */}
              <div className="mt-3 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125"
                  >
                    <Star
                      size={28}
                      className={
                        (hoverRating || rating) >= star
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optional Feedback &amp; Suggestions
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts on clinical metrics, DASH sodium scanning, or campus leaderboards..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitRatingMutation.isPending}
              className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-primary/95 disabled:opacity-50"
            >
              {submitRatingMutation.isPending ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
