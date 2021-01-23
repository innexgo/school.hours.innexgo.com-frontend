import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { isApiErrorCode } from '../utils/utils';

interface SearchSingleSchoolProps {
  name: string,
  disabled?: boolean,
  search: (input: string) => Promise<School[]>,
  isInvalid: boolean,
  setFn: (school: School | null) => void
}

type SchoolOption = {
  label: string,
  value: School
}

export default function SearchSingleSchool(props: SearchSingleSchoolProps) {
  const promiseOptions = async function(input: string): Promise<SchoolOption[]> {
    const results = await props.search(input);

    if (isApiErrorCode(results)) {
      return [];
    }

    return results.map((x: School): SchoolOption => ({
      label: `${x.name}`,
      value: x
    }));
  };


  const onChange = (opt: ValueType<SchoolOption, false>) => {
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
