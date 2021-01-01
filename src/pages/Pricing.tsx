import React from 'react';
import PricingBoxOne from '../components/PricingBoxOne'
import PricingBoxTwo from '../components/PricingBoxTwo'
import PricingBoxThree from '../components/PricingBoxThree'
import deal from '../img/deal.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap'

interface Props{};
interface State{};

class Pricing extends React.Component<Props,State> {
    render() {
        const all = {
            backgroundColor: 'white',
            marginTop: '0%',
            paddingLeft: '10%',
            paddingRight: '10%',
        }

        const half = {
            float: 'left',
            width: '44%',
            paddingLeft: '3%', // add up to 50
            paddingRight: '3%'

        } as React.CSSProperties;

        const third = {
            float: 'left',
            width: '33%',
        } as React.CSSProperties;

        return (
            <div style={all}>
                <h1 style={{textAlign: 'center', paddingBottom: '42px', paddingTop: '20px'}}>Pricing</h1>
                <div style={{
                    float: 'left',
                    width: '65%',
                    margin: '10px auto',
                }} data-aos="fade-down" data-aos-duration="2000" data-aos-once="true">
                    <p>
                    Innexgo Hours charges a consistent price for all schools, <b>$1 per student, per year</b>.
                    This covers an account for as many teachers as needed, every single student, tech support,
                    as well as our promise to always improve Hours for you. Contracts with individual schools
                    may vary; please contact us for more detail.
                    </p>
                    <a href=""><Button variant="dark">Contact us</Button></a>
              </div>
              <div style={{
                float: 'left',
                width: '35%',
                margin: '10px auto',
              }}>
                <img src={deal} style={{ width: '100%', height: '100%' }} />
                <p style={{ textAlign: 'center', fontSize: '10px', marginTop: '3px' }}>from unitonvector</p>
              </div>
                <div style={{
                    content: "",
                    display: 'table',
                    clear: 'both',
                    } as React.CSSProperties}/>
                <div style={third}>
                    <PricingBoxOne/>
                </div>
                <div style={third}>
                    <PricingBoxTwo/>
                </div>
                <div style={third}>
                    <PricingBoxThree/>
                </div>

            <div style={{
                content: "",
                display: 'table',
                clear: 'both',
            } as React.CSSProperties}/>
            </div>
        )
    }
}
export default Pricing;