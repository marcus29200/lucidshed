import { CreditCard } from '@mui/icons-material';

const Billing = () => {
	return (
		<div className="min-w-full px-20 font-poppins">
			<h1 className="text-3xl font-bold mb-4 border-b-2 border-b-green-500 pb-2">
				Billing
			</h1>
			<div className="w-[58vw] ">
				<p className="mb-4 text-gray-600">
					Manage your billing information, invoices, and payment options. For
					billing support, please reach out to{' '}
					<a
						href="mailto:billing@lucidshed.com"
						className="text-blue-600 hover:underline"
					>
						billing@lucidshed.com
					</a>
				</p>

				<div className="flex justify-between items-center mb-6 border-b-2 border-b-green-500 pb-2 w-[70vw]">
					<div>
						<h2 className="text-xl font-semibold mb-2">Current Plan</h2>
						<p className="text-gray-600 text-sm ml-3">
							Business Monthly: [cost per user]
						</p>
						<p className="text-gray-600 text-sm ml-3">
							Number of users: [Number of users in the account]
						</p>
					</div>
					<button className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600">
						Billing History
					</button>
				</div>

				<div className="mb-6 ">
					<h2 className="text-xl font-semibold mb-4">Billing Details</h2>
					<form className="ml-12">
						<div className="flex flex-col gap-y-2">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Name
								</label>
								<input
									type="text"
									placeholder="[Display Name]"
									className="w-full p-2 border rounded"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<input
									type="email"
									placeholder="[Display Email]"
									className="w-full p-2 border rounded"
								/>
							</div>

							<label className="block text-sm font-medium text-gray-700 mb-1">
								Address
							</label>
							<div className="flex gap-x-4">
								<div className="">
									<input
										type="text"
										placeholder="[Display Address 1]"
										className="w-fit p-2 border rounded mb-2"
									/>
								</div>
								<div>
									<input
										type="text"
										placeholder="[Display Suite Number]"
										className="w-fit p-2 border rounded mb-0"
									/>
								</div>
							</div>
							<div className="flex gap-x-4 mb-2">
								<div>
									<input
										type="text"
										placeholder="[Display City]"
										className="w-full p-2 border rounded"
									/>
								</div>
								<div>
									<input
										type="text"
										placeholder="[Display State]"
										className="w-full p-2 border rounded"
									/>
								</div>
							</div>
							<div>
								<input
									type="text"
									placeholder="[Display Zip]"
									className=" p-2 border rounded"
								/>
							</div>
						</div>
						<button
							type="submit"
							className="mt-4 bg-green-500 text-white px-20 py-2 rounded hover:bg-green-600"
						>
							Save
						</button>
					</form>
				</div>

				<div className="border-t-2 border-t-green-500  w-[70vw]">
					<h2 className="text-xl font-semibold mb-4 mt-3">Payment Method</h2>
					<div className="bg-gray-300 w-[50%] p-4 rounded-xl flex justify-between">
						<div className="flex flex-col gap-y-4 w-full">
							<p className="text-gray-600 font-poppins">Card Details</p>
							<div className="flex gap-x-4 w-full justify-between">
								<div className="flex items-center">
									<CreditCard className="mr-2" />
									<span>Visa Credit Card Ending in 6312</span>
								</div>
								<button className="bg-white text-gray-700 px-4 py-2 rounded-xl border hover:bg-gray-50">
									Update
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Billing;
