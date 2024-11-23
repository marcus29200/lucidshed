import { Chat, Close, Send } from '@mui/icons-material';
import {
	CircularProgress,
	FormControl,
	IconButton,
	InputLabel,
	OutlinedInput,
} from '@mui/material';
import { useState } from 'react';
import './ai-chat.css';
import { useParams } from 'react-router-dom';
import { askLucidAI } from '../../api/organizations';

const AIChatLayout = () => {
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isAsking, setIsAsking] = useState(false);
	const [message, setMessage] = useState('');
	const orgId = useParams().orgId as string;

	const [messages, setMessages] = useState([
		{
			type: 'ai-lucid-message',
			message: 'Lucidshed is here to help you!',
		},
	]);

	const handleAskLucid = (event) => {
		event.preventDefault();
		if (!message || isAsking) {
			return;
		}
		setIsAsking(true);
		const newMessages = [...messages];
		newMessages.push({ type: 'ai-user-message', message });
		setMessages(newMessages);
		askLucidAI(orgId, message)
			.then((response) => {
				console.log(response);

				newMessages.push({
					type: 'ai-lucid-message',
					message: response.summary ?? 'testing',
				});
				setIsAsking(false);
			})
			.finally(() => {
				setMessages(newMessages);
			});
		setMessage('');

		// set focus to input
		document.getElementById('ai-chat-message')?.focus();
	};

	return (
		<div
			style={{
				position: 'fixed',
				bottom: 20,
				right: 20,
				zIndex: 1,
			}}
		>
			{!isChatOpen && (
				<IconButton
					onClick={() => setIsChatOpen(true)}
					color="info"
					sx={{
						backgroundColor: '#fff',
					}}
				>
					<Chat />
				</IconButton>
			)}
			{isChatOpen && (
				<section className="min-h-[420px] max-h-[800px]  w-[560px] bg-white shadow-md rounded-lg p-4 flex flex-col">
					<header className="flex justify-between">
						<IconButton
							className="!ml-auto"
							onClick={() => setIsChatOpen(false)}
						>
							<Close />
						</IconButton>
					</header>
					<main className="flex flex-col gap-2 max-h-[calc(100%_-_112px)] overflow-y-auto pt-4 pb-2 pr-3">
						{messages.map((message, index) => (
							<div key={index} className={`ai-chat-message ${message.type}`}>
								{message.message}
							</div>
						))}
						{isAsking && <CircularProgress color="primary" size={24} />}
					</main>
					<footer className="mt-auto pt-2">
						{/* Input Field and Send Button */}
						<form onSubmit={handleAskLucid}>
							<FormControl
								variant="outlined"
								fullWidth
								size="small"
								disabled={isAsking}
							>
								<InputLabel htmlFor="ai-chat-message">Ask to Lucid</InputLabel>
								<OutlinedInput
									id="ai-chat-message"
									label="Ask to Lucid"
									placeholder="Ask to Lucid"
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									endAdornment={
										<IconButton
											color="primary"
											type="submit"
											size="small"
											disabled={isAsking}
											onClick={handleAskLucid}
										>
											<Send />
										</IconButton>
									}
								></OutlinedInput>
							</FormControl>
						</form>
					</footer>
				</section>
			)}
		</div>
	);
};

export default AIChatLayout;
