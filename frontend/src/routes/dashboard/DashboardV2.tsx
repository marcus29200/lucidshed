import { rectSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import RoadmapView from './RoadMapView';
import TodoList from './TodoLists';

import OverdueStories from './OverdueStories';
import { MultipleContainers } from '../../components/Dndkit/MultipleContainres';
import { UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from '../../components/Dndkit/item.model';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Menu,
	MenuItem,
	Tooltip,
	tooltipClasses,
} from '@mui/material';
import { Close, Edit, ExpandMore, Save } from '@mui/icons-material';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { toast } from 'react-toastify';
import CriticalStories from './CriticalStories';
import HighPriorityStories from './HighPriorityStories';
import StoriesByAssignedTo from './StoriesByAssigneedTo';

const DASHBOARD_MODULES = {
	A: [
		{
			id: 'A6',
			title: 'Current Sprint',
			content: (
				<div>
					<h5>Current Sprint</h5>
					Coming soon!
				</div>
			),
		},
		{
			id: 'A3',
			title: 'New Feature Requests',
			content: (
				<div>
					<h5>New Feature Requests</h5>
					Coming soon!
				</div>
			),
		},
		{
			id: 'A4',
			title: 'Unassigned Features',
			content: (
				<div>
					<h5>Unassigned Features</h5>
					Coming soon!
				</div>
			),
		},
		{
			id: 'A9',
			title: 'Tickets assigned by team member',
			content: <StoriesByAssignedTo />,
		},
		{
			id: 'A1',
			title: 'Epics',
			content: <RoadmapView />,
		},
	],
	B: [
		{
			id: 'B2',
			title: 'Tickets Assigned to me',
			content: <TodoList />,
		},
		{
			id: 'B5',
			title: 'Overdue Stories',
			content: <OverdueStories />,
		},
		{
			id: 'B7',
			title: 'Critical tickets',
			content: <CriticalStories />,
		},
		{
			id: 'B8',
			title: 'High Priority Tickets',
			content: <HighPriorityStories />,
		},
	],
};

const ALL_MODULES: SortableItem[] = Object.keys(DASHBOARD_MODULES).flatMap(
	(key) => DASHBOARD_MODULES[key]
);

const MAX_MODULES_ITEMS = ALL_MODULES.length;
const TEMPLATES_KEY = 'dashboardTemplates';
const TEMPLATES_STATE_KEY = 'dashboardTemplateStates';
const SELECTED_TEMPLATE_KEY = 'dashboardSelectedTemplate';

type Modules = Record<string, SortableItem[]>;
type TemplateComponents = Record<string, UniqueIdentifier[]>;
let updatedTemplateStates: TemplateComponents | null = null;

const getTemplateComponentsToStore = (modules: Modules): TemplateComponents => {
	return Object.keys(modules).reduce((acc, key) => {
		if (modules[key] && modules[key].length) {
			acc[key] = modules[key]
				.filter((module) => !!module)
				.map((module) => module.id);
		}
		return acc;
	}, {} as TemplateComponents);
};

const getTemplateComponentsToDisplay = (
	templates: TemplateComponents
): Modules => {
	return Object.keys(templates).reduce((acc, key) => {
		acc[key] = templates[key].map((item) => ({
			...ALL_MODULES.find(
				(module) => item.toString().slice(1) === module.id.toString().slice(1)
			)!,
			id: item,
		}));
		return acc;
	}, {} as Modules);
};

const getComponentsIdsInTemplate = (template: TemplateComponents): string[] => {
	return Object.keys(template).reduce((acc, key) => {
		// save only the item ID not the container id due it can be different from the original array.
		acc = [...acc, ...template[key].map((item) => item.toString().slice(1))];
		return acc;
	}, [] as string[]);
};

const getComponentsAvailable = (
	templateComponents: string[]
): SortableItem[] => {
	const available: SortableItem[] = [];
	for (let i = 0; i < ALL_MODULES.length; i++) {
		const item = ALL_MODULES[i];
		if (templateComponents.includes(item.id.toString().slice(1))) {
			continue;
		}
		available.push(item);
	}
	return available;
};
let componentsToAdd: SortableItem[] = [];

const DashboardV2 = () => {
	const [dashboardComponents, setDashboardComponents] =
		useState<Modules>(DASHBOARD_MODULES);
	const [templates, setTemplates] = useState<string[]>(() => {
		const savedTemplates = localStorage.getItem(TEMPLATES_KEY);
		return savedTemplates ? JSON.parse(savedTemplates) : ['My Template'];
	});
	const [templateStates, setTemplateStates] = useState<
		Record<string, TemplateComponents>
	>(() => {
		const savedTemplateStates = localStorage.getItem(TEMPLATES_STATE_KEY);
		if (savedTemplateStates) {
			const state = JSON.parse(savedTemplateStates);
			const templateKeys = Object.keys(state);
			const components = state[templateKeys[0]];
			// if components is an array, we are storing an old version of dashboard
			if (Array.isArray(components)) {
				localStorage.removeItem(TEMPLATES_STATE_KEY);
				return {
					'My Template': getTemplateComponentsToStore(DASHBOARD_MODULES),
				};
			}
			return state;
		}
		return {
			'My Template': getTemplateComponentsToStore(DASHBOARD_MODULES),
		};
	});

	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
		() => {
			const savedSelectedTemplate = localStorage.getItem(SELECTED_TEMPLATE_KEY);
			return savedSelectedTemplate ? savedSelectedTemplate : 'My Template';
		}
	);

	const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(8);

	const [isEditing, setIsEditing] = useState(false); // To track edit/save state

	// Toggle between edit and save mode for the dashboard
	const toggleDashboardEditMode = () => {
		setIsEditing((isEditing) => !isEditing); // Toggle the state
	};

	const [oldTemplateName, setOldTemplateName] = useState<string | null>(null);
	const [newTemplate, setNewTemplate] = useState('');
	const [editingTemplate, setEditingTemplate] = useState<number | null>(null);
	const [isAdding, setIsAdding] = useState(false);

	// State for template dropdown
	const [templateAnchorEl, setTemplateAnchorEl] = useState<null | HTMLElement>(
		null
	);

	const [addComponentDialogOpen, setAddComponentDialogOpen] = useState(false);

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
	// Close the add component modal
	const handleCloseAddComponentDialog = () => {
		setAddComponentDialogOpen(false);
	};
	// Add a component to the dashboard
	const handleAddComponent = (component: SortableItem) => {
		if (updatedTemplateStates) {
			const firstContainerKey = Object.keys(updatedTemplateStates)[0];
			const targetContainerId = `${firstContainerKey}${component.id
				.toString()
				.slice(1)}`;
			updatedTemplateStates[firstContainerKey] = [
				targetContainerId,
				...updatedTemplateStates[firstContainerKey],
			];
			handleSaveChanges();
		}

		handleCloseAddComponentDialog();
	};

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
					templateStates[newSelectedTemplate] ||
					getTemplateComponentsToStore(DASHBOARD_MODULES);
				setDashboardComponents(() =>
					getTemplateComponentsToDisplay(selectedTemplateComponents)
				);
			} else {
				setSelectedTemplate(null);
				setDashboardComponents(DASHBOARD_MODULES); // Reset the dashboard if no templates are left
			}
		}
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

	const loadTemplate = (template: string) => {
		const selectedTemplateComponents = templateStates[template];
		const keys = Object.keys(selectedTemplateComponents);
		if (
			selectedTemplateComponents &&
			!Array.isArray(selectedTemplateComponents[keys[0]])
		) {
			setDashboardComponents(() =>
				getTemplateComponentsToDisplay(selectedTemplateComponents)
			);
		} else {
			setDashboardComponents(DASHBOARD_MODULES);
		}
		setSelectedTemplate(template);
		setIsEditing(false);
	};

	const saveNewTemplate = () => {
		if (newTemplate.trim()) {
			setTemplates([...templates, newTemplate]);
			setTemplateStates((prev) => ({
				...prev,
				[newTemplate]: getTemplateComponentsToStore(DASHBOARD_MODULES), // Save current dashboard state to new template
			}));
			setSelectedTemplate(newTemplate);
			setNewTemplate('');
			setIsAdding(false);
		}
	};

	const updateItemsCount = (updatedItems: Modules) => {
		const count = Object.values(updatedItems).reduce(
			(acc, items) => acc + items.length,
			0
		);
		setDisplayedItemsCount(count);
	};

	const handleSaveChanges = () => {
		if (selectedTemplate && !!updatedTemplateStates) {
			setTemplateStates((prev) => ({
				...prev,
				[selectedTemplate]: updatedTemplateStates!,
			}));
			updatedTemplateStates = null;
		}
	};

	const handleOrderChange = (updatedItems: Modules) => {
		updateItemsCount(updatedItems);
		updatedTemplateStates = getTemplateComponentsToStore(updatedItems);

		componentsToAdd = getComponentsAvailable(
			getComponentsIdsInTemplate(updatedTemplateStates)
		);
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
		if (selectedTemplate) {
			const selectedTemplateComponents =
				templateStates[selectedTemplate] ||
				getTemplateComponentsToStore(DASHBOARD_MODULES);

			setDashboardComponents(() =>
				getTemplateComponentsToDisplay(selectedTemplateComponents)
			);
		}
	}, [selectedTemplate, templateStates]);

	return (
		<>
			<div className="flex justify-between items-center bg-white rounded-md shadow-md p-4">
				<p className="text-gray-400 text-sm font-poppins">
					This layout can be edited using the pencil icon and can be saved as a
					template for later use.
				</p>
				<div className="flex items-center gap-x-2">
					{/* Add new component */}
					{isEditing && (
						<Button
							disabled={displayedItemsCount === MAX_MODULES_ITEMS}
							size="medium"
							variant="contained"
							onClick={() => setAddComponentDialogOpen(true)}
						>
							Add component
						</Button>
					)}

					{/* Template Dropdown Button */}
					<IconButton
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
					</IconButton>

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
						<Tooltip
							title={isEditing ? 'Save dashboard' : 'Edit dashboard'}
							PopperProps={{
								sx: {
									[`& .${tooltipClasses.tooltip}`]: { background: '#000' },
								},
							}}
						>
							<IconButton
								className="text-gray-400 cursor-pointer"
								onClick={() => {
									if (isEditing) {
										// Call save dashboard logic
										handleSaveChanges();
									}
									toggleDashboardEditMode();
								}}
							>
								{isEditing ? <Save /> : <Edit />}
							</IconButton>
						</Tooltip>
					</div>
				</div>
			</div>
			<MultipleContainers
				columns={1}
				strategy={rectSortingStrategy}
				itemActionsEnabled={isEditing && displayedItemsCount > 1}
				minimal
				handle
				modifiers={[snapCenterToCursor]}
				confirmDeletion
				items={dashboardComponents}
				onOrderChange={handleOrderChange}
			/>

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
					{componentsToAdd.map((component, index) => (
						<MenuItem
							key={component.id}
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
							{index + 1}-{component.title}
						</MenuItem>
					))}
				</DialogContent>
				<DialogActions
					sx={{
						width: '100%',
						display: 'flex ',
						justifyContent: 'end',
						alignItems: 'end',
						padding: '16px 36px',
					}}
				>
					<Button
						onClick={() => setAddComponentDialogOpen(false)}
						color="primary"
						variant="contained"
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default DashboardV2;
