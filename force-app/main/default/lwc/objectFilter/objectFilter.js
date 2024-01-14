import {api, LightningElement, track} from 'lwc';
import {ShowToastEvent} from "lightning/platformShowToastEvent";
const CONDITION_AND = 'AND';
const CONDITION_OR = 'OR';
const CONDITION_CUSTOM = 'CUSTOM';
const DEFAULT_CONDITION = CONDITION_AND;
const CONDITION_LABEL_MAP = new Map([
    [CONDITION_AND,'All Conditions Are Met (AND)'],
    [CONDITION_OR,'Any Condition Is Met (OR)'],
    [CONDITION_CUSTOM,'Custom Condition Is Met (Advanced)']
]);
const OPERATOR_EQUAL = '=';
const OPERATOR_NOT_EQUAL = '!=';
const OPERATOR_LESS_THAN = '<';
const OPERATOR_GREATER_THAN = '>';
const OPERATOR_LESS_OR_EQUAL = '<=';
const OPERATOR_GREATER_OR_EQUAL = '>=';
const OPERATOR_LIKE = 'like';
const OPERATOR_NOT_LIKE = 'not_like';
const OPERATOR_LABEL_MAP = new Map([
    [OPERATOR_EQUAL,'equals'],
    [OPERATOR_NOT_EQUAL,'not equal to'],
    [OPERATOR_LESS_THAN,'less than'],
    [OPERATOR_GREATER_THAN,'greater than'],
    [OPERATOR_LESS_OR_EQUAL,'less or equal'],
    [OPERATOR_GREATER_OR_EQUAL,'greater or equal'],
    [OPERATOR_LIKE,'like'],
    [OPERATOR_NOT_LIKE,'not like'],
]);

const DEFAULT_TITLE = "Filters";
const DEFAULT_OBJECT_API_NAME= "Account";
const INVALID_CONDITION_LOGIC_WARNING_MESSAGE = 'Invalid input! It can contains only AND, OR, (,) characters.';
const INVALID_FILTER_INDEX_WARNING_MESSAGE = 'Invalid filter index!';
const NUMBER_FIELD_TYPES = ['datetime', 'date','time', 'integer', 'double', 'percent', 'number', 'currency'];
const VALID_CUSTOM_LOGIC_INPUT_CHARACTERS = ['(',')','A','N','D','O','R',' '];
const CANCEL_BUTTON_LABEL_TEXT = 'Cancel';
const UPDATE_BUTTON_LABEL_TEXT = 'Update';
const ADD_NEW_FILTER_BUTTON_LABEL_TEXT = 'Add new filter';
const LOGICAL_ORDER_INPUT_LABEL_TEXT = 'Logical Order';

export default class ObjectFilter extends LightningElement {

    labels = {
        cancelButtonLabel: CANCEL_BUTTON_LABEL_TEXT,
        updateButtonLabel: UPDATE_BUTTON_LABEL_TEXT,
        addNewFilterButtonLabel: ADD_NEW_FILTER_BUTTON_LABEL_TEXT,
        logicalOrderInputLabel: LOGICAL_ORDER_INPUT_LABEL_TEXT
    }

    @api title = DEFAULT_TITLE;
    @api objectApiName = DEFAULT_OBJECT_API_NAME;
    @api filterList = [];
    @track logicalConditions = [];
    @track operatorOptions = [];
    @track selectedLogicalCondition = DEFAULT_CONDITION;

    @track editFilter = false;

    openedFilterId;
    @track customLogicalCondition;
    showCustomConditionLogicInput;

    @track queryString;

    @api
    getFilterState(){
        if(this.filterList.length===0){
            return null;
        }
        const filterState = new FilterState();
        filterState.filterList = this.filterList;
        filterState.filterString = this.getQueryFilterString();
        filterState.filterStringWithBinds = this.getQueryFilterStringWithBinds();
        filterState.logicalCondition = this.selectedLogicalCondition;
        filterState.logicalOrder = this.customLogicalCondition;
        return filterState;
    }
    @api loadFilterState(filterState){
        this.resetComponent();
        if(filterState && filterState.filterList){
            this.filterList = filterState.filterList.map(filterToLoad=>{
                const filter = new Filter(filterToLoad.id,filterToLoad.field,filterToLoad.operator,filterToLoad.operatorValue);
                filter.index = filterToLoad.index;
                return filter;
            });
            this.selectedLogicalCondition = filterState.logicalCondition;
            if(filterState.logicalCondition === CONDITION_CUSTOM){
                this.showCustomConditionLogicInput = true;
                this.customLogicalCondition = filterState.logicalOrder;
            }else{
                this.reIndexFilters();
                this.customLogicalCondition = this.calculateLogicalOrder();
            }

            this.queryString = this.getQueryFilterString();
        }
    }
    @api resetComponent(){
        this.resetForm();
        this.filterList = [];
        this.queryString = null;
        this.customLogicalCondition = '';
        this.selectedLogicalCondition = DEFAULT_CONDITION;
        this.showCustomConditionLogicInput = false;
    }

