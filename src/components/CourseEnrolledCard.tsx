import React from 'react';
import { ArrowForwardIos, MoreHoriz } from '@material-ui/icons'
import ReportsCardStyle from './ReportCardStyle'

interface Props{
    teacherName: string,
    courseName: string,
};

class CourseEnrolledCard extends React.Component<Props> {
    render() {
        const teacherName = (this.props.teacherName).substring(0,20);
        const courseName = (this.props.courseName).substring(0,20);

        return (
            <div style={ReportsCardStyle}>
                <p style={{color: '#212529', marginBottom: '0'}}>
                    {teacherName}</p>
                <h5 style={{marginTop: '5px'}}>{courseName}</h5>
                <a title="Go to course page" href="" style={{float: 'left'}}>
                    <ArrowForwardIos/></a>
                <a title="Manage course" href="" style={{float: 'left', marginLeft: '5%'}}>
                    <MoreHoriz/></a>
            </div>
        )
    }
}

export default CourseEnrolledCard;