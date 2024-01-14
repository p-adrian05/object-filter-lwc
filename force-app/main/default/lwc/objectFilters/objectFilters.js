import {api, LightningElement, track} from 'lwc';

export default class ObjectFilters extends LightningElement {

    @api objectFilters = [];
    @track showFilters = false;

    @api
    set filters(filters){
        this.objectFilters = filters;
        if(this.objectFilters && this.objectFilters.length > 0) {
            this.showFilters = true;
        }else{
            this.showFilters = false;
        }
    }
    get filters(){
        return this.objectFilters;
    }

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