import { useRouteError } from 'react-router-dom';

const ErrorHandler = () => {
	const zzz = useRouteError();
	console.log(zzz);

	return <span>oops</span>;
};

export default ErrorHandler;
