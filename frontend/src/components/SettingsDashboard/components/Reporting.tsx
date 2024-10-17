import { useState } from 'react';
import { ExpandMore } from '@mui/icons-material';
const Reporting = () => {
	const [permissionType, setPermissionType] = useState('anyone');
	const [date, setDate] = useState('');

	const [time, setTime] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [role, setRole] = useState('');
	const [isOpen2, setIsOpen2] = useState(false);

	const options2 = [
		{ value: '', label: '[Role]' },
		{ value: 'admin', label: 'Admin' },
		{ value: 'manager', label: 'Manager' },
		{ value: 'user', label: 'User' },
	];

	const handleOptionClick2 = (value) => {
		setRole(value);
		setIsOpen2(false);
	};

	const options = [
		{ value: '', label: 'Time' },
		{ value: '09:00', label: '09:00 AM' },
		{ value: '12:00', label: '12:00 PM' },
		{ value: '15:00', label: '03:00 PM' },
		{ value: '18:00', label: '06:00 PM' },
	];

	const handleOptionClick = (value) => {
		setTime(value);
		setIsOpen(false);
	};
	return (
		<div className="w-full px-20 font-poppins ">
			<h1 className="text-3xl font-bold mb-6 border-b-2 border-b-green-500 pb-4 w-[70vw]">
				Reporting
			</h1>

			<div className="w-[58vw] ml-2 ">
				<div className="w-[70vw] mb-8 border-b-2 border-b-green-500 pb-4">
					<h2 className="text-xl font-semibold mb-2">Permissions</h2>
					<p className="text-gray-600 mb-4 text-sm">
						You can enable reporting by specific user groups or anyone within
						the organization.
					</p>

					<div className="mb-4 ml-8">
						<h3 className="font-medium mb-2">Roles</h3>
						<div className="space-y-2">
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="permission"
									value="anyone"
									checked={permissionType === 'anyone'}
									onChange={() => setPermissionType('anyone')}
									className="form-radio h-5 w-5 text-green-500"
								/>
								<span>Anyone at the organization</span>
							</label>
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="permission"
									value="specific"
									checked={permissionType === 'specific'}
									onChange={() => setPermissionType('specific')}
									className="form-radio h-5 w-5 text-green-500"
								/>
								<span>Specific Roles</span>
							</label>
						</div>
					</div>

					{permissionType === 'specific' && (
						<div className="relative ml-8 w-[50%]">
							<div
								onClick={() => setIsOpen2(!isOpen2)}
								className="block cursor-pointer bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none"
							>
								{role || '[Role]'}
								<div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
									<ExpandMore />
								</div>
							</div>
							{isOpen2 && (
								<ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
									{options2.map((option) => (
										<li
											key={option.value}
											onClick={() => handleOptionClick2(option.value)}
											className="cursor-pointer py-2 px-4 hover:bg-green-500 hover:text-white"
										>
											{option.label}
										</li>
									))}
								</ul>
							)}
						</div>
					)}
				</div>

				<div className="border-t border-gray-200 pt-6 border-b-2 border-b-green-500 pb-8 w-[70vw]">
					<h2 className="text-xl font-semibold mb-2">Scheduled Reports</h2>
					<p className="text-gray-600 mb-4 ml-2">
						Select the Date and time automated reports will run.
					</p>

					<div className="flex space-x-4 ml-8 w-[58vw]">
						<div className="relative flex-grow">
							<input
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
							/>
						</div>
						<div className="relative w-1/3">
							<div
								onClick={() => setIsOpen(!isOpen)}
								className="block cursor-pointer bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none"
							>
								{time || 'Time'}
								<div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
									<ExpandMore />
								</div>
							</div>
							{isOpen && (
								<ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
									{options.map((option) => (
										<li
											key={option.value}
											onClick={() => handleOptionClick(option.value)}
											className="cursor-pointer py-2 px-4 hover:bg-green-500 hover:text-white"
										>
											{option.label}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Reporting;
