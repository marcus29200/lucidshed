import { Box, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
	return (
		<div className="grid md:grid-cols-2 h-screen">
			<Box
				sx={{
					position: 'relative',
					width: '100%',
					height: '100vh',
					':before': {
						content: '""',
						backgroundImage: `url(${
							import.meta.env.BASE_URL + '/background.png'
						})`,
						backgroundSize: 'contain',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						width: '100%',
						height: '100%',
						display: 'block',
						position: 'absolute',
					},
					':after': {
						content: '""',
						backgroundImage: `url(${
							import.meta.env.BASE_URL + '/background.png'
						})`,
						backgroundSize: 'contain',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						width: '100%',
						height: '100%',
						display: 'block',
						filter: 'blur(200px)',
						position: 'absolute',
						zIndex: '-1',
					},
				}}
			></Box>
			<Container
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					padding: '4rem',
					gap: '2rem',
					justifyContent: 'center',
					height: '100vh',
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
