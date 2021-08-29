let app = function () {
    let web3;
    let from;
    let abi;
    let poolData;
    let divisor = 1000000000000000000;

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
        let poolDataContent = document.getElementById('poolData');
        let poolId = document.getElementById('poolId').value;
        let contractAddress = document.getElementById('masterChefAddress').value;

        abi = abi ?? await fetchAbi(contractAddress);

        let contract = await new web3.eth.Contract(abi, contractAddress);

        poolData = await contract.methods.userInfo(poolId, from).call();

        poolDataContent.innerText =
            'Deposited: ' + poolData.amount / divisor +
            ' Rewards: ' + poolData.rewardDebt / divisor;
    }

    let fetchAbi = async function (contractAddress) {
        let response = await fetch('https://api.polygonscan.com/api?module=contract&action=getabi&address='
            + contractAddress);
        let json = await response.json();

        return JSON.parse(json.result);
    }

    connectButton.onclick = connect;
    loadPoolButton.onclick = loadPool;
}

window.onload = app;