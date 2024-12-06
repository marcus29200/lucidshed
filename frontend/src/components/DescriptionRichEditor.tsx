import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Toolbar from './DescriptionRichEditorToolbar';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

import CopyFileEventHandler from './TiptapCopyImage';
import { useEffect } from 'react';
// editor height must be the same as all the fields in the form
const DescriptionRichEditor = ({ onChange, value }) => {
	const handleChange = (newContent: string) => {
		onChange(newContent);
	};
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Image.configure({ allowBase64: true }),
			CopyFileEventHandler,
			Link,
		],
		editorProps: {
			attributes: {
				class:
					'px-4 py-3 justify-start outline-solid outline-1 outline-gray-400 group-hover/editor:outline-gray-600 group-focus-within/editor:!outline-primary group-focus-within/editor:!outline-2 outline-offset-0 items-start w-full gap-3  text-base pt-4 rounded-bl-xl rounded-br-xl outline-none transition-all duration-100 min-h-[412px] max-h-[412px] overflow-y-auto',
			},
		},
		onUpdate: ({ editor }) => {
			handleChange(editor.getHTML());
		},
		content: value,
	});

	useEffect(() => {
		editor?.commands.setContent(value ?? '', false);
	}, [value]);

	return (
		<div className="w-full group/editor">
			<Toolbar editor={editor} />
			<EditorContent style={{ whiteSpace: 'pre-line' }} editor={editor} />
		</div>
	);
};

export default DescriptionRichEditor;
