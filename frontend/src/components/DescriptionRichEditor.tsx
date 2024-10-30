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
					'flex flex-col px-4 py-3 justify-start border-b border-r border-l border-gray-700 items-start w-full gap-3  text-base pt-4 rounded-bl-md rounded-br-md outline-none',
			},
		},
		onUpdate: ({ editor }) => {
			handleChange(editor.getHTML());
		},
		content: value,
	});

	return (
		<div className="w-full px-4">
			<Toolbar editor={editor} />
			<EditorContent style={{ whiteSpace: 'pre-line' }} editor={editor} />
		</div>
	);
};

export default DescriptionRichEditor;
