const LogoHeader = ({ children }: { children?: React.ReactNode }) => {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '12px 24px',
				marginBottom: '36px',
			}}
		>
			<img src="/logo.svg" style={{ height: '48px' }} />

			{children}
		</div>
	);
};

export default LogoHeader;
