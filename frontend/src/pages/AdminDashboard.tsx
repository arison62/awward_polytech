/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useAppStore,
  type Category,
  type Group,
  type Student,
  type Vote,
} from "@/lib/stores";
import * as XLSX from "xlsx";
import {
  createGroup,
  getGroups,
  createVote,
  bulkUploadStudents,
  addCandidacy,
  getVotes,
  getGroup,
} from "@/lib/api";

import { API_BASE_URL } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
// --- Composants pour les sous-routes du Dashboard Admin ---

// Admin Dashboard principal (layout)
function AdminDashboard() {
  const [isLoginForm, setLoginForm] = useState(true);
  const isAdminLoggedIn = useAppStore((state) => state.isAdminLoggedIn);
  const loginAdmin = useAppStore((state) => state.loginAdmin);
  const logoutAdmin = useAppStore((state) => state.logoutAdmin);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    console.log("email:", email);
    console.log("password:", password);
    const url = isLoginForm
      ? `${API_BASE_URL}/admin/signin`
      : `${API_BASE_URL}/admin/signup`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const access_token = data.access_token;
        localStorage.setItem("access_token", access_token);
        loginAdmin();
        navigate("/admin");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message);
      }
      setLoginLoading(false);
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(
          "Une erreur s'est produite lors de la connexion." + error.message
        );
      }
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin"); // Retourne à la page de connexion admin
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isLoginForm ? "Connexion" : "Creation"}
            </CardTitle>
            <CardDescription>
              Accédez au tableau de bord d'administration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="admin-username">Adresse email</Label>
                <Input
                  id="admin-username"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-password">Mot de passe</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading
                  ? "Connexion..."
                  : isLoginForm
                  ? "Connexion"
                  : "Creation"}
              </Button>
              <p>
                {isLoginForm ? "Pas encore inscrit ?" : "Deja inscrit ?"}
                <Button
                  variant="link"
                  onClick={() => setLoginForm(!isLoginForm)}
                >
                  {isLoginForm ? "Créer un compte" : "Se connecter"}
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
      <aside className="md:col-span-1 bg-card p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Tableau de Bord Admin</h2>
        <nav className="flex flex-col space-y-2">
          <Button asChild variant="ghost" className="justify-start">
            <Link to="/admin/groups">Gérer les Groupes</Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link to="/admin/votes">Gérer les Votes</Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link to="/admin/students">Importer les Étudiants</Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link to="/admin/candidacies">Gérer les Candidatures</Link>
          </Button>

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="justify-start mt-4"
          >
            Déconnexion
          </Button>
        </nav>
      </aside>
      <div className="md:col-span-3">
        <Outlet /> {/* Les sous-routes seront rendues ici */}
        <Routes>
          <Route
            index
            element={
              <p className="text-lg text-center mt-8">
                Sélectionnez une option dans le menu.
              </p>
            }
          />
          <Route path="groups" element={<GroupManagement />} />
          <Route path="votes" element={<VoteManagement />} />
          <Route path="students" element={<StudentImport />} />
          <Route path="candidacies" element={<CandidacyManagement />} />
        </Routes>
      </div>
    </div>
  );
}

