import { Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
	return (
		<div
			style={{
				backgroundImage: `url(${import.meta.env.BASE_URL + '/background.png'})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				height: '100vh',
			}}
		>
			<Container
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					padding: '4rem',
					gap: '2rem',
				}}
			>
				<img src={import.meta.env.BASE_URL + '/logo.svg'} />
				<Link to="/login">
					<Button
						color="primary"
						variant="contained"
						sx={{
							width: '150px',
							paddingY: '8px !important',
						}}
					>
						Log in
					</Button>
				</Link>
				<Link to="/register">
					<Button
						color="primary"
						variant="contained"
						sx={{
							width: '150px',
							paddingY: '8px !important',
						}}
					>
						Sign up
					</Button>
				</Link>
			</Container>
		</div>
	);
}

export default Home;
