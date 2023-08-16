from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from web3 import Web3
import datetime
import json
import requests
import os 
from dotenv import load_dotenv

load_dotenv()  # This will load variables from .env into the environment

with open("abi/erc20.json", "r") as f:
    ERC20_ABI = json.load(f)
app = FastAPI()
client = MongoClient(os.getenv("MDB_URL"))
db = client["crypto_db"]
collection = db["wallet_balances"]

w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
CRV_CONTRACT_ADDRESS = Web3.toChecksumAddress("0xD533a949740bb3306d119CC777fa900bA034cd52")


@app.get("/balance/")
async def get_balance(wallet: str):
    crv_contract = w3.eth.contract(address=Web3.toChecksumAddress("0xD533a949740bb3306d119CC777fa900bA034cd52"), abi=ERC20_ABI)
    token_balance_wei = crv_contract.functions.balanceOf(Web3.toChecksumAddress(wallet)).call()
    token_balance = str(Web3.fromWei(token_balance_wei, 'ether'))

    # Fetch the CRV price in USD from CoinGecko
    response = requests.get('https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token&vs_currencies=usd')
    crv_usd_price = response.json()["curve-dao-token"]["usd"]
    
    usd_balance = float(token_balance) * crv_usd_price
    current_time = datetime.datetime.utcnow()
    document = {
        "wallet": wallet,
        "last_update_time": current_time,
        "current_balance": token_balance,
        "current_balance_usd": usd_balance,
        "history": [{"isotimestamp": current_time, "value": token_balance, "usd_value": usd_balance}]
    }

    existing_doc = collection.find_one({"wallet": wallet})
    if existing_doc:
        collection.update_one(
            {"wallet": wallet},
            {
                "$set": {
                    "last_update_time": current_time,
                    "current_balance": token_balance,
                    "current_balance_usd": usd_balance
                },
                "$push": {
                    "history": {
                        "isotimestamp": current_time,
                        "value": token_balance,
                        "usd_value": usd_balance
                    }
                }
            }
        )
    else:
        collection.insert_one(document)

    return document


@app.get("/history/")
async def get_history(wallet: str):
    wallet_data = collection.find_one({"wallet": wallet})
    if not wallet_data:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet_data["history"]
