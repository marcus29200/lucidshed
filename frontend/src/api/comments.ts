import dayjs from 'dayjs';
import { BASE_URL } from '../environment';
import { getAuthHeaders } from './utils';

export type CreateCommentPayload = {
	description: string;
};
export type RawComment = {
	id: string;
	work_item_id: number;
	created_by_id: string;
	description: string;
	created_at: Date;
};
export type CommentsPage = {
	items: RawComment[];
	cursor: string | null;
};
export type UserComment = {
	id: string;
	workItemId: number;
	user: string;
	description: string;
	createdAt: string; // MMM dd, yyyy h:mm a
};
export const mapRawComment = (comment: RawComment): UserComment => {
	return {
		id: comment.id,
		description: comment.description,
		user: comment.created_by_id,
		createdAt: dayjs(comment.created_at).format('MMM DD, YYYY h:mm a'),
		workItemId: comment.work_item_id,
	};
};
export const mapCommentsPage = (commentsPage: CommentsPage): UserComment[] => {
	return commentsPage.items.map((c) => mapRawComment(c));
};

export const getAllComments = async ({
	orgId,
	workItemId,
}: {
	orgId: string;
	workItemId: number;
}) => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/engineering/${workItemId}/comments`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(),
			},
		}
	);
	if (!res.ok) {
		throw res;
	}
	const commentsPage = (await res.json()) as CommentsPage;
	return mapCommentsPage(commentsPage);
};

export const createComment = async ({
	orgId,
	workItemId,
	data,
}: {
	orgId: string;
	workItemId: number;
	data: CreateCommentPayload;
}) => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/engineering/${workItemId}/comments`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(),
			},
			body: JSON.stringify(data),
		}
	);
	if (!res.ok) {
		throw res;
	}
	return await res.json();
};

export const updateComment = async ({
	orgId,
	workItemId,
	commentId,
	data,
}: {
	orgId: string;
	workItemId: number;
	commentId: string;
	data: CreateCommentPayload;
}) => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/engineering/${workItemId}/comments/${commentId}`,
		{
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(),
			},
			body: JSON.stringify(data),
		}
	);
	if (!res.ok) {
		throw res;
	}
	return await res.json();
};
