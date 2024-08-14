import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';


export default function SprintSearchInput({ sprints }: { sprints?: any[] }) {
  console.log(sprints);
  const [value, setValue] = React.useState<any | null>(null);
  const navigate = useNavigate();
  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => {
        console.log(newValue)
        if (newValue.inputValue === 'redirect-new') {
          navigate('new', { relative: 'route' })
        }
        if (typeof newValue === 'string') {
          setValue({
            title: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            title: newValue.inputValue,
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options, params) => {
        const { inputValue } = params;
        const filtered = options.filter(opt => opt.title.toLowerCase().includes(inputValue.toLowerCase()))
        // Suggest the creation of a new value
        if (inputValue !== '' && filtered.length === 0) {
          filtered.push({
            inputValue: 'redirect-new',
            title: `Add "${inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={[{ title: "Add new sprint", inputValue: 'redirect-new' }, ...sprints]}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.title;
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            {option.title}
          </li>
        );
      }}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label="Sprint" size="small" />
      )}
    />
  );
}
