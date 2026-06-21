"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo } from "react";

import { RichTextToolbar } from "@/components/editor/RichTextToolbar";
import { countRichTextCharacters, countRichTextWords } from "@/lib/editor/wordCount";
import { isEmptyRichText, toEditorHtml } from "@/lib/security/richText";
import { cn } from "@/lib/utils/cn";

export interface RichTextEditorProps {
  readonly id?: string;
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
  readonly onBlur?: () => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly error?: boolean;
  readonly minHeight?: number;
  readonly showStats?: boolean;
}

export function RichTextEditor({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Start writing…",
  disabled = false,
  error = false,
  minHeight = 240,
  showStats = true,
}: RichTextEditorProps): React.JSX.Element {
  const editorContent = useMemo(() => toEditorHtml(value), [value]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: editorContent,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: "tiptap max-w-none min-h-[inherit] px-4 py-3 focus:outline-none",
        "aria-label": placeholder,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      onChange(isEmptyRichText(html) ? null : html);
    },
    onBlur: () => {
      onBlur?.();
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();
    const nextHtml = editorContent;

    if (currentHtml === nextHtml) {
      return;
    }

    if (isEmptyRichText(currentHtml) && isEmptyRichText(nextHtml)) {
      return;
    }

    editor.commands.setContent(nextHtml, { emitUpdate: false });
  }, [editor, editorContent]);

  const wordCount = countRichTextWords(value);
  const characterCount = countRichTextCharacters(value);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border bg-background shadow-sm",
        error && "border-destructive ring-1 ring-destructive/20",
        disabled && "opacity-60",
      )}
    >
      <RichTextToolbar editor={editor} />
      <div style={{ minHeight }} className="rich-text-editor-content">
        <EditorContent editor={editor} />
      </div>
      {showStats ? (
        <div className="flex items-center justify-end gap-4 border-t px-3 py-2 text-xs text-muted-foreground">
          <span>{wordCount} words</span>
          <span>{characterCount} characters</span>
        </div>
      ) : null}
    </div>
  );
}
