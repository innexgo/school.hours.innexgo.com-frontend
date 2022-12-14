import React from 'react';
import { Link } from 'react-router-dom';
import { List } from 'react-bootstrap-icons'

interface ExternalHeaderProps {
  fixed: boolean;
  transparentTop: boolean;
}

interface ExternalHeaderState {
  scroll: number;
}

class ExternalHeader extends React.Component<ExternalHeaderProps, ExternalHeaderState> {

  constructor(props: ExternalHeaderProps) {
    super(props);
    this.state = {
      scroll: 0,
    };
  }

  listenToScroll = () => {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop

    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight

    const scrolled = winScroll / height

    this.setState({
      scroll: scrolled,
    })
  }
  componentDidMount() {
    window.addEventListener('scroll', this.listenToScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.listenToScroll)
  }

  render() {
    const topTransparent = this.state.scroll === 0 && this.props.transparentTop;

    const navStyle = topTransparent
      ? {
        transitionDuration: "0.4s"
      }
      : {
        transitionDuration: "0.4s",
        backgroundColor: "#fff"
      };
    const linkStyle = topTransparent
      ? {
        transitionDuration: "0.4s",
        color: "#fff",
      }
      : {
        transitionDuration: "0.4s",
        color: "#000"
      }

    return (
      <header>
        <nav style={navStyle} className={"navbar navbar-expand-lg py-3" + (this.props.fixed ? " fixed-top" : "")}>
          <div className="container d-flex">
            <Link style={linkStyle} className="navbar-brand" to="/"><strong>Innexgo Hours</strong></Link>
            <button type="button" className="navbar-toggler"
              data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <List style={linkStyle} className="text-body"/>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              {/*Right Aligned*/}
              <div className="navbar-nav ms-auto">
                <Link style={linkStyle} className="nav-item nav-link font-weight-bold" to="">Home</Link>
                <Link style={linkStyle} className="nav-item nav-link font-weight-bold" to="/user">Teacher Login</Link>
                <Link style={linkStyle} className="nav-item nav-link font-weight-bold" to="/student">Student Login</Link>
              </div>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

export default ExternalHeader;