    connectedCallback() {
        this.logicalConditions = this.createOptionsListFromMap(CONDITION_LABEL_MAP);
        this.operatorOptions = this.createOptionsListFromMap(OPERATOR_LABEL_MAP);
    }

    createOptionsListFromMap(mapCollection){
        let optionList = [];
        for(let key of mapCollection.keys()){
            optionList.push({label:mapCollection.get(key),value:key});
        }
        return optionList;
    }

    handleClearFilterButton(event){
        this.resetForm();

    }
    handleUpdateFilterButton(event){
        let filterForm = this.template.querySelector('c-object-filter-form');
        let selectedFilter = filterForm.selectedField;
        this.filterList.forEach(filter=>{
            if(filter.id=== this.openedFilterId){
               selectedFilter = filter;
            }
        });
        selectedFilter.field = filterForm.selectedField;
        selectedFilter.operator = filterForm.selectedOperator;
        try{
            selectedFilter.setOperatorValue(filterForm.operatorValue);
        }catch (e){
            this.showWarningMessage(e.message);
            return;
        }
        this.filterList = [...this.filterList];
        this.resetForm();
        this.queryString = this.getQueryFilterString();
    }
    handleAddFilterButton(event){
        let filterForm = this.template.querySelector('c-object-filter-form');
        if(filterForm.selectedField && filterForm.selectedOperator){
            let filter = new Filter();
            filter.id = new Date().getTime()+this.filterList.length+1;
            filter.field = filterForm.selectedField;
            filter.operator = filterForm.selectedOperator;
            try{
                filter.setOperatorValue(filterForm.operatorValue);
            }catch (e){
                this.showWarningMessage(e.message);
                return;
            }

            this.filterList.push(filter);
            this.filterList = [...this.filterList];

            this.reIndexFilters();
            this.resetForm();
            this.customLogicalCondition = this.calculateLogicalOrder();
            this.queryString = this.getQueryFilterString();
        }
    }
    handleSelectFilter(event){
        let indexToSelect = this.findFilterById(event.detail.filterId);
        if(indexToSelect!==-1){
            let filterToLoad = this.filterList.at(indexToSelect);
            this.template.querySelector('c-object-filter-form').loadFilter(filterToLoad);

            this.editFilter = true;
            this.openedFilterId = filterToLoad.id;
        }
    }

    handleRemoveFilter(event){
        let indexToDelete = this.findFilterById(event.detail.filterId);
        if(indexToDelete!==-1){
             this.filterList.splice(indexToDelete,1);
             this.reIndexFilters();
             this.filterList = [...this.filterList];
             this.customLogicalCondition = this.calculateLogicalOrder();
             this.queryString = this.getQueryFilterString();
        }
    }

    findFilterById(filterId){
       return this.filterList.findIndex(filter=>filter.id.toString()===filterId.toString());
    }

    resetForm(){
        let filterForm = this.template.querySelector('c-object-filter-form');
        filterForm.resetForm();
        this.editFilter = false;
        this.openedFilterId = null;
    }
    reIndexFilters(){
        let index = 1;
        this.filterList.forEach(filter =>{
            filter.index = index++;
        });
    }
    handleCustomConditionLogicInput(event){
        if(event.detail.value.trim().length===0){
            this.customLogicalCondition = this.calculateLogicalOrder();
            this.queryString = this.getQueryFilterString();
        }else{
            if(!this.validateCustomConditionLogicInput(event.detail.value.trim())){
                this.showWarningMessage(INVALID_CONDITION_LOGIC_WARNING_MESSAGE);
            }else{
                this.customLogicalCondition = event.detail.value;
                this.queryString = this.getQueryFilterString();
            }
        }
    }
    validateCustomConditionLogicInput(inputString){
        if(!inputString){
            return false;
        }
        let isValid = true;
        for(let i=0;i<inputString.length;i++){
            inputString = inputString.toUpperCase();
            let currentChar = inputString.charAt(i);
            if(isNaN(currentChar) && !VALID_CUSTOM_LOGIC_INPUT_CHARACTERS.includes(currentChar)){
                isValid = false;
            }
        }
        return isValid;
    }
    handleLogicalConditionSelected(event){
        this.selectedLogicalCondition = event.detail.value;
        this.showCustomConditionLogicInput = event.detail.value === CONDITION_CUSTOM;

        this.customLogicalCondition = this.calculateLogicalOrder();
        this.queryString = this.getQueryFilterString();
    }
    calculateLogicalOrder(){
        const logicalCondition = this.selectedLogicalCondition === CONDITION_CUSTOM ?
                                DEFAULT_CONDITION : this.selectedLogicalCondition;
        let orderStr = '';
        if(this.filterList.length===1){
            return '1';
        }
        for(let i = 0; i<this.filterList.length-1;i++){
            orderStr +=  (i+1) +' '+logicalCondition+' '+(i+2)+' ';

            if(this.filterList.length%2===0){
                let nextLogicalOperator = '';
                if(this.filterList.at(i+2)!==undefined){
                    nextLogicalOperator = logicalCondition;
                }
                orderStr += nextLogicalOperator+' ';
            }else{
                orderStr += logicalCondition+' ';
                if(this.filterList.at(i+3)===undefined){
                    orderStr += ' '+ (i+3)+' ';
                }
            }
            i++;
        }
        return orderStr.trim();
    }

