import React from "react";
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";

interface MenuItemType {
  onClickAction: () => void;
  Component?: React.ReactNode;
}

interface CustomDropDownType {
  TriggerComponent: React.ReactNode;
  menuItems: MenuItemType[];
}

const CustomDropDown = ({
  TriggerComponent,
  menuItems,
}: CustomDropDownType) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {TriggerComponent}

        {/* <Button variant="outline" className="capitalize">
          Theme: {theme}
        </Button> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {menuItems.map((item, index) => (
            <DropdownMenuItem
              onClick={() => item.onClickAction()}
              key={index}
            >
              {item.Component}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomDropDown;
