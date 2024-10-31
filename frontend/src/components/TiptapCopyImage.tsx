import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';

const ALLOWED_MIME_TYPES = ['image']; // TODO: add more if needed

const isFileValid = (file: File) => {
	return ALLOWED_MIME_TYPES.some((type) => file?.type?.indexOf(type) === 0);
};
/**
 * This is an implementation from {@link https://github.com/awcodes/filament-tiptap-editor/discussions/404}
 * @param view
 * @param file
 * @returns
 */
const processFile = (view: EditorView, file: File | null) => {
	if (!file || !isFileValid(file)) {
		return;
	}

	const { schema } = view.state;

	const reader = new FileReader();
	const isImage = file.type.indexOf('image') === 0;

	if (isImage) {
		reader.onload = (readerEvent) => {
			if (!readerEvent.target) {
				return;
			}
			const node = schema.nodes.image.create({
				src: readerEvent.target.result,
			});
			const transaction = view.state.tr.replaceSelectionWith(node);
			view.dispatch(transaction);
		};
		reader.readAsDataURL(file);
		return;
	}
};
const CopyFileEventHandler = Extension.create({
	name: 'copyFileEventHandler',

	addProseMirrorPlugins() {
		return [
			new Plugin({
				editor: this.editor,
				key: new PluginKey('copyFileEventHandler'),
				props: {
					handlePaste: (view, event) => {
						const items = event.clipboardData?.items;
						if (!items) {
							return;
						}
						for (const item of items) {
							event.preventDefault();
							processFile(view, item.getAsFile());
						}
					},

					handleDrop: (view, event) => {
						const hasFiles =
							event.dataTransfer &&
							event.dataTransfer.files &&
							event.dataTransfer.files.length;

						if (!hasFiles) {
							return;
						}
						event.preventDefault();

						Array.from(event.dataTransfer.files).forEach((image) => {
							processFile(view, image);
						});
					},
				},
			}),
		];
	},
});

export default CopyFileEventHandler;
