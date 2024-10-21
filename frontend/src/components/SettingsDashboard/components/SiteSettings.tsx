import { Add } from '@mui/icons-material';
import React, { useRef, useState } from 'react';

const SiteSettings = () => {
	const [accountName, setAccountName] = useState<string>('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]; // Optional chaining to safely access the file
		if (file) {
			setSelectedFile(file);
			// Handle the file upload to your server here
		}
	};

	const handleIconClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div className="w-full px-20 font-poppins ">
			<h1 className="text-3xl font-bold mb-6 ">Site Settings</h1>
			<div className="w-full border-t-2 border-t-green-500 ">
				<div className="ml-12 py-3 w-[70%]">
					<div className="mb-8 ">
						<h2 className="text-xl font-semibold mb-2">Account Name</h2>
						<p className="text-gray-500 mb-2 text-sm ml-3">
							Account name is set once the account is setup and cannot be
							changed.
						</p>
						<input
							type="text"
							value={accountName}
							onChange={(e) => setAccountName(e.target.value)}
							placeholder="[Name of Account]"
							className="w-[50%] ml-6 p-2 border-1 border-gray-300 rounded-xl bg-gray-200"
						/>
					</div>

					<div className="mb-8 flex items-start ml-6">
						<div
							className="mr-4 w-[30%] h-36 bg-gray-200 flex items-center justify-center rounded-md border-gray-300 border cursor-pointer relative overflow-hidden"
							onClick={handleIconClick}
						>
							{selectedFile ? (
								<img
									src={
										import.meta.env.BASE_URL + URL.createObjectURL(selectedFile)
									}
									alt="Selected logo"
									className="w-full h-full object-cover"
								/>
							) : (
								<Add className="text-6xl bg-gray-400 rounded-full p-3 text-white" />
							)}
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								className="hidden"
								accept="image/*"
							/>
						</div>
						<div>
							<h3 className="font-semibold mb-2">Site Logo</h3>
							<p className="text-gray-500">
								Site Logo Displays in the left corner of your Projects. You can
								customize this with the Enterprise plan. Image requires size to
								be [size requirements].
							</p>
						</div>
					</div>
				</div>
				<div className="border-t-2 border-t-green-500 w-full">
					<div className="border-t ml-12 border-gray-200 pt-6 w-[70%]">
						<h2 className="text-xl font-semibold mb-2">Data Management</h2>
						<p className="text-gray-500 mb-4 ml-3">
							Archives include a CSV of all stories and associated metadata. It
							also includes a folder including all attachments that are mapped
							within the metadata field.
						</p>
						<button className="bg-green-500 ml-5 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300 mb-4">
							Create Account Archive
						</button>
						<p className="text-gray-500 mb-4 ml-3">
							Deleting the account will remove all data from Lucidshed and
							cannot be restored once deleted.
						</p>
						<button className="bg-red-500 ml-5 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300">
							Delete Account
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SiteSettings;
