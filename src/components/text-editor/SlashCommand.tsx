import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Type,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
} from "lucide-react";
import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import { cn } from "@/lib/utils";
import tippy from "tippy.js";

// Command Menu Items
const COMMAND_ITEMS = [
  {
    title: "Text",
    description: "Start writing with plain text",
    icon: <Type size={16} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading",
    icon: <Heading1 size={16} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 size={16} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Medium section heading",
    icon: <Heading3 size={16} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: <List size={16} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: <ListOrdered size={16} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Task List",
    description: "Track tasks with a to-do list",
    icon: <ListChecks size={16} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote",
    icon: <Quote size={16} />,
    command: ({ editor, range }: any) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
];

// Command Menu Component
export interface CommandsListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const CommandsList = React.forwardRef<CommandsListRef, any>(
  (props, ref) => {
    const { items, command } = props;
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [items, command],
    );

    React.useImperativeHandle(
      ref,
      () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
          if (event.key === "ArrowUp") {
            setSelectedIndex(
              (selectedIndex + items.length - 1) % items.length,
            );
            return true;
          }

          if (event.key === "ArrowDown") {
            setSelectedIndex((selectedIndex + 1) % items.length);
            return true;
          }

          if (event.key === "Enter") {
            selectItem(selectedIndex);
            return true;
          }

          return false;
        },
      }),
      [selectedIndex, items.length, selectItem],
    );

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    return (
      <div className="bg-secondary-900/60 rounded-sm   border-[0.5px] border-secondary-200/20 backdrop-blur-xl shadow-md w-[200px] max-h-80 overflow-auto">
        {props.items.length ? (
          props.items.map((item: any, index: number) => (
            <button
              key={index}
              className={cn(
                "flex items-center gap-4 w-full text-left p-1 rounded  transition-colors text-secondary-100",
                index === selectedIndex && "bg-secondary-800",
              )}
              onClick={() => selectItem(index)}
              onMouseOver={() => setSelectedIndex(index)}
            >
              <div className="">{item.icon}</div>
              <div>
                <div className=" font-light font-[Ubuntu] text-sm text-secondary-100">
                  {item.title}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-muted-foreground text-sm p-2">No results</div>
        )}
      </div>
    );
  },
);

CommandsList.displayName = "CommandsList";

// Slash Command Extension
export const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          return COMMAND_ITEMS.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()),
          );
        },
        render: () => {
          let component: ReactRenderer;
          let popup: any;

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(CommandsList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate(props: any) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown(props: any) {
              if (props.event.key === "Escape") {
                popup[0].hide();
                return true;
              }

              if (props.event.key === "Enter") {
                // Let the component handle the Enter key
                const handled = (component.ref as CommandsListRef | null)?.onKeyDown(props);
                // Hide popup after command execution
                if (handled && popup && popup[0]) {
                  setTimeout(() => popup[0].hide(), 100);
                }
                return handled;
              }

              return (component.ref as CommandsListRef | null)?.onKeyDown(props);
            },

            onExit() {
              if (popup && popup[0]) {
                popup[0].hide();
              }
              popup?.forEach((p: any) => p.destroy());
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
