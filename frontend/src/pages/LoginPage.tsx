import React, { useState } from "react";
import { useNavigate} from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/stores";
import { loginStudent } from "@/lib/api";
import { toast } from "sonner";

function LoginPage() {
  const navigate = useNavigate();
  const setStudent = useAppStore((state) => state.setStudent);

  const [matricule, setMatricule] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricule.trim()) {
      toast("Champs manquants", {
        description: "Veuillez entrer votre numéro de matricule.",
      });
      return;
    }

    setLoading(true);
    const response = await loginStudent(matricule);
    setLoading(false);

    if (response.data) {
    
      setStudent(response.data);
      toast("Connexion réussie", {
        description: `Bienvenue, ${response.data.name}`,
      });
      navigate("/");
    } else if (response.error) {
      toast("Échec de la connexion", {
        description: response.error,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
      {" "}
      {/* Ajuste la hauteur en fonction du header/footer */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Connexion au Vote</CardTitle>
          <CardDescription>
            Entrez votre numéro de matricule pour participer au vote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="matricule">Numéro de Matricule</Label>
              <Input
                id="matricule"
                type="text"
                placeholder="Ex: S12345"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter et voter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
