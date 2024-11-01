export const getStoredSortState = (
	tableId: string
): { [key: string]: boolean } => {
	try {
		const storedSortedKey = localStorage.getItem(`${tableId}_sortKey`);
		const storedSortedOrder = localStorage.getItem(`${tableId}_sortOrder`);
		if (!storedSortedKey) return {};
		return { [storedSortedKey]: storedSortedOrder === 'desc' };
	} catch (e) {
		console.error(e);
		return {};
	}
};

export const getStoredGroupByOption = (tableId: string): string | undefined => {
	try {
		const storedGroupOption = localStorage.getItem(`${tableId}_groupOption`);
		if (!storedGroupOption) return;
		return storedGroupOption;
	} catch (e) {
		console.error(e);
	}
};

export const setStoredGroupByOption = (
	tableId: string,
	value?: string
): void => {
	try {
		if (value) {
			localStorage.setItem(`${tableId}_groupOption`, value);
			return;
		}
		localStorage.removeItem(`${tableId}_groupOption`);
	} catch (e) {
		console.error(e);
	}
};
