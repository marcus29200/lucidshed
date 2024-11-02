export type SelectedMenuOption = {
	label: string;
	icon?: () => JSX.Element;
	onClick: (selectedRows: string[]) => void;
	isDestructive?: boolean;
};
