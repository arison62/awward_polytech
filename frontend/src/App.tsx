import { Routes, Route, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import VotePage from "./pages/VotePage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import logo from "./assets/logo.png";
import { useAppStore } from "./lib/stores";

function App() {
  const currentStudent = useAppStore((state) => state.currentStudent);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold flex gap-2">
            <div>
              <img src={logo} alt="Logo" className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <div className="flex flex-col">
              ENSPM Awards
              <span className="text-xs font-light">Premiere editon '25</span>
            </div>
          </Link>
          <div>
            {currentStudent !== null ? (
              <span>{currentStudent.name}</span>
            ) : (
              <Link to="/login">
                <Button>Connexion</Button>
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/vote/:voteId" element={<VotePage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />{" "}
          {/* Utilise /* pour les sous-routes admin */}
          <Route path="*" element={<NotFoundPage />} /> {/* Route 404 */}
        </Routes>
      </main>

      <footer className="bg-primary text-primary-foreground p-4 text-center mt-auto">
        <Link to="/admin">
        <p>&copy; {new Date().getFullYear()} ENSPM Awards</p>
        </Link>
      </footer>
    </div>
  );
}

export default App;
