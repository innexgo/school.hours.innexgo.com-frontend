import React from 'react';
import { Home, Settings, Add, BarChart } from '@material-ui/icons';

import InnerLayout from '../components/InnerLayout';

export default function DashboardLayout(props: React.PropsWithChildren<AuthenticatedComponentProps>) {
  return (<InnerLayout name={props.apiKey.creator.name} logoutCallback={() => props.setApiKey(null)} >
    <InnerLayout.SidebarEntry label="Home" icon={Home} href="/" />
    <InnerLayout.SidebarEntry label="Add Course" icon={Add} href="/addcourse" />
    <InnerLayout.SidebarEntry label="Reports" icon={BarChart} href="/reports" />
    <InnerLayout.SidebarEntry label="Settings" icon={Settings} href="/settings" />
    <InnerLayout.Body>
      {props.children}
    </InnerLayout.Body>
  </InnerLayout>)
}
