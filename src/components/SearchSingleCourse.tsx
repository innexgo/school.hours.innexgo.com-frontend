import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { isErr } from '../utils/utils';

interface SearchSingleCourseProps {
  name:string,
  disabled?:boolean,
  search: (input: string) => Promise<CourseData[]>,
  isInvalid: boolean,
  setFn: (course: CourseData | null) => void
}

type CourseDataOption = {
  label: string,
  value: CourseData
}

export default function SearchSingleCourse(props: SearchSingleCourseProps) {
  const promiseOptions = async function(input: string): Promise<CourseDataOption[]> {
    const results = await props.search(input);

    if (isErr(results)) {
      return [];
    }

    return results.map((x: CourseData): CourseDataOption => ({
      label: `${x.name}`,
      value: x
    }));
  };


  const onChange = (opt:  ValueType<CourseDataOption, false>) => {
    if (opt == null) {
      props.setFn(null);
    } else {
      props.setFn(opt.value)
    }
  }

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
