import React, {useEffect, useState} from 'react';
import {
    Form,
    Input,
    Grid,
    Card,
    Statistic,
    GridRow,
    Label,
    Icon,
    Dropdown,
    Button,
    Table,
    Container,
    Rating
} from 'semantic-ui-react';

const axios = require('axios').default;
import {useSubstrate} from './substrate-lib';
import {ApiPromise, WsProvider} from '@polkadot/api';


function Main(props) {
    const {api} = useSubstrate();
    const {accountPair} = props;
    const [stakingStakeList, setStakingStakeList] = useState([])
    const [totalIssuance, setTotalIssuance] = useState(0)
    const [erasTotalStake, setErasTotalStake] = useState(0)
    const [chainData, setChainData] = useState(null)
    const [accountCount, setAccountCount] = useState(0)
    const [validatorCount, setValidatorCount] = useState(0)
    const [stakingValidator, setStakingValidator] = useState(0)
    const [nominatorCount, setNominatorCount] = useState(0)


    function convertAresBalance(humanStr, fraction_len = 12, round_len = 2) {
        const integer = (BigInt(humanStr.replaceAll(',', '')) / BigInt(10 ** fraction_len)).toString()
        const fraction = (BigInt(humanStr.replaceAll(',', '')) % BigInt(10 ** fraction_len)).toString()
        if (round_len == 0)
            return `${integer}`
        return `${integer}.${fraction.substr(0, round_len)}`
    }

    async function getBaseData() {
        console.log("Get base data.")
        const _totalIssuance = await api.query.balances.totalIssuance()
        setTotalIssuance(_totalIssuance.toHuman())

        const activeEra = await api.query.staking.activeEra()
        console.log('activeEra ', activeEra.unwrap().toHuman())
        const _erasTotalStake = await api.query.staking.erasTotalStake(activeEra.unwrap().index)
        setErasTotalStake(_erasTotalStake.toHuman())

        axios.get('https://aresscan.aresprotocol.io/odyssey/api/v1/chain')
            .then(function (response) {
                console.log(response)
                setChainData(response.data.data)
            }).catch(function (error) {
                console.log(error)
            }).then(function () {});

        // system.account
        const _accountList = await api.query.system.account.keys();
        setAccountCount(_accountList.length)

        const _exposures = await api.query.staking.erasStakers.entries(activeEra.unwrap().index)
        setValidatorCount(_exposures.length)

        const _stakingValidator = await api.query.staking.validators.entries()
        setStakingValidator(_stakingValidator.length)

        let _nominatorKeys = await api.query.staking.nominators.entries()
        setNominatorCount(_nominatorKeys.length)
    }

    async function getInfos() {
        console.log("Get infos.")

        // 获取验证人质押数据。
        const activeEra = await api.query.staking.activeEra()

        // 获取全部验证人信息
        const validators = await api.query.staking.validators.entries()
        const validatorData = []
        validators.forEach(([key, exposure]) => {
            const _key = key.args.map((k) => k.toHuman())
            console.log('key = ', _key)
            console.log('exposure = ', exposure.toHuman())
            validatorData.push([_key[0], exposure.toHuman()])
        })

        //
        const _stakingStakerList = []
        //
        const exposures = await api.query.staking.erasStakers.entries(activeEra.unwrap().index)
        exposures.forEach(([key, exposure]) => {
            const _key = key.args.map((k) => k.toHuman())
            const validatorAddr = _key[1]
            let commission = "0%"
            validatorData.forEach((val, _idx) => {
                if (val[0] == validatorAddr && val[1].blocked == false) {
                    commission = val[1].commission
                }
            })
            _stakingStakerList.push([_key, exposure.toHuman(), commission])
        })
        console.log('_stakingStakerList= ', _stakingStakerList)
        setStakingStakeList(_stakingStakerList)
    }

    useEffect(async () => {
    }, [stakingStakeList]);

    return (
        <Grid.Column width={16}>
            <h1>Report. </h1>
            <Button onClick={() => {
                getBaseData()
            }}>获取基础数据</Button>
            <p></p>
            <GridRow>
                <Table>
                    <Table.Row>
                        <Table.Cell>Name</Table.Cell>
                        <Table.Cell>Value</Table.Cell>
                    </Table.Row>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>总供应量</Table.Cell>
                            <Table.Cell>{totalIssuance ? convertAresBalance(totalIssuance) : '-'} ARES</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>全网质押量</Table.Cell>
                            <Table.Cell>{erasTotalStake ? convertAresBalance(erasTotalStake) : '-'} ARES</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>全网质押率</Table.Cell>
                            <Table.Cell>{erasTotalStake && totalIssuance ? (parseFloat(convertAresBalance(erasTotalStake)) / parseFloat(convertAresBalance(totalIssuance))).toFixed(6) * 100 : '-'} %</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>通胀率</Table.Cell>
                            <Table.Cell> {chainData?parseFloat(chainData.inflation).toFixed(4):'-'} % </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>国库销毁量</Table.Cell>
                            <Table.Cell>  {chainData?convertAresBalance(chainData.total_treasury_burn.toString()):'-'} ARES</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>总账户数</Table.Cell>
                            <Table.Cell>{accountCount?accountCount:'-'} </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>验证人数量</Table.Cell>
                            <Table.Cell>{validatorCount?validatorCount:'-'}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>候选人数量</Table.Cell>
                            <Table.Cell>{stakingValidator && validatorCount?stakingValidator-validatorCount:'-'}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>提名人</Table.Cell>
                            <Table.Cell>{nominatorCount?nominatorCount:'-'}</Table.Cell>
                        </Table.Row>

                        <Table.Row>
                            <Table.Cell>总交易数</Table.Cell>
                            <Table.Cell>{chainData?chainData.total_events_transfer:'-'}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>链上数据处理数（正常报价数据+请求数据）</Table.Cell>
                            <Table.Cell>{chainData?chainData.total_extrinsics_signed:'-'}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </GridRow>
            <p></p>
            <Button onClick={() => {
                getInfos()
            }}>获取验证人质押数据</Button>
            <p></p>
            <p>验证人数量: {stakingStakeList.length}</p>
            <GridRow>
                <Table>
                    <Table.Row>
                        <Table.Cell>Name</Table.Cell>
                        <Table.Cell>Commission</Table.Cell>
                        <Table.Cell>Value</Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>
                    <Table.Body>
                        {stakingStakeList.map(data => <Table.Row key={data[0][1]}>
                            <Table.Cell>{data[0][1]}</Table.Cell>
                            <Table.Cell>{data[2]}</Table.Cell>
                            <Table.Cell>{convertAresBalance(data[1]['total'])}</Table.Cell>
                            <Table.Cell>ARES</Table.Cell>
                        </Table.Row>)}
                    </Table.Body>
                </Table>
            </GridRow>
        </Grid.Column>
    );
}

export default function ChainStatus(props) {
    const {api} = useSubstrate();
    return api.query.session ? <Main {...props} /> : null;
}
