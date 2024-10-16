import { Button, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
	createComment,
	CreateCommentPayload,
	mapRawComment,
	UserComment,
} from '../api/comments';
import { StoryAPI } from '../api/stories';
import { useLoaderData } from 'react-router-dom';
import UserWithAvatar from './UserWithAvatar';

type UserCommentsProps = {
	comments: UserComment[];
	className?: string;
};

const UserComments: React.FC<UserCommentsProps> = ({ comments, className }) => {
	const story = useLoaderData() as StoryAPI; // TODO: more generic (orgid and itemid) if other items can add comments

	const [newComments, setNewComments] = useState<UserComment[]>(comments);
	const [newCommentContent, setNewCommentContent] = useState<string>('');
	useEffect(() => {
		setNewComments(comments);
	}, [comments]);

	const handleAddComment = (e: React.FormEvent) => {
		e.preventDefault();
		if (newCommentContent.trim()) {
			const newComment: CreateCommentPayload = {
				description: newCommentContent,
			};
			createComment({
				orgId: story.organization_id,
				workItemId: story.id,
				data: newComment,
			}).then((comment) => {
				setNewComments([...newComments, mapRawComment(comment)]);
				setNewCommentContent('');
			});
		}
	};

	return (
		<>
			<section
				className={`${
					className ?? ''
				} bg-neutral-lighter rounded-md p-6 antialiased`}
			>
				<h6 className="text-left pb-4">Comments</h6>
				<div className="px-4 flex flex-col gap-y-9">
					{Array.isArray(newComments) && newComments.length > 0 ? (
						newComments.map((comment) => (
							<div key={comment.id} className="relative">
								<article className="p-6 text-base rounded-lg bg-[#ffffff]">
									<footer className="flex justify-between items-center mb-2">
										<div className="flex items-center">
											<p className="inline-flex font-poppins items-center mr-3 text-sm text-gray-900 font-semibold">
												<UserWithAvatar userId={comment.user} />
											</p>
											<p className="text-sm text-gray-800 font-poppins">
												<time dateTime={comment.createdAt}>
													{comment.createdAt}
												</time>
											</p>
										</div>
									</footer>
									<p className="text-gray-900 font-poppins text-left">
										{comment.description}
									</p>
								</article>
							</div>
						))
					) : (
						<p>No comments available.</p>
					)}
					<div className="bg-white rounded-lg p-6">
						<div className="flex items-center">
							<h2 className="text-lg lg:text-2xl font-bold text-gray-900 font-poppins">
								Discussion ({newComments.length})
							</h2>
						</div>
						<form onSubmit={handleAddComment}>
							<div className="py-2 px-4 mb-4">
								<TextField
									variant="outlined"
									size="small"
									margin="dense"
									fullWidth
									label="Write a comment..."
									id="comment"
									name="comment"
									multiline
									rows={3}
									value={newCommentContent}
									onChange={(e) => setNewCommentContent(e.target.value)}
								/>
							</div>
							<Button
								type="submit"
								variant="contained"
								className="inline-flex font-poppins items-center py-2.5 px-4 ml-4 text-xs font-medium text-center text-white  rounded-lg focus:ring-4 focus:ring-primary-200 "
							>
								Post comment
							</Button>
						</form>
					</div>
				</div>
			</section>
		</>
	);
};

export default UserComments;
