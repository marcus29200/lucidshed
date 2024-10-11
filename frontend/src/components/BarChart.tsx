import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
// Ensure this path is correct

// Define types for sprint data
type TicketByUserType = {
	user: string;
	ticketCount: number;
	statusBreakdown: {
		completed: number;
		inProgress: number;
		remaining: number;
	};
	color: string;
};

type SprintDataType = {
	name: string;
	ticketsByUser: TicketByUserType[];
};

type ApexChartProps = {
	sprintData: SprintDataType[]; // Array of all sprint data
	selectedSprintName?: string; // Name of the selected sprint to filter
	colors?: string[];
};

const BarChart: React.FC<ApexChartProps> = ({
	colors = [
		'#008FFB',
		'#00E396',
		'#FF4560',
		'#775DD0',
		'#FEB019',
		'#FF66C3',
		'#A8DAD8',
		'#F5D44D',
	],
	sprintData,
}) => {
	const [series, setSeries] = useState<any[]>([]);
	const [categories, setCategories] = useState<string[]>([]);

	useEffect(() => {
		if (!sprintData[0] || !Array.isArray(sprintData[0].ticketsByUser)) {
			console.warn('No sprint data available');
			return;
		}

		// Prepare data for the chart from ticketsByUser
		const userNames = sprintData[0].ticketsByUser.map((user) => user.user);
		const userCounts = sprintData[0].ticketsByUser.map(
			(user) => user.ticketCount
		);
		// const userColorsArray = selectedSprint.ticketsByUser.map(
		//   (user) => user.color
		// );

		setCategories(userNames);
		setSeries([
			{
				name: 'Tickets by User',
				data: userCounts,
			},
		]);
	}, [sprintData]);

	const options: ApexCharts.ApexOptions = {
		chart: {
			height: 350,
			type: 'bar',
			toolbar: {
				show: false,
			},
		},
		plotOptions: {
			bar: {
				columnWidth: '25%',
				distributed: true,
			},
		},
		dataLabels: {
			enabled: false,
		},
		// Removed title configuration
		legend: {
			show: false,
		},
		xaxis: {
			categories: categories,
			labels: {
				style: {
					colors: colors,
					fontSize: '12px',
				},
			},
		},
	};

	return (
		<div>
			<div id="chart">
				<ReactApexChart
					options={options}
					series={series}
					type="bar"
					height={400}
				/>
			</div>
			<div id="html-dist"></div>
		</div>
	);
};

export default BarChart;
