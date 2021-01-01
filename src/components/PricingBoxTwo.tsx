import React from 'react';

interface Props{};
interface State{};

class PricingBoxTwo extends React.Component<Props,State> {
    render() {
        const all = {
            backgroundColor: '#e0e0e0',
            boxShadow: '5px 6px #990000',
            textAlign: 'center',
            marginLeft: '5%',
            marginRight: '5%',
        } as React.CSSProperties

        return (
            <div style={all}>
                <h3 style={{paddingTop: '20px', marginBottom: '10px'}}>Premium</h3>
                <h1 style={{marginTop: '0', marginBottom: '10px'}}>$5</h1>
                <h5 style={{marginTop: '0'}}>per student, per year</h5>
                <br/>
                <div style={{textAlign: 'left', marginLeft: '14%', paddingBottom: '20px'}}>
                    <p>&#10003; Positive thing</p>
                    <p>&#10003; Positive thing</p>
                    <p>&#10003; Positive thing</p>
                    <p>&#10007; Negative thing</p>
                    <p>&#10007; Negative thing</p>
                </div>
            </div>
        )
    }
}

export default PricingBoxTwo;