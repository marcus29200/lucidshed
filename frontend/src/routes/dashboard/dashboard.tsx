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
import RoadmapView from './RoadMapView';
import RecentlyMentioned from './RecentMentions';
import TodoList from './TodoLists';
import EpicUnitsOverview from './EpicUnitsOverview';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
	Add,
	Close,
	Edit,
	ExpandMore,
	MoreVert,
	Save,
} from '@mui/icons-material';
const TEMPLATES_KEY = 'dashboardTemplates';
const TEMPLATES_STATE_KEY = 'dashboardTemplateStates';
const SELECTED_TEMPLATE_KEY = 'dashboardSelectedTemplate';
const DASHBOARD_COMPONENTS_KEY = 'dashboardTemplateComponents';
const Dashboard: React.FC = () => {
	const [oldTemplateName, setOldTemplateName] = useState<string | null>(null);
	// Dashboard components
	const availableComponents = [
		'RoadmapView',
		'RecentlyMentioned',
		'TodoList',
		'EpicUnitsOverview',
	];
	interface TemplateStates {
		[key: string]: string[]; // key is the template name, and the value is an array of strings
	}
	const [templates, setTemplates] = useState<string[]>(() => {
		const savedTemplates = localStorage.getItem(TEMPLATES_KEY);
		return savedTemplates ? JSON.parse(savedTemplates) : ['My Template'];
	});

	const [templateStates, setTemplateStates] = useState<TemplateStates>(() => {
		const savedTemplateStates = localStorage.getItem(TEMPLATES_STATE_KEY);
		return savedTemplateStates
			? JSON.parse(savedTemplateStates)
			: {
					'My Template': [
						'RoadmapView',
						'RecentlyMentioned',
						'TodoList',
						'EpicUnitsOverview',
					],
			  };
	});

	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
		() => {
			const savedSelectedTemplate = localStorage.getItem(SELECTED_TEMPLATE_KEY);
			return savedSelectedTemplate ? savedSelectedTemplate : 'My Template';
		}
	);

	const [dashboardComponents, setDashboardComponents] = useState<string[]>(
		() => {
			const savedDashboardComponents = localStorage.getItem(
				DASHBOARD_COMPONENTS_KEY
			);
			return savedDashboardComponents
				? JSON.parse(savedDashboardComponents)
				: ['RoadmapView', 'RecentlyMentioned', 'TodoList', 'EpicUnitsOverview'];
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
		localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
	}, [templates]);

	useEffect(() => {
		localStorage.setItem(TEMPLATES_STATE_KEY, JSON.stringify(templateStates));
	}, [templateStates]);

	useEffect(() => {
		if (selectedTemplate) {
			localStorage.setItem(SELECTED_TEMPLATE_KEY, selectedTemplate);
		}
	}, [selectedTemplate]);

	useEffect(() => {
		localStorage.setItem(
			DASHBOARD_COMPONENTS_KEY,
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
		<div>
			<div className="flex justify-between items-center bg-white rounded-md shadow-md p-4">
				<p className="text-gray-400 text-sm font-poppins">
					This layout can be edited using the pencil icon and can be saved as a
					template for later use.
				</p>
				<div className="flex items-center gap-x-2">
					{/* Template Dropdown Button */}
					<Button
						onClick={handleTemplateMenuOpen}
						sx={{
							paddingX: '14px',
							paddingY: '8px',
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
								<div className="flex items-center gap-x-2 w-full">
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
											pointerEvents: editingTemplate === idx ? 'none' : 'auto',
										}}
									/>
								</div>
							</MenuItem>
						))}
					</Menu>

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

			<div className={`flex flex-row gap-x-6 h-full`}>
				<div className="flex flex-col gap-4 w-[70%] mt-4">
					{/* Add Component Placeholder */}
					<div className="flex flex-row gap-x-4">
						{isEditing && (
							<div
								className={`h-full min-h-[50vh] w-[30%] flex justify-center items-center border-dotted border-2 rounded-md border-gray-300`}
								onClick={() => setAddComponentDialogOpen(true)}
							>
								<div className="text-center flex flex-col justify-center items-center">
									<Add className="text-gray-400 text-4xl mb-2" />
									<p className="text-gray-400 text-sm">
										Click to add component
									</p>
								</div>
							</div>
						)}

						{/* RoadmapView */}
						{dashboardComponents.includes('RoadmapView') && (
							<div className="relative w-full">
								{isEditing && (
									<Close
										className="absolute top-2 right-2 text-red-500 cursor-pointer"
										onClick={() => handleRemoveComponentClick('RoadmapView')}
									/>
								)}
								<RoadmapView />
							</div>
						)}
					</div>

					{/* RecentlyMentioned */}
					{dashboardComponents.includes('RecentlyMentioned') && (
						<div className="relative">
							{isEditing && (
								<Close
									className="absolute top-2 right-2 text-red-500 cursor-pointer"
									onClick={() =>
										handleRemoveComponentClick('RecentlyMentioned')
									}
								/>
							)}
							<RecentlyMentioned />
						</div>
					)}
				</div>

				<div className="grid grid-rows-2 gap-4 mt-4 w-[30%] h-full">
					{/* TodoList and EpicUnitsOverview */}
					{dashboardComponents.includes('TodoList') && (
						<div className="relative">
							{isEditing && (
								<Close
									className="absolute top-2 right-2 text-red-500 cursor-pointer"
									onClick={() => handleRemoveComponentClick('TodoList')}
								/>
							)}
							<TodoList />
						</div>
					)}

					{dashboardComponents.includes('EpicUnitsOverview') && (
						<div className="relative">
							{isEditing && (
								<Close
									className="absolute top-2 right-2 text-red-500 cursor-pointer"
									onClick={() =>
										handleRemoveComponentClick('EpicUnitsOverview')
									}
								/>
							)}
							<EpicUnitsOverview />
						</div>
					)}
				</div>
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

export default Dashboard;
