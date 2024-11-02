import { Button, Menu, Switch, FormControlLabel } from '@mui/material';
import { useState } from 'react';

const GroupByButton = ({
	options,
	setSelectedItem,
	selectItem,
}: {
	options: { label: string; value: string }[];
	setSelectedItem: React.Dispatch<React.SetStateAction<string | undefined>>;
	selectItem: string | undefined;
}) => {
	const [anchorMenuEl, setAnchorMenuEl] = useState<null | HTMLElement>(null);

	const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorMenuEl(event.currentTarget);
	};

	const handleCloseMenu = () => {
		setAnchorMenuEl(null);
	};

	return (
		<>
			<Button
				variant="outlined"
				onClick={handleClickMenu}
				color="neutral"
				sx={{
					paddingX: '16px',
					borderRadius: '10px',
					fontFamily: 'Poppins, sans-serif',
					paddingY: '8px',
					fontSize: '16px',
				}}
			>
				<span>
					Group by
					{selectItem && (
						<>: {options.find((opt) => opt.value === selectItem)?.label}</>
					)}
				</span>
			</Button>
			<Menu
				anchorEl={anchorMenuEl}
				open={Boolean(anchorMenuEl)}
				onClose={handleCloseMenu}
				slotProps={{
					paper: {
						style: {
							width: '290px',
							padding: '10px',
						},
					},
				}}
			>
				{/* Menu Items with Checkboxes */}
				{options.map((item) => (
					<FormControlLabel
						key={item.value}
						control={
							<Switch
								checked={item.value === selectItem}
								onChange={() => {
									setSelectedItem(() =>
										item.value !== selectItem ? item.value : undefined
									);
									handleCloseMenu();
								}}
							/>
						}
						label={item.label}
					/>
				))}
			</Menu>
		</>
	);
};

export default GroupByButton;
