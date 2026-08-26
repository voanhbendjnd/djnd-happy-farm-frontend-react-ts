import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import { Button, Space, Divider } from 'antd';
import {
    BoldOutlined, ItalicOutlined, UnderlineOutlined, StrikethroughOutlined,
    OrderedListOutlined, UnorderedListOutlined, LinkOutlined,
} from '@ant-design/icons';

export interface RichTextEditorRef {
    getJSON: () => JSONContent;
    getHTML: () => string;
    isEmpty: () => boolean;
}

interface RichTextEditorProps {
    /** Chỉ dùng để KHỞI TẠO nội dung ban đầu (uncontrolled). */
    initialContent?: JSONContent | null;
    placeholder?: string;
    minHeight?: number;
}

const COLORS = ['#000000', '#f5222d', '#fa8c16', '#52c41a', '#1677ff', '#722ed1'];

/**
 * Rich Text Editor kiểu Word/Google Docs dựa trên Tiptap.
 *
 * QUAN TRỌNG: Đây là UNCONTROLLED component.
 * - KHÔNG setState ở cha mỗi keystroke -> tránh re-render toàn bộ page.
 * - Cha lấy dữ liệu qua ref.current.getJSON() CHỈ khi submit.
 * - Dùng key={editingId ?? 'new'} ở cha để force remount khi đổi record
 *   (giữ nguyên cách bạn đang làm, đúng rồi).
 */
const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
    ({ initialContent, placeholder = 'Nhập mô tả...', minHeight = 140 }, ref) => {
        const editor = useEditor({
            extensions: [
                StarterKit,
                Underline,
                TextStyle,
                Color,
                Link.configure({ openOnClick: false, autolink: true }),
            ],
            content: initialContent ?? '',
            editorProps: {
                attributes: {
                    style: `min-height:${minHeight}px; padding: 8px 12px; outline: none;`,
                    'data-placeholder': placeholder,
                },
            },
            // Không còn onUpdate gọi setState của cha nữa.
            // Tiptap tự quản lý nội dung trong nội bộ editor instance.
        });

        useImperativeHandle(ref, () => ({
            getJSON: () => editor?.getJSON() ?? { type: 'doc', content: [] },
            getHTML: () => editor?.getHTML() ?? '',
            isEmpty: () => editor?.isEmpty ?? true,
        }), [editor]);

        useEffect(() => () => editor?.destroy(), [editor]);

        if (!editor) return null;

        const setLink = () => {
            const previousUrl = editor.getAttributes('link').href as string | undefined;
            const url = window.prompt('Nhập URL:', previousUrl || '');
            if (url === null) return;
            if (url === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        };

        return (
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <div style={{ padding: '6px 8px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                    <Space size={4} wrap>
                        <Button size="small" type={editor.isActive('bold') ? 'primary' : 'default'}
                                icon={<BoldOutlined />} onClick={() => editor.chain().focus().toggleBold().run()} />
                        <Button size="small" type={editor.isActive('italic') ? 'primary' : 'default'}
                                icon={<ItalicOutlined />} onClick={() => editor.chain().focus().toggleItalic().run()} />
                        <Button size="small" type={editor.isActive('underline') ? 'primary' : 'default'}
                                icon={<UnderlineOutlined />} onClick={() => editor.chain().focus().toggleUnderline().run()} />
                        <Button size="small" type={editor.isActive('strike') ? 'primary' : 'default'}
                                icon={<StrikethroughOutlined />} onClick={() => editor.chain().focus().toggleStrike().run()} />
                        <Divider type="vertical" />
                        <Button size="small" type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Button>
                        <Button size="small" type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
                        <Divider type="vertical" />
                        <Button size="small" type={editor.isActive('bulletList') ? 'primary' : 'default'}
                                icon={<UnorderedListOutlined />} onClick={() => editor.chain().focus().toggleBulletList().run()} />
                        <Button size="small" type={editor.isActive('orderedList') ? 'primary' : 'default'}
                                icon={<OrderedListOutlined />} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
                        <Button size="small" type={editor.isActive('link') ? 'primary' : 'default'}
                                icon={<LinkOutlined />} onClick={setLink} />
                        <Divider type="vertical" />
                        {COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => editor.chain().focus().setColor(color).run()}
                                title={color}
                                style={{
                                    width: 18, height: 18, borderRadius: '50%', background: color,
                                    border: editor.isActive('textStyle', { color }) ? '2px solid #000' : '1px solid #d9d9d9',
                                    cursor: 'pointer', padding: 0,
                                }}
                            />
                        ))}
                    </Space>
                </div>
                <EditorContent editor={editor} />
            </div>
        );
    }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;