/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/lib/stores";
import { getVoteDetails, submitStudentVote } from "@/lib/api";
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

  // State to store the details of the vote, including categories and candidates
  const [voteDetails, setVoteDetails] = useState<any>(null);
  // State to store the selected candidate for each category,
  // where key is categoryId and value is candidateStudentId
  const [selectedCandidates, setSelectedCandidates] = useState<{
    [categoryId: number]: number | null;
  }>({});

  // State to manage loading status while fetching vote details
  const [loading, setLoading] = useState(true);
  // State to manage submitting status while submitting votes
  const [submitting, setSubmitting] = useState(false);

  // Effect hook to fetch vote details when the component mounts or dependencies change
  useEffect(() => {
    // Redirect to login if no student is currently logged in
    if (!currentStudent) {
      toast("Non connecté", {
        description: "Veuillez vous connecter pour accéder à cette page.",
      });
      navigate("/login");
      return;
    }

    // Function to fetch vote details from the API
    const fetchDetails = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await getVoteDetails(
          parseInt(voteId!), // Parse voteId from string to number
          currentStudent.groupId // Use the current student's group ID
        );

        if (response.data) {
          console.log("Vote Details:", response.data);
          setVoteDetails(response.data); // Set the fetched vote details

          // Initialize selectedCandidates state: set null for each category
          const initialSelections: { [key: number]: number | null } = {};
          response.data.vote.Categories.forEach((cat: any) => {
            initialSelections[cat.id] = null;
          });
          setSelectedCandidates(initialSelections);
        } else if (response.error) {
          toast("Erreur", {
            description: response.error,
          });
          navigate("/"); // Navigate back to home on error
        }
      } catch (error) {
        console.error("Failed to fetch vote details:", error);
        toast("Erreur", {
          description: "Impossible de charger les détails du vote.",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails(); // Call the fetch function
  }, [voteId, currentStudent, navigate]); // Dependencies for the useEffect hook

  // Handler for selecting a candidate in a specific category
  const handleCandidateSelection = (
    categoryId: number,
    candidateStudentId: string
  ) => {
    // Update the selectedCandidates state
    setSelectedCandidates((prevSelections) => ({
      ...prevSelections,
      [categoryId]: parseInt(candidateStudentId), // Convert candidate ID to number
    }));
  };

  // Handler for submitting all votes
  const handleVoteSubmission = async () => {
    // // Check if all categories have a selected candidate
    // const allCategoriesVoted = voteDetails.vote.Categories.every(
    //   (category: any) => selectedCandidates[category.id] !== null
    // );

    // if (!allCategoriesVoted) {
    //   toast("Validation requise", {
    //     description:
    //       "Veuillez sélectionner un candidat pour chaque catégorie avant de soumettre.",
    //   });
    //   return; // Stop submission if not all categories are voted
    // }

    setSubmitting(true); // Set submitting to true
    let successCount = 0;
    const errorMessages: string[] = [];

    // Iterate over each category and submit a vote
    for (const category of voteDetails.vote.Categories) {
      const candidateId = selectedCandidates[category.id];
      if (candidateId !== null) {
        try {
          const response = await submitStudentVote({
            voteId: parseInt(voteId!),
            categoryId: category.id,
            voterStudentId: currentStudent!.id!,
            candidateStudentId: candidateId,
          });

          if (response.data) {
            successCount++;
          } else if (response.error) {
            errorMessages.push(
              `Catégorie "${category.name}": ${response.error}`
            );
          }
        } catch (error) {
          console.error(
            `Error submitting vote for category ${category.name}:`,
            error
          );
          errorMessages.push(
            `Catégorie "${category.name}": Erreur de soumission.`
          );
        }
      }
    }

    setSubmitting(false); // Set submitting to false after all votes are attempted

    // Display toast messages based on submission results
    if (successCount > 0) {
      toast("Succès", {
        description: "Tous vos votes ont été soumis avec succès !",
      });
      navigate("/"); // Navigate to dashboard on full success
    }  else {
      toast("Échec", {
        description: `Aucun vote n'a pu être soumis. Erreurs: ${errorMessages.join(
          ", "
        )}`,
      });
    }
  };

  // Display loading message while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement des détails du vote...</p>
      </div>
    );
  }

  // Display message if vote details are not found after loading
  if (!voteDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Vote non trouvé ou inaccessible.</p>
      </div>
    );
  }

  // Render the vote page content
  return (
    <div className="container mx-auto py-8 md:p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800">
            {voteDetails.vote.title}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {voteDetails.vote.description ||
              "Votez pour vos candidats préférés dans chaque catégorie."}
          </CardDescription>
          <div className="text-sm text-center text-gray-500 mt-2">
            Du {new Date(voteDetails.vote.startDate).toLocaleDateString()} au{" "}
            {new Date(voteDetails.vote.endDate).toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {voteDetails.vote.Categories.map((category: any) => (
              <div
                key={category.id}
                className="border p-2 rounded-lg shadow-sm bg-white"
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-700">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {category.description ||
                    "Sélectionnez un candidat pour cette catégorie."}
                </p>
                <div className="grid gap-2">
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-gray-700"
                  >
                    Candidat:
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleCandidateSelection(category.id, value)
                    }
                    value={selectedCandidates[category.id]?.toString() || ""}
                  >
                    <SelectTrigger
                      id={`category-${category.id}`}
                      className="w-full overflow-hidden text-ellipsis"
                    >
                      <SelectValue placeholder="Sélectionner un candidat" />
                    </SelectTrigger>
                    <SelectContent>
                      {category.Candidacies.length > 0 ? (
                        category.Candidacies.map((candidacy: any) => (
                          <SelectItem
                            key={candidacy.id}
                            value={candidacy.Student.id.toString()}
                            
                          >
                            {candidacy.Student.name} (
                            {candidacy.Student.matricule})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-candidates" disabled>
                          Aucun candidat disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleVoteSubmission}
            disabled={submitting || loading}
            className="w-full mt-8 py-3 text-lg"
          >
            {submitting ? "Soumission en cours..." : "Soumettre mes votes"}
          </Button>
          {submitting && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Veuillez ne pas fermer cette page pendant la soumission.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VotePage;
