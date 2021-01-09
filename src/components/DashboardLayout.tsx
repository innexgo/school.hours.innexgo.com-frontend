import React from 'react';
import { Home, BarChart } from '@material-ui/icons';

import InnerLayout from '../components/InnerLayout';

export default function DashboardLayout(props: React.PropsWithChildren<AuthenticatedComponentProps>) {
  return (<InnerLayout name={props.apiKey.creator.name} logoutCallback={() => props.setApiKey(null)} >
    <InnerLayout.SidebarEntry label="Home" icon={Home} href="/user" />
    <InnerLayout.SidebarEntry label="Report" icon={BarChart} href="/report" />
    <InnerLayout.Body>
      {props.children}
    </InnerLayout.Body>
  </InnerLayout>)
}
