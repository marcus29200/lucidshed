import { Button, TextField } from '@mui/material';
import React, { useState } from 'react';
type Reply = {
	ReplyId: string;
	Author: string;
	Content: string;
	Date: string;
};

type Comment = {
	CommentId: string;
	Author: string;
	Content: string;
	Date: string;
	Replies: Reply[];
};

type UserCommentsProps = {
	comments: Comment[];
	className?: string;
};

const UserComments: React.FC<UserCommentsProps> = ({ comments, className }) => {
	const [newComments, setNewComments] = useState<Comment[]>(comments);
	const [newCommentContent, setNewCommentContent] = useState<string>('');
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [newReplyContent, setNewReplyContent] = useState<string>('');

	const handleAddComment = (e: React.FormEvent) => {
		e.preventDefault();
		if (newCommentContent.trim()) {
			const newComment: Comment = {
				CommentId: Date.now().toString(),
				Author: 'Current User', // Replace with actual user data
				Content: newCommentContent,
				Date: new Date().toLocaleDateString(),
				Replies: [],
			};

			setNewComments([...newComments, newComment]);
			setNewCommentContent('');
		}
	};

	const handleReply = (commentId: string) => {
		if (newReplyContent.trim()) {
			const updatedComments = newComments.map((comment) => {
				if (comment.CommentId === commentId) {
					const newReply: Reply = {
						ReplyId: Date.now().toString(),
						Author: 'Current User', // Replace with actual user data
						Content: newReplyContent,
						Date: new Date().toLocaleDateString(),
					};
					return {
						...comment,
						Replies: [...comment.Replies, newReply],
					};
				}
				return comment;
			});

			setNewComments(updatedComments);
			setReplyingTo(null);
			setNewReplyContent('');
		}
	};

	const handleCancelReply = () => {
		setReplyingTo(null);
		setNewReplyContent('');
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
							<div key={comment.CommentId} className="relative">
								<article className="p-6 text-base rounded-lg bg-[#ffffff]">
									<footer className="flex justify-between items-center mb-2">
										<div className="flex items-center">
											<p className="inline-flex font-poppins items-center mr-3 text-sm text-gray-900 font-semibold">
												<img
													className="mr-2 w-6 h-6 rounded-full"
													src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
													alt={comment.Author}
												/>
												{comment.Author}
											</p>
											<p className="text-sm text-gray-800 font-poppins">
												<time dateTime={comment.Date}>{comment.Date}</time>
											</p>
										</div>
									</footer>
									<p className="text-gray-900 font-poppins">
										{comment.Content}
									</p>
									<div className="flex items-center mt-4 space-x-4">
										<Button
											type="button"
											className="flex items-center font-poppins text-sm text-gray-900 hover:underline font-medium"
											onClick={() => setReplyingTo(comment.CommentId)}
										>
											Reply
										</Button>
									</div>
								</article>
								{replyingTo === comment.CommentId && (
									<div className="transition-all ease-in-out duration-300 p-4 bg-[#f9f9f9] rounded-lg mt-4">
										<form
											onSubmit={(e) => {
												e.preventDefault();
												handleReply(comment.CommentId);
											}}
										>
											<div className="mb-4">
												<TextField
													variant="outlined"
													size="small"
													margin="dense"
													fullWidth
													label="Write a reply..."
													id="reply"
													name="reply"
													multiline
													rows={3}
													value={newReplyContent}
													onChange={(e) => setNewReplyContent(e.target.value)}
												/>
											</div>
											<div className="flex justify-end space-x-2">
												<Button
													type="submit"
													color="info"
													variant="contained"
													className="py-2 px-4 text-xs font-medium text-white focus:ring-4 focus:ring-primary-200"
												>
													Save
												</Button>
												<Button
													type="button"
													color="neutral"
													onClick={handleCancelReply}
													className="py-2 px-4 text-xs font-medium rounded-lg focus:ring-4 focus:ring-primary-200"
												>
													Discard
												</Button>
											</div>
										</form>
									</div>
								)}
								<div className="replies flex flex-col mt-5 gap-y-5">
									{Array.isArray(comment.Replies) &&
										comment.Replies.map((reply) => (
											<article
												key={reply.ReplyId}
												className="p-6 ml-6 lg:ml-12 text-base bg-white rounded-lg"
											>
												<footer className="flex justify-between items-center mb-2">
													<div className="flex items-center">
														<p className="inline-flex items-center font-poppins mr-3 text-sm text-gray-900 font-semibold">
															<img
																className="mr-2 w-6 h-6 rounded-full"
																src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
																alt={reply.Author}
															/>
															{reply.Author}
														</p>
														<p className="text-sm text-gray-600 font-poppins">
															<time dateTime={reply.Date}>{reply.Date}</time>
														</p>
													</div>
												</footer>
												<p className="text-gray-900 text-sm font-poppins">
													{reply.Content}
												</p>
											</article>
										))}
								</div>
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
