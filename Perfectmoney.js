'use strict';

const axios = require('axios');
const qs = require('qs');

require('dotenv').config()


module.exports = class Perfectmoney {

    constructor() {

        this.baseUrl        =   'https://perfectmoney.com/acct/'
        this.accountID      =   process.env.PERFECTMONEY_ACCOUNT_ID
        this.passphrase     =   process.env.PERFECTMONEY_PASS
    }

    /**
     * execution de requetes
     */
    PerfectmoneyRequest = async (method, body, endpoind, headers = {}) => {
        try{
            console.log({endpoind, method, body, headers})
            body = (method == "GET")?qs.stringify(body):body
            var options = {
                url: `${this.baseUrl}${endpoind}`,
                method: method,
                data : body,
                headers: headers,
            };
            return axios(options)
            .then(response => {return response})
            .catch(err => {
                throw new Error(err.message)
            })
        }catch(e) {
            throw new Error(e.message)
        }
    }

    /**
     * Extraction des informations contenu dans la reponse de perfectmoney
     * @param {*} inputs 
     * @returns 
     */
    inputs_extraction = async (inputs) => {
        try{
            let my_json = {}
            let regexp = /<input name='(.*)' type='hidden' value='(.*)'>/g
            const array = [...inputs.matchAll(regexp)]
            let inc = 0
            let result = {}
            do{
                result[array[inc][1]] = array[inc][2]
                inc++
            }while(inc < array.length)
            return result
        }catch(e){
            throw new Error (e.message)
        }
    }

    /**
     * Recuperer le solde des compte perfectmoney
     * @param {*} account 
     * @returns 
     */
    balance = async (account = null) => {   
        try{
            let body = {}
            var url         =   `balance.asp?AccountID=${this.accountID}&PassPhrase=${this.passphrase}`
            let response    =   await this.PerfectmoneyRequest('GET', body, url)
            let listAccounts =  await this.inputs_extraction(response.data)
            if(listAccounts){
                if(account){
                    if((Object.keys(listAccounts).includes(account))){
                        console.log(listAccounts)
                        return {account: account, balance : parseFloat(listAccounts[account])}
                    }else{
                        return false
                    }
                }
                return listAccounts
            }else{
                return false
            }
        }catch(e) {
            throw new Error(e.message)
        }
    }

    /**
     * Effectuer un retrait 
     * @param {*} sender 
     * @param {*} receiver 
     * @param {*} amount 
     * @param {*} payment_ID 
     * @returns 
     */
    withdraw = async (sender, receiver, amount, payment_ID) => {   
        try{
            let body            =   {}
            var url             =   `confirm.asp?AccountID=${this.accountID}&PassPhrase=${this.passphrase}&Payer_Account=${sender}&Payee_Account=${receiver}&Amount=${amount}&PAY_IN=1&PAYMENT_ID=${payment_ID}`
            let response        =   await this.PerfectmoneyRequest('GET', body, url)
            let withdraw            =   await this.inputs_extraction(response.data)
            console.log(withdraw)
            let result = {
                Payee_Account_Name: withdraw.Payee_Account_Name,
                Payee_Account: withdraw.Payee_Account,
                Payer_Account: withdraw.Payer_Account,
                PAYMENT_AMOUNT: withdraw.PAYMENT_AMOUNT,
                PAYMENT_BATCH_NUM: withdraw.PAYMENT_BATCH_NUM,
                PAYMENT_ID: withdraw.PAYMENT_ID,
            }
            return result
        }catch(e) {
            throw new Error(e.message)
        }

    }


}