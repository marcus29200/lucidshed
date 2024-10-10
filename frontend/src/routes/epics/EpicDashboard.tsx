import React, { useEffect, useState } from 'react';

import {
	Menu,
	MenuItem,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from '@mui/material'; // MUI components
import '../../index.css';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useLoaderData, useParams } from 'react-router-dom';
// import BarChart from '../components/BarChart';
// import LineChart from '../components/LineChart';
// import LineChartLOE from '../components/LineChartLOE';
// import TableChart from '../components/TableChart';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HomeIcon } from '../../icons/icons';
import {
	Add,
	Close,
	Edit,
	ExpandMore,
	MoreVert,
	Save,
	Settings,
} from '@mui/icons-material';
import { ApiEpic } from './Epics';

// TODO: add types
const EpicsDashboard = () => {
	const [oldTemplateName, setOldTemplateName] = useState<string | null>(null);
	// Dashboard components
	const availableComponents = [
		'BarChart',
		'LineChart',
		'LineChartLOE',
		'TableChart',
	];

	interface TemplateStates {
		[key: string]: string[]; // key is the template name, and the value is an array of strings
	}
	const [templates, setTemplates] = useState<string[]>(() => {
		const savedTemplates = localStorage.getItem('graphTemplates');
		return savedTemplates ? JSON.parse(savedTemplates) : ['My Templates'];
	});
	const { epicId, orgId } = useParams();
	const epicDetails = useLoaderData() as ApiEpic; // State to hold epic details

	const [templateStates, setTemplateStates] = useState<TemplateStates>(() => {
		const savedTemplateStates = localStorage.getItem('graphTemplateStates');
		return savedTemplateStates
			? JSON.parse(savedTemplateStates)
			: {
					'My Templates': [
						'BarChart',
						'LineChart',
						'LineChartLOE',
						'TableChart',
					],
			  };
	});

	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
		() => {
			const savedSelectedTemplate = localStorage.getItem(
				'graphSelectedTemplate'
			);
			return savedSelectedTemplate ? savedSelectedTemplate : 'My Templates';
		}
	);

	const [dashboardComponents, setDashboardComponents] = useState<string[]>(
		() => {
			const savedDashboardComponents =
				localStorage.getItem('dashboardComponent');
			return savedDashboardComponents
				? JSON.parse(savedDashboardComponents)
				: ['BarChart', 'LineChart', 'LineChartLOE', 'TableChart'];
		}
	);
	// Manage save dialog
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);

	const [ellipsisAnchorEl, setEllipsisAnchorEl] = useState<null | HTMLElement>(
		null
	);
	const [isEditing, setIsEditing] = useState(false); // To track edit/save state

	// Open the ellipsis menu
	const handleEllipsisMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setEllipsisAnchorEl(event.currentTarget);
	};

	// Close the ellipsis menu
	const handleEllipsisMenuClose = () => {
		setEllipsisAnchorEl(null);
	};

	// Toggle between edit and save mode for the dashboard
	const toggleDashboardEditMode = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation(); // Prevent the menu from closing
		setIsEditing(!isEditing); // Toggle the state
	};

	const [newTemplate, setNewTemplate] = useState('');
	const [editingTemplate, setEditingTemplate] = useState<number | null>(null);
	const [isAdding, setIsAdding] = useState(false);

	// State for template dropdown
	const [templateAnchorEl, setTemplateAnchorEl] = useState<null | HTMLElement>(
		null
	);

	// Open the template menu when the button is clicked
	const handleTemplateMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setTemplateAnchorEl(event.currentTarget);
	};

	// Close the template menu
	const handleTemplateMenuClose = () => {
		setTemplateAnchorEl(null);
	};

	const cancelAddTemplate = () => {
		setIsAdding(false);
		setNewTemplate('');
	};
	const handleTemplateEdit = (idx: number) => {
		setEditingTemplate(idx);
		setOldTemplateName(templates[idx]); // Store the old template name
	};
	const saveTemplateEdit = (idx: number, newName: string) => {
		const oldName = oldTemplateName;

		if (oldName) {
			setTemplates((prevTemplates) => {
				const updatedTemplates = [...prevTemplates];
				updatedTemplates[idx] = newName; // Update the template name
				return updatedTemplates;
			});

			setTemplateStates((prevTemplateStates) => {
				const updatedTemplateStates = { ...prevTemplateStates };
				updatedTemplateStates[newName] = updatedTemplateStates[oldName]; // Transfer the old state to the new name
				delete updatedTemplateStates[oldName]; // Remove the old state
				return updatedTemplateStates;
			});

			setEditingTemplate(null);
			setOldTemplateName(null); // Reset old name
		}
	};
	// Track edit/save state

	const [addComponentDialogOpen, setAddComponentDialogOpen] = useState(false);

	// Close the add component modal
	const handleCloseAddComponentDialog = () => {
		setAddComponentDialogOpen(false);
	};

	// Add a component to the dashboard
	const handleAddComponent = (component: string) => {
		setDashboardComponents((prevComponents) => [...prevComponents, component]);
		handleCloseAddComponentDialog();
	};
	const componentsToAdd = availableComponents.filter(
		(component) => !dashboardComponents.includes(component)
	);
	// Confirmation dialog state
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [componentToRemove, setComponentToRemove] = useState<string | null>(
		null
	);

	// Confirm the removal of the component

	// Cancel the removal of the component
	const cancelRemoveComponent = () => {
		setConfirmationOpen(false); // Close confirmation dialog
		setComponentToRemove(null); // Reset the component being removed
	};

	// Add a component to the dashboard
	const handleRemoveComponentClick = (component: string) => {
		console.log('handleRemoveComponentClick');
		setComponentToRemove(component); // Set the component to remove
		setConfirmationOpen(true); // Open the confirmation dialog
	};
	console.log('Component', confirmationOpen);
	// Confirm the removal of the component
	const confirmRemoveComponent = () => {
		if (componentToRemove) {
			setDashboardComponents((prevComponents) =>
				prevComponents.filter((comp) => comp !== componentToRemove)
			);
		}
		setConfirmationOpen(false); // Close confirmation dialog
		setComponentToRemove(null); // Reset the component being removed
	};
	const handleCloseSaveDialog = () => {
		setSaveDialogOpen(false);
	};

	const handleSaveTemplate = () => {
		if (selectedTemplate) {
			// Save the current dashboard state to the selected template
			setTemplateStates({
				...templateStates,
				[selectedTemplate]: dashboardComponents, // Save current dashboard state
			});

			console.log('Saving template|' + selectedTemplate);
			// Close the save dialog
			setSelectedTemplate(selectedTemplate);
			handleCloseSaveDialog();

			// Exit edit mode and change button text back to "Edit Dashboard"
			setIsEditing(false);
		}
	};

	// Save templates, templateStates, selectedTemplate, and dashboardComponents to localStorage when they change
	useEffect(() => {
		localStorage.setItem('graphTemplates', JSON.stringify(templates));
	}, [templates]);

	useEffect(() => {
		localStorage.setItem('graphTemplateStates', JSON.stringify(templateStates));
	}, [templateStates]);

	useEffect(() => {
		if (selectedTemplate) {
			localStorage.setItem('graphSelectedTemplate', selectedTemplate);
		}
	}, [selectedTemplate]);

	useEffect(() => {
		localStorage.setItem(
			'dashboardComponents',
			JSON.stringify(dashboardComponents)
		);
	}, [dashboardComponents]);

	const removeTemplate = (templateToRemove: string) => {
		if (templates.length === 1) {
			toast.error('You must have at least one template in your UI.');
		} else {
			const updatedTemplates = templates.filter(
				(template) => template !== templateToRemove
			);
			setTemplates(updatedTemplates); // Update templates state

			const newSelectedTemplate = updatedTemplates[0] || null;
			if (newSelectedTemplate) {
				setSelectedTemplate(newSelectedTemplate);
				const selectedTemplateComponents =
					templateStates[newSelectedTemplate] || availableComponents;
				setDashboardComponents(selectedTemplateComponents);
			} else {
				setSelectedTemplate(null);
				setDashboardComponents([]); // Reset the dashboard if no templates are left
			}
		}
	};

	const saveNewTemplate = () => {
		if (newTemplate.trim()) {
			setTemplates([...templates, newTemplate]);
			setTemplateStates({
				...templateStates,
				[newTemplate]: dashboardComponents, // Save current dashboard state to new template
			});
			setSelectedTemplate(newTemplate);
			setNewTemplate('');
			setIsAdding(false);
		}
	};

	const loadTemplate = (template: string) => {
		const selectedTemplateComponents = templateStates[template];
		if (selectedTemplateComponents) {
			setDashboardComponents(selectedTemplateComponents);
		} else {
			setDashboardComponents([]);
		}
		setSelectedTemplate(template);
		setIsEditing(false);
	};

	return (
		<div className="bg-gray-100 flex flex-col gap-y-4 px-6 overflow-hidden font font-poppins">
			<div className="flex justify-between items-center px-4 w-full rounded-md shadow-md mt-[40px]">
				<div className="flex space-x-3">
					<Link to={`/${orgId}/epics/${epicId}`}>
						<button className="flex gap-x-1 justify-center items-center px-24 py-3 bg-gray-100 text-gray-300 rounded-md font-bold">
							<HomeIcon className="text-white -ml-3" />
							<span className="mt-1">Stories</span>
						</button>{' '}
					</Link>
					<Link to={`/${orgId}/epics/${epicId}/dashboard`}>
						<button className="flex gap-x-1 justify-center items-center px-24 py-3 bg-green-500 text-white rounded-md font-bold">
							<Settings className="text-gray-300 -ml-3" />
							Reporting
						</button>
					</Link>
				</div>
				<div className="flex w-[55%] justify-end gap-x-2">
					{/* Template Dropdown Button */}

					<div className=" flex justify-end">
						<Button
							onClick={handleTemplateMenuOpen}
							sx={{
								paddingX: '14px',
								paddingY: '11px',
								fontFamily: 'Poppins, sans-serif',
								color: 'gray',
								fontSize: '14px',
								borderRadius: `12px`,
								fontWeight: '10px',
								backgroundColor: 'white',
								border: '1px solid #ccc',
								display: 'flex', // Flexbox to align text and icon
								alignItems: 'center', // Align icon and text vertically
								justifyContent: 'space-between', // Add space between text and icon
								gap: '8px', // Space between text and icon
							}}
						>
							{selectedTemplate ? selectedTemplate : 'All templates'}
							<ExpandMore />
						</Button>

						{/* Template Dropdown Menu */}
						<Menu
							anchorEl={templateAnchorEl}
							open={Boolean(templateAnchorEl)}
							onClose={handleTemplateMenuClose}
							slotProps={{
								paper: {
									style: {
										borderRadius: '8px',
										padding: '20px',
										width: '20%',
										marginLeft: '-70px',
										marginTop: '20px',
									},
								},
							}}
							// Adjust the position to align to the left
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							sx={{
								paddingX: '30px',
							}}
						>
							<div className="px-2 py-2 mb-2 flex justify-end">
								{!isAdding ? (
									<button
										onClick={() => setIsAdding(true)}
										className="text-sm bg-green-500 text-white px-2 py-2 rounded-lg hover:bg-green-600"
									>
										Add Template
									</button>
								) : (
									<div className="flex items-center gap-x-2">
										<input
											type="text"
											value={newTemplate}
											onChange={(e) => setNewTemplate(e.target.value)}
											className="border rounded-md px-3 py-2 text-sm"
											placeholder="Enter Template Name"
										/>
										<button
											onClick={() => {
												saveNewTemplate();
												handleTemplateMenuClose(); // Close after saving new template
											}}
											className="text-sm bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600"
										>
											Save
										</button>
										<button
											onClick={cancelAddTemplate}
											className="text-sm bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
										>
											Cancel
										</button>
									</div>
								)}
							</div>

							{templates.map((template, idx) => (
								<MenuItem
									key={idx}
									value={template}
									sx={{
										paddingX: '34px',
										marginBottom: '10px',
										paddingY: '8px',
										fontFamily: 'Poppins, sans-serif',
										borderRadius: '10px',
										backgroundColor:
											selectedTemplate === template ? '#DD2777' : '#FBD9E0', // Dark pink if selected
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										'&:hover': {
											backgroundColor:
												selectedTemplate === template ? '#DD2777' : '#FBD9E0', // Keep background color on hover
										},
									}}
									className="grid grid-cols-3 w-full gap-x-6 justify-between items-center bg-slate-200 p-3"
								>
									{editingTemplate === idx ? (
										<input
											type="text"
											value={template}
											onChange={(e) => {
												setTemplates((prevTemplates) => [
													...prevTemplates.slice(0, idx),
													e.target.value,
													...prevTemplates.slice(idx + 1),
												]);
											}}
											onBlur={() => saveTemplateEdit(idx, template)}
											className="col-span-2 border rounded-md px-3 py-2 text-sm"
										/>
									) : (
										<span
											className="col-span-2 text-sm w-full "
											style={{
												color:
													selectedTemplate === template ? 'white' : '#DB2788',
											}}
											onClick={() => {
												loadTemplate(template); // Load the selected template's components
											}}
										>
											{template}
										</span>
									)}

									<div className="flex justify-end gap-x-2 col-span-1">
										{editingTemplate === idx ? (
											<Save
												className="text-white bg-green-500 p-2 rounded-lg cursor-pointer hover:bg-green-600"
												onClick={() => saveTemplateEdit(idx, template)} // Save the new name
											/>
										) : (
											<Edit
												className="text-white bg-[#32C5FF] p-2 rounded-lg cursor-pointer hover:bg-blue-600"
												onClick={() => handleTemplateEdit(idx)} // Enter edit mode
											/>
										)}

										<Close
											className={`text-white bg-[#E4B710] p-2 rounded-lg cursor-pointer hover:bg-red-600 ${
												editingTemplate === idx
													? 'opacity-50 cursor-not-allowed'
													: ''
											}`}
											onClick={() => {
												if (editingTemplate !== idx) {
													removeTemplate(template);
												}
											}}
											style={{
												pointerEvents:
													editingTemplate === idx ? 'none' : 'auto',
											}}
										/>
									</div>
								</MenuItem>
							))}
						</Menu>
					</div>
					{/* Ellipsis icon to open the dropdown */}
					<div>
						<Button onClick={handleEllipsisMenuOpen}>
							<MoreVert className="text-gray-400 cursor-pointer" />
						</Button>

						{/* Ellipsis Dropdown Menu */}
						<Menu
							anchorEl={ellipsisAnchorEl}
							open={Boolean(ellipsisAnchorEl)}
							onClose={handleEllipsisMenuClose}
							slotProps={{
								paper: {
									style: {
										borderRadius: '8px',
										padding: '5px',
										width: '200px',
										marginTop: '25px',
									},
								},
							}}
						>
							<MenuItem
								onClick={(e) => {
									if (isEditing) {
										// Call save dashboard logic
										setSaveDialogOpen(true);
									} else {
										// Toggle edit mode
										toggleDashboardEditMode(e);
									}
									handleEllipsisMenuClose(); // Close the ellipsis menu after action
								}}
								sx={{
									fontFamily: 'Poppins, sans-serif',
									borderRadius: '8px',
									backgroundColor: '#f5f5f5',
									paddingX: '12px',
									paddingY: '6px',
								}}
							>
								{isEditing ? 'Save Dashboard' : 'Edit Dashboard'}
							</MenuItem>
						</Menu>
					</div>
				</div>
			</div>
			<div className="flex flex-col  rounded-2xl p-2 w-full justify-center items-center mx-auto gap-y-16 min-h-screen">
				<div className="flex flex-row justify-center mx-auto gap-x-6 w-full h-full">
					<div className="flex flex-col gap-4 w-[45%] mt-4">
						{/* Add Component Placeholder */}
						<div className="flex flex-row gap-x-4 bg-yellow-50 p-6 rounded-xl">
							{/* RoadmapView */}
							{dashboardComponents.includes('BarChart') && (
								<div className="relative min-h-[50vh] w-full">
									{isEditing && (
										<Close
											className="absolute right-2 text-red-500 cursor-pointer"
											onClick={() => handleRemoveComponentClick('BarChart')}
										/>
									)}
									<div className="flex flex-col gap-y-1 w-full">
										<h1 className="text-black font-poppins text-lg">
											Tickets By User
										</h1>
										<p className="text-gray-400 font-poppins text-sm">
											Track Tickets By Owner Of Tickets
										</p>
									</div>
									{/* <BarChart
										selectedSprintName={epicDetails && epicDetails.name}
										sprintData={sprintData}
									/> */}
								</div>
							)}
						</div>

						{/* RecentlyMentioned */}
						{dashboardComponents.includes('LineChart') && (
							<div className="relative min-h-[50vh] bg-yellow-50 p-6 rounded-xl">
								{isEditing && (
									<Close
										className="absolute -top-4 right-2 text-red-500 cursor-pointer"
										onClick={() => handleRemoveComponentClick('LineChart')}
									/>
								)}
								<div className="flex flex-col gap-y-1 w-full">
									<h1 className="text-black font-poppins text-lg">
										Tickets Completed Per Day
									</h1>
									<p className="text-gray-400 font-poppins text-sm">
										This Tracks the Average number of tickets per day
									</p>
								</div>
								{/* <LineChart
									selectedSprintName={epicDetails && epicDetails.name}
								/> */}
							</div>
						)}
					</div>

					<div className="grid grid-rows-2 gap-4 mt-4 w-[45%] h-full">
						{/* TodoList and EpicUnitsOverview */}
						{dashboardComponents.includes('LineChartLOE') && (
							<div className="relative min-h-[50vh] bg-yellow-50 p-6 rounded-xl">
								{isEditing && (
									<Close
										className="absolute -top-4 right-2 text-red-500 cursor-pointer"
										onClick={() => handleRemoveComponentClick('LineChartLOE')}
									/>
								)}
								<div className="flex flex-col gap-y-1 w-full">
									<h1 className="text-black font-poppins text-lg">
										Burn Down Rate
									</h1>
									<p className="text-gray-400 font-poppins text-sm">
										Show the trend of remaining and completed Work
									</p>
								</div>
								{/* <LineChartLOE
									selectedSprintName={epicDetails && epicDetails.name}
								/> */}
							</div>
						)}

						{dashboardComponents.includes('TableChart') && (
							<div className="relative min-h-[50vh] flex flex-col gap-y-4 bg-yellow-50 p-6 rounded-xl">
								{isEditing && (
									<Close
										className="absolute -top-6 right-2 text-red-500 cursor-pointer"
										onClick={() => handleRemoveComponentClick('TableChart')}
									/>
								)}
								<div className="flex flex-col gap-y-1 w-full">
									<h1 className="text-black font-poppins text-lg">
										Estimated Story Points
									</h1>
									<p className="text-gray-400 font-poppins text-sm">
										Displays the Estimated Level of Efforts
									</p>
								</div>
								{/* <TableChart
									selectedSprintName={epicDetails && epicDetails.name}
								/> */}
							</div>
						)}
					</div>
				</div>
				{isEditing && (
					<div
						className={`h-full min-h-[50vh] w-[90%] flex justify-center items-center border-dotted border-2 rounded-md border-gray-300`}
						onClick={() => setAddComponentDialogOpen(true)}
					>
						<div className="text-center flex flex-col justify-center items-center">
							<Add className="text-gray-600 p-3 rounded-full text-6xl mb-2 bg-gray-200" />
							<p className="text-gray-400 text-sm">Click to add component</p>
						</div>
					</div>
				)}
			</div>

			{/* Confirmation Dialog */}
			<Dialog
				open={confirmationOpen}
				onClose={cancelRemoveComponent}
				sx={{ fontFamily: 'Poppins, sans-serif' }}
			>
				<DialogTitle>Are you sure you want to continue?</DialogTitle>
				<DialogContent>
					<p className="font-poppins">
						You are about to remove the <strong>{componentToRemove}</strong>{' '}
						from the dashboard. Do you want to proceed?
					</p>
				</DialogContent>
				<DialogActions
					sx={{
						width: '100%',
						display: 'flex ',
						justifyContent: 'end',
						alignItems: 'end',
					}}
				>
					<Button
						onClick={cancelRemoveComponent}
						sx={{
							backgroundColor: 'red',
							color: 'white',
						}}
					>
						Cancel
					</Button>
					<Button
						onClick={confirmRemoveComponent}
						sx={{
							backgroundColor: 'green',
							color: 'white',
						}}
					>
						Continue
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={saveDialogOpen}
				onClose={handleCloseSaveDialog}
				sx={{ fontFamily: 'Poppins, sans-serif' }}
			>
				<DialogTitle>Save Dashboard to Template</DialogTitle>
				<DialogContent>
					{templates.map((template, index) => (
						<MenuItem
							key={template}
							sx={{
								fontFamily: 'Poppins, sans-serif',
								padding: '10px',
								borderRadius: '5px',
								marginBottom: '10px',
								backgroundColor:
									selectedTemplate === template ? '#ccc' : 'white', // Highlight if selected
								'&:hover': {
									backgroundColor:
										selectedTemplate === template ? '#ccc' : 'lightgray', // Maintain green if selected
									cursor: 'pointer',
								},
							}}
							onClick={() => setSelectedTemplate(template)} // Select the template to save to
						>
							{index + 1}- {template}
						</MenuItem>
					))}
				</DialogContent>
				<DialogActions
					sx={{
						width: '100%',
						display: 'flex ',
						justifyContent: 'end',
						alignItems: 'end',
					}}
				>
					<Button
						onClick={handleCloseSaveDialog}
						sx={{
							backgroundColor: 'red',
							color: 'white',
						}}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSaveTemplate} // Call save logic when Save button is clicked
						disabled={!selectedTemplate}
						sx={{
							backgroundColor: 'green',
							color: 'white',
						}}
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>

			{/* Add Component Dialog */}
			<Dialog
				open={addComponentDialogOpen}
				onClose={() => setAddComponentDialogOpen(false)}
				sx={{ fontFamily: 'Poppins, sans-serif' }}
			>
				<DialogTitle sx={{ fontFamily: 'Poppins, sans-serif' }}>
					Select the Component Which You Wanna Add
				</DialogTitle>
				<DialogContent sx={{ fontFamily: 'Poppins, sans-serif' }}>
					{componentsToAdd.length > 0 ? (
						componentsToAdd.map((component, index) => (
							<MenuItem
								key={component}
								onClick={() => handleAddComponent(component)}
								sx={{
									fontFamily: 'Poppins, sans-serif',
									padding: '10px',
									borderRadius: '5px',
									marginBottom: '10px',
									'&:hover': {
										backgroundColor: 'lightgray',
										cursor: 'pointer',
									},
								}}
							>
								{index + 1}-{component}
							</MenuItem>
						))
					) : (
						<p>No components available to add</p>
					)}
				</DialogContent>
				<DialogActions
					sx={{
						width: '100%',
						display: 'flex ',
						justifyContent: 'end',
						alignItems: 'end',
					}}
				>
					<Button
						onClick={() => setAddComponentDialogOpen(false)}
						color="primary"
						sx={{
							backgroundColor: 'green',
							color: 'white',
						}}
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default EpicsDashboard;
