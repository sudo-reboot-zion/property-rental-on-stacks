/**
 * Blockchain Debug Utilities
 * 
 * Helper functions to debug blockchain state directly from the browser console.
 * 
 * Usage:
 * 1. Open browser console on any page
 * 2. Import this module or call window.debugBlockchain
 * 3. Run: await window.debugBlockchain.checkProperties()
 */

import { getAllProperties } from './escrow';
import { CONTRACT_ADDRESS, CONTRACTS } from './config';

export const blockchainDebug = {
    /**
     * Check all properties on the blockchain
     */
    async checkProperties(maxProperties: number = 20) {
        console.log('\n' + '='.repeat(70));
        console.log('🔗 Blockchain Properties Debug');
        console.log('='.repeat(70));
        console.log(`Contract: ${CONTRACT_ADDRESS}.${CONTRACTS.ESCROW}`);
        console.log(`Checking up to ${maxProperties} properties...
`);

        try {
            const properties = await getAllProperties(maxProperties);

            console.log(`\n✅ Found ${properties.length} properties on blockchain:\n`);

            if (properties.length === 0) {
                console.log('⚠️  No properties found on blockchain!');
                console.log('   → Either no properties have been listed yet,');
                console.log('   → Or the contract address is incorrect.');
            } else {
                properties.forEach((prop, index) => {
                    console.log(`\n📍 Property #${prop.id}:`);
                    console.log(`   Owner: ${prop.owner}`);
                    console.log(`   Price: ${prop.pricePerNight / 1_000_000} STX/night`);
                    console.log(`   Location Tag: ${prop.locationTag}`);
                    console.log(`   Metadata URI: ${prop.metadataUri}`);
                    console.log(`   Active: ${prop.active}`);
                    console.log(`   Created At Block: ${prop.createdAt}`);
                });
            }

            console.log('\n' + '='.repeat(70) + '\n');
            return properties;
        } catch (error) {
            console.error('\n❌ Error checking blockchain:', error);
            console.log('\nPossible issues:');
            console.log('  • Contract not deployed to this network');
            console.log('  • Network connection issues');
            console.log('  • Contract address mismatch\n');
            throw error;
        }
    },

    /**
     * Check backend API for properties
     */
    async checkBackendAPI() {
        console.log('\n' + '='.repeat(70));
        console.log('🗄️  Backend API Properties Debug');
        console.log('='.repeat(70));

        const apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/properties/`;
        console.log(`API URL: ${apiUrl}\n`);

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const properties = await response.json();

            console.log(`\n✅ Found ${properties.length} properties in database:\n`);

            if (properties.length === 0) {
                console.log('⚠️  Database is empty!');
                console.log('   → Properties need to be synced from blockchain');
                console.log('   → Use /api/properties/sync endpoint\n');
            } else {
                properties.forEach((prop: any) => {
                    console.log(`\n📍 Property #${prop.blockchain_id}:`);
                    console.log(`   Title: ${prop.title || 'N/A'}`);
                    console.log(`   Owner: ${prop.owner_address}`);
                    console.log(`   Price: ${prop.price_per_night / 1_000_000} STX/night`);
                    console.log(`   Location: ${prop.location_city}, ${prop.location_country}`);
                    console.log(`   Active: ${prop.active}`);
                });
            }

            console.log('\n' + '='.repeat(70) + '\n');
            return properties;
        } catch (error) {
            console.error('\n❌ Error checking backend:', error);
            console.log('\nPossible issues:');
            console.log('  • Backend server not running');
            console.log('  • CORS issues');
            console.log('  • Database connection problems\n');
            throw error;
        }
    },

    /**
     * Compare blockchain vs backend state
     */
    async compareStates() {
        console.log('\n' + '='.repeat(70));
        console.log('🔄 Blockchain vs Backend Comparison');
        console.log('='.repeat(70) + '\n');

        try {
            const [blockchainProps, backendProps] = await Promise.all([
                this.checkProperties(),
                this.checkBackendAPI()
            ]);

            console.log('\n📊 Summary:');
            console.log(`   Blockchain: ${blockchainProps.length} properties`);
            console.log(`   Backend:    ${backendProps.length} properties`);

            if (blockchainProps.length > backendProps.length) {
                console.log(`\n⚠️  ${blockchainProps.length - backendProps.length} properties missing from backend!`);
                console.log('   → These need to be synced via /api/properties/sync\n');
            } else if (blockchainProps.length < backendProps.length) {
                console.log('\n⚠️  Backend has more properties than blockchain!');
                console.log('   → This shouldn\'t happen. Check data integrity.\n');
            } else if (blockchainProps.length === 0) {
                console.log('\n✅ Both are empty. Start by listing a property!\n');
            } else {
                console.log('\n✅ Counts match! States appear synchronized.\n');
            }

            return { blockchainProps, backendProps };
        } catch (error) {
            console.error('\n❌ Comparison failed:', error);
            throw error;
        }
    }
};

// Make available globally for console debugging
if (typeof window !== 'undefined') {
    (window as any).debugBlockchain = blockchainDebug;
    console.log('💡 Blockchain debug tools loaded! Try: await window.debugBlockchain.checkProperties()');
}

export default blockchainDebug;
