let web3;
let polygonScanApiKey = 'U1IPRFI5GKT4J9P79V7KJCPSXCW1X7RI39';

let app = function () {
    let from;
    let abi;
    let contract;
    let token;
    let pool;
    let zeroAddress = '0x0000000000000000000000000000000000000000';

    let connectButton = document.getElementById('connect');
    let walletContent = document.getElementById('wallet');

    let content = document.getElementById('content');
    let loadPoolButton = document.getElementById('loadPool');

    let connect = async function () {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);

            try {
                await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                connectButton.style.display = 'none';

                const accounts = await web3.eth.getAccounts();

                from = accounts[0];

                walletContent.innerText = 'Connected to wallet ' + from;
                content.style.display = 'initial';
            } catch (error) {
                alert('App needs access to wallet');
            }
        } else {
            alert('Cannot connect to wallet');
        }
    }

    let loadPool = async function () {
        let poolInfo = document.getElementById('poolInfo');
        let poolDataContent = document.getElementById('poolData');
        let getRewardsButton = document.getElementById('getRewards');
        let depositButton = document.getElementById('deposit');

        let poolId = document.getElementById('poolId').value;
        let contractAddress = document.getElementById('masterchefs').value;

        abi = abi ?? await fetchAbi(contractAddress);

        contract = await new web3.eth.Contract(abi, contractAddress);

        pool = await contract.methods.userInfo(poolId, from).call();
        pool.info = await contract.methods.poolInfo(poolId).call();

        poolDataContent.innerText =
            'Deposited: ' + web3.utils.fromWei(pool.amount) +
            ' Rewards: ' + web3.utils.fromWei(pool.rewardDebt);

        getRewardsButton.onclick = getRewards;
        depositButton.onclick = deposit;

        poolInfo.style.display = 'initial';
    }

    let getToken = async function (abi, contractAddress) {
        let contract = await new web3.eth.Contract(abi, contractAddress);

        if (contract.methods.hasOwnProperty('implementation')) {
            let impAddress = await contract.methods.implementation().call();
            let impAbi = await fetchAbi(impAddress);

            contract = await new web3.eth.Contract(impAbi, contractAddress);
        }

        return contract;
    }

    let fetchAbi = async function (contractAddress) {
        let response = await fetch('https://api.polygonscan.com/api?module=contract&action=getabi'
            + '&address=' + contractAddress
            + '&apiKey=' + polygonScanApiKey
        );
        let json = await response.json();

        return JSON.parse(json.result);
    }

    let getRewards = async function () {
        let poolId = document.getElementById('poolId').value;
        let response = await contract.methods.deposit(poolId, 0, zeroAddress).send({ from });

        return response;
    }

    let deposit = async function () {
        let poolId = document.getElementById('poolId').value;

        let abi = await fetchAbi(pool.info.lpToken);
        token = await getToken(abi, pool.info.lpToken);

        let balance = await token.methods.balanceOf(from).call();
        let symbol = await token.methods.symbol().call();
        let decimals = await token.methods.decimals().call();

        let amount = window.prompt(symbol + ' amount?', balance / Math.pow(10, decimals));

        if (amount != null && amount != '') {
            let response = await contract.methods.deposit(poolId, web3.utils.toWei(amount), zeroAddress).send({ from });

            return response;
        }
    }



    connectButton.onclick = connect;
    loadPoolButton.onclick = loadPool;
}

window.onload = app;