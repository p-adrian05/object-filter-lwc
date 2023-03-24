import {api, LightningElement, track, wire} from 'lwc';
import getFieldsBySobjectApiName from '@salesforce/apex/ObjectFilterController.getFieldsBySobjectApiName';
import {ShowToastEvent} from "lightning/platformShowToastEvent";
export default class ObjectFilterForm extends LightningElement {
    @api objectApiName;
    @track fieldOptions;
    @api selectedField;
    @track selectedFieldOption;
    @api selectedOperator;
    @api operatorValue;
    @api operatorOptions;
    @track selectedInputType = 'text';
    fieldMap = new Map();

    @wire(getFieldsBySobjectApiName,{sObjectApiName: '$objectApiName'})
    initFields({error,data}){
        if(data){
            this.fieldMap = new Map();
            if(Array.isArray(data)) {
                this.fieldOptions = data.map(field=>{
                    this.fieldMap.set(field.apiName,field);
                    return {label:field.labelName, value:field.apiName,description:field.apiName};
                });
            }
        }else if(error){
            this.fieldMap = new Map();
            console.error(JSON.stringify(error));
            const event = new ShowToastEvent({variant: 'error', title: 'Error!', message: error.body.message});
            dispatchEvent(event);
        }
    }
    @api loadFilter(filter){
        if(filter){
            this.selectedField = filter.field;
            this.selectedFieldOption = filter.field.apiName;
            this.selectedOperator = filter.operator;
            this.operatorValue = filter.operatorValue;
        }
    }
    @api resetForm(){
        this.selectedField = null;
        this.selectedFieldOption = null;
        this.selectedOperator = null;
        this.operatorValue = null;
    }


    handleFieldSelected(event){
        this.selectedFieldOption = event.detail.value;
        this.selectedField = this.fieldMap.get(event.detail.value);
        this.selectedInputType = this.getInputTypeByFieldType(this.selectedField.type);
    }
    handleOperatorSelected(event){
        this.selectedOperator = event.detail.value;
    }
    handleOnChangeOperatorInputValue(event){
        this.operatorValue = event.detail.value;
    }


    getInputTypeByFieldType(fieldType){
        let inputType = 'text';
        fieldType = fieldType.toLowerCase();
        switch (fieldType) {
            case 'date':
                inputType = 'date';
                break;
            case 'datetime':
                inputType = 'datetime';
                break;
            case 'time':
                inputType = 'time';
                break;
            case 'url':
                inputType = 'url';
                break;
            case 'integer':
            case 'double':
            case 'percent':
            case 'number':
            case 'currency':
                inputType = 'number';
                break;
            case 'email':
                inputType='email';
                break;
            case 'phone':
                inputType ='tel';
                break;
        }
        return inputType;
    }
}