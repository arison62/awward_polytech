import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore, type Vote } from "@/lib/stores";
import { getGroups } from "@/lib/api";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CountDownDate from "@/components/ui/countdown-date";
import { Award, Star, Trophy, Users, Calendar, Mail, User, Lock } from "lucide-react";
import logoSrc from "../assets/logo.png";
import logoEnspm from "../assets/logo_enspm.png";


function HomePage() {
  const [availableGroups, setAvailableGroups] = useState<
    {
      id: number;
      name: string;
      description: string;
      Votes: Vote[];
    }[]
  >([]);
  const currentStudent = useAppStore((state) => state.currentStudent);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVotes = async () => {
      const response = await getGroups();
      if (response.data) {
        console.log(response.data);
        setAvailableGroups(response.data);
      } else if (response.error) {
        toast(
          "Une erreur s'est produite lors de la récupération des votes disponibles.",
          {
            description: response.error,
          }
        );
      }
      setIsLoaded(true);
    };
    fetchVotes();
  }, [setAvailableGroups, toast]);

  const handleVoteClick = (voteId: number) => {
    navigate(`/vote/${voteId}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section avec animation d'entrée */}
      <section className="relative overflow-hidden bg-gray-200/25">
        <div className="absolute inset-0"></div>
        <div 
          className={`container mx-auto p-8 pt-16 transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="flex flex-col items-center md:flex-row justify-between gap-8">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-amber-600 rounded-full animate-pulse">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                  ENSPM AWARDS
                </h1>
              </div>
              <p className="text-2xl md:text-3xl leading-relaxed">
                <span className="font-bold text-purple-600 animate-pulse">Première édition</span> de la{" "}
                <span className="font-bold text-amber-600">ENSPM Awards</span>,
                célébrons l'excellence et l'amitié ! Votez pour vos camarades et
                enseignants qui ont rendu votre année scolaire inoubliable et
                découvrez qui seront les grands gagnants !
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex items-center gap-2 text-purple-600">
                  <Star className="w-5 h-5 animate-spin" style={{animationDuration: '3s'}} />
                  <span className="font-medium">Excellence</span>
                </div>
                <div className="flex items-center gap-2 text-amber-600">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Communauté</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Award className="w-5 h-5" />
                  <span className="font-medium">Reconnaissance</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-amber-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <img 
                src={logoSrc} 
                className="relative z-10 transition-transform duration-500 hover:scale-110 hover:rotate-3" 
                alt="ENSPM Awards Logo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Section avec effet de flottement */}
      <section className={`py-16 transition-all duration-1000 delay-300 bg-white ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="px-4">
          <div className="backdrop-blur-sm p-8 border border-white/50">
            <h2 className="text-3xl font-light text-center mb-8 text-gray-700">
              Sponsorisé par
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="absolute inset-0 blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-white rounded-2xl p-6 border transition-transform duration-300 hover:scale-105">
                  <div className="flex flex-col items-center gap-4">
                    <img src={logoEnspm} className="h-24 w-24 transition-transform duration-300 hover:rotate-12" alt="ENSPM Logo" />
                    <span className="text-lg font-medium text-center text-gray-700">
                      École Nationale Supérieure Polytechnique de Maroua
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Votes Section avec animations décalées */}
      <section className={`py-16 transition-all duration-1000 delay-500 bg-orange-50 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="container mx-auto px-4">
          <div className="backdrop-blur-sm border-white/50">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-amber-600" />
                <h2 className="text-3xl font-light text-gray-700">Votes disponibles</h2>
                <Trophy className="w-8 h-8 text-amber-600" />
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-amber-600 mx-auto rounded-full"></div>
            </div>
            
            {availableGroups.length === 0 ? (
              <div className="text-center py-16">
                <div className="animate-bounce mb-4">
                  <Award className="w-16 h-16 text-gray-400 mx-auto" />
                </div>
                <p className="text-xl text-gray-500">
                  Aucun vote actif n'est disponible pour le moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-8">
                {availableGroups.map((group, index) => {
                  if (group.Votes.length === 0) return null;
                  return (
                    <div
                      key={group.id}
                      className={`transition-all duration-700 ${
                        isLoaded
                          ? "translate-y-0 opacity-100"
                          : "translate-y-10 opacity-0"
                      }`}
                      style={{ transitionDelay: `${800 + index * 200}ms` }}
                    >
                      <Card className="relative overflow-hidden transition-all duration-300 hover:scale-105 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardHeader className="relative">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-600 to-amber-600 rounded-lg">
                              <Star className="w-5 h-5 text-white" />
                            </div>
                            <CardTitle className="bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent">
                              {group.name}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-gray-600 text-base">
                            {group.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                          <Accordion type="single" collapsible>
                            {group.Votes.map((vote) => (
                              <AccordionItem
                                key={vote.id}
                                value={`vote-${vote.id}`}
                                className="border-purple-200"
                              >
                                <AccordionTrigger className="font-semibold text-gray-700 hover:text-purple-600 transition-colors">
                                  {vote.title}
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                  <p className="text-gray-600">
                                    {vote.description}
                                  </p>
                                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Calendar className="w-4 h-4" />
                                      <span className="font-medium">
                                        Début :
                                      </span>
                                      <span>
                                        {
                                          new Date(vote.startDate)
                                            .toISOString()
                                            .split("T")[0]
                                        }
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Calendar className="w-4 h-4" />
                                      <span className="font-medium">Fin :</span>
                                      <span>
                                        {
                                          new Date(vote.endDate)
                                            .toISOString()
                                            .split("T")[0]
                                        }
                                      </span>
                                    </div>
                                  </div>
                                  {!currentStudent && (
                                    <div className="text-center py-2">
                                      <span className="inline-flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                                        <User className="w-4 h-4" />
                                        Vous devez vous connecter pour
                                        participer au vote
                                      </span>
                                    </div>
                                  )}
                                  <div className="pt-2">
                                    {vote.status === "active" &&
                                    currentStudent &&
                                    currentStudent.groupId === group.id && (
                                      <Button
                                        className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 transition-all duration-300 transform hover:scale-105"
                                        onClick={() => handleVoteClick(vote.id)}
                                      >
                                        🎭 Participer au vote
                                      </Button>
                                    ) }
                                    {vote.status === "active" &&
                                    currentStudent &&
                                    currentStudent.groupId !== group.id && (
                                      <div className="text-center py-2">
                                        <span className="inline-flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                                          <Lock className="w-4 h-4" />
                                          Vous ne pouvez pas participer au vote de ce groupe
                                        </span>
                                      </div>
                                    )}
                                    {vote.status === "completed" && (
                                      <div className="text-center py-2">
                                        <span className="inline-flex items-center gap-2 text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                                          <Trophy className="w-4 h-4" />
                                          Vote terminé
                                        </span>
                                      </div>
                                    )}
                                    {vote.status === "pending" && (
                                      <CountDownDate
                                        endDate={new Date(vote.endDate)}
                                      />
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* À propos Section */}
      <section className={`py-16 transition-all duration-1000 delay-700 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-600/90 to-amber-600/90 rounded-3xl p-8  text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light mb-4">À propos</h2>
              <div className="w-24 h-1 bg-white/50 mx-auto rounded-full"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg leading-relaxed text-center">
                <span className="font-bold text-amber-200">ENSPM Awards</span> est une initiative étudiante visant à
                promouvoir l'excellence et le vivre ensemble. Cette plateforme est
                indépendante du cadre administratif de l'école. En participant, vous
                vous engagez à respecter les autres, à éviter les propos injurieux et
                à suivre les règles établies. Nous nous réservons le droit de modérer
                ou de supprimer tout contenu inapproprié.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-16 transition-all duration-1000 delay-900 ${
        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <div className="container mx-auto px-4">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border-white/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Mail className="w-8 h-8 text-purple-600" />
                <h2 className="text-3xl font-light text-gray-700">Contact</h2>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-amber-600 mx-auto rounded-full mb-6"></div>
              <p className="text-lg text-gray-600 mb-4">
                Pour toute question ou suggestion, vous pouvez nous contacter par email
              </p>
              <a 
                href="mailto:legrandpone1@gmail.com"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                legrandpone1@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 
      SUGGESTIONS D'AMÉLIORATION (à ajouter plus tard) :
      
      1. Section "Statistiques en temps réel" :
         - Nombre total de votes
         - Nombre de participants
         - Catégories les plus populaires
      
      2. Section "Timeline des événements" :
         - Calendrier visuel des différentes phases
         - Dates importantes à retenir
      
      3. Section "Témoignages" :
         - Citations d'étudiants sur l'importance des awards
         - Photos des gagnants précédents (si applicable)
      
      4. Section "Partenaires" :
         - Logos des autres sponsors
         - Entreprises qui soutiennent l'initiative
      
      5. Section "FAQ" :
         - Questions fréquemment posées
         - Règles de participation détaillées
      
      6. Footer avec réseaux sociaux :
         - Liens vers les réseaux sociaux de l'école
         - Informations légales
      
      7. Particules flottantes en arrière-plan :
         - Animation de particules dorées
         - Effet de confettis lors du hover
      */}
    </div>
  );
}

export default HomePage;