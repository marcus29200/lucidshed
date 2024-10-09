import {
	Box,
	Button,
	Chip,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createEpic, Priority } from '../../api/epics';
import FullHeightSection from '../../components/FullHeightSection';

import { useState } from 'react';
import { CloudUpload } from '@mui/icons-material';

// these are hard coded temporarily until they become configurable
const priorities = [
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

type CreateEpicProps = {
	title: string;
	description: string;
	targetDate: Date | null; // time
	priority: Priority;
	category: string;
	attachments: string[];
};

export const CreateEpic = () => {
	const [formData, setFormData] = useState<CreateEpicProps>({
		title: '',
		description: '',
		targetDate: null, // Store as Dayjs object
		priority: 'low',
		category: '',
		attachments: [],
	});
	const queryClient = useQueryClient();
	const params = useParams();
	const navigate = useNavigate();

	const handleSubmit = async () => {
		// Format dates only when submitting or displaying them
		try {
			await createEpic({
				orgId: params.orgId as string,
				data: {
					title: formData.title,
					description: formData.description,
					estimated_completion_date: formData.targetDate?.toISOString(),
					priority: formData.priority,
					item_type: 'epic',
				},
			});
			await queryClient.invalidateQueries({ queryKey: ['epics'] });
			navigate(`/${params.orgId}/epics`);
		} catch (error) {
			console.warn(error);
		}
	};
	const handleInputChange = (field: string, value: string) => {
		setFormData((prevData) => ({ ...prevData, [field]: value }));
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const uploadedFiles = Array.from(event.target.files || []).map(
			(file) => file.name
		);
		setFormData((prevData) => ({
			...prevData,
			attachments: [...prevData.attachments, ...uploadedFiles],
		}));
	};

	const handleAttachmentDelete = (index: number) => {
		setFormData((prevData) => ({
			...prevData,
			attachments: prevData.attachments.filter((_, i) => i !== index),
		}));
	};
	return (
		<FullHeightSection>
			<Box
				sx={{
					padding: '20px',
					minHeight: 'calc(100vh - 200px)',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Typography
					variant="h1"
					fontSize={'18px'}
					fontWeight={'600'}
					align="left"
				>
					Create New Epic
				</Typography>
				<Typography
					variant="subtitle2"
					color="neutral.light"
					align="left"
					fontSize={'14px'}
					sx={{ marginBottom: '16px' }}
				>
					Fill out the following details to create a new epic
				</Typography>
				<Typography
					variant="body1"
					fontSize={'16px'}
					fontWeight={'600'}
					sx={{ paddingBottom: '16px' }}
					align="left"
				>
					Basic Details
				</Typography>
				<div className="flex flex-row gap-x-4 justify-center ">
					<div className="flex flex-col w-[60%] gap-y-4">
						<div className="col-span-2">
							<TextField
								fullWidth
								label="Title"
								variant="outlined"
								placeholder="{Epic name/Number}"
								value={formData.title}
								onChange={(e) => handleInputChange('title', e.target.value)}
							/>
						</div>

						<div className="col-span-2">
							<TextField
								fullWidth
								label="Description"
								variant="outlined"
								multiline
								rows={4}
								placeholder="Develop a user authentication system..."
								value={formData.description}
								onChange={(e) =>
									handleInputChange('description', e.target.value)
								}
							/>
						</div>
						{/* checkbox */}
						<div className="flex pt-12 gap-x-2">
							<label htmlFor="roadCheck" className="flex gap-2 items-center">
								<input
									type="checkbox"
									name="roadCheck"
									id="roadCheck"
									className="border-1 border-gray-400"
								/>
								Add Epic to RoadMap Widget
							</label>
						</div>
					</div>
					<div className="flex flex-col w-[40%] gap-y-4 ">
						<DatePicker
							label="Estimated Completion"
							name="targetDate"
							value={formData.targetDate}
							onChange={(evt) =>
								setFormData((prev) => ({ ...prev, targetDate: evt }))
							}
							slotProps={{
								textField: {
									variant: 'outlined',
									size: 'medium',
									fullWidth: true,
								},
							}}
						></DatePicker>
						<div className="flex flex-col rounded-xl ">
							<FormControl>
								<InputLabel size="normal" id="priority-label">
									Priority
								</InputLabel>
								<Select
									variant="outlined"
									size="medium"
									margin="dense"
									fullWidth
									labelId="priority-label"
									label="Priority"
									value={formData.priority}
									onChange={(evt) =>
										setFormData((prev) => ({
											...prev,
											priority: evt.target.value as Priority,
										}))
									}
									id="priority"
									name="priority"
								>
									{priorities.map((priority) => (
										<MenuItem value={priority.value} key={priority.value}>
											{priority.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</div>
						<div className="flex flex-col">
							<TextField
								fullWidth
								label="Product Area/Category"
								variant="outlined"
								value={formData.category}
								onChange={(e) => handleInputChange('category', e.target.value)}
							/>
						</div>

						{/* File Upload Section */}
						<div
							className="flex flex-col cursor-pointer"
							onClick={() => document.getElementById('file-upload')?.click()}
						>
							<label className="block mb-2 text-sm  text-gray-700 text-left">
								Attachments/Files
							</label>
							<div className="flex items-center gap-2 p-2 rounded-xl border-1 border-gray-300">
								<IconButton
									color="primary"
									aria-label="upload file"
									component="label"
								>
									<input
										hidden
										id="file-upload"
										type="file"
										multiple
										onChange={handleFileUpload}
									/>
									<CloudUpload />
								</IconButton>
								<span className="text-gray-600">Upload Files</span>
							</div>
						</div>

						<div className="col-span-2">
							<div className="flex flex-col justify-start items-start flex-wrap gap-2">
								{formData.attachments.slice(0, 3).map((file, index) => (
									<Chip
										key={index}
										label={file}
										onDelete={() => handleAttachmentDelete(index)}
									/>
								))}
								{formData.attachments.length > 3 && (
									<Button
										variant="text"
										className="text-blue-500"
										onClick={() => alert('Show more attachments')}
									>
										See More ({formData.attachments.length - 3} Additional
										Attachments)
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-x-6 justify-end items-end mt-auto">
					{' '}
					<Link to={'..'} relative="path">
						<Button
							variant="contained"
							color="neutral"
							sx={{
								paddingX: '70px',
								borderRadius: '10px',
								fontFamily: 'Poppins, sans-serif',
								paddingY: '13px',
								fontSize: '16px',
								backgroundColor: '#E9EAEC',
								color: '#000',
							}}
						>
							Cancel
						</Button>
					</Link>
					<Button
						variant="contained"
						sx={{
							paddingX: '70px',
							borderRadius: '10px',
							fontFamily: 'Poppins, sans-serif',
							paddingY: '13px',
							fontSize: '16px',
						}}
						onClick={handleSubmit}
					>
						Create Epic
					</Button>
				</div>
			</Box>
		</FullHeightSection>
	);
};

// const navigate = useNavigate()
// return (
//   <FullHeightSection>
//     <Box sx={{
//       padding: '20px', minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column'
//     }}>
//       <Typography variant="subtitle1" align="left">Create New Epic</Typography>
//       <Typography variant="subtitle2" color="neutral.light" align="left" sx={{ marginBottom: '16px' }}>Fill out the following details to create a new epic</Typography>
//       <Typography variant="body1" align="left">Basic Details</Typography>
//       <Form method="post" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
//         <Grid container spacing={2} sx={{ flexGrow: 1 }}>
//           <Grid item xs={8}>
//             <TextField variant="outlined" size="small" margin="dense" fullWidth label="Title" id="title" name="title"></TextField>
//             <TextField variant="outlined" size="small" margin="dense" fullWidth label="Description" id="description" name="description" multiline minRows={8}></TextField>
//           </Grid>
//           <Grid item xs={4}>
//             <DatePicker label="Estimated Completion" name="targetDate" slotProps={{ textField: { variant: "outlined", size: "small", margin: 'dense', fullWidth: true } }}></DatePicker>
//             <FormControl sx={{ width: '100%' }}>
//               <InputLabel size="small" id="priority-label">Priority</InputLabel>
//               <Select variant="outlined" size="small" margin="dense" fullWidth labelId="priority-label" label="Priority" defaultValue={"low"} id="priority" name="priority">{
//                 priorities.map(priority => <MenuItem value={priority.value} key={priority.value}>{priority.label}</MenuItem>)
//               }</Select>
//             </FormControl>
//             <TextField variant="outlined" size="small" margin="dense" fullWidth label="Product Area" id="category" name="category"></TextField>
//             <TextField variant="outlined" size="small" margin="dense" fullWidth label="Attachments/Files"></TextField>
//           </Grid>
//         </Grid>
//         <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
//           <Button variant="contained" sx={{ backgroundColor: 'neutral.lightest', color: 'black' }} color="neutral" onClick={() => navigate('..', { relative: 'path' })}>Cancel</Button>
//           <Button variant="contained" type="submit">Create Epic</Button>
//         </Box>
//       </Form>
//     </Box >
//   </FullHeightSection>
// )
// }
