import { CalendarMonth } from '@mui/icons-material';
import { DashboardItemIcon } from '../../icons/icons';

interface TaskProps {
	title: string;
	ticket: string;
	due: string;
	completed?: boolean; // This is optional because not all tasks are completed
}

const TodoList: React.FC = () => {
	return (
		<div className="p-6 bg-white rounded-lg shadow-md border-1 border-gray-200 font-poppins">
			<div className="flex flex-col gap-y-1.5">
				<div className="flex flex-row gap-x-2 ">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">Todo List</h2>
				</div>

				<p className="text-sm ml-10 text-gray-400 font-semibold mb-4 font-poppins">
					Tasks need your immediate attention
				</p>
			</div>

			{/* Container for tasks with vertical scroll */}
			<div className="max-h-[340px] overflow-y-auto space-y-4 scrollbar-hide custom-scrollbar">
				<Task
					title="Project Alpha Launch"
					ticket="2015423"
					due="Sep 15, 2024"
				/>
				<Task
					title="Project Alpha Launch"
					ticket="2015423"
					due="Sep 15, 2024"
				/>
				<Task
					title="Project Alpha Launch"
					ticket="2015423"
					due="Sep 15, 2024"
					completed={true}
				/>
				<Task
					title="Project Alpha Launch"
					ticket="2015423"
					due="Sep 15, 2024"
				/>
				<Task
					title="Project Alpha Launch"
					ticket="2015423"
					due="Sep 15, 2024"
				/>
				<Task
					title="Project Alpha Launch"
					ticket="2015423"
					due="Sep 15, 2024"
					completed={true}
				/>
				<Task
					title="Project Alpha Launch"
					ticket="2015423"
					due="Sep 15, 2024"
				/>
				<Task
					title="Project Alpha Launch"
					ticket="2015423"
					due="Sep 15, 2024"
				/>
				<Task
					title="Project Alpha Launch"
					ticket="2015423"
					due="Sep 15, 2024"
					completed={true}
				/>
			</div>
		</div>
	);
};

// Define the Task component that accepts TaskProps as props
const Task: React.FC<TaskProps> = ({ title, ticket, due, completed }) => (
	<div className="flex flex-col gap-y-4 justify-center items-start w-full mb-4">
		<div className="flex flex-row justify-between w-full">
			<div className="flex flex-col gap-y-2">
				<span
					className={`text-sm bg-[#FBD9E0] p-2 rounded-lg w-max ${
						completed ? 'text-pink-600' : 'text-pink-600'
					}`}
				>
					{completed ? 'Completed' : 'Upcoming'}
				</span>
				<p className="font-semibold">{title}</p>
			</div>
			<input
				type="radio"
				checked={completed}
				className="radio-Todo rounded-full h-4 w-4 mb-30"
				readOnly
			/>
		</div>
		<div className="flex flex-row justify-between w-full">
			<p className="text-xs text-gray-400">Ticket#: {ticket}</p>
			<div className="flex flex-row gap-x-1">
				<CalendarMonth className="mr-1 text-gray-300" />
				<p className="text-xs text-gray-400 mr-4">Due: {due}</p>
			</div>
		</div>
	</div>
);

export default TodoList;
