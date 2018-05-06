import Web3 from 'web3'
import config from '../helpers/config'
import request from './request'

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/5lcMmHUURYg8F20GLGSr'));

class Ethereum {

	constructor() {
		this.core = web3
	}

	login(privateKey) {
		let data
		if (privateKey) {
			data = this.core.eth.accounts.privateKeyToAccount(privateKey)
		} else {
			data = this.core.eth.accounts.create()
			this.core.eth.accounts.wallet.add(data)
		}
	
		this.core.eth.accounts.wallet.add(data.privateKey)	
		console.info('Logged in with Ethereum', data)
	
		return data
	}

	getBalance(address) {
		return this.core.eth.getBalance(address)
			.then(wei => {
			const balance = this.core.utils.fromWei(wei,"ether")
			return balance
		})
	}

	getTransaction(address) {
		return new Promise((resolve) => {
			if (address) {
			const url =`http://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.apiKeys.eth}`
			let transactions

			request.get(url)
				.then((res) => {
					if (res.status) {
						transactions = res.result
						.filter((item) => {

							return item.value > 0
							}).map((item) => ({
									status: item.blockHash != null ? 1 : 0,
									value: this.core.utils.fromWei(item.value),
									address: item.to,
									date: new Date(item.timeStamp * 1000),
									type: address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out'
								}))

						resolve(transactions)
					} else { console.log('res:status ETH false', res) }
				})
			}
		})
	}
}


export default new Ethereum()

export {
  Ethereum,
  web3,
}
