import React from 'react';

// Bootstrap CSS & JS
import '../style/external.scss'
import 'bootstrap/dist/js/bootstrap.js'
import 'popper.js/dist/popper.js'

import Footer from './Footer';
import ExternalHeader from './ExternalHeader';

interface ExternalLayoutProps {
  fixed: boolean;
  transparentTop: boolean;
  children: React.ReactChild | React.ReactChildren;
}

function ExternalLayout(props: ExternalLayoutProps) {
  return <>
    <ExternalHeader fixed={props.fixed} transparentTop={props.transparentTop} />
    {props.children}
    <Footer />
  </>
}

export default ExternalLayout;
