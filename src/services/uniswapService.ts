import { abi as IUniswapV3Factory } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
import { abi as IUniswapV3Pool } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import { useProvider } from 'wagmi';
import { Contract } from 'ethers-multicall';
import BigNumber from 'bignumber.js';

import { getConfig } from '~/config';
import { MultiCallService } from './multicallService';
import { Address, UniswapPool } from '~/types';

export class UniswapService {
  provider = useProvider();
  addresses = getConfig().ADDRESSES;
  fees = getConfig().FEE_TIERS;
  multiCallService = new MultiCallService();
  uniswapV3Factory: Contract;

  constructor() {
    this.uniswapV3Factory = new Contract(this.addresses.UNISWAP_V3_FACTORY, IUniswapV3Factory);
  }

  async fetchUniswapPools(tokenAddress: Address): Promise<{ [k: string]: UniswapPool }> {
    const feeList = Object.values(this.fees);

    const poolAddressList: Address[] = await this.multiCallService.multicall(
      feeList.map((feeValue) => this.getPoolCall(tokenAddress, feeValue.fee))
    );

    const pricings = await this.fetchPoolsPricing(poolAddressList);

    const pools: UniswapPool[] = poolAddressList.map((address) => ({
      address,
      pricing: pricings[address],
    }));

    const poolListMap = Object.fromEntries(pools.map((pool, index) => [pool.pricing && feeList[index].label, pool]));
    return poolListMap;
  }

  async fetchPoolsPricing(pools: Address[]): Promise<{ [address: string]: BigNumber }> {
    const filteredPools = pools.filter((address) => address !== this.addresses.ZERO_ADDRESS);
    const slot0s = await this.multiCallService.multicall(
      filteredPools
        .filter((address) => address !== this.addresses.ZERO_ADDRESS)
        .map((address) => {
          const poolContract = new Contract(address, IUniswapV3Pool);
          return poolContract.slot0();
        })
    );
    const pricings = slot0s.map((slot0) => slot0.sqrtPriceX96);
    return Object.fromEntries(filteredPools.map((pool, index) => [pool, pricings[index]]));
  }

  getPoolCall(tokenAddress: Address, feeAmount: number) {
    return this.uniswapV3Factory.getPool(tokenAddress, this.addresses.WETH_ADDRESS, feeAmount);
  }
}
