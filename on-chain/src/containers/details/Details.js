import React, {Component} from 'react';

import {Grid, Col, Row} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {drizzleConnect} from 'drizzle-react';
import axios from 'axios';

import './style.scss';
import BasicDetails from "./components/basicDetails/BasicDetails";
import Tips from "./components/tips/Tips";
import ButtonModal from "./components/buttonModal/ButtonModal";
import RequestContract from '../../../build/contracts/FindRequest.json';
import urls from '../../utils/urls';
import {dateFormat} from "../../utils/formatters";

const requestABI = RequestContract["abi"];


class Details extends Component {

    constructor(props, context) {
        super(props);

        let address = '';
        if (props.match && props.match.params && props.match.params.address) {
            address = props.match.params.address;
        }

        this.state = {
            address,
            donation_amount:'',
            hint:'',
            userOffchain: '',
            userBlockchain: '',
            errorAddress: null,
            hints: [{type: 'success', hint: "Waldo was seen in Full Node programming", isAdmin: false},
                {type: 'info', hint: "Waldo was in ETHBerlin pitball", isAdmin: true}]
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.drizzleStatus.initialized && nextProps.drizzleStatus.initialized) {
            this._fetchSummary();
        }
    }

    _fetchSummary = () => {
        let {drizzle} = this.context;
        let findRequest = new drizzle.web3.eth.Contract(requestABI, this.state.address);
        findRequest.methods.getSummary().call().then((data) => {
            this.setState({userBlockchain: data});
            console.log(data);
            this._fetchOffChainData(data[0])
        })
    };

    _fetchOffChainData = (address) => {
        let REQUEST_URL = `${urls.API_ROOT}/api/v1/requests/${address}/`;
        console.log(REQUEST_URL);
        axios.get(REQUEST_URL, {})
            .then((response) => {
                this.setState({userOffchain: response.data})
                console.log(response.data)
            })
            .catch((error) => {
                console.log(error.response);
            })
    };

    _rejectHint = (id) => {

    };

    _acceptHint = (id) => {
    };

    _sendHint = (text) => {

    };

    _sendDonation = async (amount) => {
        let {drizzle} = this.context;
        let findRequest = new drizzle.web3.eth.Contract(requestABI, this.state.address);
        const accounts = await drizzle.web3.eth.getAccounts();

        findRequest.web3.send({
            from: accounts[0],
            value: drizzle.web3.utils.toWei(amount, "ether")
        }).then(function(result) {
            console.log(result);
        })
    };

    _closeSearch = () => {

    };
    _addWatcher = (address) => {
        if (this.checkAddress()) {

        } else {
            return false;
        }
    };

    checkAddress = () => {
        let {drizzle} = this.context;
        if (drizzle.web3.utils.isAddress(this.state.address)) {
            this.setState({errorAddress: 'success'});
            return true;
        } else {
            this.setState({errorAddress: 'error'});
            return false;
        }
    };

    _renderHints = () => {
        return this.state.hints.map((hint, index) => {
            return <Tips key={hint.hint} type={hint.type} title={`Hint ${index + 1}`} hint={hint.hint}
                         editable={hint.isAdmin} acceptAction={this._acceptHint} rejectAction={this._rejectHint}/>
        })
    };

    _handleInput = (prop, value) => {
        this.setState({[prop]: value});
    };

    render() {
        let {userOffchain, userBlockchain} = this.state;
        return (
            <div className={"details-section"}>
                {this.state.userOffchain &&
                <BasicDetails myLatLng={userBlockchain[3]} photo={userOffchain.photo}
                              actionClose={this._closeSearch} actionDonate={this._sendDonation} actionSendHint={this._sendHint}
                              propDonate={"donation_amount"} propHint={"hint"} valueDonate={this.state.donation_amount} valueHint={this.state.hint}
                              name={`${userOffchain.first_name + ` ` + userOffchain.last_name}`}
                              age={`${userBlockchain[2]} years old`} location={"Görlitzer Park, Berlin"}
                              date={dateFormat(userOffchain.lost_date)} contact={userOffchain.creator_email}
                              description={userOffchain.description}/>}
                <Grid>
                    <Row>
                        <Col xs={12}>
                            <Row>
                                <Col xs={10}>
                                    <h2 className={"title"}>Hints</h2>
                                </Col>
                                <Col xs={2} style={{marginTop: 50}}>
                                    <ButtonModal username={this.props.name} buttonTitle={"Add watcher"} type={"input"}
                                                 action={this._addWatcher}
                                                 value={this.state.address}
                                                 validation={this.state.errorAddress}
                                                 handleAction={this._handleInput}
                                                 inputProp={"address"}
                                                 title={"Add new watcher"}
                                                 acceptButtonText={"Add"}
                                                 placeholder={"Address"} textContent={`If you add a watcher to this search, he/she would be
                                                 able to watch all the hints available. Are you sure you want to proceed?`}/>
                                </Col>
                            </Row>
                            {this._renderHints()}
                        </Col>
                    </Row>
                </Grid>
            </div>
        )

    }

}

Details.contextTypes = {
    drizzle: PropTypes.object
};

const mapStateToProps = state => {
    return {
        drizzleStatus: state.drizzleStatus,
        web3: state.web3,
    }
};

const DetailsContainer = drizzleConnect(Details, mapStateToProps);

export default DetailsContainer;

