/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_BASE_URL } from "./constants";
import type { Vote, Student, Category, Group } from "./stores";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  count?: number; // Pour les opérations d'ajout/mise à jour
}

// --- Fonctions API pour les votes (visibles aux étudiants) ---

export const getAvailableVotes = async (): Promise<ApiResponse<Vote[]>> => {
  // TODO: Appel API pour récupérer tous les votes actifs et leurs groupes associés
  // Exemple (à adapter selon ton endpoint backend):
  try {
    const response = await fetch(`${API_BASE_URL}/vote/get`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Échec de la récupération des votes disponibles."
      );
    }
    const data = await response.json();
    return { data: data.votes }; // Supposons que ton API retourne { votes: [...] }
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};

export const loginStudent = async (
  matricule: string,
): Promise<ApiResponse<Student>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricule}),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Échec de la connexion étudiant.");
    }
    const data = await response.json();
 
    localStorage.setItem("access_token", data.access_token);
    return { data: data.student};
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};

export const getVoteDetails = async (
  voteId: number,
  groupId: number
): Promise<
  ApiResponse<any>
> => {

  try {
    const response = await fetch(`${API_BASE_URL}/vote/${voteId}/category/${groupId}`, {
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
     
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Échec de la récupération des détails du vote."
      );
    }
    const data = await response.json();
    
    return { data };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};

export const checkUserVoted = async (data : {
  voteId: number,
  studentId: number
}) : Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/studentVote/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("access_token")}`,
       },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();
    console.log(responseData)
    if(response.ok){
      return {data : responseData };
    }else{
      return {error : responseData.message || "Échec de la récupération des détails du vote."};
    }
    
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
}


export const submitStudentVote = async (voteData: {
  voteId: number;
  categoryId: number;
  voterStudentId: number;
  candidateStudentId: number;
}): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/studentVote/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("access_token")}`,
       },
      body: JSON.stringify(voteData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Échec de la soumission du vote.");
    }
    const data = await response.json();
    return { data: data };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};




export const createGroup = async (groupData: {
  name: string;
  description?: string;
}): Promise<ApiResponse<Group>> => {
  // TODO: Appel API pour créer un groupe
  // L'adminId devra venir du store Zustand ou d'un contexte d'auth réel.
  try {
    const response = await fetch(`${API_BASE_URL}/group/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(groupData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Échec de la création du groupe.");
    }
    const data = await response.json();
    return { data: data.group };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};

export const getGroup = async (id: number): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/group/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Échec de la récupération du groupe."
      );
    }
    const data = await response.json();
    return { data: data.group };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};

export const getGroups = async (): Promise<ApiResponse<any>> => {
  // TODO: Appel API pour obtenir la liste des groupes
  try {
    const response = await fetch(`${API_BASE_URL}/group`);
    console.log(response.status)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Échec de la récupération des groupes."
      );
    }
    const data = await response.json();
  
    return { data: data.groups };
  } catch (error: any) {
    console.log(error);
    return { error: error.message || "Erreur réseau." };
  }
};

export const createVote = async (voteData: {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  groupId: number;
  categories?: Omit<Category, "id" | "voteId">[];
}): Promise<ApiResponse<Vote>> => {
  // TODO: Appel API pour créer un vote
  try {
    const response = await fetch(`${API_BASE_URL}/vote/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(voteData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Échec de la création du vote.");
    }
    const data = await response.json();
    return { data: data.vote };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};

export const getVotes = async (): Promise<ApiResponse<any>> => {
  // TODO: Appel API pour obtenir la liste des votes
  try {
    const response = await fetch(`${API_BASE_URL}/vote/all`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Échec de la récupération des votes."
      );
    }
    const data = await response.json();
    return { data: data.votes };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};

export const getVote = async (id: number): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vote/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Échec de la récupération du vote.");
    }
    const data = await response.json();
    return { data: data.vote };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};

export const createCategory = async (categoryData: {
  name: string;
  description?: string;
  voteId: number;
}): Promise<ApiResponse<Category>> =>{
  try {
      const response = await fetch(`${API_BASE_URL}/category/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Échec de la création de la categorie."
        );
      }
      const data = await response.json();
      return { data: data.category };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
}

export const getCategoriesByVoteId = async (voteId: number): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/vote/${voteId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Échec de la récupération des categories."
      );
    }
    const data = await response.json();
    return { data: data.categories };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};

export const bulkUploadStudents = async (
  students: any[]
): Promise<
  ApiResponse<{
    createdCount: number;
    updatedCount: number;
    totalProcessed: number;
  }>
> => {
  // TODO: Appel API pour l'upload en masse des étudiants (comme vu précédemment)
  try {
    const response = await fetch(`${API_BASE_URL}/student/bulk-create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(students),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Échec de l'importation des étudiants."
      );
    }
    const data = await response.json();
    return { data: data };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};



export const addCandidacy = async (candidacyData: {
  voteId: number;
  categoryId: number;
  studentsId: number[];
}): Promise<ApiResponse<any>> => {
  // TODO: Appel API pour créer une candidature
  try {
    const response = await fetch(`${API_BASE_URL}/candidacy/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("access_token")}`,
       },
      body: JSON.stringify(candidacyData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Échec de l'ajout de la candidature."
      );
    }
    const data = await response.json();
    return { data: data };
  } catch (error: any) {
    return { error: error.message || "Erreur réseau." };
  }
};

// ... autres fonctions API pour l'admin (gestion des votes, categories, etc.)
