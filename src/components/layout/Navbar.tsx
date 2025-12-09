import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";

interface UserMenuProps {
  user: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  onLogout: () => void;
}

export const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { updateProfile } = useAuthStore();

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atualização do perfil quando necessário
  const handleProfileUpdate = () => {
    updateProfile();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão de avatar */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition"
      >
        <img
          src={user?.avatarUrl || "/default-avatar.png"}
          alt="Avatar"
          className="h-10 w-10 rounded-full object-cover"
        />
      </button>

      {/* Menu aberto */}
      {isOpen && (
        <div
          className="
            absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border 
            animate-fadeIn z-50
          "
        >
          <div className="p-3 border-b">
            <p className="font-medium">{user?.name || "Usuário"}</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>

          <ul className="p-2">
            <li>
              <button
                onClick={handleProfileUpdate}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Atualizar Perfil
              </button>
            </li>

            <li>
              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-red-600 rounded-md hover:bg-red-100"
              >
                Sair
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

