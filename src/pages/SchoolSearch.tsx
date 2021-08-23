import { SimpleLayout, BrandedComponentProps } from '@innexgo/common-react-components';
import { Link } from 'react-router-dom';

function SchoolSearch(props: BrandedComponentProps) {
  return <SimpleLayout branding={props.branding}>
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw"
    }}>
      <div className="my-auto mx-auto text-center">
        <h1>School Search</h1>
        <h5>Under Construction</h5>
        <Link to="/">Return Home</Link>
      </div>
    </div>
  </SimpleLayout>
}

export default SchoolSearch
