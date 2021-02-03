import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { isApiErrorCode } from '../utils/utils';

interface SearchSingleSchoolProps {
  name: string,
  disabled?: boolean,
  search: (input: string) => Promise<SchoolData[]>,
  isInvalid: boolean,
  setFn: (school: SchoolData | null) => void
}

type SchoolDataOption = {
  label: string,
  value: SchoolData
}

export default function SearchSingleSchool(props: SearchSingleSchoolProps) {
  const promiseOptions = async function(input: string): Promise<SchoolDataOption[]> {
    const results = await props.search(input);

    if (isApiErrorCode(results)) {
      return [];
    }

    return results.map((x: SchoolData): SchoolDataOption => ({
      label: `${x.name}`,
      value: x
    }));
  };


  const onChange = (opt: ValueType<SchoolDataOption, false>) => {
    if (opt == null) {
      props.setFn(null);
    } else {
      props.setFn(opt.value)
    }
  }

  /*components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }} */ 
  return <AsyncSelect
    placeholder="Start typing to search"
    defaultOptions
    isClearable={true}
    onChange={onChange}
    cacheOptions={true}
    name={props.name}
    isDisabled={props.disabled}
    loadOptions={promiseOptions} />
}
