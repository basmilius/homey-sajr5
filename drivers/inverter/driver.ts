import { Driver } from 'homey';

module.exports = class extends Driver {

    async onInit(): Promise<void> {
        this.log('SAJR5 driver has been initialized.');
    }

    async onPairListDevices(): Promise<any[]> {
        return [];
    }

}
