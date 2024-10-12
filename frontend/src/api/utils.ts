export const getAuthHeaders = () => {
	const token = localStorage.getItem('token');
	const headers = {
		Authorization: `Bearer ${token}`,
	};
	return headers;
};
export const copyLink = async (contextPath?: string) => {
	await navigator.clipboard.writeText(
		`${window.location.href}${contextPath ? '/' + contextPath : ''}`
	);
};
