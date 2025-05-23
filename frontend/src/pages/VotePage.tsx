/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/stores";
import { submitStudentVote } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

function VotePage() {
  const { voteId } = useParams<{ voteId: string }>();
  const navigate = useNavigate();
  const { currentStudent } = useAppStore();


  const [voteDetails, ] = useState<any>(null); // TODO: Type plus précisément
  const [selectedCandidates, setSelectedCandidates] = useState<{
    [categoryId: number]: number | null;
  }>({});
 
  const [loading, ] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentStudent) {
      // Si l'étudiant n'est pas connecté, redirige vers la page de login
      toast("Non connecté", {
        description: "Veuillez vous connecter pour accéder à cette page.",
      });
      navigate(`/login/${voteId}`);
      return;
    }

    // const fetchDetails = async () => {
    //   setLoading(true);
    //   const response = await getVoteDetails(
    //     parseInt(voteId!),
    //     currentStudent.id
    //   );
    //   setLoading(false);

    //   if (response.data) {
    //     setVoteDetails(response.data);
    //     // Initialise les sélections par défaut
    //     const initialSelections: { [key: number]: number | null } = {};
    //     response.data.categories.forEach((cat: any) => {
    //       initialSelections[cat.id] = null;
    //     });
    //     setSelectedCandidates(initialSelections);
    //   } else if (response.error) {
    //     toast("Erreur", {
    //       description: response.error,
    //     });
    //     navigate("/"); // Retour à l'accueil en cas d'erreur de chargement
    //   }
    // };

    // fetchDetails();
  }, [voteId, currentStudent, navigate, toast]);

  const handleCandidateSelect = (categoryId: number, studentId: string) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [categoryId]: parseInt(studentId),
    }));
  };

  const handleSubmitVote = async () => {
    if (!currentStudent || !voteDetails) {
      toast("Erreur", {
        description: "Informations de l'étudiant ou du vote manquantes.",
      });
      return;
    }

    // Vérifier que toutes les catégories ont un candidat sélectionné
    const allCategoriesVoted = voteDetails.categories.every(
      (cat: any) => selectedCandidates[cat.id] !== null
    );
    if (!allCategoriesVoted) {
      toast("Vote incomplet", {
        description: "Veuillez sélectionner un candidat pour chaque catégorie.",
      });
      return;
    }

    setSubmitting(true);
    const successfulVotes: any[] = [];
    const failedVotes: any[] = [];

    // Soumettre chaque vote individuellement (ou en batch si l'API le permet)
    for (const category of voteDetails.categories) {
      const candidateId = selectedCandidates[category.id];
      if (candidateId) {
        const voteResponse = await submitStudentVote({
          voteId: parseInt(voteId!),
          categoryId: category.id,
          voterStudentId: currentStudent.id,
          candidateStudentId: candidateId,
        });

        if (voteResponse.data) {
          successfulVotes.push(category.name);
        } else {
          failedVotes.push({
            category: category.name,
            error: voteResponse.error,
          });
        }
      }
    }
    setSubmitting(false);

    if (successfulVotes.length > 0 && failedVotes.length === 0) {
      toast("Vote soumis !", {
        description: "Vos votes ont été enregistrés avec succès.",
      });
      navigate("/"); // Redirige après le vote
    } else if (successfulVotes.length > 0 && failedVotes.length > 0) {
      toast("Vote Partiellement Soumis", {
        description: `Certains votes ont réussi, d'autres ont échoué. Détails: ${failedVotes
          .map((f) => `${f.category}: ${f.error}`)
          .join(", ")}`,
      });
    } else {
      toast("Échec du Vote", {
        description:
          "Aucun de vos votes n'a pu être enregistré. " +
          (failedVotes[0]?.error || ""),
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center text-lg">
        Chargement des détails du vote...
      </div>
    );
  }

  if (!voteDetails) {
    return (
      <div className="text-center text-lg text-red-500">
        Impossible de charger les détails du vote.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{voteDetails.vote.title}</h1>
      <p className="text-gray-600 mb-6">{voteDetails.vote.description}</p>
      {voteDetails.vote.group && (
        <p className="text-lg mb-4">
          Vote pour le groupe:{" "}
          <span className="font-semibold">{voteDetails.vote.group.name}</span>
        </p>
      )}

      <div className="grid gap-6">
        {voteDetails.categories.map((category: any) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor={`select-candidate-${category.id}`}>
                Choisissez votre candidat :
              </Label>
              <Select
                onValueChange={(value) =>
                  handleCandidateSelect(category.id, value)
                }
                value={selectedCandidates[category.id]?.toString() || ""}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Sélectionner un candidat" />
                </SelectTrigger>
                <SelectContent>
                  {/* Filtrer les candidats pour ne montrer que ceux qui sont candidats dans cette catégorie */}
                  {voteDetails.candidacies
                    .filter((c: any) => c.categoryId === category.id)
                    .map((candidacy: any) => (
                      <SelectItem
                        key={candidacy.studentId}
                        value={candidacy.studentId.toString()}
                      >
                        {candidacy.student.firstName}{" "}
                        {candidacy.student.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleSubmitVote}
        className="mt-8 w-full"
        disabled={submitting}
      >
        {submitting ? "Soumission en cours..." : "Soumettre mes votes"}
      </Button>
    </div>
  );
}

export default VotePage;
