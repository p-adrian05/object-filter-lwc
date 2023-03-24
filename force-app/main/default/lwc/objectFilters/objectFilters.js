import {api, LightningElement} from 'lwc';

export default class ObjectFilters extends LightningElement {

    @api objectFilters = [];

    handleSelectFilter(event){
        this.dispatchCustomEventWithFilterId('selectfilter',event.currentTarget.dataset.id);
    }
    handleRemoveFilterButton(event){
        this.dispatchCustomEventWithFilterId('removefilter',event.currentTarget.dataset.id);
    }

    dispatchCustomEventWithFilterId(eventName,filterId){
        let customFilterEvent = new CustomEvent(eventName,{
            detail:{
                filterId:filterId
            }
        });
        this.dispatchEvent(customFilterEvent);
    }
}