// Composant pour la gestion des groupes
function GroupManagement() {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const response = await getGroups();
    if (response.data) {
      setGroups(response.data);
    } else {
     
      toast("Erreur", {
        description: response.error,
      });
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const response = await createGroup({
      name: groupName,
      description: groupDescription,
    });
    setLoading(false);

    if (response.data) {
      toast.success("Groupe créé", {
        description: `Le groupe "${response.data.name}" a été créé.`,
      });
      setGroupName("");
      setGroupDescription("");
      fetchGroups(); // Rafraîchir la liste des groupes
    } else {
      toast.error("Erreur", {
        description: response.error,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gérer les Groupes</CardTitle>
        <CardDescription>
          Créer de nouveaux groupes pour organiser les étudiants et les votes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateGroup} className="grid gap-4 mb-8">
          <div className="grid gap-2">
            <Label htmlFor="group-name">Nom du Groupe</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer un Groupe"}
          </Button>
        </form>

        <h3 className="text-xl font-semibold mb-4">Groupes Existants</h3>
        {groups.length === 0 ? (
          <p>Aucun groupe n'a été créé.</p>
        ) : (
          <ul>
            {groups.map((group) => (
              <li
                key={group.id}
                className="border-b py-2 flex justify-between items-start flex-col"
              >
                <p>{group.name}</p>
                <span className="text-gray-500">{group.description}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// Composant pour la gestion des votes
function VoteManagement() {
  const [voteTitle, setVoteTitle] = useState("");
  const [voteDescription, setVoteDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [categories, setCategories] = useState<
    Omit<Category, "id" | "voteId">[]
  >([
    {
      name: "",
      description: "",
    },
  ]);
  const [categoryNumber, setCategoryNumber] = useState(1);

  useEffect(() => {
    fetchVotes();
  });
  useEffect(() => {
    const fetchGroupsForSelect = async () => {
      const response = await getGroups();
      if (response.data) {
        setGroups(response.data);
      } else {
        toast("Erreur", {
          description: response.error,
        });
      }
    };
    fetchGroupsForSelect();
  }, [toast]);

  const fetchVotes = async () => {
    const response = await getVotes();
    if (response.data) {
      setVotes(response.data);
    } else {
      toast("Erreur", {
        description: response.error,
      });
    }
  };

  const addCategoryField = () => {
    setCategories([
      ...categories,
      {
        name: "",
        description: "",
      },
    ]);
    setCategoryNumber(categoryNumber + 1);
  };
  const removeCategoryField = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
    setCategoryNumber(categoryNumber - 1);
  };
  const handleCreateVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await createVote({
      title: voteTitle,
      description: voteDescription,
      startDate,
      endDate,
      groupId: parseInt(selectedGroupId),
      categories,
    });
    

    if (response.data) {
      toast("Vote créé", {
        description: `Le vote "${response.data.title}" a été créé pour le groupe.`,
      });
      setVoteTitle("");
      setVoteDescription("");
      setStartDate("");
      setEndDate("");
      setSelectedGroupId("");
      fetchVotes();
    } else {
      toast("Erreur", {
        description: response.error,
      });
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gérer les Votes</CardTitle>
        <CardDescription>Créer et gérer les sessions de vote.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateVote} className="grid gap-4 mb-8">
          <div className="grid gap-2">
            <Label htmlFor="vote-title">Titre du Vote</Label>
            <Input
              id="vote-title"
              value={voteTitle}
              onChange={(e) => setVoteTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vote-description">Description</Label>
            <Textarea
              id="vote-description"
              value={voteDescription}
              onChange={(e) => setVoteDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Date de Début</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">Date de Fin</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vote-group">Groupe Cible</Label>
            <Select
              onValueChange={setSelectedGroupId}
              value={selectedGroupId}
              required
            >
              <SelectTrigger id="vote-group">
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category, index) => (
              <div key={index} className="grid gap-2">
                <div className="grid gap-2">
                  <Label htmlFor={`category-name-${index}`}>
                    Nom de la Catégorie {index + 1}
                  </Label>
                  <Input
                    id={`category-name-${index}`}
                    value={category.name}
                    onChange={(e) => {
                      const updatedCategories = [...categories];
                      updatedCategories[index] = {
                        ...updatedCategories[index],
                        name: e.target.value,
                      };
                      setCategories(updatedCategories);
                    }}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`category-description-${index}`}>
                    Description de la Catégorie {index + 1}
                  </Label>
                  <Input
                    id={`category-description-${index}`}
                    value={category.description}
                    onChange={(e) => {
                      const updatedCategories = [...categories];
                      updatedCategories[index] = {
                        ...updatedCategories[index],
                        description: e.target.value,
                      };
                      setCategories(updatedCategories);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={addCategoryField}
              size={"sm"}
              className="w-fit"
              variant={"secondary"}
            >
              Ajouter une Catégorie
            </Button>
            {categories.length > 1 && (
              <Button
                onClick={() => removeCategoryField(categories.length - 1)}
                size={"sm"}
                className="w-fit"
                variant={"ghost"}
              >
                Supprimer une Catégorie
              </Button>
            )}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer un Vote"}
          </Button>
        </form>

        <h3 className="text-xl font-semibold mb-4">Votes Existants</h3>
        <ul>
          {votes.map((vote) => (
            <li key={vote.id} className="mb-2">
              <Link
                to={`/admin/votes/${vote.id}`}
                className="text-blue-500 hover:underline"
              >
                {vote.title}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Composant pour l'importation des étudiants
function StudentImport() {
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  useEffect(() => {
    const fetchGroupsForSelect = async () => {
      const response = await getGroups();
      if (response.data) {
        setGroups(response.data);
      } else {
        toast("Erreur", {
          description: response.error,
        });
      }
    };
    fetchGroupsForSelect();
  }, [toast]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (json.length > 1) {
          const headers = json[0] as string[];
          const students = (json.slice(1) as any[]).map((row: any[]) => {
            const student: any = {};
            headers.forEach((header, index) => {
              const key = header.trim().toLowerCase().replace(/ /g, "");
              if (key === "matricule") student.matricule = row[index];
              if (key === "nom") student.name = row[index];
              // Assure-toi que les noms de colonnes dans ton Excel correspondent à ça
              // Exemple: Matricule, Nom
            });
            return student;
          });
          setStudentsData(students);
          setMessage(
            `Fichier "${file.name}" lu. ${students.length} étudiants trouvés.`
          );
        } else {
          setMessage("Le fichier Excel est vide ou n'a pas de données.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmitStudents = async () => {
    if (studentsData.length === 0 || !selectedGroupId) {
      toast("Champs manquants", {
        description:
          "Veuillez lire un fichier Excel et sélectionner un groupe.",
      });
      return;
    }

    setLoading(true);
    // Ajoute le groupId à chaque étudiant avant l'envoi
    const studentsWithGroup = studentsData.map((student) => ({
      ...student,
      groupId: parseInt(selectedGroupId),
    }));
    const response = await bulkUploadStudents(studentsWithGroup);
    setLoading(false);

    if (response.data) {
      setMessage(
        `Données envoyées avec succès ! ${response.data.createdCount} créés, ${response.data.updatedCount} mis à jour.`
      );
      toast("Importation réussie", {
        description: `${response.data.totalProcessed} étudiants traités.`,
      });
      setStudentsData([]);
      setSelectedGroupId("");
    } else if (response.error) {
      setMessage(`Erreur lors de l'envoi : ${response.error}`);
      toast("Erreur d'importation", {
        description: response.error,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importer les Étudiants</CardTitle>
        <CardDescription>
          Importer une liste d'étudiants à partir d'un fichier Excel et les
          attribuer à un groupe.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="student-file">Fichier Excel (.xlsx, .xls)</Label>
            <Input
              id="student-file"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assign-group">Attribuer au Groupe</Label>
            <Select
              onValueChange={setSelectedGroupId}
              value={selectedGroupId}
              required
            >
              <SelectTrigger id="assign-group">
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSubmitStudents}
            disabled={studentsData.length === 0 || !selectedGroupId || loading}
          >
            {loading ? "Envoi en cours..." : "Importer les Étudiants"}
          </Button>
          <p className="text-sm text-muted-foreground">{message}</p>

          {studentsData.length > 0 && (
            <div className="border rounded-md p-4 mt-4 max-h-60 overflow-y-auto">
              <h4 className="font-semibold mb-2">
                Aperçu des étudiants lus (premiers 10) :
              </h4>
              <ul className="list-none pl-5 text-sm">
                {studentsData.slice(0, 10).map((s, idx) => (
                  <li key={idx} className="odd:bg-muted py-2 pl-1">
                    {s.name} - Matricule: ({s.matricule || "N/A"})
                  </li>
                ))}
                {studentsData.length > 10 && (
                  <li>... et {studentsData.length - 10} autres.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour la gestion des candidatures
function CandidacyManagement() {
  const [votes, setVotes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]); // Pour les étudiants disponibles
  const [categories, setCategories] = useState<any[]>([]); // Pour les catégories du vote sélectionné

  const [selectedVoteId, setSelectedVoteId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number[]>([]);

  // pagination
  const [numberPerpage, setNumberPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);
  const [numberPage, setNumberPage] = useState(1);

  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchVotes();
  }, []);

  useEffect(() => {
    if (selectedVoteId) {
      fetchStudents();
    }
  }, [selectedVoteId]);

  useEffect(() => {
    if (selectedVoteId) {
      const vote = votes.find((v) => v.id === parseInt(selectedVoteId));
      if (vote) {
        const categories = vote.Categories;

        setCategories(categories);
      }
    } else {
      setCategories([]);
    }
  }, [selectedVoteId, votes]);

  useEffect(() => {
    setNumberPage(Math.ceil(students.length / numberPerpage));
  }, [numberPerpage]);
  const fetchVotes = async () => {
    const response = await getVotes();
    if (response.data) {
      setVotes(response.data);
    } else {
      toast(
        "Une erreur s'est produite lors de la récupération des votes disponibles.",
        {
          description: response.error,
        }
      );
    }
  };

  const fetchStudents = async () => {
    const vote = votes.find((v) => v.id === parseInt(selectedVoteId));
    const response = await getGroup(vote.groupId);
    if (response.data) {
      setNumberPage(Math.ceil(response.data.Students.length / numberPerpage));
      setStudents(response.data.Students);
    } else {
      toast(
        "Une erreur s'est produite lors de la récupération des votes disponibles.",
        {
          description: response.error,
        }
      );
    }
  };

  const handleCheckboxChange = (checked: boolean, studentId: number) => {
    if (checked) {
      setSelectedStudentId([...selectedStudentId, studentId]);
    } else {
      setSelectedStudentId(selectedStudentId.filter((id) => id !== studentId));
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filteredStudents = students.filter((student) =>
      student.name.toLowerCase().includes(event.target.value.toLowerCase())
    );

    setStudents(filteredStudents);
  };

  const handleAllCheckboxChange = (checked: boolean) => {
    if (checked) {
      setSelectedStudentId(students.map((student) => student.id));
    } else {
      setSelectedStudentId([]);
    }
  }
  const handleAddCandidacy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedVoteId && selectedCategoryId && selectedStudentId.length > 0) {
      setLoading(true);
      const response = await addCandidacy(
       {
        voteId: parseInt(selectedVoteId),
        categoryId: parseInt(selectedCategoryId),
        studentsId: selectedStudentId
       }
      );

      if (response.data) {
        toast.success("Succès", {
          description: "Les candidatures ont été ajoutées avec succès.",
        });
      } else {
        toast.error("Erreur", {
          description: response.error,
        });
      }
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gérer les Candidatures</CardTitle>
        <CardDescription>
          Ajouter des étudiants comme candidats dans les catégories de vote.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddCandidacy} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="select-vote">Sélectionner un Vote</Label>
            <Select
              onValueChange={setSelectedVoteId}
              value={selectedVoteId}
              required
            >
              <SelectTrigger id="select-vote">
                <SelectValue placeholder="Choisir un vote" />
              </SelectTrigger>
              <SelectContent>
                {votes.map((vote) => (
                  <SelectItem key={vote.id} value={vote.id.toString()}>
                    {vote.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedVoteId && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="select-category">
                  Sélectionner une Catégorie
                </Label>
                <Select
                  onValueChange={setSelectedCategoryId}
                  value={selectedCategoryId}
                  required
                >
                  <SelectTrigger id="select-category">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 mt-2">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Label htmlFor="search">Rechercher un Etudiant</Label>
                    <Input
                      id="search"
                      placeholder="Matricule ou Nom"
                      className="w-fit"
                      onChange={handleSearch}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search">Nombre par page</Label>
                    <Select
                      value={numberPerpage.toString()}
                      onValueChange={(e) => setNumberPerPage(parseInt(e))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="search">Page {numberPage}</Label>
                    <Select
                      value={currentPage.toString()}
                      onValueChange={(e) => setCurrentPage(parseInt(e))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: numberPage }, (_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Table>
                  <TableHeader className="font-semibold">
                    <TableRow>
                      <TableHead className="w-[10px]">
                        <Checkbox onCheckedChange={(e) => handleAllCheckboxChange(e as boolean)}/>
                      </TableHead>
                      <TableHead className="w-[10px]">Index</TableHead>
                      <TableHead className="w-[100px]">Matricule</TableHead>
                      <TableHead className="w-[100px]">Nom</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .slice(
                        currentPage * numberPerpage,
                        numberPerpage * (currentPage + 1)
                      )
                      .map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell className="w-[10px]">
                            <Checkbox
                              onCheckedChange={(e) =>
                                handleCheckboxChange(e as boolean, student.id)
                              }
                              checked={selectedStudentId.includes(student.id)}
                            />
                          </TableCell>
                          <TableCell className="w-[10px]">
                            {index + 1 + numberPerpage * currentPage}
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {student.matricule}
                          </TableCell>
                          <TableCell className="w-[100px]">
                            {student.firstName} {student.name}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter Candidature"}
          </Button>
        </form>
        {/* TODO: Afficher la liste des candidatures existantes pour le vote sélectionné */}
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;
