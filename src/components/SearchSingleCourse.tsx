import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { isApiErrorCode } from '../utils/utils';

interface SearchSingleCourseProps {
  name:string,
  disabled?:boolean,
  search: (input: string) => Promise<Course[]>,
  isInvalid: boolean,
  setFn: (course: Course | null) => void
}

type CourseOption = {
  label: string,
  value: Course
}

export default function SearchSingleCourse(props: SearchSingleCourseProps) {
  const promiseOptions = async function(input: string): Promise<CourseOption[]> {
    const results = await props.search(input);

    if (isApiErrorCode(results)) {
      return [];
    }

    return results.map((x: Course): CourseOption => ({
      label: `${x.name}`,
      value: x
    }));
  };


  const onChange = (opt:  ValueType<CourseOption, false>) => {
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
