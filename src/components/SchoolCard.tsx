import React from 'react';
import { ArrowForwardIos, MoreHoriz } from '@material-ui/icons'
import ReportsCardStyle from './ReportCardStyle'

interface Props{
    userType: any,
    schoolName: string,
};

class SchoolCard extends React.Component<Props> {
    render() {
        const schoolName = (this.props.schoolName).substring(0,20)
        return (
            <div style={ReportsCardStyle}>
                <p style={{color: '#212529', marginBottom: '0'}}>
                    {this.props.userType}</p>
                <h5 style={{marginTop: '5px'}}>{schoolName}</h5>
                <a title="Go to school page" href="" style={{float: 'left'}}>
                    <ArrowForwardIos/></a>
                <a title="Manage school" href="" style={{float: 'left', marginLeft: '5%'}}>
                    <MoreHoriz/></a>
            </div>
        )
    }
}

export default SchoolCard;