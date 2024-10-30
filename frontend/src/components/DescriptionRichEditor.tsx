import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Toolbar from './DescriptionRichEditorToolbar';
import Underline from '@tiptap/extension-underline';

const DescriptionRichEditor = ({ onChange, value }) => {
	const handleChange = (newContent: string) => {
		onChange(newContent);
	};
	const editor = useEditor({
		extensions: [StarterKit, Underline],
		editorProps: {
			attributes: {
				class:
					'flex flex-col px-4 py-3 justify-start border-b border-r border-l border-gray-400 group-hover/editor:border-gray-600 items-start w-full gap-3  text-base pt-4 rounded-bl-xl rounded-br-xl outline-none',
			},
		},
		onUpdate: ({ editor }) => {
			handleChange(editor.getHTML());
		},
		content: value,
	});

	return (
		<div className="w-full group/editor">
			<Toolbar editor={editor} />
			<EditorContent style={{ whiteSpace: 'pre-line' }} editor={editor} />
		</div>
	);
};

export default DescriptionRichEditor;
