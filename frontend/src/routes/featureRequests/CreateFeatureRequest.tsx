import { memo } from 'react';

const CreateFeatureRequest = memo(({ show }: { show: boolean }) => {
	return (
		<div
			className={`absolute top-0 right-0 bg-white px-2 py-1 rounded-md shadow-md transition-all duration-300 ${
				show ? 'translate-x-0' : 'translate-x-72'
			}`}
		>
			boo!
		</div>
	);
});

CreateFeatureRequest.displayName = 'CreateFeatureRequest';

export default CreateFeatureRequest;
