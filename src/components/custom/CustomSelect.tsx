import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MenuItemType {
  title: string;
  value: string;
  Component?: React.ReactNode;
}

interface CustomSelectType {
  placeholder: string;
  menuItems: MenuItemType[];
  triggerClassName?: string;
  contentClassName?: string;
  onValueChange: (value: string) => void;
}

const CustomSelect = ({
  placeholder,
  menuItems,
  triggerClassName,
  contentClassName,
  onValueChange,
}: CustomSelectType) => {
  return (
    <div>
      <Select onValueChange={onValueChange}>
        <SelectTrigger className={cn(triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className={cn(contentClassName)}>
          <SelectGroup>
            {menuItems.map((item) => (
              <SelectItem value={item.value} key={item.value}>
                {item.title ? item.title : item.Component}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomSelect;
