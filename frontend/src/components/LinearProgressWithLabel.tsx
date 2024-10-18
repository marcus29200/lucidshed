export function LinearProgressWithLabel({ value }: { value: number }) {
	let progressColor = '';

	if (value === 100) {
		progressColor = '#20A224'; // Green for 100% completion
	} else if (value > 70) {
		progressColor = '#8bc34a'; // Light green for progress > 70%
	} else if (value > 40) {
		progressColor = '#E5B710'; // Yellow for progress between 40% and 70%
	} else {
		progressColor = '#FCD9E0'; // Red for progress < 40%
	}

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					height: '8px', // thinner height
					backgroundColor: '#e0e0e0', // Light grey for the background bar
					borderRadius: '20px',

					overflow: 'hidden',
					marginRight: '8px', // Spacing between the bar and the percentage
				}}
			>
				<div
					style={{
						width: `${value}%`,
						backgroundColor: progressColor,
						height: '100%',
					}}
				></div>
			</div>
			<span
				className="text-end pr-2"
				style={{ color: '#9e9e9e', fontSize: '0.875rem' }}
			>
				{value}%
			</span>
		</div>
	);
}
