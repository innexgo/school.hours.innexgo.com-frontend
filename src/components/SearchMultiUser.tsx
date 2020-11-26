import React from 'react';
import { ValueType } from 'react-select';
import AsyncSelect from 'react-select/async';
import { viewUser, isApiErrorCode } from '../utils/utils';

interface SearchMultiUserProps {
  isInvalid: boolean,
  name: string,
  apiKey: ApiKey,
  userKind: "STUDENT" | "USER" | "ADMIN",
  setFn: (ids: number[]) => void
}

type UserOption = {
  label: string,
  value: number
}

export default function SearchMultiUser(props: SearchMultiUserProps) {
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
      value: x.id
    }));
  };


  const onChange = (opt: ValueType<UserOption>) => {
    if (opt == null) {
      props.setFn([]);
    } else if ("label" in opt && "value" in opt) {
      props.setFn([opt.value]);
    } else {
      props.setFn(opt.map(x => x.value));
    }
  }

  return <AsyncSelect
    placeholder="Start typing to search"
    isClearable={true}
    onChange={onChange}
    cacheOptions={true}
    name={props.name}
    isMulti={true}
    components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
    noOptionsMessage={() => null}
    loadOptions={promiseOptions} />
}
