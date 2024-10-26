import React from 'react';
import { DashboardItemIcon } from '../../icons/icons';
import { CalendarMonth } from '@mui/icons-material';
import { Epic } from '../epics/Epics';
import { getEpics } from '../../api/epics';
import { useParams } from 'react-router-dom';
import { LinearProgressWithLabel } from '../../components/LinearProgressWithLabel';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { CircularProgress } from '@mui/material';
// TODO: for now we're using epics
const RoadmapView: React.FC = () => {
	const { orgId } = useParams();
	const { data, isLoading } = useQuery({
		queryKey: ['epics'],
		queryFn: async () => getEpics(orgId as string),
	});
	const epics = data ?? [];

	return (
		<div className="p-6 bg-white rounded-lg shadow-md border-1 border-gray-200 font-poppins h-full">
			<div className="flex flex-col gap-y-1.5">
				<div className="flex flex-row gap-x-2">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">Roadmap Overview</h2>
					{isLoading && <CircularProgress color="inherit" size={20} />}
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
							key={'epic-' + epic.epicId}
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
		<h3 className="font-semibold text-lg">{name}</h3>
		{/* Progress bar */}
		<LinearProgressWithLabel value={progress} />
		{/* Member avatars and date */}
		<div className="flex justify-between items-center mt-4">
			{/* Date with calendar icon */}
			<div className="flex items-center text-gray-400 text-sm ml-auto">
				<CalendarMonth className="mr-1" />
				<p>{endDate}</p>
			</div>
		</div>
	</div>
);

export default RoadmapView;
