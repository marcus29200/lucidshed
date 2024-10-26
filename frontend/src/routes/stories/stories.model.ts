export const STORY_STATUS = {
	'not-started': 'Not Started',
	'in-progress': 'In Progress',
	done: 'Done',
} as const;
export type StoryStatus = (typeof STORY_STATUS)[keyof typeof STORY_STATUS]; // "not-started" | "in-progress" | "done
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

export const TICKET_TYPE = {
	feature: 'feature',
	bug: 'bug',
	task: 'task',
} as const;

export type TicketType = (typeof TICKET_TYPE)[keyof typeof TICKET_TYPE];

export const ticketTypes = [
	{
		label: 'Feature',
		value: TICKET_TYPE.feature,
	},
	{
		label: 'Bug',
		value: TICKET_TYPE.bug,
	},
	{
		label: 'Task',
		value: TICKET_TYPE.task,
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
	epic: 'Epic',
	attachment: 'Attachments',
} as const;

export const DISABLED_DEFAULT_FIELDS = ['subType'];

export type MetadataFieldOption = keyof typeof METADATA_FIELD_OPTIONS;

export const STORY_STATUS_PROGRESS = {
	'not-started': 0,
	'in-progress': 50,
	done: 100,
} as const;
export const STORY_PRIORITY = {
	'1': 'Critical',
	'2': 'High',
	'3': 'Medium',
	'4': 'Small',
} as const;
export const STORY_PRIORITY_VALUE = {
	critical: 1,
	high: 2,
	medium: 3,
	low: 4,
} as const;
