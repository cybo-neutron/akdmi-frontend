import { useTheme } from "@/store/useTheme";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LaptopMinimal } from "lucide-react";

type Theme = "light" | "dark" ;

const cycle: Theme[] = ["light", "dark" ];

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    const current = cycle.indexOf(theme as Theme);
    const next = cycle[(current + 1) % cycle.length];
    setTheme(next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={`Switch theme (current: ${theme})`}
      className="transition-all hover:scale-105 active:scale-95"
    >
      {theme === "light" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform rotate-0" />
      ) : theme === "dark" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform" />
      ) : (
        <LaptopMinimal className="h-[1.2rem] w-[1.2rem] transition-transform" />
      )}
    </Button>
  );
};

export default ThemeSelector;
