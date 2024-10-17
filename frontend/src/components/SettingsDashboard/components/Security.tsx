const Security = () => {
	return (
		<div className="min-w-full px-20 font-poppins">
			<h1 className="text-3xl font-bold mb-6 border-b-2 border-b-green-500 pb-2">
				Security
			</h1>

			<div className="w-[58vw] ">
				<div className="mb-8 ml-12 flex flex-row w-full pb-2">
					<div className="flex flex-col w-full">
						<h2 className="text-xl font-semibold mb-3">Need a new Password?</h2>
						<button className="bg-green-500 ml-5 w-fit text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
							Send Password Reset Email
						</button>
					</div>

					<div className="mt-4 ml-24 text-sm text-gray-500 leading-7">
						<p className="mb-2">
							To ensure the security of your account, please follow the steps
							below to request a password reset:
						</p>
						<ol className="list-decimal pl-6">
							<li className="mb-1">
								Click the Send Button: Click on the "Send" button to receive a
								password reset email.
							</li>
							<li className="mb-1">
								Receive Email: An email will be sent to your registered email
								address with instructions to reset your password.
							</li>
							<li className="mb-1">
								Click the link to reset your password. Enter New Password:
								Follow the instructions in the email to create a new password.
								Your new password should be strong and secure, at least 8
								characters long, and include a mix of letters, numbers, and
								special characters.
							</li>
							<li className="mb-1">
								Confirm New Password: Re-enter the new password to confirm it.
								This helps ensure that there are no typos and that you have
								accurately remembered your new password.
							</li>
						</ol>
						<p className="mt-2">
							Once both fields are filled in, click on the "Save" button to
							update your password.
						</p>
					</div>
				</div>
				<div className="w-[69vw] border-t-2 pt-5 border-t-green-500">
					<div className="w-full ml-12">
						<h2 className="text-xl font-semibold mb-4 ">
							Two-Factor Authentication
						</h2>
						<button className="bg-purple-500 ml-3 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors">
							Enable Two-Factor Authentication
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Security;
