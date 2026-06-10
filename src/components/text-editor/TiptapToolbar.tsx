import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImagePlus,
  Undo,
  Redo,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const setAlignment = (editor: any, alignment: string) => {
  // Check if we're in an image node
  const { state } = editor;
  const { selection } = state;
  const node = state.doc.nodeAt(selection.from);

  if (node?.type.name === "image") {
    // Update image alignment directly
    editor
      .chain()
      .focus()
      .updateAttributes("image", { textAlign: alignment })
      .run();
  } else {
    // Use standard text align for paragraphs/headings
    editor.chain().focus().setTextAlign(alignment).run();
  }
};

const isAlignmentActive = (editor: any, alignment: string) => {
  const { state } = editor;
  const { selection } = state;
  const node = state.doc.nodeAt(selection.from);

  if (node?.type.name === "image") {
    return node.attrs.textAlign === alignment;
  }
  return editor.isActive({ textAlign: alignment });
};

const insertImage = (editor: any) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      editor.chain().focus().setImage({ src: dataUrl }).run();
    };
    reader.readAsDataURL(file);
  };
  input.click();
};

const toolbarOptions = (editor: any) => [
  {
    title: "Bold",
    icon: <Bold size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().toggleBold().run(),
    isActive: () => editor.isActive("bold"),
  },
  {
    title: "Italic",
    icon: <Italic size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().toggleItalic().run(),
    isActive: () => editor.isActive("italic"),
  },
  {
    title: "Strikethrough",
    icon: <Strikethrough size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().toggleStrike().run(),
    isActive: () => editor.isActive("strike"),
  },
  { type: "separator" },
  {
    title: "Heading 1",
    icon: <Heading1 size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => editor.isActive("heading", { level: 1 }),
  },
  {
    title: "Heading 2",
    icon: <Heading2 size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => editor.isActive("heading", { level: 2 }),
  },
  {
    title: "Heading 3",
    icon: <Heading3 size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => editor.isActive("heading", { level: 3 }),
  },
  { type: "separator" },
  {
    title: "Bullet List",
    icon: <List size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().toggleBulletList().run(),
    isActive: () => editor.isActive("bulletList"),
  },
  {
    title: "Numbered List",
    icon: <ListOrdered size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.isActive("orderedList"),
  },
  {
    title: "Task List",
    icon: <ListChecks size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().toggleTaskList().run(),
    isActive: () => editor.isActive("taskList"),
  },
  { type: "separator" },
  {
    title: "Align Left",
    icon: <AlignLeft size={16} strokeWidth={2} />,
    command: () => setAlignment(editor, "left"),
    isActive: () => isAlignmentActive(editor, "left"),
  },
  {
    title: "Align Center",
    icon: <AlignCenter size={16} strokeWidth={2} />,
    command: () => setAlignment(editor, "center"),
    isActive: () => isAlignmentActive(editor, "center"),
  },
  {
    title: "Align Right",
    icon: <AlignRight size={16} strokeWidth={2} />,
    command: () => setAlignment(editor, "right"),
    isActive: () => isAlignmentActive(editor, "right"),
  },
  {
    title: "Align Justify",
    icon: <AlignJustify size={16} strokeWidth={2} />,
    command: () => setAlignment(editor, "justify"),
    isActive: () => isAlignmentActive(editor, "justify"),
  },
  { type: "separator" },
  {
    title: "Insert Image",
    icon: <ImagePlus size={16} strokeWidth={2} />,
    command: () => insertImage(editor),
    isActive: () => false,
  },
  { type: "separator" },
  {
    title: "Undo (Ctrl+Z)",
    icon: <Undo size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().undo().run(),
    isActive: () => editor.can().undo(),
  },
  {
    title: "Redo (Ctrl+Y)",
    icon: <Redo size={16} strokeWidth={2} />,
    command: () => editor.chain().focus().redo().run(),
    isActive: () => editor.can().redo(),
  },
];

const TiptapToolbar = ({ editor }: { editor: any }) => {
  return (
    <div className="flex items-center gap-2 border-slate-700/50">
      <div className="flex gap-1 items-center border border-foreground/20 rounded-sm p-1">
        {toolbarOptions(editor).map((option, index) => {
          if (option.type === "separator") {
            return (
              <Separator
                key={`sep-${index}`}
                orientation="vertical"
                className="h-6 bg-foreground/20"
              />
            );
          }
          return (
            <Button
              key={option.title}
              variant="ghost"
              size="icon"
              onClick={option.command}
              className={cn(
                option.isActive?.() && "bg-foreground/20",
                "text-foreground hover:bg-foreground/20 rounded-sm h-7 w-7 ",
              )}
              title={option.title}
            >
              {option.icon}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default TiptapToolbar;
