import React from 'react'
import { schoolInfo, isApiErrorCode } from '../utils/utils'
import { Async } from 'react-async';

export const getSchoolInfo = async () => {
  const maybeSchoolInfo = await schoolInfo();
  if (isApiErrorCode(maybeSchoolInfo)) {
    throw new Error();
  } else {
    return maybeSchoolInfo;
  }
}

const SchoolName = () => {
  return <Async promiseFn={getSchoolInfo}>
    <Async.Pending>
    </Async.Pending>
    <Async.Rejected>
    </Async.Rejected>
    <Async.Fulfilled<SchoolInfo>>
      {schoolInfo => `${schoolInfo.name}`}
    </Async.Fulfilled>
  </Async>
}

export default SchoolName
