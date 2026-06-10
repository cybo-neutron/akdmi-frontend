import { useTheme } from "@/store/useTheme";
import CustomDropDown from "@/components/custom/CustomDropDown";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LaptopMinimal } from "lucide-react";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  return (
    <CustomDropDown
      TriggerComponent={
        <Button variant="ghost" size="icon" className="capitalize">
          {theme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : theme === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <LaptopMinimal className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      }
      menuItems={[
        {
          onClickAction: () => setTheme("light"),
          Component: (
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </div>
          ),
        },
        {
          onClickAction: () => setTheme("dark"),
          Component: (
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </div>
          ),
        },
        {
          onClickAction: () => setTheme("system"),
          Component: (
            <div className="flex items-center gap-2">
              <LaptopMinimal className="h-4 w-4" />
              <span>System</span>
            </div>
          ),
        },
      ]}
    />
  );
};

export default ThemeSelector;
