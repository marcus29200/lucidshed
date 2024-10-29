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
