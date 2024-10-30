import {
	FormatBold,
	FormatItalic,
	FormatListBulleted,
	FormatListNumbered,
	FormatUnderlined,
	StrikethroughS,
} from '@mui/icons-material';
import { type Editor } from '@tiptap/react';
import { Heading2Icon } from '../icons/icons';
import { IconButton } from '@mui/material';

type Props = {
	editor: Editor | null;
};

const Toolbar = ({ editor }: Props) => {
	if (!editor) {
		return null;
	}
	return (
		<div
			className="px-2 rounded-tl-xl rounded-tr-xl flex justify-between items-start
    gap-5 w-full flex-wrap border border-gray-400 group-hover/editor:border-gray-600 group-focus-within/editor:!border-primary transition-all duration-100"
		>
			<div className="flex justify-start items-center gap-2 w-full lg:w-10/12 flex-wrap ">
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleBold().run();
					}}
					color={editor.isActive('bold') ? 'primary' : 'default'}
				>
					<FormatBold className="w-5 h-5" />
				</IconButton>
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleItalic().run();
					}}
					color={editor.isActive('italic') ? 'primary' : 'default'}
				>
					<FormatItalic className="w-5 h-5" />
				</IconButton>
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleUnderline().run();
					}}
					color={editor.isActive('underline') ? 'primary' : 'default'}
				>
					<FormatUnderlined className="w-5 h-5" />
				</IconButton>
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleStrike().run();
					}}
					color={editor.isActive('strike') ? 'primary' : 'default'}
				>
					<StrikethroughS className="w-5 h-5" />
				</IconButton>
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleHeading({ level: 2 }).run();
					}}
					color={editor.isActive('heading') ? 'primary' : 'default'}
				>
					<Heading2Icon className="w-5 h-5" />
				</IconButton>

				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleBulletList().run();
					}}
					color={editor.isActive('bulletList') ? 'primary' : 'default'}
				>
					<FormatListBulleted className="w-5 h-5" />
				</IconButton>
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleOrderedList().run();
					}}
					color={editor.isActive('orderedList') ? 'primary' : 'default'}
				>
					<FormatListNumbered className="w-5 h-5" />
				</IconButton>
			</div>
		</div>
	);
};

export default Toolbar;
