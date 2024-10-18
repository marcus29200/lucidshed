import React from 'react';
import { DashboardItemIcon } from '../../icons/icons';

interface MentionProps {
	sender: string;
	time: string;
	story: string;
	ticket: string;
	message: string;
}

const RecentlyMentioned: React.FC = () => {
	const mentions: MentionProps[] = [
		{
			sender: 'Sam Guy',
			time: '12:55pm',
			story: 'Endpoint Identification',
			ticket: '1015423',
			message: 'API Integration refers to the process of connecting.',
		},
		{
			sender: 'Sam Guy',
			time: '12:55pm',
			story: 'API Integration',
			ticket: '1015423',
			message: 'API Integration refers to the process of connecting.',
		},
		{
			sender: 'Sam Guy',
			time: '12:55pm',
			story: 'Endpoint Identification',
			ticket: '1015423',
			message: 'API Integration refers to the process of connecting.',
		},
		{
			sender: 'Sam Guy',
			time: '12:55pm',
			story: 'Endpoint Identification',
			ticket: '1015423',
			message: 'API Integration refers to the process of connecting.',
		},
		{
			sender: 'Sam Guy',
			time: '12:55pm',
			story: 'API Integration',
			ticket: '1015423',
			message: 'API Integration refers to the process of connecting.',
		},
		{
			sender: 'Sam Guy',
			time: '12:55pm',
			story: 'Endpoint Identification',
			ticket: '1015423',
			message: 'API Integration refers to the process of connecting.',
		},
	];

	return (
		<div className="p-6 bg-white rounded-lg shadow-md border-1 border-gray-200 font-poppins">
			<div className="flex flex-col gap-y-1.5">
				<div className="flex flex-row gap-x-2 ">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">Recent Mentions</h2>
				</div>

				<p className="text-sm ml-10 text-gray-400 font-semibold mb-4 font-poppins">
					Keep up with the latest discussions and feedback on your project.
				</p>
			</div>

			{/* Scrollable container for mentions */}
			<div className="max-h-[280px] overflow-y-auto space-y-4 scrollbar-hide custom-scrollbar">
				<table className="min-w-full bg-white border rounded-md overflow-hidden">
					<thead className="bg-[#E9EAEC] rounded-md">
						<tr className="text-left text-gray-500 border-b">
							<th className="px-4 py-2 text-black rounded-tl-md">Sender</th>
							<th className="px-4 py-2 text-black">Story</th>
							<th className="px-4 py-2 text-black">Message</th>
							<th className="px-4 py-2 text-black text-center rounded-tr-md">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{mentions.map((mention, idx) => (
							<tr key={idx} className="border-b">
								<td className="px-4 py-5 flex items-center space-x-2">
									<img
										src={`https://i.pravatar.cc/40?img=${idx}`}
										alt="avatar"
										className="h-8 w-8 rounded-full"
									/>
									<div>
										<p className="font-semibold">{mention.sender}</p>
										<p className="text-xs text-gray-400">{mention.time}</p>
									</div>
								</td>
								<td className="px-4 py-2">
									<p className="font-semibold">{mention.story}</p>
									<p className="text-xs text-gray-400">
										Ticket#: {mention.ticket}
									</p>
								</td>
								<td className="px-4 py-2">
									<p className="text-sm text-gray-600">{mention.message}</p>
								</td>
								<td className="px-4 py-2 text-center">
									<button className="text-sm text-white bg-green-500 px-4 py-1 rounded-full hover:bg-green-600">
										Mark As Read
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default RecentlyMentioned;
