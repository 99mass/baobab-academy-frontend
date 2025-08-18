/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// CourseRatingComponent.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MessageCircle,
  User,
  Trash2,
  Award,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { courseService } from '../services/courseService';
import type { CourseRating, UserRatingRequest } from '../types/course';

interface CourseRatingComponentProps {
  courseId: string;
  isEnrolled: boolean;
  isAuthenticated: boolean;
  currentRating: number;
  totalRatings: number;
  onRatingUpdate: (newRating: number) => void;
  initialShowForm?: boolean; // New prop
  onClose: () => void; // New prop for closing modal
}

const CourseRatingComponent: React.FC<CourseRatingComponentProps> = ({
  courseId,
  isEnrolled,
  isAuthenticated,
  currentRating,
  totalRatings,
  onRatingUpdate,
  initialShowForm = false, // Default to false
  onClose // Destructure onClose
}) => {
  // États du composant
  const [userRating, setUserRating] = useState<CourseRating | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(initialShowForm);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseRatings, setCourseRatings] = useState<CourseRating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [showAllRatings, setShowAllRatings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    if (isAuthenticated && isEnrolled) {
      loadUserRating();
    }
    loadCourseRatings();
  }, [courseId, isAuthenticated, isEnrolled]);

  // Charger la note de l'utilisateur connecté
  const loadUserRating = async () => {
    try {
      const response = await courseService.getUserRating(courseId);
      if (response.success && response.data) {
        setUserRating(response.data);
        setSelectedRating(response.data.rating);
        setComment(response.data.comment || '');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      // L'utilisateur n'a pas encore noté - c'est normal
      console.log('Aucune note existante pour cet utilisateur');
    }
  };

  // Charger les évaluations du cours
  const loadCourseRatings = async () => {
    try {
      setLoadingRatings(true);
      setError(null);
      const response = await courseService.getCourseRatings(
        courseId, 
        0, 
        showAllRatings ? 20 : 5
      );
      if (response.success && response.data) {
        setCourseRatings(response.data.content);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des commentaires:', error);
      setError('Impossible de charger les évaluations');
    } finally {
      setLoadingRatings(false);
    }
  };

  // Soumettre ou modifier une évaluation
  const handleSubmitRating = async () => {
    if (!selectedRating) {
      setError('Veuillez sélectionner une note');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const ratingData: UserRatingRequest = {
        rating: selectedRating,
        comment: comment.trim() || undefined
      };

      const response = await courseService.rateCourse(courseId, ratingData);
      
      if (response.success && response.data) {
        setUserRating(response.data);
        setShowRatingForm(false);
        onRatingUpdate(selectedRating);
        loadCourseRatings();
        
        // Message de succès
        setSuccessMessage(userRating ? 'Évaluation mise à jour !' : 'Merci pour votre évaluation !');
        setTimeout(() => setSuccessMessage(null), 3000);
        onClose(); // Close modal after successful submission
      }
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      setError('Erreur lors de l\'envoi de votre évaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer l'évaluation de l'utilisateur
  const handleDeleteRating = async () => {
    if (!userRating) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer votre évaluation ?')) {
      try {
        setIsSubmitting(true);
        await courseService.deleteMyRating(courseId);
        setUserRating(null);
        setSelectedRating(0);
        setComment('');
        setShowRatingForm(false);
        loadCourseRatings();
        onRatingUpdate(0);
        setSuccessMessage('Évaluation supprimée');
        setTimeout(() => setSuccessMessage(null), 3000);
        onClose(); // Close modal after successful deletion
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        setError('Erreur lors de la suppression');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setShowRatingForm(false);
    setSelectedRating(userRating?.rating || 0);
    setComment(userRating?.comment || '');
    setError(null);
    setHoveredRating(0);
    onClose(); // Close modal on cancel
  };

  // Rendu des étoiles
  const renderStars = (
    rating: number, 
    interactive = false, 
    size = 'w-5 h-5',
    onStarClick?: (rating: number) => void,
    onStarHover?: (rating: number) => void,
    onStarLeave?: () => void
  ) => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= (interactive && hoveredRating ? hoveredRating : rating);
          
          return (
            <Star
              key={index}
              className={`${size} transition-all duration-200 ${ 
                isFilled ? 'text-yellow-500 fill-current' : 'text-gray-300'
              } ${interactive ? 
                'cursor-pointer hover:text-yellow-400 hover:scale-110' : 
                ''
              }`}
              onClick={interactive && onStarClick ? () => onStarClick(starValue) : undefined}
              onMouseEnter={interactive && onStarHover ? () => onStarHover(starValue) : undefined}
              onMouseLeave={interactive && onStarLeave ? onStarLeave : undefined}
            />
          );
        })}
      </div>
    );
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  // Obtenir le texte descriptif de la note
  const getRatingText = (rating: number) => {
    const texts = {
      1: 'Très décevant',
      2: 'Décevant',
      3: 'Correct',
      4: 'Très bien',
      5: 'Excellent'
    };
    return texts[rating as keyof typeof texts] || '';
  };

  // Obtenir la couleur de la note
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  // Si l'utilisateur n'est pas connecté ou pas inscrit
  if (!isAuthenticated || !isEnrolled) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* En-tête avec note moyenne */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Évaluations</h3>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-1">
              {renderStars(currentRating)}
              <span className={`text-2xl font-bold ${getRatingColor(currentRating)}`}>
                {currentRating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500">{totalRatings} avis</p>
          </div>
        </div>
        
        {/* Message pour utilisateur non connecté/inscrit */}
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            {!isAuthenticated 
              ? 'Connectez-vous pour participer'
              : 'Inscrivez-vous pour évaluer'
            }
          </h4>
          <p className="text-gray-600 mb-4">
            {!isAuthenticated 
              ? 'Connectez-vous pour voir et laisser des évaluations'
              : 'Inscrivez-vous au cours pour laisser une évaluation'
            }
          </p>
          {!isAuthenticated && (
            <Link 
              to="/auth" 
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Messages de notification */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* En-tête avec moyenne et distribution */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Évaluations du cours</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {renderStars(currentRating)}
              <span className={`text-3xl font-bold ${getRatingColor(currentRating)}`}>
                {currentRating.toFixed(1)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{totalRatings}</span> avis
            </div>
          </div>
        </div>
        
        {/* Bouton pour voir plus d'évaluations */}
        {courseRatings.length > 3 && (
          <button
            onClick={() => {
              setShowAllRatings(!showAllRatings);
              loadCourseRatings();
            }}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {showAllRatings ? 'Voir moins' : `Voir les ${totalRatings} avis`}
          </button>
        )}
      </div>

      {/* Section d'évaluation utilisateur */}
      <div className="border-t border-gray-100 pt-6">
        {userRating ? (
          // L'utilisateur a déjà noté
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-blue-900 flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Votre évaluation</span>
              </h4>
              <div className="flex items-center space-x-2">
              
                <button
                  onClick={handleDeleteRating}
                  disabled={isSubmitting}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-red-200 hover:border-red-300 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-3">
              {renderStars(userRating.rating)}
              <span className="text-lg font-bold text-blue-800">
                {getRatingText(userRating.rating)}
              </span>
              <span className="text-sm text-gray-600 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(userRating.createdAt)}</span>
              </span>
            </div>
            
            {userRating.comment && (
              <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                <p className="text-gray-700 leading-relaxed italic">
                  "{userRating.comment}"
                </p>
              </div>
            )}
          </div>
        ) : (
          // L'utilisateur n'a pas encore noté
          <div>
            {!showRatingForm ? (
              <button
                onClick={() => setShowRatingForm(true)}
                className="w-full bg-gradient-to-r from-primary to-primary/90 text-white py-4 px-6 rounded-xl hover:from-primary/90 hover:to-primary transition-all flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-lg"
              >
                <Star className="w-6 h-6" />
                <span>Évaluer ce cours</span>
              </button>
            ) : (
              // Formulaire d'évaluation
              <div className="bg-gray-50 rounded-xl p-6 space-y-6 border border-gray-200">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-4">
                    Votre note
                  </label>
                  <div className="flex items-center space-x-4">
                    {renderStars(
                      selectedRating,
                      true,
                      'w-10 h-10',
                      setSelectedRating,
                      setHoveredRating,
                      () => setHoveredRating(0)
                    )}
                    {(selectedRating > 0 || hoveredRating > 0) && (
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-800">
                          {getRatingText(hoveredRating || selectedRating)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {hoveredRating || selectedRating}/5 étoiles
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleSubmitRating}
                    disabled={!selectedRating || isSubmitting}
                    className="flex-1 bg-primary text-white py-3 px-6 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Envoi...</span>
                      </div>
                    ) : (
                      userRating ? 'Mettre à jour l\'évaluation' : 'Publier l\'évaluation'
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Liste des commentaires */}
      {courseRatings.length > 0 && (
        <div className="border-t border-gray-100 pt-6">
          <h4 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Avis des étudiants</span>
            <span className="text-sm font-normal text-gray-500">
              ({courseRatings.length} affichés)
            </span>
          </h4>
          
          {loadingRatings ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {courseRatings.map((rating) => (
                <div 
                  key={rating.id} 
                  className="border-l-4 border-primary/30 pl-6 py-4 bg-gray-50/50 rounded-r-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          {renderStars(rating.rating, false, 'w-4 h-4')}
                          <span className="text-sm font-bold text-gray-700">
                            {getRatingText(rating.rating)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center space-x-2">
                          <span className="font-medium">
                            {rating.userFirstName && rating.userLastName ? 
                              `${rating.userFirstName} ${rating.userLastName}` : 
                              'Étudiant vérifié'
                            }
                          </span>
                          <span>•</span>
                          <span>{formatDate(rating.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {rating.comment && (
                    <div className="bg-white rounded-lg p-4 mt-3 border border-gray-200 shadow-sm">
                      <p className="text-gray-700 leading-relaxed">
                        "{rating.comment}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message si aucun avis */}
      {courseRatings.length === 0 && !loadingRatings && (
        <div className="border-t border-gray-100 pt-6">
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Aucun avis pour le moment
            </h4>
            <p className="text-sm text-gray-500">
              Soyez le premier à partager votre expérience avec ce cours !
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRatingComponent;
