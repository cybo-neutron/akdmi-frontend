import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const TaskItemView = ({ node, updateAttributes }: ReactNodeViewProps) => {
  const isChecked = node.attrs.checked;

  return (
    <NodeViewWrapper className="flex items-start gap-2 mb-1">
      <Checkbox
        checked={isChecked}
        onCheckedChange={(checked) => updateAttributes({ checked })}
        className="flex-shrink-0 mt-1.5"
      />
      <NodeViewContent
        as="div"
        className={cn(
          "flex-1 text-foreground",
          isChecked && "line-through opacity-60",
        )}
      />
    </NodeViewWrapper>
  );
};
