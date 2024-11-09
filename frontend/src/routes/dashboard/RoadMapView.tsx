import React from 'react';
import { DashboardItemIcon } from '../../icons/icons';
import { ArrowDropUpRounded, CalendarMonth } from '@mui/icons-material';
import { Epic } from '../epics/Epics';
import { getEpics } from '../../api/epics';
import { Link, useParams } from 'react-router-dom';

import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { CircularProgress } from '@mui/material';

const priorityColors = {
	critical: '#ED254E',
	high: '#E5B710',
	medium: '#20A224',
	low: '#717584',
};

// TODO: for now we're using epics
const RoadmapView: React.FC = () => {
	const orgId = useParams().orgId as string;
	const { data, isLoading } = useQuery({
		queryKey: ['epics'],
		queryFn: async () => getEpics(orgId),
	});
	const epics = data ?? [];

	return (
		<div className="p-6 bg-white rounded-lg shadow-md border-1 border-gray-200 font-poppins h-full">
			<div className="flex flex-col gap-y-1.5">
				<div className="flex flex-row gap-x-2">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins text-left">
						Roadmap Overview
					</h2>
					{isLoading && <CircularProgress color="inherit" size={20} />}
				</div>

				<p className="text-sm text-left text-gray-400 font-semibold mb-4 font-poppins">
					Track the Progress of Your Project
				</p>
			</div>

			{/* Container for the cards with horizontal scroll */}
			<div className="flex space-x-4 overflow-x-auto pb-4">
				<div
					className="flex flex-nowrap space-x-4"
					style={{ maxWidth: '900px' }}
				>
					{' '}
					{/* Adjust width based on 3 cards */}
					{epics.map((epic) => (
						<Card {...epic} orgId={orgId} key={'epic-' + epic.id} />
					))}
				</div>
			</div>
		</div>
	);
};

// Define the Card component that accepts CardProps as props
const Card: React.FC<Epic & { orgId: string }> = ({
	endDate,
	name,
	description,
	priority,
	id,
	orgId,
}) => (
	<div
		className="shadow-sm p-5 border rounded-lg min-w-[300px] min-h-32 relative"
		style={{
			borderColor: priorityColors[priority],
		}}
	>
		{' '}
		{/* Ensure card has fixed width */}
		<h3 className="font-semibold text-lg flex items-center">
			<Link
				to={`/${orgId}/epics/${id}`}
				className="text-neutral-dark hover:text-neutral-regular "
			>
				{name}
			</Link>
			{/* Date with calendar icon */}
			{endDate && (
				<div className="flex items-center text-gray-400 text-sm ml-auto">
					<p>{dayjs(endDate).format('MMM DD, YYYY')}</p>
					<CalendarMonth className="ml-1" />
				</div>
			)}
		</h3>
		{/* Member avatars and date */}
		<p className="text-sm line-clamp-3 text-left">{description}</p>
		<div className="absolute right-1 top-0">
			<small className="text-neutral-regular text-xs font-medium italic capitalize">
				{priority}
			</small>
			<ArrowDropUpRounded
				style={{
					color: priorityColors[priority],
				}}
			/>
		</div>
	</div>
);

export default RoadmapView;
