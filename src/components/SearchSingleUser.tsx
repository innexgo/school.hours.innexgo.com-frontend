import AsyncSelect from 'react-select/async';
import { ValueType } from 'react-select';
import { viewUser, isApiErrorCode } from '../utils/utils';

interface SearchSingleUserProps {
  isInvalid: boolean,
  name: string,
  apiKey: ApiKey,
  userKind: "STUDENT" | "USER" | "ADMIN",
  setFn: (id: User | null) => void
}

type UserOption = {
  label: string,
  value: User
}

export default function SearchSingleUser(props: SearchSingleUserProps) {
  const promiseOptions = async function(input: string): Promise<UserOption[]> {
    const results = await viewUser({
      partialUserName: input.toUpperCase(),
      userKind: props.userKind,
      apiKey: props.apiKey.key
    });

    if (isApiErrorCode(results)) {
      return [];
    }

    return results.map((x: User): UserOption => ({
      label: `${x.name} -- ${x.email}`,
      value: x
    }));
  };


  const onChange = (opt:  ValueType<UserOption, false>) => {
    if (opt == null) {
      props.setFn(null);
    } else {
      props.setFn(opt.value)
    }
  }

  return <AsyncSelect
    placeholder="Start typing to search"
    isClearable={true}
    onChange={onChange}
    cacheOptions={true}
    name={props.name}
    components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
    noOptionsMessage={() => null}
    loadOptions={promiseOptions} />
}
