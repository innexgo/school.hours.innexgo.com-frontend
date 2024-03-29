import AsyncSelect from 'react-select/async';
import { SingleValue } from 'react-select';
import {LocationData} from '../utils/utils';

interface SearchSingleLocationProps {
  name: string,
  disabled?: boolean,
  search: (input: string) => Promise<LocationData[]>,
  inputState?: any,
  isInvalid: boolean,
  setFn: (location: LocationData | null) => void
}

type LocationDataOption = {
  label: string,
  value: LocationData
}

export default function SearchSingleLocation(props: SearchSingleLocationProps) {
  const promiseOptions = async function(input: string): Promise<LocationDataOption[]> {
    const results = await props.search(input);

    return results.map((x: LocationData): LocationDataOption => ({
      label: `${x.name}`,
      value: x
    }));
  };


  const onChange = (opt: SingleValue<LocationDataOption>) => {
    if (opt == null) {
      props.setFn(null);
    } else {
      props.setFn(opt?.value)
    }
  }

  /*components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }} */ 
  return <AsyncSelect
    key={props.inputState}
    placeholder="Start typing to search"
    isClearable={true}
    defaultOptions={true}
    onChange={onChange}
    name={props.name}
    isDisabled={props.disabled}
    loadOptions={promiseOptions}
    />
}
