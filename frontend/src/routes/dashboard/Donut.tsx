import { Component } from 'react';
import Chart from 'react-apexcharts';

interface DonutState {
	options: ApexCharts.ApexOptions;
	series: number[];
	labels: string[];
}

class Donut extends Component<any, DonutState> {
	constructor(props: any) {
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
										return 'Epic Progress';
									},
								},
								value: {
									show: true,
									fontSize: '14px',
									fontFamily: 'Poppins, sans-serif',
									fontWeight: 700,
									color: '#333',
									offsetY: 10,
									formatter: function (val: string) {
										return val + '%';
									},
								},
								total: {
									show: true,
									label: 'Total',
									fontFamily: 'Poppins, sans-serif',
									fontWeight: 700,
									formatter: function () {
										return '100%';
									},
								},
							},
						},
					},
				},
				fill: {
					colors: ['#F36884', '#F3D053', '#8EDF91'],
				},
				labels: ['Completed', 'In Progress', 'Not Started'],
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
			series: [25, 50, 25],
		};
	}

	render() {
		return (
			<div className="donut" style={{ display: 'flex', alignItems: 'center' }}>
				<div style={{ width: '30%', marginRight: '10px' }}>
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
								marginRight: 'auto',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							Completed
						</span>
						<span
							style={{
								fontSize: '14px',
								fontWeight: 'bold',
								color: '#00E396',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							25
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
								marginRight: 'auto',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							In Progress
						</span>
						<span
							style={{
								fontSize: '14px',
								fontWeight: 'bold',
								color: '#FEB019',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							50
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
								marginRight: 'auto',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							Not Started
						</span>
						<span
							style={{
								fontSize: '14px',
								fontWeight: 'bold',
								color: '#FF4560',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							25
						</span>
					</div>
				</div>
				<div style={{ width: '60%' }}>
					<Chart
						options={this.state.options}
						series={this.state.series}
						type="donut"
						width="300"
					/>
				</div>
			</div>
		);
	}
}

export default Donut;
