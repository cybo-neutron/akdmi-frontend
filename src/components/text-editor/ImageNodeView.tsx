import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { useState, useRef } from "react";
import { ImageViewer } from "./ImageViewer";

export function ImageNodeView({
  node,
  updateAttributes,
  selected,
}: ReactNodeViewProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const startWidth = useRef(0);
  const startX = useRef(0);

  // Get text alignment from node attributes
  const textAlign = node.attrs.textAlign || "left";

  const handleImageClick = (e: React.MouseEvent) => {
    // Only open viewer if not resizing
    if (!isResizing) {
      e.preventDefault();
      e.stopPropagation();
      setIsViewerOpen(true);
    }
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    direction: "left" | "right",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = imageRef.current?.offsetWidth || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const diff =
        direction === "right"
          ? moveEvent.clientX - startX.current
          : startX.current - moveEvent.clientX;
      const newWidth = Math.max(50, startWidth.current + diff * 2); // *2 because we resize from center
      updateAttributes({ width: `${newWidth}px` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <NodeViewWrapper
      className="image-node-wrapper my-4"
      style={{
        textAlign: textAlign as "left" | "center" | "right" | "justify",
      }}
    >
      <div className="relative inline-block group">
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || "Double-click to view"}
          className={`rounded-lg cursor-pointer transition-all ${
            selected
              ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-background"
              : ""
          }`}
          style={{ width: node.attrs.width || "auto" }}
          onDoubleClick={handleImageClick}
          draggable={false}
        />

        {/* Resize handles - only show when selected */}
        {selected && (
          <>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-8 bg-primary-500 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleMouseDown(e, "left")}
            />
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-8 bg-primary-500 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleMouseDown(e, "right")}
            />
          </>
        )}
      </div>

      <ImageViewer
        src={node.attrs.src}
        alt={node.attrs.alt}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </NodeViewWrapper>
  );
}