    @api getQueryFilterString(){
        return this.calculateQueryString((filter)=>{
            return filter.toString();
        });
    }
    getQueryFilterStringWithBinds(){
        return this.calculateQueryString((filter)=>{
            return filter.toStringWithBindVariable();
        });
    }
    calculateQueryString(handleFilterCallback){
        let filterQuery = '';
        try{
            for(let i = 0; i<this.customLogicalCondition.length; i++){
                let charCode = this.customLogicalCondition.charCodeAt(i);
                let nextCharCode = this.customLogicalCondition.charCodeAt(i+1);
                let actualStringIndexOfFilter = '';

                if(charCode>48 && charCode<58){
                    actualStringIndexOfFilter += String.fromCharCode(charCode);
                    if(nextCharCode>=48 && nextCharCode<58){
                        actualStringIndexOfFilter += String.fromCharCode(nextCharCode);
                        i++;
                    }
                    let indexOfFilter = Number.parseInt(actualStringIndexOfFilter);
                    let filter = this.filterList.at(indexOfFilter-1);
                    if(!filter){
                        this.showWarningMessage(INVALID_FILTER_INDEX_WARNING_MESSAGE);
                        return filterQuery;
                    }else{
                        filterQuery+= handleFilterCallback(filter);
                    }
                }else{
                    filterQuery+=String.fromCharCode(charCode);
                }
            }
        }catch (e){
            console.error(JSON.stringify(e));
        }
        return filterQuery.trim();
    }
}
class FilterState{

    filterList = [];
    filterString;
    filterStringWithBinds;
    logicalCondition;
    logicalOrder;

}
class Filter{
    id;
    index;
    field;
    operator;
    operatorValue;
    bindVariable;

    constructor(id,field,operator,operatorValue) {
        this.id = id;
        this.field = field;
        this.operator = operator;
        this.operatorValue = operatorValue;
    }
    setOperatorValue(operatorValue){
        if(this.field.type.toLowerCase() ==='boolean') {
            if (operatorValue !== 'true' && operatorValue !== 'false') {
                throw new Error('Please add true or false value for Boolean type!');
            }
        }
        if(operatorValue === null || operatorValue === undefined || operatorValue.trim() === ''){
            this.operatorValue = 'null';
        }else{
            this.operatorValue = operatorValue;
        }
    }
    toString(){
        let tempQuery = '';

        if(this.operatorValue==='null') {
           tempQuery = this.toStringWithOperatorValue(null);
        }else if (NUMBER_FIELD_TYPES.includes(this.field.type.toLowerCase()) || this.field.type.toLowerCase()==='boolean') {
            tempQuery = this.toStringWithOperatorValue(this.operatorValue);
        }
        else{
            tempQuery = this.toStringWithOperatorValue(`'${this.operatorValue}'`);
        }
        return tempQuery;
    }
    toStringWithBindVariable(){
        this.bindVariable = 'value'+this.index;
        return this.toStringWithOperatorValue(':'+this.bindVariable);
    }
    toStringWithOperatorValue(operatorValue){
        let tempQuery = '';
        switch(this.operator) {
            case OPERATOR_NOT_LIKE:
                tempQuery = ` (not ${this.field.apiName} like ${operatorValue})`;
                break;
            default:
                tempQuery = ` ${this.field.apiName} ${this.operator} ${operatorValue}`;
                break;
        }
        return tempQuery;
    }
    showWarningMessage(message,title) {
        if(!title) title = 'Warning!';
        const event = new ShowToastEvent({variant: 'warning', title: title, message: String(message)});
        dispatchEvent(event)
    }
}