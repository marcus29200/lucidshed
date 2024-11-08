import { Component } from 'react';
import Chart from 'react-apexcharts';

type DonutState = {
	options: ApexCharts.ApexOptions;
	series: number[];
	labels: string[];
};
type DonutProps = {
	completed: number;
	inProgress: number;
	notStarted: number;
	total: number;
};
class Donut extends Component<DonutProps, DonutState> {
	constructor(props: DonutProps) {
		super(props);

		this.state = {
			labels: [],
			options: {
				chart: {
					type: 'donut',
				},
				dataLabels: {
					enabled: false,
				},
				plotOptions: {
					pie: {
						donut: {
							size: '75%',
							labels: {
								show: true,
								name: {
									show: true,
									fontSize: '18px',
									fontFamily: 'Poppins, sans-serif',
									fontWeight: 700,
									color: '#333',
									offsetY: -5,
									formatter: function () {
										return 'Progress';
									},
								},
								value: {
									show: true,
									fontSize: '14px',
									fontFamily: 'Poppins, sans-serif',
									fontWeight: 700,
									color: '#333',
									offsetY: 10,
									formatter: (val: string) => {
										return `${this.getPercentage(+val)}%`;
									},
								},
								total: {
									show: true,
									label: 'Total',
									fontFamily: 'Poppins, sans-serif',
									fontWeight: 700,
									formatter: () => {
										return `${this.getPercentage(this.props.completed)}%`;
									},
								},
							},
						},
					},
				},
				fill: {
					colors: ['#F36884', '#F3D053', '#8EDF91'],
				},
				labels: ['Not Started', 'In Progress', 'Completed'],
				legend: {
					show: false,
				},
				responsive: [
					{
						breakpoint: 600,
						options: {
							chart: {
								width: '100%',
							},
						},
					},
				],
			},
			series: [
				this.props.notStarted,
				this.props.inProgress,
				this.props.completed,
			],
		};
	}
	getPercentage = (value: number) => {
		return ((value * 100) / this.props.total).toFixed(2);
	};

	render() {
		return (
			<div
				className="donut h-full"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: '16px',
				}}
			>
				<div className="flex-1">
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							marginBottom: '10px',
						}}
					>
						<div
							style={{
								width: '10px',
								height: '10px',
								backgroundColor: '#00E396',
								borderRadius: '50%',
								marginRight: '10px',
							}}
						></div>
						<span
							style={{
								fontSize: '14px',
								paddingRight: '4px',
								display: 'block',
								width: '83px',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							Completed
						</span>
					</div>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							marginBottom: '10px',
						}}
					>
						<div
							style={{
								width: '10px',
								height: '10px',
								backgroundColor: '#FEB019',
								borderRadius: '50%',
								marginRight: '10px',
							}}
						></div>
						<span
							style={{
								fontSize: '14px',
								paddingRight: '4px',
								display: 'block',
								width: '83px',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							In Progress
						</span>
					</div>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							marginBottom: '10px',
						}}
					>
						<div
							style={{
								width: '10px',
								height: '10px',
								backgroundColor: '#FF4560',
								borderRadius: '50%',
								marginRight: '10px',
							}}
						></div>
						<span
							style={{
								fontSize: '14px',
								paddingRight: '4px',
								display: 'block',
								width: '83px',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							Not Started
						</span>
					</div>
				</div>
				<div>
					{this.props.total && (
						<Chart
							options={this.state.options}
							series={this.state.series}
							type="donut"
							className="pb-4"
						/>
					)}
				</div>
			</div>
		);
	}
}

export default Donut;
