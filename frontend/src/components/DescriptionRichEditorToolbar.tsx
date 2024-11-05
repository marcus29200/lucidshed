import {
	FormatBold,
	FormatItalic,
	FormatListBulleted,
	FormatListNumbered,
	FormatUnderlined,
	ImageSearch,
	StrikethroughS,
	Wallpaper,
} from '@mui/icons-material';
import { type Editor } from '@tiptap/react';
import { Heading2Icon } from '../icons/icons';
import {
	Button,
	IconButton,
	Menu,
	TextField,
	Tooltip,
	tooltipClasses,
} from '@mui/material';
import { useState } from 'react';
import { VisuallyHiddenInput } from './Styled';

type Props = {
	editor: Editor | null;
};

const Toolbar = ({ editor }: Props) => {
	const [imageAnchorEl, setImageAnchorEl] = useState<null | HTMLElement>(null);
	const [imageUrl, setImageUrl] = useState<string>('');
	// Close the Image menu
	const handleImageMenuClose = () => {
		setImageAnchorEl(null);
	};

	const handleLoadImageUrl = () => {
		if (editor && imageUrl) {
			editor.chain().focus().setImage({ src: imageUrl }).run();
			handleImageMenuClose();
			setImageUrl('');
		}
	};

	const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!editor || !event.target.files?.length) return;
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onloadend = () => {
			if (reader.result) {
				editor
					.chain()
					.focus()
					.setImage({ src: reader.result.toString() })
					.run();
				handleImageMenuClose();
			}
		};
		reader.readAsDataURL(file);
	};
	if (!editor) {
		return null;
	}

	return (
		<div
			className="px-2 py-1 rounded-tl-xl rounded-tr-xl flex justify-between items-start
    gap-5 w-full flex-wrap outline-solid outline-1 outline-gray-400 group-hover/editor:outline-gray-600 group-focus-within/editor:!outline-primary transition-all duration-100"
		>
			<div className="flex justify-start items-center gap-2 w-full lg:w-10/12 flex-wrap ">
				<IconButton
					className={`${
						editor.isActive('bold') ? 'active-tiptap-style' : ''
					} !p-1 !rounded-lg`}
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleBold().run();
					}}
				>
					<FormatBold className="w-5 h-5" />
				</IconButton>
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleItalic().run();
					}}
					className={`${
						editor.isActive('italic') ? 'active-tiptap-style' : ''
					} !p-1 !rounded-lg`}
				>
					<FormatItalic className="w-5 h-5" />
				</IconButton>
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleUnderline().run();
					}}
					className={`${
						editor.isActive('underline') ? 'active-tiptap-style' : ''
					} !p-1 !rounded-lg`}
				>
					<FormatUnderlined className="w-5 h-5" />
				</IconButton>
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleStrike().run();
					}}
					className={`${
						editor.isActive('strike') ? 'active-tiptap-style' : ''
					} !p-1 !rounded-lg`}
				>
					<StrikethroughS className="w-5 h-5" />
				</IconButton>
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleHeading({ level: 2 }).run();
					}}
					className={`${
						editor.isActive('heading') ? 'active-tiptap-style' : ''
					} !p-1 !rounded-lg`}
				>
					<Heading2Icon className="w-5 h-5" />
				</IconButton>

				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleBulletList().run();
					}}
					className={`${
						editor.isActive('bulletList') ? 'active-tiptap-style' : ''
					} !p-1 !rounded-lg`}
				>
					<FormatListBulleted className="w-5 h-5" />
				</IconButton>
				<IconButton
					onClick={(e) => {
						e.preventDefault();
						editor.chain().focus().toggleOrderedList().run();
					}}
					className={`${
						editor.isActive('orderedList') ? 'active-tiptap-style' : ''
					} !p-1 !rounded-lg`}
				>
					<FormatListNumbered className="w-5 h-5" />
				</IconButton>
				<Tooltip
					title="Add image URL"
					PopperProps={{
						sx: {
							[`& .${tooltipClasses.tooltip}`]: { background: '#000' },
						},
					}}
				>
					<IconButton
						onClick={(e) => {
							e.preventDefault();
							setImageAnchorEl(e.currentTarget);
						}}
						color={'default'}
					>
						<Wallpaper className="w-5 h-5" />
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={imageAnchorEl}
					open={Boolean(imageAnchorEl)}
					onClose={handleImageMenuClose}
					slotProps={{
						paper: {
							style: {
								borderRadius: '8px',
								padding: '5px',
							},
						},
					}}
				>
					<div className="flex flex-col px-4 gap-4">
						<div className="flex gap-2 items-center">
							{/* add image URL or upload from computer */}
							<TextField
								type="text"
								value={imageUrl}
								onChange={(e) => setImageUrl(e.target.value)}
								label="Enter image URL"
								style={{ width: '100%', padding: '5px', borderRadius: '4px' }}
							/>
							<Button onClick={() => handleLoadImageUrl()} size="small">
								Add Image
							</Button>
						</div>
						<div className="flex gap-2 items-center">
							Or
							{/* upload from computer */}
							<Button
								component="label"
								role={undefined}
								variant="contained"
								tabIndex={-1}
								startIcon={<ImageSearch />}
							>
								Upload image
								<VisuallyHiddenInput
									type="file"
									accept="image/*"
									onChange={(event) => handleUploadImage(event)}
								/>
							</Button>
						</div>
					</div>
				</Menu>
			</div>
		</div>
	);
};

export default Toolbar;
