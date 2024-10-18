import { DashboardItemIcon } from '../../icons/icons';
import Donut from './Donut';
const EpicUnitsOverview = () => {
	return (
		<div className="p-6 bg-white rounded-lg shadow-md border-1 border-gray-200">
			<div className="flex flex-col gap-y-1.5">
				<div className="flex flex-row gap-x-2 ">
					{' '}
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">
						Epic Units Overview
					</h2>
				</div>

				<p className="text-sm ml-10 text-gray-400 font-semibold mb-4 font-poppins">
					All Assigns Epic Overview
				</p>
			</div>

			<Donut />
		</div>
	);
};

export default EpicUnitsOverview;
