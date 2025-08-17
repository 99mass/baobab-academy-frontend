/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CoursePlayer from "./pages/CoursePlayer";
import AdminDashboard from "./pages/AdminDashboard";
import CourseEditor from "./pages/CourseEditor";
import Profile from "./pages/Profile";

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && user?.role !== "ADMIN") {
    return <Navigate to="/courses" replace />;
  }

  return <>{children}</>;
}

// Composant pour rediriger les utilisateurs connectés (SANS Loading)
interface PublicRouteProps {
  children: ReactNode;
}

// Modifiez uniquement la fonction PublicRoute dans App.tsx

function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isAuthenticated && !isLoading) {
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/profile" replace />;
    }
  }

  return <>{children}</>;
}
function AppContent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral flex flex-col">
      <Routes>
        {/* Routes publiques - SANS Loading */}

        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        {/* Routes avec header/footer */}
        <Route
          path="/*"
          element={
            <>
              <Header
                isAuthenticated={isAuthenticated}
                userRole={user?.role === "ADMIN" ? "admin" : "student"}
                user={user as any}
              />

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />

                  {/* Routes publiques avec header */}
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/course/:id" element={<CourseDetail />} />

                  {/* Routes protégées - AVEC Loading si nécessaire */}
                  <Route
                    path="/player/:id"
                    element={
                      <ProtectedRoute>
                        <CoursePlayer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/player/:id/:lessonId"
                    element={
                      <ProtectedRoute>
                        <CoursePlayer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Routes admin - AVEC Loading si nécessaire */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/course/new"
                    element={
                      <ProtectedRoute adminOnly>
                        <CourseEditor />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/course/edit/:id"
                    element={
                      <ProtectedRoute adminOnly>
                        <CourseEditor />
                      </ProtectedRoute>
                    }
                  />

                  {/* Route 404 */}
                  <Route
                    path="*"
                    element={<Navigate to="/courses" replace />}
                  />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
