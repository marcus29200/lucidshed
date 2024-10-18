import React, { useEffect, useState } from 'react';
import { DashboardItemIcon } from '../../icons/icons';
import { CalendarMonth } from '@mui/icons-material';
import { Epic } from '../epics/Epics';
import { getEpics } from '../../api/epics';
import { useParams } from 'react-router-dom';
import { LinearProgressWithLabel } from '../../components/LinearProgressWithLabel';
import dayjs from 'dayjs';
// TODO: for now we're using epics
const RoadmapView: React.FC = () => {
	const [epics, setEpics] = useState<Epic[]>([]);
	const { orgId } = useParams();

	useEffect(() => {
		// Fetch epics data when the component mounts
		if (orgId) {
			getEpics(orgId).then((data) => {
				setEpics(data);
			});
		}
	}, [orgId]);
	return (
		<div className="p-6 bg-white rounded-lg shadow-md border-1 border-gray-200 font-poppins">
			<div className="flex flex-col gap-y-1.5">
				<div className="flex flex-row gap-x-2">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">Roadmap Overview</h2>
				</div>

				<p className="text-sm ml-10 text-gray-400 font-semibold mb-4 font-poppins">
					Track the Progress of Your Project
				</p>
			</div>

			{/* Container for the cards with horizontal scroll */}
			<div className="flex space-x-4 overflow-x-auto custom-scrollbar">
				<div
					className="flex flex-nowrap space-x-4"
					style={{ maxWidth: '900px' }}
				>
					{' '}
					{/* Adjust width based on 3 cards */}
					{epics.map((epic) => (
						<Card
							name={epic.name}
							endDate={dayjs(epic.endDate).format('MMM DD, YYYY')}
							progress={epic.progress}
							epicId={epic.epicId}
							startDate={epic.startDate}
							key={epic.epicId}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

// Define the Card component that accepts CardProps as props
const Card: React.FC<Epic> = ({ endDate, name, progress }) => (
	<div className="p-5 border rounded-lg min-w-[300px]">
		{' '}
		{/* Ensure card has fixed width */}
		{/* <p
			className={`font-semibold text-sm p-1.5 rounded-md w-max mb-2 ${
				status === 'Completed'
					? 'text-green-600 bg-[#DEF2DF]'
					: status === 'In Progress'
					? 'text-yellow-600 bg-[#FBF5D9]'
					: 'text-pink-600 bg-[#FBD9E0]'
			}`}
		>
			{status}
		</p> */}
		<h3 className="font-semibold text-lg">{name}</h3>
		{/* Status message like "Completed 10 Hrs Ago" */}
		{/* <p className="text-sm text-gray-600 mt-2">{statusMessage}</p> */}
		{/* Progress bar */}
		<LinearProgressWithLabel value={progress} />
		{/* Member avatars and date */}
		<div className="flex justify-between items-center mt-4">
			{/* <div className="flex">
				{Array.from({ length: members }).map((_, idx) => (
					<img
						key={idx}
						className="h-6 w-6 rounded-full border border-white -ml-2"
						src={`https://i.pravatar.cc/150?img=${idx}`}
						alt="user-avatar"
					/>
				))}
			</div> */}

			{/* Date with calendar icon */}
			<div className="flex items-center text-gray-400 text-sm ml-auto">
				<CalendarMonth className="mr-1" />
				<p>{endDate}</p>
			</div>
		</div>
	</div>
);

export default RoadmapView;
