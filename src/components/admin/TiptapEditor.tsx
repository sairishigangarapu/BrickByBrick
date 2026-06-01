"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

export default function TiptapEditor({ 
  content, 
  onChange 
}: { 
  content: string, 
  onChange: (html: string) => void 
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
        attributes: {
            class: 'min-h-[150px] p-4 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white prose max-w-none text-sm'
        }
    },
    immediatelyRender: false
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col border border-gray-200 bg-white shadow-sm w-full">
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-brand-surface">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}>
           <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}>
           <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}>
           <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}>
           <ListOrdered className="w-4 h-4" />
        </button>
      </div>
      <div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
