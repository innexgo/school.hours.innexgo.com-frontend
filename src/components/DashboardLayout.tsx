import React from 'react';
import {
    ColumnsGap as DashboardIcon,
    CalendarEvent as  CalendarIcon,
    Gear as SettingsIcon,
} from 'react-bootstrap-icons';
import { InnerLayout, AuthenticatedComponentProps } from '@innexgo/auth-react-components';

export default function DashboardLayout(props: React.PropsWithChildren<AuthenticatedComponentProps>) {
  return <InnerLayout apiKey={props.apiKey} logoutCallback={() => props.setApiKey(null)} >
    <InnerLayout.SidebarEntry label="Dashboard" icon={DashboardIcon} href="/" />
    <InnerLayout.SidebarEntry label="Calendar" icon={CalendarIcon} href="/calendar" />
    <InnerLayout.SidebarEntry label="Settings" icon={SettingsIcon} href="/settings" />
    <InnerLayout.Body>
      {props.children}
    </InnerLayout.Body>
  </InnerLayout>
}
