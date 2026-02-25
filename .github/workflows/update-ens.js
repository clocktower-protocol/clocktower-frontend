// Load environment variables from .env or .env.local file (for local testing)
// Load .env first, then .env.local (so .env.local overrides .env)
import dotenv from 'dotenv';
dotenv.config(); // Load .env
dotenv.config({ path: '.env.local' }); // Override with .env.local if it exists

// Pinata SDK only needed for fallback query
let PinataSDK;
import { createWalletClient, createPublicClient, http, namehash, parseGwei } from 'viem';
import { normalize } from 'viem/ens';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// ENS Resolver ABI - setContenthash function
const RESOLVER_ABI = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'bytes', name: 'hash', type: 'bytes' },
    ],
    name: 'setContenthash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// ENS Resolver Authorization ABI - check if account is authorized
const RESOLVER_AUTH_ABI = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'node', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'authorised',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// ENS Registry ABI - resolver and owner functions
const REGISTRY_ABI = [
  {
    inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
    name: 'resolver',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// ENS Registry address on mainnet
const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';

/**
 * Encode IPFS CID to ENS contenthash format (ENSIP-7)
 * Supports CIDv1 directly: 0xe3 + 0x01 + raw codec + multihash
 */
async function encodeIpfsToContenthash(cid) {
  try {
    // Import multiformats for CID parsing
    const { CID } = await import('multiformats/cid');
    
    // Remove /ipfs/ prefix if present
    let cidString = cid;
    if (cidString.startsWith('/ipfs/')) {
      cidString = cidString.slice(6);
    }
    
    // Parse the CID
    const cidObj = CID.parse(cidString);
    
    // Ensure we have a CIDv1 (convert v0 to v1 if needed)
    let cidV1 = cidObj;
    if (cidObj.version === 0) {
      // Convert CIDv0 to CIDv1
      // CIDv0 always uses dag-pb codec (112) implicitly
      const dagPbCodec = 0x70; // 112 = dag-pb
      cidV1 = CID.createV1(dagPbCodec, cidObj.multihash);
      console.log(`🔄 Converted CIDv0 to CIDv1: ${cidString} -> ${cidV1.toString()}`);
    }
    
    // Get CIDv1 raw bytes (format: 0x01 + codec varint + multihash)
    const cidBytes = cidV1.bytes;
    
    // Encode according to ENSIP-7: 0xe3 + 0x01 (CID version) + codec varint + multihash
    // The ENS app explicitly adds the CID version byte (0x01), so we do the same
    // This ensures compatibility with ENS gateways
    const contenthash = new Uint8Array(1 + 1 + cidBytes.length);
    contenthash[0] = 0xe3; // IPFS protocol code (ENSIP-7)
    contenthash[1] = 0x01; // CID version 1 (explicitly added to match ENS app format)
    contenthash.set(cidBytes, 2); // Includes 0x01 + codec varint + multihash
    
    // Convert to hex string with 0x prefix
    const hexString = '0x' + Array.from(contenthash)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return hexString;
  } catch (error) {
    throw new Error(`Failed to encode CID to contenthash: ${error.message}`);
  }
}

/**
 * Get CID from environment variable (passed from deploy step)
 * Falls back to querying Pinata if not provided
 */
async function getCID() {
  // First, try to get CID from environment variable (from deploy step)
  if (process.env.IPFS_CID) {
    console.log(`✅ Using CID from deploy step: ${process.env.IPFS_CID}`);
    return process.env.IPFS_CID;
  }
  
  // Fallback: Query Pinata if CID not provided
  console.log('⚠️  IPFS_CID not provided, querying Pinata...');
  
  if (!process.env.PINATA_JWT_TOKEN) {
    throw new Error('PINATA_JWT_TOKEN environment variable is not set');
  }
  
  // Dynamically import Pinata SDK only if needed
  if (!PinataSDK) {
    const pinataModule = await import('pinata');
    PinataSDK = pinataModule.PinataSDK;
  }
  
  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT_TOKEN
  });
  
  console.log('🔍 Querying Pinata for latest pin...');
  console.log(`🔑 Token present: ${process.env.PINATA_JWT_TOKEN ? 'Yes' : 'No'} (${process.env.PINATA_JWT_TOKEN?.substring(0, 10)}...)`);
  
  try {
    // Try using Pinata SDK v2 method to list pins
    let pins;
    let error;
    
    // Try SDK method first
    try {
      if (pinata.data && typeof pinata.data.pinList === 'function') {
        console.log('📦 Using Pinata SDK data.pinList method...');
        pins = await pinata.data.pinList({
          metadata: {
            name: 'clocktower-frontend'
          },
          status: 'pinned',
          pageLimit: 1,
          sort: 'DESC'
        });
      } else if (pinata.pin && typeof pinata.pin.list === 'function') {
        console.log('📦 Using Pinata SDK pin.list method...');
        pins = await pinata.pin.list({
          metadata: {
            name: 'clocktower-frontend'
          },
          status: 'pinned',
          pageLimit: 1,
          sort: 'DESC'
        });
      } else {
        throw new Error('Pinata SDK methods not available');
      }
    } catch (sdkError) {
      console.log('⚠️  Pinata SDK method failed, trying direct API call...');
      error = sdkError;
      
      // Fallback to direct API call
      const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1&sort=DESC', {
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT_TOKEN}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}. ${errorText ? `Details: ${errorText}` : 'Check your PINATA_JWT_TOKEN is valid and has the correct permissions.'}`);
      }
      
      pins = await response.json();
    }
    
    const pinRows = pins?.rows || pins?.data?.rows || (Array.isArray(pins) ? pins : []);
    
    if (!pinRows || pinRows.length === 0) {
      throw new Error('No pinned files found for clocktower-frontend');
    }
    
    const latestPin = pinRows.find(pin => 
      pin.metadata?.name === 'clocktower-frontend' || 
      pin.name === 'clocktower-frontend'
    ) || pinRows[0];
    
    const cid = latestPin.ipfs_pin_hash || latestPin.cid || latestPin.IpfsHash;
    
    if (!cid) {
      throw new Error('CID not found in pin data');
    }
    
    console.log(`✅ Found latest CID from Pinata: ${cid}`);
    return cid;
  } catch (error) {
    console.error('❌ Error querying Pinata:', error.message);
    throw error;
  }
}

/**
 * Get ENS resolver address for a domain
 */
async function getEnsResolver(publicClient, domainNode) {
  const resolverAddress = await publicClient.readContract({
    address: ENS_REGISTRY_ADDRESS,
    abi: REGISTRY_ABI,
    functionName: 'resolver',
    args: [domainNode],
  });
  
  if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error(`No resolver found for domain`);
  }
  
  return resolverAddress;
}

/**
 * Read and verify contenthash from resolver
 */
async function verifyContenthash(publicClient, resolverAddress, domainNode) {
  try {
    console.log('🔍 Reading contenthash from resolver...');
    const actualContenthash = await publicClient.readContract({
      address: resolverAddress,
      abi: [
        {
          inputs: [{ internalType: 'bytes32', name: 'node', type: 'bytes32' }],
          name: 'contenthash',
          outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'contenthash',
      args: [domainNode],
    });
    
    if (!actualContenthash || actualContenthash === '0x' || actualContenthash === '0x00') {
      console.log('❌ No contenthash set on resolver');
      return null;
    }
    
    console.log(`📝 Contenthash on-chain: ${actualContenthash}`);
    return actualContenthash;
  } catch (error) {
    console.error('❌ Failed to read contenthash:', error.message);
    throw error;
  }
}

/**
 * Update ENS contenthash record
 */
async function updateEnsContenthash() {
  try {
    console.log('🚀 Starting ENS contenthash update...');
    
    // Validate environment variables
    if (!process.env.ETH_PRIVATE_KEY) {
      throw new Error('ETH_PRIVATE_KEY environment variable is not set');
    }
    
    if (!process.env.ETH_MAINNET_RPC_URL) {
      throw new Error('ETH_MAINNET_RPC_URL environment variable is not set');
    }
    
    const ensDomain = process.env.ENS_DOMAIN || 'clocktower.eth';
    console.log(`📝 ENS Domain: ${ensDomain}`);
    
    // Get CID from environment variable (passed from deploy step) or query Pinata
    const cid = await getCID();
    
    // Encode CID to contenthash format
    console.log('🔄 Encoding CID to contenthash format...');
    const contenthash = await encodeIpfsToContenthash(cid);
    console.log(`✅ Encoded contenthash: ${contenthash}`);
    
    // Set up viem clients
    const rpcUrl = process.env.ETH_MAINNET_RPC_URL;
    const transport = http(rpcUrl);
    
    const account = privateKeyToAccount(process.env.ETH_PRIVATE_KEY);
    console.log(`👤 Account: ${account.address}`);
    
    const publicClient = createPublicClient({
      chain: mainnet,
      transport,
    });
    
    const walletClient = createWalletClient({
      chain: mainnet,
      transport,
      account,
    });
    
    // Normalize and hash the ENS domain
    const normalizedDomain = normalize(ensDomain);
    const domainNode = namehash(normalizedDomain);
    console.log(`🔐 Domain node: ${domainNode}`);
    
    // Get resolver address
    console.log('🔍 Getting ENS resolver address...');
    const resolverAddress = await getEnsResolver(publicClient, domainNode);
    console.log(`📍 Resolver address: ${resolverAddress}`);
    
    // Check if account is the owner
    // Owners can directly call setContenthash
    console.log('🔐 Checking authorization...');
    const domainOwner = await publicClient.readContract({
      address: ENS_REGISTRY_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: 'owner',
      args: [domainNode],
    });
    
    const isOwner = domainOwner.toLowerCase() === account.address.toLowerCase();
    console.log(`👑 Domain owner: ${domainOwner}`);
    console.log(`👤 Account is owner: ${isOwner ? 'Yes' : 'No'}`);
    
    // Check resolver authorization if supported
    // The resolver's authorised modifier checks: owner OR setApprovalForAll (legacy)
    let isResolverAuthorized = false;
    try {
      isResolverAuthorized = await publicClient.readContract({
        address: resolverAddress,
        abi: RESOLVER_AUTH_ABI,
        functionName: 'authorised',
        args: [domainNode, account.address],
      });
      console.log(`🔑 Authorized on resolver: ${isResolverAuthorized ? 'Yes' : 'No'}`);
    } catch (error) {
      console.log('⚠️  Resolver does not support authorised function (this is normal for some resolvers)');
    }
    
    if (isOwner) {
      console.log(`✅ Account is the domain owner - can directly set contenthash`);
    } else if (isResolverAuthorized) {
      console.log(`✅ Account is authorized on resolver (legacy setApprovalForAll)`);
    } else {
      console.warn(`⚠️  Warning: Account ${account.address} may not be authorized`);
      console.warn(`   Domain owner: ${domainOwner}`);
      console.warn(`   Account is not the owner.`);
      console.warn(`   Legacy: setApprovalForAll approval (deprecated) may also work.`);
    }
    
    // Call setContenthash on the resolver
    // The resolver's authorised modifier checks: owner OR setApprovalForAll (legacy)
    const contractAddress = resolverAddress;
    const contractABI = RESOLVER_ABI;
    
    console.log('📋 Calling setContenthash on resolver');
    
    // Simulate transaction first to get better error messages
    console.log('🧪 Simulating transaction...');
    try {
      await publicClient.simulateContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'setContenthash',
        args: [domainNode, contenthash],
        account,
      });
      console.log('✅ Simulation successful');
    } catch (simError) {
      console.error('❌ Simulation failed:', simError.message);
      if (simError.shortMessage) {
        console.error('   Short message:', simError.shortMessage);
      }
      if (simError.details) {
        console.error('   Details:', simError.details);
      }
      // Try to extract revert reason
      if (simError.cause) {
        console.error('   Cause:', simError.cause);
      }
      if (simError.data) {
        console.error('   Revert data:', simError.data);
      }
      // Check for common revert reasons
      const errorMsg = simError.message || simError.shortMessage || '';
      if (errorMsg.includes('Unauthorized') || errorMsg.includes('Not authorized')) {
        throw new Error(`Transaction simulation failed: Account is not authorized. The account must be the domain owner or have legacy setApprovalForAll approval (deprecated).`);
      } else if (errorMsg.includes('Only owner')) {
        throw new Error(`Transaction simulation failed: Only the domain owner can set contenthash.`);
      } else {
        throw new Error(`Transaction simulation failed: ${simError.message}. Verify authorization: the account must be the domain owner.`);
      }
    }
    
    // Verify current contenthash on-chain
    const currentContenthash = await verifyContenthash(publicClient, resolverAddress, domainNode);
    
    if (currentContenthash) {
      console.log(`✅ Contenthash is set on-chain`);
      console.log(`📋 CID: ${cid}`);
      console.log(`🌐 ENS Domain: ${ensDomain}`);
      console.log(`📝 Current contenthash: ${currentContenthash}`);
    } else {
      console.log(`⚠️  No contenthash currently set`);
    }
    
    // Send transaction to update contenthash
    console.log('📤 Sending transaction to update ENS contenthash...');
    const priorityFeeGwei = 3n;
    const block = await publicClient.getBlock({ blockTag: 'pending' });
    const baseFee = block?.baseFeePerGas ?? 0n;
    const maxFeePerGas = (baseFee * 120n) / 100n + parseGwei(priorityFeeGwei.toString());
    const maxPriorityFeePerGas = parseGwei(priorityFeeGwei.toString());
    console.log(`⛽ Gas: maxFeePerGas=${maxFeePerGas}, maxPriorityFeePerGas=${maxPriorityFeePerGas}`);
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'setContenthash',
      args: [domainNode, contenthash],
      maxPriorityFeePerGas,
      maxFeePerGas,
    });
    
    console.log(`✅ Transaction sent: ${hash}`);
    console.log(`🔗 Explorer: https://etherscan.io/tx/${hash}`);
    
    // Wait for transaction confirmation
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`🎉 ENS contenthash updated successfully!`);
    console.log(`📋 CID: ${cid}`);
    console.log(`🌐 ENS Domain: ${ensDomain}`);
    
    return { hash, cid, receipt };
    
  } catch (error) {
    console.error('❌ ENS update failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}
 
// Run the update
updateEnsContenthash();

