import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner"; // Assuming 'sonner' for toasts
import { Button } from "@/components/ui/button"; // Assuming Button component
import { API_BASE_URL } from "@/lib/constants";

// --- Type Definitions for API Response ---

// Structure d'un candidat dans les résultats de vote
interface CandidateResult {
  voteCount: number;
  candidate: {
    studentId: number;
    name: string; // Nom du candidat
    matricule: string; // Matricule du candidat
  };
}

// Structure d'une catégorie dans les résultats de vote
interface CategoryResult {
  categoryId: number;
  categoryName: string;
  categoryDescription: string;
  candidat: CandidateResult[]; // Liste des candidats pour cette catégorie
}

// Structure de la réponse complète de l'API des résultats de vote
interface VoteResultResponse {
  message: string;
  result: CategoryResult[]; // Tableau des catégories avec leurs résultats
}


const getVoteResults = async (
  voteId: string
): Promise<{ data?: VoteResultResponse; error?: string }> => {
  // Simulate network delay
  const response = await fetch(`${API_BASE_URL}/studentVote/${voteId}/result`);
  if(response.ok){
    return {data: await response.json()}
  }else{
    const data = await response.json()
    return {...data}
  }

};

function VoteResultsPage() {
  const { voteId } = useParams<{ voteId: string }>();
  const navigate = useNavigate();

  const [voteResults, setVoteResults] = useState<CategoryResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null); // Clear previous errors

      if (!voteId) {
        setError("Vote ID non fourni.");
        setLoading(false);
        toast.error("Erreur", {
          description: "L'identifiant du vote est manquant.",
        });
        navigate("/"); // Redirect if voteId is missing
        return;
      }

      try {
        const response = await getVoteResults(voteId);

        if (response.data) {
          // Sort candidates within each category by voteCount in descending order
          const sortedResults = response.data.result.map((category) => ({
            ...category,
            candidat: category.candidat.sort(
              (a, b) => b.voteCount - a.voteCount
            ),
          }));
          setVoteResults(sortedResults);
        } else if (response.error) {
          setError(response.error);
          toast.error("Erreur", { description: response.error });
        }
      } catch (err) {
        console.error("Failed to fetch vote results:", err);
        setError("Impossible de charger les résultats du vote.");
        toast.error("Erreur", {
          description: "Impossible de charger les résultats du vote.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [voteId, navigate]); // Re-fetch if voteId changes

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">
          Chargement des résultats du vote...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Card className="p-6 text-center shadow-lg rounded-xl">
          <CardTitle className="text-2xl font-bold text-red-600">
            Erreur de chargement
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            {error}
          </CardDescription>
          <Button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  if (!voteResults || voteResults.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="p-2 text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Aucun résultat trouvé
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Aucun résultat n'est disponible pour ce vote pour le moment.
          </CardDescription>
          <Button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 min-h-screen">
      <Card className="max-w-4xl w-full mx-auto overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-700 p-6 sm:p-8 text-white rounded-t-2xl">
          <CardTitle className="text-3xl sm:text-4xl font-extrabold text-center leading-tight">
            Résultats du Vote
          </CardTitle>
          <CardDescription className="text-center text-purple-100 mt-2 sm:text-lg">
            Découvrez les résultats par catégorie.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-8">
            {voteResults.map((category) => (
              <div
                key={category.categoryId}
                className="border border-purple-200 p-5 sm:p-6 rounded-xl shadow-md bg-white transition-shadow hover:shadow-lg"
              >
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-purple-800 flex items-center">
                  <span className="mr-3 text-pink-500">🏆</span>
                  {category.categoryName}
                </h3>
                {category.categoryDescription && (
                  <p className="text-gray-600 mb-4 text-base italic">
                    {category.categoryDescription}
                  </p>
                )}

                {category.candidat.length > 0 ? (
                  <ul className="space-y-3">
                    {category.candidat.map((candidateInfo) => (
                      <li
                        key={candidateInfo.candidate.studentId}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100"
                      >
                        <div className="flex items-center">
                          <span className="text-xl mr-3 text-indigo-600">
                            ⭐
                          </span>
                          <span className="text-lg font-medium text-gray-800">
                            {candidateInfo.candidate.name} (
                            {candidateInfo.candidate.matricule})
                          </span>
                        </div>
                        <span className="text-xl font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                          {candidateInfo.voteCount} voix
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg text-yellow-800">
                    <p className="font-semibold text-base">
                      Aucun candidat n'a reçu de votes dans cette catégorie.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VoteResultsPage;
