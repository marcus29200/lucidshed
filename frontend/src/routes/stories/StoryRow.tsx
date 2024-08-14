import { TableCell, TableRow, IconButton, MenuItem, Menu } from "@mui/material"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { redirect, useLocation, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStory } from "../../api/stories";

// TODO: add typing for epic
const StoryRow = ({ story }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const params = useParams();
  const open = Boolean(anchorEl);
  const queryClient = useQueryClient();
  const { mutate: removeStory } = useMutation({
    mutationFn: deleteStory,
    onError: () => {
      console.error("wuhh");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['stories'] });
      navigate(0)
    }

  })

  const handleClick = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.href}/${story.id}`);
  }

  const deleteItem = () => {
    removeStory({ orgId: params.orgId, storyId: story.id });

  }
  const formattedCompletionDate = story.estimated_completion_date ? format(new Date(story.estimated_completion_date), 'MMM dd, yyyy') : null;
  return (
    <>
      <TableRow sx={{ cursor: 'pointer' }} hover={true} onClick={() => navigate(`./${story.id}`, { relative: 'path' })}>
        <TableCell>{story.title}</TableCell>
        <TableCell>{story.id}</TableCell>
        <TableCell></TableCell>
        <TableCell>{formattedCompletionDate}</TableCell>
        <TableCell>
          <IconButton onClick={handleClick}>
            <MoreHorizIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={copyLink}>Copy Url</MenuItem>
        <MenuItem onClick={deleteItem}>Delete Item</MenuItem>
      </Menu>
    </>
  )
}

export default StoryRow
