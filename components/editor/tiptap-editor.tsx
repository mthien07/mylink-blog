'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, List, ListOrdered,
  Quote, AlignLeft, AlignCenter, AlignRight, Link2, ImageIcon,
  Highlighter, Heading1, Heading2, Heading3, Undo, Redo
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function TiptapEditor({ content, onChange, placeholder = 'Bắt đầu viết nội dung bài viết...' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4' },
    },
  })

  if (!editor) return null

  const ToolbarButton = ({ onClick, active, title, children }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode
  }) => (
    <Button
      type="button" variant="ghost" size="icon"
      className={cn('h-8 w-8', active && 'bg-muted text-foreground')}
      onClick={onClick} title={title}
    >
      {children}
    </Button>
  )

  const addLink = () => {
    const url = window.prompt('Nhập URL:')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Nhập URL ảnh:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="border rounded-lg overflow-hidden tiptap-editor">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Tiêu đề 1">
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Tiêu đề 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Tiêu đề 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="In đậm">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Nghiêng">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch chân">
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Nổi bật">
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Căn trái">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Căn giữa">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Căn phải">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách số">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Trích dẫn">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Thêm liên kết">
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Thêm ảnh">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Hoàn tác">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Làm lại">
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
