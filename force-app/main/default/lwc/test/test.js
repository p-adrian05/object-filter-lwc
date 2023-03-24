

import {api, LightningElement} from 'lwc';

export default class Test extends LightningElement {

    @api objectApiName;

    handleGetState() {
        console.log('handleGetState');

       console.log(JSON.stringify(this.template.querySelector('c-object-filter').getFilterState()));
    }

}