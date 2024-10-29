import React, { useEffect, useState } from 'react';

import {
	Menu,
	MenuItem,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
} from '@mui/material'; // MUI components
import '../../index.css';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useParams } from 'react-router-dom';
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
import { ConfirmationDialog } from '../../components/DeleteDialog';

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

	const [templateStates, setTemplateStates] = useState<TemplateStates>(() => {
		const savedTemplateStates = localStorage.getItem('graphTemplateStates');
		if (savedTemplateStates) {
			return JSON.parse(savedTemplateStates);
		}
		return {
			'My Templates': ['BarChart', 'LineChart', 'LineChartLOE', 'TableChart'],
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
		<div className="overflow-y-auto">
			<div className="flex justify-between items-center gap-4 pr-6">
				<div className="flex space-x-4">
					<Link to={`/${orgId}/epics/${epicId}`}>
						<button className="flex gap-x-1 justify-center items-center px-24 py-3 bg-gray-50 text-gray-300 rounded-md font-bold border-none hover:border-none shadow-neutral">
							<HomeIcon className="text-gray-300 -ml-3" />
							<span className="mt-1">Epic</span>
						</button>
					</Link>
					<Link to={`/${orgId}/epics/${epicId}/dashboard`}>
						<button className="flex gap-x-1 justify-center items-center px-24 py-3 transition bg-green-500 border-none text-white rounded-md font-bold hover:border-none hover:bg-green-600/80 relative">
							<Settings className="text-white -ml-3" />
							<span>Reporting</span>
							<div className="absolute -bottom-1 rounded h-0.5 w-full bg-green-500"></div>
						</button>
					</Link>
				</div>
				{/* template and edit button */}
				<div className="flex items-center gap-x-2">
					{/* Template Dropdown Button */}
					<div>
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
							className="truncate"
						>
							<div className="truncate">
								{selectedTemplate ? selectedTemplate : 'All templates'}
							</div>
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
						<IconButton onClick={handleEllipsisMenuOpen}>
							<MoreVert className="text-gray-400 cursor-pointer" />
						</IconButton>

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
			<div className="flex flex-col pr-6 w-full justify-center items-center gap-y-16 min-h-screen">
				{/* charts content */}
				<div className="flex flex-row justify-center mx-auto gap-x-6 w-full h-full">
					{/* left section */}
					<div className="flex flex-col gap-4 w-1/2 mt-4">
						{/* Add Component Placeholder */}
						<div className="flex relative flex-row gap-x-4 bg-white border-1 border-gray-300 p-6 rounded-xl">
							{/* RoadmapView */}
							{dashboardComponents.includes('BarChart') && (
								<div className="min-h-[50vh] w-full">
									{isEditing && (
										<Close
											className="absolute top-3 right-3 text-red-500 cursor-pointer"
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
						<div className="flex relative flex-row gap-x-4 bg-white border-1 border-gray-300 p-6 rounded-xl">
							{/* RecentlyMentioned */}
							{dashboardComponents.includes('LineChart') && (
								<div className="min-h-[50vh] w-full">
									{isEditing && (
										<Close
											className="absolute top-3 right-3 text-red-500 cursor-pointer"
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
					</div>
					{/* right section */}
					<div className="grid grid-rows-2 gap-4 mt-4 w-1/2 h-full">
						<div className="flex relative flex-row gap-x-4 bg-white border-1 border-gray-300 p-6 rounded-xl">
							{/* TodoList and EpicUnitsOverview */}
							{dashboardComponents.includes('LineChartLOE') && (
								<div className="w-full min-h-[50vh] ">
									{isEditing && (
										<Close
											className="absolute top-3 right-3 text-red-500 cursor-pointer"
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
						</div>
						<div className="flex relative flex-row gap-x-4 bg-white border-1 border-gray-300 p-6 rounded-xl">
							{dashboardComponents.includes('TableChart') && (
								<div className="w-full min-h-[50vh] ">
									{isEditing && (
										<Close
											className="absolute top-3 right-3 text-red-500 cursor-pointer"
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
				</div>
				{/* add new component card */}
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
			<ConfirmationDialog
				open={confirmationOpen}
				onClose={cancelRemoveComponent}
				onConfirm={confirmRemoveComponent}
			>
				<p className="font-poppins">
					You are about to remove the <strong>{componentToRemove}</strong> from
					the dashboard. Do you want to proceed?
				</p>
			</ConfirmationDialog>

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
						variant="contained"
						color="error"
					>
						Cancel
					</Button>
					<Button
						onClick={handleSaveTemplate} // Call save logic when Save button is clicked
						color="primary"
						variant="contained"
						disabled={!selectedTemplate}
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
