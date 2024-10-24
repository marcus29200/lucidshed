export const statuses = [
	{
		label: 'Not started',
		value: 'not-started',
	},
	{
		label: 'In progress',
		value: 'in-progress',
	},
	{
		label: 'Done',
		value: 'done',
	},
];
export const priorities = [
	{
		label: 'None',
		value: undefined,
	},
	{
		label: 'Critical',
		value: 'critical',
	},
	{
		label: 'High',
		value: 'high',
	},
	{
		label: 'Medium',
		value: 'medium',
	},
	{
		label: 'Small',
		value: 'low',
	},
];
export const ticketTypes = [
	{
		label: 'Feature',
		value: 'feature',
	},
	{
		label: 'Bug',
		value: 'bug',
	},
	{
		label: 'Task',
		value: 'task',
	},
];

export const METADATA_FIELD_OPTIONS = {
	targetDate: 'Due Date',
	estimate: 'Estimate',
	status: 'Status',
	priority: 'Priority',
	subType: 'Type',
	sprint: 'Sprint',
	tags: 'Tags',
	assignedTo: 'Assigned to',
	attachment: 'Attachments',
} as const;

export const DISABLED_DEFAULT_FIELDS = ['subType'];

export type MetadataFieldOption = keyof typeof METADATA_FIELD_OPTIONS;
