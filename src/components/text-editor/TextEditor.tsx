import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import TiptapToolbar from "./TiptapToolbar";
import { SlashCommand } from "./SlashCommand";
import { TaskItemView } from "./TaskItemView";
import { ImageNodeView } from "./ImageNodeView";
import { marked } from "marked";
import TurndownService from "turndown";
import { useMemo } from "react";

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Initialize turndown service for HTML -> Markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
});

// Custom rule to preserve images with width/sizing as HTML
turndownService.addRule("images", {
  filter: "img",
  replacement: (_content, node: any) => {
    const alt = node.getAttribute("alt") || "";
    const src = node.getAttribute("src") || "";
    const width = node.style.width || node.getAttribute("width");
    const textAlign = node.getAttribute("data-text-align");

    // If image has custom attributes, preserve as HTML
    if (width || textAlign) {
      let style = "";
      if (width) style += `width: ${width};`;
      const alignAttr = textAlign ? ` data-text-align="${textAlign}"` : "";
      return `<img src="${src}" alt="${alt}" style="${style}"${alignAttr} />`;
    }

    // Standard markdown for simple images
    return `![${alt}](${src})`;
  },
});

// Custom rule to preserve text alignment
turndownService.addRule("textAlign", {
  filter: (node: any) => {
    if (!node.style) return false;
    const textAlign = node.style.textAlign;
    return (
      textAlign &&
      textAlign !== "left" &&
      ["p", "h1", "h2", "h3"].includes(node.nodeName.toLowerCase())
    );
  },
  replacement: (content, node: any) => {
    const textAlign = node.style.textAlign;
    const tag = node.nodeName.toLowerCase();

    // Preserve alignment using inline style attribute in HTML
    if (tag === "h1") {
      return `<h1 style="text-align: ${textAlign}">${content}</h1>`;
    } else if (tag === "h2") {
      return `<h2 style="text-align: ${textAlign}">${content}</h2>`;
    } else if (tag === "h3") {
      return `<h3 style="text-align: ${textAlign}">${content}</h3>`;
    } else {
      return `<p style="text-align: ${textAlign}">${content}</p>`;
    }
  },
});

// Configure marked to allow HTML
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Convert markdown to HTML for editor initialization
const markdownToHtml = (markdown: string): string => {
  return marked.parse(markdown, { async: false }) as string;
};

export default function TextEditor({ content, onChange }: TextEditorProps) {
  // Convert markdown to HTML for Tiptap
  // const htmlContent = useMemo(() => {
  //   if (!initialContent || initialContent.trim() === "") return "";
  //   try {
  //     return markdownToHtml(initialContent);
  //   } catch (err) {
  //     console.error("Failed to parse markdown:", err);
  //     return initialContent;
  //   }
  // }, [initialContent]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              parseHTML: (element) => {
                const width =
                  element.style.width || element.getAttribute("width");
                return width || null;
              },
              renderHTML: (attributes) => {
                if (!attributes.width) return {};
                return { style: `width: ${attributes.width}` };
              },
            },
            textAlign: {
              default: "left",
              parseHTML: (element) => {
                return (
                  element.style.textAlign ||
                  element.getAttribute("data-text-align") ||
                  "left"
                );
              },
              renderHTML: (attributes) => {
                if (!attributes.textAlign || attributes.textAlign === "left")
                  return {};
                return { "data-text-align": attributes.textAlign };
              },
            },
          };
        },
        addCommands() {
          return {
            ...this.parent?.(),
          };
        },
        addNodeView() {
          return ReactNodeViewRenderer(ImageNodeView);
        },
      }).configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(TaskItemView);
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing or use "/" for commands...',
      }),
      Typography,
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
      }),
      SlashCommand,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        // class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none p-8'
        class: "prose prose-invert max-w-none ",
      },
    },
  });

  // Debounced save function
  // const debouncedSave = useCallback(
  //   debounce(async (content: string) => {
  //     try {
  //       await onSave(content);
  //     } catch (err) {
  //       console.error("Failed to save:", err);
  //     }
  //   }, 500),
  //   [onSave],
  // );

  // Auto-save on content change
  // useEffect(() => {
  //   if (!editor) return;

  //   const handleUpdate = () => {
  //     const html = editor.getHTML();
  //     // Convert HTML to Markdown before saving
  //     const markdown = turndownService.turndown(html);
  //     debouncedSave(markdown);
  //   };

  //   editor.on("update", handleUpdate);

  //   return () => {
  //     editor.off("update", handleUpdate);
  //   };
  // }, [editor, debouncedSave]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="flex flex-col p-1 border rounded-md max-h-[calc(90vh-12rem)]">
      <div className="w-full p-1 flex flex-col gap-2 h-full">
        {/* Toolbar */}
        <div className="flex w-full items-center justify-center gap-2 shrink-0">
          <TiptapToolbar editor={editor} />
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <EditorContent
            editor={editor}
            className="p-1 [&>.tiptap]:min-h-[calc(90vh-18rem)] [&>.tiptap]:max-h-[calc(90vh-18rem)] [&>.tiptap]:p-2"
          />
        </div>
      </div>
    </div>
  );
}
