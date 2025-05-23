import { create } from "zustand";

// Définitions de types pour nos données
export interface Student {
  id: number;
 name: string;
 matricule: string;
  groupId: number; // Ajouté pour la gestion des groupes
}

export interface Group {
  id: number;
  name: string;
  description?: string;
}

export interface Vote {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "pending" | "active" | "completed" | "cancelled";
  groupId: number; // Ajouté pour lier le vote à un groupe
  group?: Group; // Pour inclure les détails du groupe si on le récupère
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  voteId: number;
}

export interface Candidate {
  studentId: number;
  firstName: string;
  lastName: string;
  // ... autres infos du student si besoin
}

interface AppState {
  // État étudiant (pour la session de vote)
  currentStudent: Student | null;
  setStudent: (student: Student | null) => void;

  // État admin (simplifié ici, un vrai admin aurait une auth JWT)
  isAdminLoggedIn: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;

  // TODO: Gérer l'état des votes disponibles, catégories, etc.
  // Cela pourrait être chargé au fur et à mesure des pages.
  availableVotes: Vote[];
  setAvailableVotes: (votes: Vote[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentStudent: null,
  setStudent: (student) => set({ currentStudent: student }),

  isAdminLoggedIn: false, // Pour l'instant, c'est juste un flag simple
  loginAdmin: () => set({ isAdminLoggedIn: true }),
  logoutAdmin: () => set({ isAdminLoggedIn: false }),

  availableVotes: [],
  setAvailableVotes: (votes) => set({ availableVotes: votes }),
}));
