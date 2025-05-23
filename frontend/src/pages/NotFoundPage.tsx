// src/pages/NotFoundPage.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center p-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-2xl text-gray-700 mb-4">Page non trouvée</p>
      <p className="text-md text-gray-500 mb-8">
        Désolé, la page que vous recherchez n'existe pas.
      </p>
      <Button asChild>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
