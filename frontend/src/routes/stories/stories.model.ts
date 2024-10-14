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

export const METADATA_FIELD_OPTIONS = {
	targetDate: 'Due Date',
	estimate: 'Estimate',
	status: 'Status',
	priority: 'Priority',
	subType: 'Type',
	sprint: 'Sprint',
	tags: 'Tags',
	attachment: 'Attachments',
} as const;

export type MetadataFieldOption = keyof typeof METADATA_FIELD_OPTIONS;
