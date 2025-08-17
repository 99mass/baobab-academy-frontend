interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
  overlay?: boolean; 
}

export default function Loading({ 
  message = "Chargement...", 
  size = 'md', 
  fullscreen = false,
  overlay = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Classes conditionnelles selon le type d'affichage
  let containerClasses;
  if (overlay) {
    containerClasses = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  } else if (fullscreen) {
    containerClasses = 'min-h-screen flex items-center justify-center';
  } else {
    containerClasses = 'flex items-center justify-center p-8';
  }

  const contentClasses = overlay ? 'bg-white rounded-lg p-6 shadow-lg' : '';

  return (
    <div className={containerClasses}>
      <div className={`flex flex-col items-center space-y-4 ${contentClasses}`}>
        <div className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`}></div>
        <p className={`text-gray-600 ${textSizeClasses[size]}`}>{message}</p>
      </div>
    </div>
  );
}